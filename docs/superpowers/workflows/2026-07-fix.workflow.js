export const meta = {
  name: '2026-07-textbook-fix',
  description: '2026-07 검수 결함(차단+권고+경미) 지문별 수정 — 지문당 1 에이전트(충돌방지)',
  phases: [{ title: 'Fix' }, { title: 'Verify' }],
}

// args = [{ grade, seq, file(본문 절대경로), auditFile(검수결과 절대경로), counts }, ...]
let TASKS = args
if (typeof TASKS === 'string') { try { TASKS = JSON.parse(TASKS) } catch { TASKS = [] } }
if (TASKS && !Array.isArray(TASKS) && typeof TASKS === 'object') TASKS = [TASKS]
if (!Array.isArray(TASKS)) TASKS = []
log(`수정 대상 ${TASKS.length}개 지문`)

const FIX_RESULT_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['grade', 'seq', 'applied', 'fixes'],
  properties: {
    grade: { type: 'string' }, seq: { type: 'number' },
    applied: { type: 'number', description: '실제 수정 적용한 finding 수' },
    skipped: { type: 'number' },
    fixes: {
      type: 'array', items: {
        type: 'object', additionalProperties: false,
        required: ['location', 'what'],
        properties: {
          location: { type: 'string' }, what: { type: 'string', description: '무엇을 어떻게 고쳤는지' },
          skippedReason: { type: 'string' },
        },
      },
    },
    integrityOk: { type: 'boolean', description: '3자 동기화(본문 문장수=page3=translation_ko [N])·blank 1개·questions mix 유지 확인' },
  },
}

function fixPrompt(t) {
  return [
    `너는 한국 고등 영어 교재 편집자다. 한 지문의 검수 결함을 직접 수정한다.`,
    `1) 검수 결과를 Read: ${t.auditFile}  (confirmed=차단/권고, minors=경미. 각 finding의 location·issue·evidence·suggestion 참고)`,
    `2) 본문을 Read: ${t.file}`,
    `3) 모든 finding을 Edit 툴로 본문 JSON에 실제 반영한다. suggestion이 있으면 우선 따르되, 본문 근거에 맞게 판단.`,
    ``,
    `수정 원칙(반드시 준수 — validator 강제):`,
    `- 빈칸 정답 노출(translation_ko가 page2 빈칸문제 정답을 드러냄): 해당 자리를 원문처럼 빈칸(____) 또는 자연스러운 미완 표현으로 바꿔 정답을 가린다. page2 정답/choices는 그대로 둔다.`,
    `- 구문 역할 오태깅(M↔C 등): page3.sentences[].segments[].role 만 정확히 교정. grammar_note도 일치시킨다.`,
    `- 문장번호 참조 오류(answers.explanations의 evidence/rationale이 잘못된 문장번호 인용): 올바른 번호로 교정.`,
    `- 번역 누락/중복: translation_ko의 [N] 마커 수 = 본문 문장 수 = page3.sentences 수 (3자 동기화) 유지. 누락 문장 추가, 중복 제거.`,
    `- 영문 비문/어색(react hard→react vigorously 등): body 표현만 교정. 교정 시 page3·translation_ko의 해당 문장도 동기화.`,
    `- 본문 단어수 290~360 & ≥1400자, page3.sentences ≤20, <blank> 정확히 1개, questions mix(mock_objective 3+school_descriptive 1), vocab 12개 중복금지 — 수정이 이 제약을 깨지 않게.`,
    `- JSON 따옴표는 escape(\\"). 파일은 유효한 JSON으로 유지.`,
    ``,
    `대상: ${t.grade} #${t.seq}. 수정 후 integrityOk를 점검해 보고하라. 적용 못 한 건 skippedReason에 이유.`,
  ].join('\n')
}

function verifyPrompt(t) {
  return [
    `너는 검증자다. 방금 수정된 지문 파일이 결함을 제대로 고쳤고 새 문제를 만들지 않았는지 확인하라.`,
    `1) 검수 결과 Read: ${t.auditFile} (원래 어떤 결함이 있었는지)`,
    `2) 수정된 본문 Read: ${t.file}`,
    `점검: (a) 빈칸 정답이 여전히 노출되는가 (b) 3자 동기화(본문 문장수=page3.sentences=translation_ko [N]) (c) <blank> 1개 (d) JSON 유효 (e) 새로 생긴 오류.`,
    `남은 문제가 있으면 isReal=true로, 깨끗하면 isReal=false로.`,
  ].join('\n')
}

const VERIFY_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['grade', 'seq', 'isReal', 'issues'],
  properties: {
    grade: { type: 'string' }, seq: { type: 'number' },
    isReal: { type: 'boolean', description: '남은 문제가 있으면 true' },
    issues: { type: 'array', items: { type: 'string' } },
  },
}

const results = await pipeline(
  TASKS,
  // 스테이지 1: 지문당 1 에이전트가 모든 결함 수정 (파일 충돌 방지)
  (t) => agent(fixPrompt(t), { label: `fix:${t.grade}#${t.seq}`, phase: 'Fix', schema: FIX_RESULT_SCHEMA, agentType: 'general-purpose' })
    .then(fix => ({ t, fix })),
  // 스테이지 2: 수정 검증
  async ({ t, fix }) => {
    const v = await agent(verifyPrompt(t), { label: `verify:${t.grade}#${t.seq}`, phase: 'Verify', schema: VERIFY_SCHEMA, agentType: 'Explore' })
    return { grade: t.grade, seq: t.seq, fix, verify: v }
  }
)

return results.filter(Boolean)
