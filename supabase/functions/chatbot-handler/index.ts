// Terra Nova · 카카오톡 챗봇 핸들러 (LLM 기반)
// 배포: supabase functions deploy chatbot-handler --no-verify-jwt
//
// 요청 흐름:
//   카카오 i 오픈빌더 (skill webhook)
//     ↓ POST { userRequest: { user: { id }, utterance } }
//   chatbot-handler
//     ├─ 1. Rate limit 체크 (5분 내 10회)
//     ├─ 2. 사용자 식별 (profiles.kakao_user_id 매칭)
//     ├─ 3. 컨텍스트 수집 (구독·결제·최근 주문)
//     ├─ 4. 최근 대화 5개 조회 (멀티턴 컨텍스트)
//     ├─ 5. Claude API 호출
//     ├─ 6. 응답 저장 + 비용 기록
//     └─ 7. 카카오 응답 포맷 반환
//
// 환경변수:
//   ANTHROPIC_API_KEY            — Anthropic Console 에서 발급
//   SUPABASE_URL, SERVICE_ROLE_KEY — 자동 주입
//
// 응답 형식: 카카오 i 오픈빌더 SkillResponse v2.0
//   { version: '2.0', template: { outputs: [{ simpleText: { text } }] } }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;

const MODEL = 'claude-haiku-4-5-20251001';
const MAX_OUTPUT_TOKENS = 500;

// Haiku 4.5 단가 (USD per million tokens)
const PRICE_INPUT_PER_M = 1.00;
const PRICE_OUTPUT_PER_M = 5.00;

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return kakaoTextResp('잘못된 요청입니다.');

  // ── 1. 카카오 요청 파싱 ──
  let body: any;
  try { body = await req.json(); } catch {
    return kakaoTextResp('요청을 이해하지 못했어요. 다시 말씀해주세요.');
  }

  const kakaoUserId: string = body?.userRequest?.user?.id || '';
  const utterance: string = (body?.userRequest?.utterance || '').trim();

  if (!kakaoUserId || !utterance) {
    return kakaoTextResp('메시지를 입력해주세요.');
  }

  // ── 2. Rate Limit ──
  try {
    const { data: allowed } = await sb.rpc('check_chatbot_rate_limit', {
      p_kakao_user_id: kakaoUserId,
    });
    if (allowed === false) {
      return kakaoTextResp('잠시 후 다시 시도해주세요. 너무 많은 요청이 있었어요. (5분 후 가능)');
    }
  } catch (err) {
    console.warn('[chatbot] rate limit check skipped:', err);
  }

  // ── 3. 사용자 매칭 (profiles 조회) ──
  const { data: profile } = await sb
    .from('profiles')
    .select('id, display_name, phone, marketing_consent')
    .eq('kakao_user_id', kakaoUserId)
    .maybeSingle();

  let userId: string | null = profile?.id || null;
  let displayName: string = profile?.display_name || '회원';

  // ── 4. 구독·결제 컨텍스트 수집 (매칭된 사용자만) ──
  let subscriptionContext = '';
  let recentOrdersContext = '';

  if (userId) {
    const { data: sub } = await sb
      .from('subscriptions')
      .select('plan_code, status, level, expires_at, auto_renew, billing_cycle')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (sub) {
      const expiresKo = sub.expires_at
        ? new Date(sub.expires_at).toLocaleDateString('ko-KR')
        : '없음';
      subscriptionContext = `[현재 구독]
- 플랜: ${sub.plan_code || '없음'}
- 상태: ${sub.status || '없음'}
- 레벨: ${sub.level || '미선택'}
- 결제 주기: ${sub.billing_cycle === 'annual' ? '연간' : '월간'}
- 만료/다음 결제일: ${expiresKo}
- 자동 갱신: ${sub.auto_renew ? '예' : '아니오'}
`;
    } else {
      subscriptionContext = '[현재 구독] 없음 (가입은 했지만 구독 시작 전)\n';
    }

    const { data: orders } = await sb
      .from('orders')
      .select('id, total_amount, status, paid_at, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(3);

    if (orders && orders.length > 0) {
      recentOrdersContext = '[최근 주문 3건]\n' +
        orders.map((o, i) => {
          const d = (o.paid_at || o.created_at);
          const dKo = d ? new Date(d).toLocaleDateString('ko-KR') : '미상';
          return `${i + 1}. ${dKo} · ${o.total_amount}원 · ${o.status}`;
        }).join('\n') + '\n';
    }
  }

  // ── 5. 최근 대화 이력 (멀티턴 컨텍스트, 최근 5개) ──
  const { data: recentMessages } = await sb
    .from('chatbot_conversations')
    .select('role, message')
    .eq('kakao_user_id', kakaoUserId)
    .in('role', ['user', 'assistant'])
    .order('created_at', { ascending: false })
    .limit(5);

  const conversationHistory = (recentMessages || [])
    .reverse()
    .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.message }));

  // ── 6. 시스템 프롬프트 ──
  const systemPrompt = buildSystemPrompt({
    displayName,
    isMember: !!userId,
    subscriptionContext,
    recentOrdersContext,
  });

  // ── 7. Claude API 호출 ──
  let answer = '';
  let tokensIn = 0;
  let tokensOut = 0;
  let costUsd = 0;

  try {
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_OUTPUT_TOKENS,
        system: systemPrompt,
        messages: [
          ...conversationHistory,
          { role: 'user', content: utterance },
        ],
      }),
    });

    if (!claudeRes.ok) {
      const errText = await claudeRes.text();
      console.error('[chatbot] Claude API failed:', claudeRes.status, errText);
      return kakaoTextResp('지금은 답변을 준비하지 못했어요. 잠시 후 다시 시도해주세요. 급하시면 support@terra-nova.kr 로 메일 주세요.');
    }

    const claudeData = await claudeRes.json();
    answer = claudeData?.content?.[0]?.text || '';
    tokensIn = claudeData?.usage?.input_tokens || 0;
    tokensOut = claudeData?.usage?.output_tokens || 0;
    costUsd =
      (tokensIn / 1_000_000) * PRICE_INPUT_PER_M +
      (tokensOut / 1_000_000) * PRICE_OUTPUT_PER_M;
  } catch (err) {
    console.error('[chatbot] Claude call threw:', err);
    return kakaoTextResp('일시적인 오류가 있어요. 잠시 후 다시 시도해주세요.');
  }

  if (!answer) {
    return kakaoTextResp('답변을 생성하지 못했어요. 다시 한 번 말씀해주실래요?');
  }

  // ── 8. 대화 이력 저장 (best-effort) ──
  try {
    await sb.from('chatbot_conversations').insert([
      {
        user_id: userId,
        kakao_user_id: kakaoUserId,
        role: 'user',
        message: utterance,
      },
      {
        user_id: userId,
        kakao_user_id: kakaoUserId,
        role: 'assistant',
        message: answer,
        tokens_input: tokensIn,
        tokens_output: tokensOut,
        cost_usd: costUsd,
        model: MODEL,
      },
    ]);

    // 일별 집계 upsert
    const today = new Date().toISOString().slice(0, 10);
    await sb.rpc('upsert_chatbot_usage_daily', {
      p_date: today,
      p_tokens_in: tokensIn,
      p_tokens_out: tokensOut,
      p_cost_usd: costUsd,
    }).catch(() => {}); // RPC 없으면 무시 (다음 마이그레이션에서 추가)
  } catch (err) {
    console.warn('[chatbot] conversation save failed (non-fatal):', err);
  }

  // ── 9. 카카오 응답 (QuickReply 포함) ──
  return kakaoTextResp(answer, [
    { label: '환불 정책', action: 'message', messageText: '환불 정책 알려주세요' },
    { label: '레벨 변경', action: 'message', messageText: '레벨 변경하고 싶어요' },
    { label: '무료 샘플', action: 'message', messageText: '무료 샘플 받고 싶어요' },
    { label: '마이페이지', action: 'webLink', webLinkUrl: 'https://terra-nova.kr/mypage.html' },
  ]);
});

