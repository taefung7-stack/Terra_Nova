export const meta = {
  name: '2026-08-textbook-fix',
  description: '2026-08 검수 결함(차단+권고+경미+Codex) 지문별 수정 — 지문당 1 에이전트(충돌방지) + 검증',
  phases: [{ title: 'Fix' }, { title: 'Verify' }],
}

// args = [{ grade, seq, file(본문 절대경로), auditFile(검수결과 절대경로) }, ...]
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
    `1) 검수 결과를 Read: ${t.auditFile}  (confirmed=차단/권고(+codex 제보), minors=경미. 각 finding의 location·issue·evidence·suggestion 참고)`,
    `2) 본문을 Read: ${t.file}`,
    `3) 모든 finding을 Edit 툴로 본문 JSON에 실제 반영한다. suggestion이 있으면 우선 따르되, 본문 근거에 맞게 판단.`,
    `   단, 삽화(illustration) 관련 지적은 이번 사이클 대상이 아니므로 건드리지 않는다.`,
    ``,
    `수정 원칙(반드시 준수 — validator 강제):`,
    `- 해설 인용 정확성: answers.explanations의 evidence/rationales에서 큰따옴표 직접 인용은 본문(page1.body)과 글자 단위로 정확히 일치시킨다. 본문에 없는 문구를 인용하지 말 것.`,
    `- 문장번호 참조 오류: 해설이 "n번"으로 가리키는 번호는 학생이 보는 page3.sentences의 [1]~[N] 번호(index 필드) 기준으로 정정한다. 전체 번호가 밀린 지문은 전 인용을 재정렬.`,
    `- 구문 역할 오태깅(S/V/O/C/M): page3.sentences[].segments[].role 을 정확히 교정하고 note·grammar_note도 일치시킨다. 존재하지 않는 문법 현상(도치·강조 등) 설명은 삭제/교체.`,
    `- 번역 오역: translation_ko 를 원문 의미에 맞게 교정(절대부정 no↔비교급 less 구분, same의 수식 대상, less A than B 등). [N] 마커 수 = 본문 문장 수 = page3.sentences 수 (3자 동기화) 유지.`,
    `- 빈칸 정답 노출: translation_ko 나 vocab 예문이 page2 빈칸문제 정답을 드러내면 그 자리를 가린다(원문처럼 빈칸 처리 또는 우회 표현). page2 정답/choices는 그대로.`,
    `- 정답/조건 충돌(예: 요약문 빈칸에 본문 원단어가 정답 처리 안 되는 경우): 문제 조건과 모범답안이 모순 없게 정리 — 본문 단어를 정답으로 인정하거나(model_answer·hints에 추가), 요약문 표현을 바꿔 유일 정답이 되게 한다. 유일 정답성 우선.`,
    `- 빈칸 문법 정합: 정답 선지를 본문 빈칸에 대입했을 때 관사·중복 형용사 등 비문이 되지 않게 본문 또는 선지를 최소 수정(전 선지가 같은 형태 유지).`,
    `- 영문 비문/오타/개념 오류: body 표현을 교정하되, 교정 시 page3 해당 문장 세그먼트·translation_ko·vocab 예문을 함께 동기화.`,
    `- 어휘부(page4.vocab): 의미가 어긋난 synonyms/antonyms는 교체하거나 삭제(빈 배열 허용). 예문은 표제 품사·본문 문맥과 일치시키고, 본문 인용을 표방한 예문은 본문과 정확히 일치시킨다. vocab 12개·중복금지 유지.`,
    `- 본문 단어수 290~360 & >=1400자, page3.sentences <=20, <blank> 정확히 1개, questions mix(mock_objective 3+school_descriptive 1), 밑줄 <u> 정합(stem 인용=본문 밑줄), 정답 길이 균형 — 수정이 이 제약을 깨지 않게.`,
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
    `점검: (a) 해설의 직접 인용이 본문과 글자 단위로 일치하는가 (b) 해설 문장번호가 page3 index와 일치하는가 (c) 3자 동기화(본문 문장수=page3.sentences=translation_ko [N]) (d) <blank> 1개·빈칸 정답 비노출 (e) JSON 유효 (f) 새로 생긴 오류.`,
    `남은 문제가 있으면 isReal=true로, 깨끗하면 isReal=false로. issues에 구체적으로.`,
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
