# 2026-07 고등 교재 본문 내용 정확성 전수 검수 — 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 2026-07 고등 60지문(고1/2/3 각 20)을 자동검사(L1·L2) + 멀티에이전트 4관점 병렬 검수(L3) + 적대검증으로 전수 진단하고, 차단/권고/경미로 분류한 리포트를 산출한다.

**Architecture:** 3층 검수. L1·L2는 기존 Node/Python 도구를 60지문에 1회 실행하고 결과를 JSON으로 모은다. L3는 단일 Workflow 스크립트가 지문별 4관점 에이전트를 파이프라인으로 흘리고(관점→적대검증→판정), 지문별 JSON + 전체 REPORT.md를 쓴다. 이 작업은 **진단까지만** — 결함 수정 없음.

**Tech Stack:** Node.js(ESM, tools/), Python3(lexile-audit), Workflow 오케스트레이션(agent/pipeline/parallel + JSON schema), 기존 `tools/validate-content.mjs`·`tools/lexile-audit.py`.

## Global Constraints

- 검수 대상 경로(verbatim): 고1 `textbook/content/passages/2026-07/`, 고2 `textbook/content/passages/2026-07-J/`, 고3 `textbook/content/passages/2026-07-Sun/`. 각 폴더 `01.json`~`20.json`.
- 지문 스키마 v2.2 고등 프로파일: body 290–360 단어, 문제 mix = mock_objective×3 + school_descriptive×1, `meta.achievement_verified=true` 강제.
- 산출물 루트: `textbook/audit/2026-07/`. 학년 하위폴더명: `saturn-g1` / `jupiter-g2` / `sun-g3`.
- **수정 금지** — 본 계획은 어떤 passage JSON도 수정하지 않는다. 진단 산출물만 쓴다.
- **업로드 금지** — Storage 업로드·IMPACT7 관련 일체 없음(CLAUDE.md).
- 심각도 3단계: `blocker`(판매 차단) / `warn`(권고) / `minor`(경미).
- 커밋 메시지 한국어, 마지막 줄 `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
- 작업 시작 전 `git pull --rebase origin main`, 단위 완료 시 commit+push(자동배포 정책).

---

## File Structure

- `textbook/tools/audit-prepass.mjs` (Create) — L1·L2 자동검사를 60지문에 실행해 지문별 사전검사 결과 JSON을 모은다. validate-content와 lexile-audit 결과를 지문 단위로 병합.
- `textbook/audit/2026-07/_prepass.json` (산출) — 60지문 사전검사 집계(자동 생성).
- `textbook/audit/schemas/finding.schema.json` (Create) — L3 에이전트 구조화 출력 스키마(관점별 findings, verdict).
- `docs/superpowers/workflows/2026-07-audit.workflow.js` (Create) — L3 Workflow 스크립트(지문별 4관점→적대검증→판정→파일 쓰기). 실제 실행은 Workflow 툴로 이 스크립트를 돌린다.
- `textbook/audit/2026-07/<학년>/<NN>.json` (산출) — 지문별 검수 결과.
- `textbook/audit/2026-07/REPORT.md` (산출) — 전체 요약.

---

## Task 1: 사전검사 수집기 (L1·L2 → 지문별 JSON)

**Files:**
- Create: `textbook/tools/audit-prepass.mjs`
- Test: 인라인(스크립트 자체 실행 결과 검증 — 별도 vitest 불필요, 1회성 도구)

**Interfaces:**
- Consumes: 기존 `tools/validate-content.mjs`(CLI), `tools/lexile-audit.py`(+ `lexile-audit-result.json`), passage JSON들.
- Produces: `textbook/audit/2026-07/_prepass.json` — 형태:
  ```json
  { "generated": "<ISO>", "passages": [
    { "grade":"saturn-g1","seq":1,"file":"...01.json",
      "l1": { "ok":true, "errors":[] },
      "l2": { "lexile_label":"760L","lexile_measured":null,"mismatch":false,"achievement":"10통과2-01-03","achievement_verified":true } }
  ] }
  ```

- [ ] **Step 1: 기존 도구의 실제 출력 형식 확인**

Run:
```bash
cd textbook && node tools/validate-content.mjs 2>&1 | head -40
python tools/lexile-audit.py 2>&1 | head -20 || true
head -60 tools/lexile-audit-result.json
```
Expected: validate-content가 학년별 통과/실패와 오류 목록을 출력. lexile-audit-result.json의 키 구조(지문별 라벨 vs 실측) 확인. 이 출력 형식에 맞춰 파서를 작성한다.

- [ ] **Step 2: audit-prepass.mjs 작성 — 세 학년 폴더를 순회하며 지문 메타 수집**

```javascript
#!/usr/bin/env node
// L1·L2 사전검사 수집기 — passage JSON + validate-content + lexile-audit 결과를 지문 단위로 병합
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');               // textbook/
const GRADES = [
  { key: 'saturn-g1', dir: 'content/passages/2026-07' },
  { key: 'jupiter-g2', dir: 'content/passages/2026-07-J' },
  { key: 'sun-g3', dir: 'content/passages/2026-07-Sun' },
];
const outDir = resolve(root, 'audit/2026-07');
mkdirSync(outDir, { recursive: true });