function buildSystemPrompt(ctx: {
  displayName: string;
  isMember: boolean;
  subscriptionContext: string;
  recentOrdersContext: string;
}): string {
  const memberInfo = ctx.isMember
    ? `이름: ${ctx.displayName}\n${ctx.subscriptionContext}${ctx.recentOrdersContext}`
    : '사이트 미가입 또는 카카오톡 ID 미연결 사용자';

  return `당신은 Terra Nova English 의 CS 상담 챗봇입니다.

[고객 정보]
${memberInfo}

[Terra Nova 서비스]
- 사이트: https://terra-nova.kr
- 한국 영어 학습지 정기 구독 서비스 (월간 발행 PDF)
- LIGHT 플랜: 11,900원/월 (연간 119,000원, 2개월 무료)
- 8단계 레벨: MARS(초5) · VENUS(초6) · TERRA(중1) · NEPTUNE(중2) · URANUS(중3) · SATURN(고1) · JUPITER(고2) · SUN(고3)
- STANDARD/PREMIUM: 준비중 (가입 불가, 출시 시 별도 공지)
- 결제: KG이니시스 신용카드 (카카오페이/네이버페이 추가 예정)

[운영 정책]
- 결제일에 그달치 PDF 즉시 이메일 발송
- 환불: 다운로드/열람 전 7일 이내 전액 환불 (전자상거래법 17조)
- 레벨 변경: 마이페이지에서 매월 1회 무료
- 해지: 마이페이지에서 즉시 가능, 당월 끝까지 이용
- 무료 샘플: sample.html 에서 이메일 입력하면 즉시 발송
- 레벨 테스트: 무료, 결과 마이페이지 저장

[톤]
- 친근하고 따뜻하게 (반말 X, "~예요/~어요" 사용)
- 정확한 정보만, 모르면 "정확한 처리는 support@terra-nova.kr 로 메일 주세요"
- 답변은 3~5문장 이내로 짧고 명확하게
- 결제·환불 등 실제 처리가 필요한 건 "마이페이지에서 ○○하시거나 메일 주세요" 안내

[금지]
- STANDARD/PREMIUM 가격 언급 시 "준비중" 명시 (절대 가입 가능하다고 답하지 마세요)
- 정확하지 않은 약속 (예: "환불 즉시 처리됩니다" → "영업일 1-2일 내 처리됩니다")
- 다른 학습지 회사와 비교 부정 발언
- 의료/법률/세무 조언

답변은 카카오톡 메시지에 맞게 짧고 명확하게.`;
}

function kakaoTextResp(text: string, quickReplies?: any[]) {
  const output: any = {
    version: '2.0',
    template: {
      outputs: [{ simpleText: { text: text.slice(0, 1000) } }], // 카카오 1000자 제한
    },
  };
  if (quickReplies && quickReplies.length > 0) {
    output.template.quickReplies = quickReplies;
  }
  return new Response(JSON.stringify(output), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
