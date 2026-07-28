export const meta = {
  name: '2026-08-textbook-audit',
  description: '2026-08 고등 40지문 4관점 병렬 검수 + 적대검증 + 심각도 판정',
  phases: [{ title: 'Review' }, { title: 'Verify' }],
}

// args = [{ grade, seq, file, lexNote }, ...]  (검수 대상 목록. 본문은 에이전트가 file을 Read)
//   grade: 'saturn-g1'|'jupiter-g2'|'sun-g3', seq: 1..20
//   file:  절대경로 또는 워크스페이스 상대경로 (passage JSON)
//   lexNote: 난이도 신호 문자열('' 가능)
const FINDING_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['lens', 'findings'],
  properties: {
    lens: { type: 'string', enum: ['language', 'explanation', 'translation', 'answer', 'vocab'] },
    findings: {
      type: 'array', items: {
        type: 'object', additionalProperties: false,
        required: ['severity', 'location', 'issue', 'evidence'],
        properties: {
          severity: { type: 'string', enum: ['blocker', 'warn', 'minor'] },
          location: { type: 'string' }, issue: { type: 'string' },
          evidence: { type: 'string' }, suggestion: { type: 'string' },
        },
      },
    },
  },
}
const VERDICT_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['isReal', 'confidence', 'reason'],
  properties: {
    isReal: { type: 'boolean' }, confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
    reason: { type: 'string' },
  },
}

const LENSES = [
  { key: 'language', focus: '영문 본문(page1.body)의 문법 오류, 오타(철자), 비문, 어색한 표현, 학년 CEFR 수준 적합성, 단락 구분·논리 전개의 가독성, 내용의 사실적 정확성(과학·역사 등 개념 오류는 warn 이상). 단순 문체 취향은 minor 이하로.' },
  { key: 'explanation', focus: 'page3 구문분석(sentences)·grammar_note와 answers.explanations 해설이 본문 근거와 일치하는지, 비약/오류가 있는지. 구문 역할(S/V/O/C/M) 오태깅 포함.' },
  { key: 'translation', focus: 'page3.translation_ko가 영문 본문을 정확히 옮겼는지 — 오역·누락·과장. 문장 번호 단위로 대조.' },
  { key: 'answer', focus: '각 문제(page2.questions)의 정답(answer_index/model_answer)이 본문 근거로 타당한지, 오답 선지의 변별력·함정이 적절한지. "밑줄 친 …" stem이 인용한 구가 본문 <u>밑줄</u>과 정확히 일치하는지. 정답 오류는 blocker.' },
  { key: 'vocab', focus: 'page4.vocab 어휘 검수: ① word가 본문(page1.body)에 실제 등장하는지 ② meaning_ko가 본문 문맥의 뜻과 일치하는지 ③ synonyms/antonyms가 정확한지(품사·의미 불일치는 warn 이상) ④ examples 예문(en)이 문법적으로 옳고 단어 뜻을 잘 보여주는지, ko 대역이 정확한지 ⑤ page1.gloss_extra의 term·ko 정확성. 학년 대비 너무 쉬운 기초어는 warn.' },
]

function reviewPrompt(t, lens) {
  return [
    `너는 한국 고등 영어 교재 검수 전문가다. 아래 파일의 지문을 "${lens.key}" 관점에서만 검수한다.`,
    `먼저 이 파일을 Read 툴로 읽어라: ${t.file}`,
    `관점 초점: ${lens.focus}`,
    `대상: 학년 ${t.grade}, 지문번호 ${t.seq}.${t.lexNote ? ' ' + t.lexNote : ''}`,
    `실제 결함만 보고하라. 결함 없으면 findings 빈 배열. 추측성 지적 금지 — 반드시 evidence(본문 인용)를 단다.`,
    `심각도: blocker=정답이 틀렸거나 본문/해설/번역에 명백한 오류로 판매 불가 / warn=고치는 게 좋음 / minor=사소(문체·미세).`,
    `lens 필드는 반드시 "${lens.key}" 로 채운다.`,
  ].join('\n')
}

function verifyPrompt(t, f) {
  return [
    `너는 적대적 검증자다. 다음 검수 지적이 실제 결함인지 검증하라.`,
    `기본 입장은 "반박(isReal=false)"이며, 파일 근거로 명확히 확인될 때만 isReal=true.`,
    `먼저 파일을 Read 하라: ${t.file}`,
    `지적: [${f.severity}/${f.lens}] ${f.issue}`,
    `위치: ${f.location}`,
    `근거주장: ${f.evidence}`,
  ].join('\n')
}

// args 정규화: 문자열로 도착하면 파싱, 객체 하나면 배열로 감싼다.
let TASKS = args
if (typeof TASKS === 'string') { try { TASKS = JSON.parse(TASKS) } catch { TASKS = [] } }
if (TASKS && !Array.isArray(TASKS) && typeof TASKS === 'object') { TASKS = [TASKS] }
if (!Array.isArray(TASKS)) TASKS = []
log(`검수 대상 ${TASKS.length}개 지문`)

const results = await pipeline(
  TASKS,
  // 스테이지 1: 4관점 병렬 검수
  (t) => parallel(LENSES.map(lens => () =>
    agent(reviewPrompt(t, lens), { label: `review:${t.grade}#${t.seq}:${lens.key}`, phase: 'Review', schema: FINDING_SCHEMA, agentType: 'Explore' })
  )).then(lensResults => ({ t, lensResults: lensResults.filter(Boolean) })),
  // 스테이지 2: blocker/warn findings만 적대검증
  async ({ t, lensResults }) => {
    const flat = lensResults.flatMap(r => (r.findings || []).map(f => ({ ...f, lens: r.lens })))
    const toVerify = flat.filter(f => f.severity === 'blocker' || f.severity === 'warn')
    const verified = await parallel(toVerify.map(f => () =>
      agent(verifyPrompt(t, f), { label: `verify:${t.grade}#${t.seq}`, phase: 'Verify', schema: VERDICT_SCHEMA, agentType: 'Explore' })
        .then(v => ({ ...f, verdict: v }))
    ))
    const confirmed = verified.filter(Boolean).filter(f => f.verdict?.isReal)
    const minors = flat.filter(f => f.severity === 'minor')
    return {
      grade: t.grade, seq: t.seq,
      confirmed,
      minors,
      blockers: confirmed.filter(f => f.severity === 'blocker'),
      counts: { raw: flat.length, verified: toVerify.length, confirmed: confirmed.length, minor: minors.length },
    }
  }
)

return results.filter(Boolean)