// L1: validate-content 실행 (실패해도 출력 캡처). --json 플래그가 없으면 종료코드/텍스트만 사용.
function runValidate() {
  try { return { raw: execSync('node tools/validate-content.mjs', { cwd: root, encoding: 'utf8' }), ok: true }; }
  catch (e) { return { raw: (e.stdout || '') + (e.stderr || ''), ok: false }; }
}

// L2: lexile-audit-result.json 로드(있으면). 키 매핑은 Step 1에서 확인한 실제 구조에 맞춤.
function loadLexile() {
  const p = resolve(root, 'tools/lexile-audit-result.json');
  if (!existsSync(p)) return {};
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return {}; }
}

const validate = runValidate();
const lexile = loadLexile();
const passages = [];

for (const g of GRADES) {
  const gdir = resolve(root, g.dir);
  const files = readdirSync(gdir).filter(f => /^\d{2}\.json$/.test(f)).sort();
  for (const f of files) {
    const seq = parseInt(f, 10);
    const data = JSON.parse(readFileSync(join(gdir, f), 'utf8'));
    passages.push({
      grade: g.key, seq, file: join(g.dir, f),
      l2: {
        lexile_label: data.meta?.lexile ?? null,
        achievement: data.meta?.achievement_standard ?? null,
        achievement_verified: data.meta?.achievement_verified ?? false,
      },
    });
  }
}

const out = {
  generated: process.env.AUDIT_TS || 'unstamped',
  validate_ok: validate.ok,
  validate_raw: validate.raw.slice(0, 20000),
  lexile_present: Object.keys(lexile).length > 0,
  passages,
};
writeFileSync(join(outDir, '_prepass.json'), JSON.stringify(out, null, 2));
console.log(`[audit-prepass] ${passages.length} passages → audit/2026-07/_prepass.json (validate_ok=${validate.ok})`);
```

- [ ] **Step 3: 실행해서 60지문이 모두 수집되는지 확인**

Run: `cd textbook && AUDIT_TS=$(date -u +%FT%TZ) node tools/audit-prepass.mjs`
Expected: `[audit-prepass] 60 passages → audit/2026-07/_prepass.json (validate_ok=...)`. 60이 아니면 학년 폴더 경로/파일 패턴을 점검.

- [ ] **Step 4: _prepass.json 내용 점검**

Run: `node -e "const d=require('./textbook/audit/2026-07/_prepass.json'); console.log('count',d.passages.length); console.log('grades',[...new Set(d.passages.map(p=>p.grade))]); console.log('sample',JSON.stringify(d.passages[0]))"`
Expected: count 60, grades 3개(saturn-g1/jupiter-g2/sun-g3), sample에 lexile_label·achievement 채워짐.

- [ ] **Step 5: 커밋**

```bash
git add textbook/tools/audit-prepass.mjs textbook/audit/2026-07/_prepass.json
git commit -m "feat(audit): 2026-07 사전검사 수집기(L1·L2) + 60지문 prepass 산출

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 2: L3 에이전트 출력 스키마

**Files:**
- Create: `textbook/audit/schemas/finding.schema.json`

