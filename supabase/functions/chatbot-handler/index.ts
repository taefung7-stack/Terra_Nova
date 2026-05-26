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
//     ├─ 5. OpenAI Chat Completions API 호출 (gpt-4o-mini)
//     ├─ 6. 응답 저장 + 비용 기록
//     └─ 7. 카카오 응답 포맷 반환
//
// 환경변수:
//   OPENAI_API_KEY                — OpenAI Platform 에서 발급
//   SUPABASE_URL, SERVICE_ROLE_KEY — 자동 주입
//
// 응답 형식: 카카오 i 오픈빌더 SkillResponse v2.0
//   { version: '2.0', template: { outputs: [{ simpleText: { text } }] } }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')!;

const MODEL = 'gpt-4o';
const MAX_OUTPUT_TOKENS = 500;

// gpt-4o 단가 (USD per million tokens)
const PRICE_INPUT_PER_M = 2.50;
const PRICE_OUTPUT_PER_M = 10.00;

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

  // ── 7. OpenAI Chat Completions API 호출 (gpt-4o-mini) ──
  let answer = '';
  let tokensIn = 0;
  let tokensOut = 0;
  let costUsd = 0;

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_OUTPUT_TOKENS,
        temperature: 0.2,
        top_p: 0.9,
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory,
          { role: 'user', content: utterance },
        ],
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      console.error('[chatbot] OpenAI API failed:', openaiRes.status, errText);
      return kakaoTextResp('지금은 답변을 준비하지 못했어요. 잠시 후 다시 시도해주세요. 급하시면 taefung7@gmail.com 으로 메일 주세요.');
    }

    const openaiData = await openaiRes.json();
    answer = openaiData?.choices?.[0]?.message?.content || '';
    tokensIn = openaiData?.usage?.prompt_tokens || 0;
    tokensOut = openaiData?.usage?.completion_tokens || 0;
    costUsd =
      (tokensIn / 1_000_000) * PRICE_INPUT_PER_M +
      (tokensOut / 1_000_000) * PRICE_OUTPUT_PER_M;
  } catch (err) {
    console.error('[chatbot] OpenAI call threw:', err);
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

    // 일별 집계 upsert (RPC 호출 — supabase-js 의 .rpc() 는 Promise 라 .catch() 가능하지만,
    // 타입 안전성 위해 try-catch 로 감싸기)
    try {
      const today = new Date().toISOString().slice(0, 10);
      await sb.rpc('upsert_chatbot_usage_daily', {
        p_date: today,
        p_tokens_in: tokensIn,
        p_tokens_out: tokensOut,
        p_cost_usd: costUsd,
      });
    } catch (rpcErr) {
      console.warn('[chatbot] usage daily RPC failed (non-fatal):', rpcErr);
    }
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

  return `너는 테라노바 잉글리시(Terra Nova English) 한국어 CS 챗봇이다.

[출력 형식 — 엄수]
오직 사용자에게 보낼 최종 한국어 답변 문장만 출력해라. 절대 출력 금지:
- "(A) 라벨링..." 같은 분석 과정
- "라벨: 가격" 같은 메타 표기
- 영어 단어 (브랜드명/플랜명/MARS 등 고유명사 제외)
- 마크다운 헤더(##), 글머리표(▶/-)
즉 답은 카카오톡에 그대로 보낼 자연스러운 한국어 문장 2~5개여야 한다. "~예요/~어요" 톤. 묻지 않은 정보 추가 금지.

[내부 사고 — 답하기 전에 머릿속으로만, 출력 금지]
사용자 마지막 질문의 의도를 다음 중 하나로 분류한 뒤, 그 ▶ 섹션의 정보만 사용해서 답해라:
가격 · 결제수단 · PDF사용 · PDF환불 · 월간구독환불 · 연간구독환불 · 실물교재환불 · 환불기간 · 해지 · 레벨변경 · 레벨종류 · 샘플 · 레벨테스트 · 연락처 · 인사

매핑 가이드 (이 매핑을 답에 쓰지 말고 참고만 해라):
"프리미엄 얼마예요?" → 가격 → ▶ 가격/플랜 사용
"스탠다드는 얼마?" → 가격
"라이트 가격" → 가격
"연간 구독 얼마?" → 가격
"카카오페이 됩니까?" → 결제수단 → ▶ 결제수단 사용
"PDF 인쇄 돼요?" → PDF사용 → ▶ PDF 사용 사용
"PDF 다운받았는데 환불 가능?" → PDF환불 → ▶ 환불-PDF단품 사용
"오늘 결제했는데 해지하면 환불?" → 해지+월간구독환불 → ▶ 해지 + ▶ 환불-월간구독 사용
"환불 며칠 걸려요?" → 환불기간 → ▶ 환불 처리 기간 사용
"해지 어떻게 해요?" → 해지 → ▶ 해지 사용
"샘플 받고 싶어요" → 샘플 → ▶ 무료 샘플 사용
"레벨 바꾸면 이번달부터?" → 레벨변경 → ▶ 레벨 변경 사용
"레벨 종류 뭐 있어요?" → 레벨종류 → ▶ 레벨 종류 사용
"레벨 테스트 무료?" → 레벨테스트 → ▶ 레벨 테스트 사용
"이메일 알려주세요" → 연락처 → ▶ 연락처/CS 사용
"안녕하세요" → 인사 → "안녕하세요! 무엇을 도와드릴까요?"
"뭐 배워요?" / "어떤 거 배우나요?" / "문법 공부도 돼요?" / "듣기 있어요?" / "어휘 학습?" → 학습콘텐츠 → ▶ 학습 콘텐츠 / 무엇을 배우나 사용

**의도 분류가 모호하면 "인사" 로 도망가지 말고, 가장 가능성 높은 카테고리에 베팅해서 답해라.** 명백한 "안녕/감사" 같은 인사가 아니면 절대 "안녕하세요! 무엇을 도와드릴까요?" 로 답하지 마라.

[고객 정보]
${memberInfo}

━━━━━━━━━━━━━━━━━━ 지식베이스 ━━━━━━━━━━━━━━━━━━

▶ 가격 / 플랜 (키워드: 가격, 얼마, 비용, 요금, LIGHT, STANDARD, PREMIUM, 라이트, 스탠다드, 프리미엄, 플랜, 구독료)
- LIGHT (PDF): 월 11,900원 · 연 119,000원 (2개월 무료) — 정식 운영중, 가입 가능
- STANDARD (PDF+실물): 월 24,900원 · 연 249,000원 — 준비중, 가입 불가
- PREMIUM (올인원): 월 58,900원 · 연 589,000원 — 준비중, 가입 불가
→ 사용자가 가격을 물으면 해당 플랜 가격을 알려주고, STANDARD/PREMIUM 이면 반드시 "준비중이라 아직 가입 불가"도 함께.

▶ 결제수단 (키워드: 결제, 카드, 카카오페이, 네이버페이, 페이코, 무통장, 계좌이체)
- KG이니시스 신용카드만 지원.
- 카카오페이/네이버페이/페이코: 현재 미지원, 준비중.
- (참고: 현재 카드사 심사 진행 중이라 결제가 일시 보류일 수 있음 — 결제 시도가 거절됐다는 문의일 때만 "심사 완료 후 정상화 예정, 며칠 후 재시도 부탁드려요" 안내)

▶ PDF 사용 (키워드: PDF, 다운로드, 다운, 인쇄, 출력, 복사, 붙여넣기, 열람, 보기)
- 결제일에 그달치 PDF 이메일로 즉시 발송 (메일 내 다운로드 링크).
- PC/모바일/태블릿 모두 열람 가능, 인쇄 가능.
- 복사·붙여넣기·편집은 저작권 보호로 제한될 수 있음.
- 이메일 미수신/다운로드 안 됨 같은 기술 문제는 taefung7@gmail.com (스크린샷 첨부 추천).

▶ 학습 콘텐츠 / 무엇을 배우나 (키워드: 뭐 배워, 무엇을 배우, 어떤 거 배워, 어떤 내용, 학습 내용, 커리큘럼, 구성, 문법, 어휘, 단어, 독해, 듣기, 쓰기, 회화, 본문, 지문)
- Terra Nova는 **교과 연계 영어 독해** 중심 월간 학습지예요. 학교 교과(국어·사회·과학·수학 등)의 한 단원을 영어 지문으로 학습.
- 한 지문 = 4페이지 구성:
  1️⃣ 영어 본문 (학년 수준 맞춤 길이)
  2️⃣ 독해 문제 (객관식 + 서술형, 학교시험 유형 반영)
  3️⃣ 구문 분석 (색깔 표시로 문장 구조 시각화)
  4️⃣ 단어 풀이 (동의어·반의어 포함 어휘 정리)
- 한글 해설 포함 (직역 + 자연스러운 의역).
- 문법은 별도 챕터로 떼서 가르치지 않고, 본문 속 핵심 구문을 ③ 구문 분석에서 색깔로 시각화하는 방식. 따라서 "문법책" 형태는 아니지만 독해를 통해 문법 구조가 자연스럽게 학습돼요.
- 듣기·쓰기·회화는 **포함되지 않아요** (독해 + 어휘 + 구문 + 한글 해설 중심).
- 분량: 한 회 4페이지 약 30분 분량.

▶ 환불 — PDF 단품 (키워드: PDF 환불, PDF 다운받았, PDF 열어봤, 다운로드 후, 열람 후)
- 다운로드·열람 전: 결제 7일 이내 전액 환불 가능.
- 다운로드·열람 후: 전자상거래법 제17조 2항 5호에 따라 환불 불가.
→ PDF 환불 질문엔 반드시 양쪽 조건을 다 안내해라.

▶ 환불 — 월간 구독 (키워드: 월간 환불, 구독 환불, 이번 달 환불, 방금 결제 환불, 오늘 결제)
- 결제 7일 이내 + 당월 PDF 미수령: 100% 환불.
- 당월 PDF 이미 발송된 후: 환불 불가 + 다음 회차부터 자동 해지로 처리.

▶ 환불 — 연간 구독 (키워드: 연간 환불, 1년 환불, 연 구독 환불)
- 결제 7일 이내 + 미이용: 전액 환불.
- 이용 시작 후 중도 해지: 사용 월수 × 월정가 + 위약금 10% 차감 후 잔액 환불.

▶ 환불 — 실물 교재 (키워드: 책 환불, 교재 환불, 반품)
- 수령 7일 이내 + 미개봉: 전액 환불.
- 개봉·필기·훼손: 환불 불가.
- 단순 변심: 왕복 배송비 회원 부담.

▶ 환불 — 회사 귀책 (키워드: 파일 손상, 발송 누락, 잘못 왔, 회사 잘못)
- 회원 부담 0, 전액 환불.

▶ 환불 처리 기간 (키워드: 환불 언제, 환불 며칠, 환불 기간)
- 영업일 3~5일. 카드 취소는 카드사 정책상 1~2주 소요 가능.
- 신청: 마이페이지 또는 taefung7@gmail.com (주문번호·사유 포함).

▶ 해지 (키워드: 해지, 취소, 그만, 정지, 중단)
- 마이페이지에서 즉시 가능.
- 환불 조건 충족 시 환불 처리, 아니면 당월까지 이용 후 다음 회차부터 자동 해지.

▶ 레벨 변경 (키워드: 레벨, 단계, 바꾸, 변경)
- 마이페이지 → 매월 1회 무료, 추가 비용 없음.
- 적용은 **다음 달 PDF(다음 결제일)부터**. 이번 달 PDF는 기존 레벨로 발송.

▶ 레벨 종류 (키워드: 무슨 레벨, 어떤 레벨, 레벨 뭐)
MARS(초5) · VENUS(초6) · TERRA(중1) · NEPTUNE(중2) · URANUS(중3) · SATURN(고1) · JUPITER(고2) · SUN(고3)

▶ 무료 샘플 (키워드: 샘플, 미리보기, 체험)
- sample.html 에서 이메일 입력 시 즉시 발송.
- 무료 항목이라 환불 대상 아님.

▶ 레벨 테스트 (키워드: 레벨 테스트, 진단, 어느 레벨, 내 레벨)
- 무료, 약 3분, 결과는 마이페이지에 저장.

▶ 연락처 / CS (키워드: 이메일, 연락처, 문의, 상담, 전화)
- 이메일: taefung7@gmail.com (유일한 공식 연락처).
- CS 운영시간: 평일 09:00-18:00 (이메일 회신 기준).
- 전화 상담은 운영하지 않음 (이건 사용자가 "전화" 를 직접 언급한 경우에만 답해라).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[금지 — 절대 위반 금지]
- support@, info@, help@ 등 존재하지 않는 이메일 만들어내기.
- 회사명을 "Teran", "TerraNova" 같이 변형해서 쓰기 (정확히 "테라노바 잉글리시" 또는 "Terra Nova").
- 묻지 않은 항목 정보 추가 (예: 가격 질문에 환불 정책까지 같이 답하기).
- 환불 처리 시간을 "즉시" 라고 답하기.
- 가입 가능 플랜으로 STANDARD/PREMIUM 추천하기.
- 일반 정보 질문을 "메일 주세요" 로 떠넘기기 (메일 안내는 개인 처리 필요한 경우에만).
- 다른 학습지 회사 비교 부정 발언, 의료/법률/세무 조언.`;
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