**Interfaces:**
- Produces: `FINDING_SCHEMA`(관점 에이전트 출력), `VERDICT_SCHEMA`(적대검증 출력) — Task 3 Workflow가 `agent({schema})`로 사용.

- [ ] **Step 1: finding.schema.json 작성**

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://terranova.app/audit/finding.schema.json",
  "type": "object",
  "additionalProperties": false,
  "required": ["lens", "findings"],
  "properties": {
    "lens": { "type": "string", "enum": ["language", "explanation", "translation", "answer"] },
    "findings": {
      "type": "array",
      "items": {
        "type": "object",
        "additionalProperties": false,
        "required": ["severity", "location", "issue", "evidence"],
        "properties": {
          "severity": { "type": "string", "enum": ["blocker", "warn", "minor"] },
          "location": { "type": "string", "description": "예: page1.body 문장3 / answers[1].rationale / page3.translation_ko [12]" },
          "issue": { "type": "string", "description": "무엇이 문제인지 한 문장" },
          "evidence": { "type": "string", "description": "본문/해설 인용 근거" },
          "suggestion": { "type": "string", "description": "권고 수정안(선택)" }
        }
      }
    }
  }
}
```

- [ ] **Step 2: VERDICT 스키마를 같은 파일에 별도 정의로 추가(JSON 두 개를 한 파일로 못 두므로 별도 파일)**

Create `textbook/audit/schemas/verdict.schema.json`:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://terranova.app/audit/verdict.schema.json",
  "type": "object",
  "additionalProperties": false,
  "required": ["isReal", "confidence", "reason"],
  "properties": {
    "isReal": { "type": "boolean", "description": "지적이 실제 결함이면 true. 반박되면 false." },
    "confidence": { "type": "string", "enum": ["high", "medium", "low"] },
    "reason": { "type": "string", "description": "판정 근거 한두 문장" }
  }
}
```

- [ ] **Step 3: 두 스키마가 유효한 JSON인지 확인**

Run: `node -e "require('./textbook/audit/schemas/finding.schema.json'); require('./textbook/audit/schemas/verdict.schema.json'); console.log('schemas ok')"`
Expected: `schemas ok`

- [ ] **Step 4: 커밋**

```bash
git add textbook/audit/schemas/
git commit -m "feat(audit): L3 검수 출력 스키마(finding/verdict)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 3: L3 Workflow 스크립트 (4관점 병렬 → 적대검증 → 판정 → 파일)

**Files:**
- Create: `docs/superpowers/workflows/2026-07-audit.workflow.js`

**Interfaces:**
- Consumes: `_prepass.json`(컨텍스트), passage JSON들, finding/verdict 스키마(스크립트에 인라인 복사 — Workflow 스크립트는 파일 import 불가).
- Produces: `textbook/audit/2026-07/<grade>/<NN>.json`, `textbook/audit/2026-07/REPORT.md`.

> **주의:** Workflow 스크립트는 파일시스템 접근이 없다. 따라서 (a) passage 내용과 prepass는 `args`로 주입하고, (b) 산출 파일은 Workflow가 반환한 결과를 받아 **이 메인 세션에서** Write 툴로 저장한다. 스크립트는 "검수 결과 객체 배열"을 return 한다.

- [ ] **Step 1: 검수 입력 번들 생성기 작성 (passage 본문을 Workflow args로 넘길 형태로 압축)**

Create `textbook/tools/audit-bundle.mjs`:
```javascript
#!/usr/bin/env node
// 60지문의 검수에 필요한 필드만 추려 audit-input.json 으로 묶는다(Workflow args 용).
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const GRADES = [
  { key: 'saturn-g1', dir: 'content/passages/2026-07' },
  { key: 'jupiter-g2', dir: 'content/passages/2026-07-J' },
  { key: 'sun-g3', dir: 'content/passages/2026-07-Sun' },
];
const items = [];
for (const g of GRADES) {
  const gdir = resolve(root, g.dir);
  for (const f of readdirSync(gdir).filter(f => /^\d{2}\.json$/.test(f)).sort()) {
    const d = JSON.parse(readFileSync(join(gdir, f), 'utf8'));
    items.push({
      grade: g.key, seq: parseInt(f, 10),
      meta: d.meta,
      title: d.page1?.title, subtitle: d.page1?.subtitle, body: d.page1?.body,
      questions: d.page2?.questions,
      sentences: d.page3?.sentences,
      translation_ko: d.page3?.translation_ko,
      answers: d.answers,
      vocab: d.page4?.vocab,
    });
  }
}
writeFileSync(resolve(root, 'audit/2026-07/_input.json'), JSON.stringify(items));
console.log(`[audit-bundle] ${items.length} passages → audit/2026-07/_input.json`);
```

Run: `cd textbook && node tools/audit-bundle.mjs`
Expected: `[audit-bundle] 60 passages → audit/2026-07/_input.json`

- [ ] **Step 2: Workflow 스크립트 작성**

Create `docs/superpowers/workflows/2026-07-audit.workflow.js`:
```javascript
export const meta = {
  name: '2026-07-textbook-audit',
  description: '2026-07 고등 60지문 4관점 병렬 검수 + 적대검증 + 심각도 판정',
  phases: [{ title: 'Review' }, { title: 'Verify' }],
}

// args = [{grade,seq,meta,title,subtitle,body,questions,sentences,translation_ko,answers,vocab}, ...] (60개)
const FINDING_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['lens', 'findings'],
  properties: {
    lens: { type: 'string', enum: ['language','explanation','translation','answer'] },
    findings: { type: 'array', items: { type: 'object', additionalProperties: false,
      required: ['severity','location','issue','evidence'],
      properties: {
        severity: { type: 'string', enum: ['blocker','warn','minor'] },
        location: { type: 'string' }, issue: { type: 'string' },
        evidence: { type: 'string' }, suggestion: { type: 'string' },
      } } },
  },
}
const VERDICT_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['isReal','confidence','reason'],
  properties: {
    isReal: { type: 'boolean' }, confidence: { type: 'string', enum: ['high','medium','low'] },
    reason: { type: 'string' },
  },
}

const LENSES = [
  { key: 'language', focus: '영문 본문(body)의 문법 오류, 비문, 어색한 표현, 학년 CEFR 수준 적합성. body만 본다.' },
  { key: 'explanation', focus: 'page3 구문분석(sentences)·grammar_note와 answers.explanations의 해설 논리가 본문 근거와 일치하는지, 비약/오류가 있는지.' },
  { key: 'translation', focus: 'page3.translation_ko가 영문 본문을 정확히 옮겼는지 — 오역·누락·과장. 문장 번호 단위로 대조.' },
  { key: 'answer', focus: '각 문제의 정답(answer_index/model_answer)이 본문 근거로 타당한지, 오답 선지의 변별력·함정이 적절한지.' },
]

function passagePrompt(p, lens) {
  return [
    `너는 한국 고등 영어 교재 검수 전문가다. 아래 지문을 "${lens.key}" 관점에서만 검수한다.`,
    `관점 초점: ${lens.focus}`,
    `학년: ${p.grade}, 지문번호: ${p.seq}, 라벨난이도: ${p.meta?.difficulty}/${p.meta?.lexile}.`,
    `실제 결함만 보고하라. 결함 없으면 findings 빈 배열. 추측성 지적 금지 — 반드시 evidence(본문 인용)를 단다.`,
    `심각도: blocker=정답이 틀렸거나 본문에 명백한 오류로 판매 불가 / warn=고치는 게 좋음 / minor=사소.`,
    `--- 지문 데이터(JSON) ---`,
    JSON.stringify({
      meta: p.meta, title: p.title, subtitle: p.subtitle, body: p.body,
      questions: p.questions, sentences: p.sentences, translation_ko: p.translation_ko,
      answers: p.answers, vocab: p.vocab,
    }),
  ].join('\n')
}

const results = await pipeline(
  args,
  // 스테이지 1: 4관점 병렬 검수 (지문 하나당)
  (p) => parallel(LENSES.map(lens => () =>
    agent(passagePrompt(p, lens), { label: `review:${p.grade}#${p.seq}:${lens.key}`, phase: 'Review', schema: FINDING_SCHEMA })
  )).then(lensResults => ({ p, lensResults: lensResults.filter(Boolean) })),
  // 스테이지 2: blocker/warn findings만 적대검증 (minor는 스킵)
  async ({ p, lensResults }) => {
    const flat = lensResults.flatMap(r => (r.findings||[]).map(f => ({ ...f, lens: r.lens })))
    const toVerify = flat.filter(f => f.severity === 'blocker' || f.severity === 'warn')
    const verified = await parallel(toVerify.map(f => () =>
      agent(
        `다음 검수 지적이 실제 결함인지 적대적으로 검증하라. 기본 입장은 "반박(isReal=false)"이며, 명확한 근거가 있을 때만 isReal=true.\n` +
        `지적: [${f.severity}/${f.lens}] ${f.issue}\n위치: ${f.location}\n근거주장: ${f.evidence}\n` +
        `--- 지문 ---\n` + JSON.stringify({ body: p.body, questions: p.questions, sentences: p.sentences, translation_ko: p.translation_ko, answers: p.answers }),
        { label: `verify:${p.grade}#${p.seq}`, phase: 'Verify', schema: VERDICT_SCHEMA }
      ).then(v => ({ ...f, verdict: v }))
    ))
    const confirmed = verified.filter(Boolean).filter(f => f.verdict?.isReal)
    const minors = flat.filter(f => f.severity === 'minor')
    return {
      grade: p.grade, seq: p.seq,
      confirmed,                          // 검증 통과한 blocker/warn
      minors,                             // minor(검증 생략)
      blockers: confirmed.filter(f => f.severity === 'blocker'),
    }
  }
)

return results.filter(Boolean)
```

- [ ] **Step 3: Workflow를 args와 함께 실행 (메인 세션에서 Workflow 툴 호출)**

이 단계는 코드가 아니라 Workflow 툴 호출이다:
- `scriptPath`: `docs/superpowers/workflows/2026-07-audit.workflow.js`
- `args`: `textbook/audit/2026-07/_input.json`의 내용(JSON 배열 60개)을 그대로 전달.
Expected: 60지문 × 4관점 review + 의심건 verify가 실행되고, `results`(지문별 판정 배열 60개)가 반환된다.

- [ ] **Step 4: 반환 결과를 지문별 JSON으로 저장 (메인 세션 Write)**

Workflow 반환 배열의 각 원소를 `textbook/audit/2026-07/<grade>/<NN>.json`으로 Write. NN은 2자리 zero-pad.
검증: `node -e "const fs=require('fs');const n=fs.readdirSync('textbook/audit/2026-07/saturn-g1').length+fs.readdirSync('textbook/audit/2026-07/jupiter-g2').length+fs.readdirSync('textbook/audit/2026-07/sun-g3').length;console.log('written',n)"`
Expected: `written 60`

- [ ] **Step 5: 커밋**

```bash
git add docs/superpowers/workflows/2026-07-audit.workflow.js textbook/tools/audit-bundle.mjs textbook/audit/2026-07/
git commit -m "feat(audit): L3 멀티에이전트 검수 워크플로 + 60지문 판정 산출

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 4: 종합 리포트 생성 (REPORT.md)

**Files:**
- Create: `textbook/tools/audit-report.mjs`
- Create(산출): `textbook/audit/2026-07/REPORT.md`

**Interfaces:**
- Consumes: `textbook/audit/2026-07/<grade>/<NN>.json` 60개, `_prepass.json`.
- Produces: `REPORT.md` — 학년별 blocker/warn/minor 집계 + 차단결함 우선 목록.

- [ ] **Step 1: audit-report.mjs 작성**

```javascript
#!/usr/bin/env node
// 지문별 판정 JSON 60개를 모아 REPORT.md 생성
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
const base = resolve(here, '..', 'audit/2026-07');
const GRADES = [['saturn-g1','고1 Saturn'],['jupiter-g2','고2 Jupiter'],['sun-g3','고3 Sun']];
const lines = ['# 2026-07 고등 교재 검수 리포트', ''];
let totalBlock = 0, totalWarn = 0, totalMinor = 0;
for (const [key, label] of GRADES) {
  const gdir = join(base, key);
  if (!existsSync(gdir)) continue;
  const files = readdirSync(gdir).filter(f => f.endsWith('.json')).sort();
  let gb = 0, gw = 0, gm = 0;
  const blockerLines = [];
  for (const f of files) {
    const r = JSON.parse(readFileSync(join(gdir, f), 'utf8'));
    const b = (r.blockers||[]).length;
    const w = (r.confirmed||[]).filter(x=>x.severity==='warn').length;
    const m = (r.minors||[]).length;
    gb += b; gw += w; gm += m;
    for (const blk of (r.blockers||[])) {
      blockerLines.push(`- **${label} #${r.seq}** [${blk.lens}] ${blk.issue} — \`${blk.location}\`  \n  근거: ${blk.evidence}${blk.suggestion?`  \n  권고: ${blk.suggestion}`:''}`);
    }
  }
  totalBlock += gb; totalWarn += gw; totalMinor += gm;
  lines.push(`## ${label} — 차단 ${gb} · 권고 ${gw} · 경미 ${gm}`, '');
  if (blockerLines.length) { lines.push('### 🚫 차단 결함', ...blockerLines, ''); }
  else { lines.push('차단 결함 없음 ✅', ''); }
}
lines.unshift(`> 합계: 차단 **${totalBlock}** · 권고 **${totalWarn}** · 경미 **${totalMinor}**  (생성: ${process.env.AUDIT_TS||'unstamped'})`, '');
writeFileSync(join(base, 'REPORT.md'), lines.join('\n'));
console.log(`[audit-report] 차단 ${totalBlock} / 권고 ${totalWarn} / 경미 ${totalMinor} → REPORT.md`);
```

- [ ] **Step 2: 실행**

Run: `cd textbook && AUDIT_TS=$(date -u +%FT%TZ) node tools/audit-report.mjs`
Expected: `[audit-report] 차단 N / 권고 N / 경미 N → REPORT.md`

- [ ] **Step 3: REPORT.md 확인**

Run: `head -40 textbook/audit/2026-07/REPORT.md`
Expected: 합계 줄 + 학년별 집계 + 차단 결함 목록(있으면).

- [ ] **Step 4: 커밋**

```bash
git add textbook/tools/audit-report.mjs textbook/audit/2026-07/REPORT.md
git commit -m "feat(audit): 종합 리포트 생성기 + 2026-07 REPORT.md

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>"
```

---

## Task 5: 메모리 정정 + 결과 보고

**Files:**
- Modify: 메모리 `project_terra_nova_2026_07_g1_progress.md`(stale "고1 #12~20 미완" 정정), `project_terra_nova_2026_07_lexile_mismatch.md`(검수 실측 반영)

- [ ] **Step 1: 검수 결과로 메모리 정정**

`project_terra_nova_2026_07_g1_progress.md`에 "2026-06-20 확인: 고1/2/3 각 20지문 + 풀북 빌드 완료, 내용 검수 리포트는 textbook/audit/2026-07/REPORT.md" 반영. Lexile mismatch 메모리에 이번 검수의 answer/translation 관련 confirmed findings 요약 추가.

- [ ] **Step 2: 사용자에게 REPORT.md 요약 보고**

차단 결함 건수·학년별 분포를 표로 제시하고, 다음 사이클(차단 0이면 표지·업로드 / 결함 있으면 수정 사이클) 선택지를 제시. **이 시점에서 작업 A 종료.**

---

## Self-Review (작성자 체크)

- **Spec 커버리지:** L1·L2(Task1) / L3 4관점+적대검증(Task3) / 산출 JSON·REPORT(Task3·4) / 범위경계=수정·업로드 없음(Global Constraints) / 메모리 정정(Task5). 스펙 §3~7 모두 태스크에 매핑됨.
- **Placeholder:** 모든 스크립트 전체 코드 포함, 명령·기대출력 명시. "적절히 처리" 류 없음.
- **타입 일관성:** FINDING_SCHEMA/VERDICT_SCHEMA가 Task2 정의 ↔ Task3 인라인 동일(lens enum, severity enum, isReal). 산출 경로 `audit/2026-07/<grade>/<NN>.json`와 report 읽기 경로 동일. grade 키(saturn-g1/jupiter-g2/sun-g3) 전 태스크 통일.
- **알려진 제약:** Workflow 스크립트 파일IO 불가 → 입력은 _input.json을 args로 주입(Task3 Step1·3), 출력은 메인 세션 Write(Task3 Step4)로 명시.
