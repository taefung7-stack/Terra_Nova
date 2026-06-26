#!/usr/bin/env node
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const here = dirname(fileURLToPath(import.meta.url));
const schemasDir = resolve(here, '..', 'schemas');
const highSchema = JSON.parse(readFileSync(resolve(schemasDir, 'passage.schema.json'), 'utf8'));
const middleSchema = JSON.parse(readFileSync(resolve(schemasDir, 'passage.mid.schema.json'), 'utf8'));

function makeElementarySchema() {
  const schema = JSON.parse(JSON.stringify(highSchema));
  schema.$id = 'https://terranova.app/schemas/passage-elementary-2.2.json';
  schema.title = 'Terra Nova Passage ELEMENTARY v2.2 (MARS)';
  schema.properties.id.pattern = '^\\d{4}-\\d{2}-Mars-\\d{2}$';
  schema.properties.meta.properties.month.pattern = '^\\d{4}-\\d{2}-Mars$';
  schema.properties.meta.properties.subject.enum = ['과학', '사회', '수학', '인문', '문학·예술', '국어', '도덕', '미술', '음악'];
  schema.properties.meta.properties.achievement_standard.pattern = '^[3-6](과|사|수|국|도|미|음)\\d{2}-\\d{2}$';
  schema.properties.meta.properties.ar_level.maximum = 6.0;
  schema.properties.page1.properties.body.minLength = 500;
  schema.properties.page1.properties.body.maxLength = 1100;
  schema.properties.page1.properties.illustration.pattern = '^\\.\\./\\.\\./assets/illustrations/\\d{4}-\\d{2}-Mars/\\d{2}\\.(svg|png|jpg|webp)$';
  schema.properties.page2.properties.textbook_tieback.properties.body_ko.minLength = 100;
  schema.properties.page2.properties.textbook_tieback.properties.body_ko.maxLength = 350;
  schema.properties.page3.properties.sentences.items.properties.grammar_note.minLength = 0;
  schema.properties.page3.properties.translation_ko.minLength = 300;
  schema.properties.page3.properties.translation_ko.maxLength = 900;
  return schema;
}

const elementarySchema = makeElementarySchema();

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validators = {
  high: ajv.compile(highSchema),
  middle: ajv.compile(middleSchema),
  elementary: ajv.compile(elementarySchema),
};

const PROFILES = {
  high: {
    label: '고등',
    bodyWords: [290, 360],
    questionMix: { mock_objective: 3, school_descriptive: 1 },
    requireAchievementVerified: true,
  },
  middle: {
    label: '중등',
    bodyWords: [220, 320],
    questionMix: { mock_objective: 1, tf_evidence: 1, short_translate: 1, short_answer: 1 },
    requireAchievementVerified: true,
  },
  elementary: {
    label: '초등',
    bodyWords: [100, 160],
    questionMix: { mock_objective: 3, school_descriptive: 1 },
    requireAchievementVerified: false,
  },
};

function countWords(text = '') {
  // Strip custom markers like <u>...</u> and <blank> before counting
  const cleaned = text
    .replace(/<\/?u>/g, ' ')
    .replace(/<blank>/g, ' blank ')
    .replace(/<\/?mark>/g, ' ');
  return cleaned.trim().split(/\s+/).filter(Boolean).length;
}

function profileFor(data) {
  if (data.schema_version === '2.2-mid') return 'middle';
  const month = data.meta?.month || data.id || '';
  if (/-Mars(?:-|$)/.test(month) || /-Mars-/.test(data.id || '')) return 'elementary';
  return 'high';
}

// Subject taxonomy ↔ curriculum-unit consistency map.
// Used by R3 (label-unit consistency) below.
// Add new keywords here as new subjects/units appear.
const UNIT_KEYWORDS_BY_SUBJECT = {
  '도덕': ['윤리', '도덕', '인문학과 윤리', '생활과 윤리', '윤리와 사상',
          '윤리 문제 탐구', '윤리문제 탐구', '통합도덕'],
  '사회': ['사회', '정치', '경제', '한국지리', '세계지리', '동아시아사', '세계사',
          '사회·문화', '사회문제 탐구', '통합사회'],
  '과학': ['과학', '물리', '화학', '생명', '생물', '지구', '통합과학',
          '역학', '에너지', '전자기', '양자', '세포', '물질대사', '유전',
          '행성', '우주', '환경', '화학반응', '지구시스템'],
  '수학': ['수학', '미적분', '기하', '확률과 통계', '경제수학', '경제 수학',
          '공통수학'],
  '국어': ['국어', '문학', '독서', '화법', '작문', '언어와 매체',
          '주제 통합 독서', '주제 탐구', '문학과 영상', '매체'],
  '통합과학': ['과학', '물질', '생명', '역학', '중력', '뉴턴', '탄소', '진화',
            '화학', '산', '염기', '중화', '에너지', '생태', '생물', '다양성',
            '환경', '기후', '효율'],
  '통합사회': ['사회', '관계', '도시', '기후', '계절풍', '지형', '농업', '문화',
            '인권', '헌법', '시장경제', '경제', '합리적', '자산', '금융',
            '지속가능', '발전'],
  '공통수학': ['수학', '경우의 수', '방정식', '부등식', '도형', '좌표',
            '다항식', '집합', '명제', '함수', '그래프'],
  '공통국어': ['국어', '서술', '시점', '구비문학', '매체', '음운', '문법',
            '작문', '쓰기', '논증'],
};

function addError(errors, instancePath, message) {
  errors.push({ instancePath, message });
}

function addWarn(warnings, instancePath, message) {
  warnings.push({ instancePath, message });
}

/* Strip author markup so we can search the raw English body. */
function plainBody(body = '') {
  return String(body)
    .replace(/<\/?u>/g, '')
    .replace(/<\/?mark>/g, '')
    .replace(/<blank>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* All English text marked with <u>…</u> in the body, lowercased. */
function underlinedSpans(body = '') {
  return [...String(body).matchAll(/<u>([\s\S]*?)<\/u>/g)].map(m => m[1].toLowerCase().trim());
}

/* ---- 이슈 1: 정답 보기 길이 균형 (WARN) ----
   정답 보기가 오답 평균의 1.4배 이상이면서 동시에 가장 길면 경고.
   "가장 긴 게 정답" 패턴을 학생이 눈치채는 것을 막기 위함. 차단은 안 함. */
function validateAnswerLengthBalance(data, warnings) {
  const qs = data.page2?.questions || [];
  qs.forEach((q, i) => {
    if (q.type !== 'mock_objective' || !Array.isArray(q.choices)) return;
    const lens = q.choices.map(c => String(c).trim().length);
    const ai = q.answer_index;
    if (!Number.isInteger(ai) || ai < 0 || ai >= lens.length) return;
    const ansLen = lens[ai];
    const others = lens.filter((_, k) => k !== ai);
    if (!others.length) return;
    const mean = others.reduce((a, b) => a + b, 0) / others.length;
    const isLongest = ansLen === Math.max(...lens);
    if (isLongest && mean > 0 && ansLen >= mean * 1.4) {
      addWarn(warnings, `/page2/questions/${i}`,
        `정답 보기(idx ${ai})가 가장 길고 오답 평균의 ${(ansLen / mean).toFixed(2)}배 — 길이로 정답이 노출됨. 오답과 비슷한 길이로 재작성 권장`);
    }
  });
}

/* ---- 이슈 4: 본문↔문제 밑줄 정합 (ERROR) ----
   stem이 "밑줄 친 …" 으로 본문 표현을 인용하면, 인용된 영어 구가
   page1.body에 <u>…</u> 로 실제 존재해야 한다. 없으면 차단. */
function validateUnderlineConsistency(data, errors) {
  const body = data.page1?.body || '';
  const spans = underlinedSpans(body);
  const plain = plainBody(body).toLowerCase();
  const qs = data.page2?.questions || [];
  qs.forEach((q, i) => {
    const stem = String(q.stem || q.prompt || '');
    if (!/밑줄\s*친/.test(stem)) return;
    // 빈칸(밑줄 친 빈칸) 류는 <blank>가 담당하므로 제외.
    if (/빈칸/.test(stem)) return;
    // stem에서 인용된 영어 구 추출: 연속된 영문 단어(2+) 토막.
    const cited = [...stem.matchAll(/[A-Za-z][A-Za-z'’-]*(?:\s+[A-Za-z][A-Za-z'’-]*)+/g)]
      .map(m => m[0].toLowerCase().trim())
      .filter(s => s.split(/\s+/).length >= 2);
    if (!cited.length) return;
    for (const phrase of cited) {
      const inUnderline = spans.some(u => u.includes(phrase) || phrase.includes(u));
      if (inUnderline) continue;
      const inBody = plain.includes(phrase);
      if (inBody) {
        addError(errors, `/page2/questions/${i}/stem`,
          `밑줄 인용구 "${phrase}" 가 본문에 있으나 <u>…</u> 표시가 없음 — 본문에 밑줄 추가 필요`);
      } else {
        addError(errors, `/page2/questions/${i}/stem`,
          `밑줄 인용구 "${phrase}" 가 본문 표현과 불일치 — 본문 실제 표현으로 stem 수정 + <u> 표시 필요`);
      }
    }
  });
}

/* ---- 이슈 6: 단어장 단어가 본문에 등장 (WARN) ---- */
function validateVocabInBody(data, warnings) {
  const plain = plainBody(data.page1?.body || '').toLowerCase();
  const vocab = data.page4?.vocab || [];
  vocab.forEach((v, i) => {
    const w = String(v.word || '').toLowerCase().trim();
    if (!w) return;
    const stem = w.replace(/(ing|ed|es|s|ly)$/,'');
    const re = new RegExp(`\\b${stem.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}`, 'i');
    if (!re.test(plain)) {
      addWarn(warnings, `/page4/vocab/${i}`,
        `단어장 단어 "${v.word}" 가 본문에 등장하지 않음 — 본문 고급어 위주로 교체 권장`);
    }
  });
}

/* ---- 이슈 3: 한글 띄어쓰기 깨짐 (WARN) ---- */
const KO_FIELDS_DESC = [
  ['/page3/translation_ko', d => d.page3?.translation_ko],
  ['/page2/textbook_tieback/body_ko', d => d.page2?.textbook_tieback?.body_ko],
];
function koSpacingIssues(text = '') {
  const t = String(text);
  const hits = [];
  if (/ {2,}/.test(t)) hits.push('이중 공백');
  if (/[가-힣A-Za-z0-9] +[,.;)\]！？!?]/.test(t)) hits.push('구두점/닫는괄호 앞 공백');
  if (/[(\[] +/.test(t)) hits.push('여는괄호 뒤 공백');
  if (/[가-힣] +·|· +[가-힣]/.test(t)) hits.push('가운뎃점 주변 공백');
  return hits;
}
function validateKoSpacing(data, warnings) {
  for (const [path, get] of KO_FIELDS_DESC) {
    const hits = koSpacingIssues(get(data) || '');
    if (hits.length) addWarn(warnings, path, `한글 띄어쓰기 의심: ${[...new Set(hits)].join(', ')}`);
  }
  // examples[].ko + vocab meaning
  (data.page4?.vocab || []).forEach((v, i) => {
    (v.examples || []).forEach((ex, j) => {
      const hits = koSpacingIssues(ex.ko || '');
      if (hits.length) addWarn(warnings, `/page4/vocab/${i}/examples/${j}/ko`, `한글 띄어쓰기 의심: ${[...new Set(hits)].join(', ')}`);
    });
  });
  // descriptive question prompt (Q4 한글 발문)
  (data.page2?.questions || []).forEach((q, i) => {
    if (q.type !== 'school_descriptive') return;
    const hits = koSpacingIssues(q.prompt || '');
    if (hits.length) addWarn(warnings, `/page2/questions/${i}/prompt`, `한글 띄어쓰기 의심: ${[...new Set(hits)].join(', ')}`);
  });
}

function validateQuestionMix(data, profile, errors) {
  const expected = PROFILES[profile].questionMix;
  const qs = data.page2?.questions || [];
  for (const [type, count] of Object.entries(expected)) {
    const actual = qs.filter(q => q.type === type).length;
    if (actual !== count) {
      addError(errors, '/page2/questions', `expected ${count} ${type}, got ${actual}`);
    }
  }
}

function validateAnswerConsistency(data, errors) {
  const qs = data.page2?.questions || [];
  const explanations = data.answers?.explanations || [];
  if (explanations.length !== qs.length) {
    addError(errors, '/answers/explanations', `expected ${qs.length} explanations, got ${explanations.length}`);
  }
  const expByIndex = new Map(explanations.map(e => [e.q_index, e]));

  for (let i = 0; i < qs.length; i++) {
    const q = qs[i];
    const exp = expByIndex.get(i);
    if (!exp) {
      addError(errors, `/answers/explanations`, `missing explanation for question ${i + 1}`);
      continue;
    }

    if (q.type === 'mock_objective') {
      if (exp.correct !== q.answer_index) {
        addError(errors, `/answers/explanations/${i}/correct`, `correct=${exp.correct} does not match answer_index=${q.answer_index}`);
      }
      if ((exp.rationales || []).length !== (q.choices || []).length) {
        addError(errors, `/answers/explanations/${i}/rationales`, `expected ${(q.choices || []).length} rationales, got ${(exp.rationales || []).length}`);
      }
    } else if (exp.correct !== null && exp.correct !== undefined) {
      addError(errors, `/answers/explanations/${i}/correct`, `non-objective question should use correct=null`);
    }
  }
}

function validateCommonContentRules(data, profile, errors, warnings) {
  const [minWords, maxWords] = PROFILES[profile].bodyWords;
  const wc = countWords(data.page1?.body || '');
  if (wc < minWords || wc > maxWords) {
    addError(errors, '/page1/body', `word count ${wc} is outside ${minWords}–${maxWords} for ${PROFILES[profile].label}`);
  }

  const blankCount = ((data.page1?.body || '').match(/<blank>/g) || []).length;
  if (blankCount !== 1) {
    addError(errors, '/page1/body', `expected exactly one <blank>, got ${blankCount}`);
  }

  validateQuestionMix(data, profile, errors);
  validateAnswerConsistency(data, errors);

  if (PROFILES[profile].requireAchievementVerified && data.meta?.achievement_verified !== true) {
    addError(errors, '/meta/achievement_verified', `NCIC 검증 미완 (achievement_verified=${data.meta?.achievement_verified}). tools/mark-verified.mjs 후 재실행`);
  }

  const subj = data.meta?.subject;
  const unit = data.meta?.linked_unit || '';
  const subjKeywords = UNIT_KEYWORDS_BY_SUBJECT[subj];
  if (profile === 'high' && subjKeywords && !subjKeywords.some(k => unit.includes(k))) {
    let suggested = null;
    for (const [sname, kws] of Object.entries(UNIT_KEYWORDS_BY_SUBJECT)) {
      if (kws.some(k => unit.includes(k))) { suggested = sname; break; }
    }
    addError(errors, '/meta/subject',
      `subject="${subj}"이 linked_unit="${unit}"의 키워드와 불일치` +
      (suggested ? ` (suggest: "${suggested}")` : '')
    );
  }

  // ---- 2026-07 검수 결함 방지 규칙 ----
  if (profile === 'high') {
    validateUnderlineConsistency(data, errors);          // 이슈 4: 차단
    validateAnswerLengthBalance(data, warnings);         // 이슈 1: 경고
    validateVocabInBody(data, warnings);                 // 이슈 6: 경고
    validateKoSpacing(data, warnings);                   // 이슈 3: 경고
  }
}

export function validatePassage(data, options = {}) {
  const profile = options.profile && options.profile !== 'auto' ? options.profile : profileFor(data);
  const ajvValidate = validators[profile];
  if (!ajvValidate) throw new Error(`unknown validation profile: ${profile}`);

  const ok = ajvValidate(data);
  const errors = ok ? [] : (ajvValidate.errors ?? []).map(e => ({ ...e }));
  const warnings = [];
  if (ok) validateCommonContentRules(data, profile, errors, warnings);

  return { ok: errors.length === 0, errors, warnings, profile };
}

// Multi-passage balance check. Run after per-passage validation across a month.
// Warns (does not error) when a single subject exceeds 50% of the book.
export function checkBalance(passages) {
  const subs = {};
  for (const p of passages) {
    const s = p.meta?.subject;
    if (s) subs[s] = (subs[s] || 0) + 1;
  }
  const total = passages.length;
  const warnings = [];
  for (const [s, n] of Object.entries(subs)) {
    const pct = (n / total) * 100;
    if (pct > 50) {
      warnings.push(`subject 비중 경고: ${s} ${n}/${total} (${pct.toFixed(0)}%) — 다음 달에 균형 조정 권장`);
    }
  }
  return { distribution: subs, warnings };
}

export function checkAnswerBalance(passages) {
  const counts = {};
  for (const p of passages) {
    for (const q of p.page2?.questions || []) {
      if (q.type === 'mock_objective' && Number.isInteger(q.answer_index)) {
        const label = String(q.answer_index + 1);
        counts[label] = (counts[label] || 0) + 1;
      }
    }
  }
  const values = Object.values(counts);
  const warnings = [];
  if (values.length >= 2) {
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (max - min >= 10 || (min > 0 && max / min >= 2.5)) {
      warnings.push(`objective answer balance warning: ${Object.entries(counts).map(([k, v]) => `${k}:${v}`).join(' / ')}`);
    }
  }
  return { distribution: counts, warnings };
}

function listPassageFiles(monthDir) {
  return readdirSync(monthDir)
    .filter(n => /^\d{2}\.json$/.test(n))
    .map(n => join(monthDir, n))
    .sort();
}

async function cli() {
  const { values } = parseArgs({
    options: {
      month: { type: 'string' },
      file:  { type: 'string' },
      profile: { type: 'string', default: 'auto' }
    }
  });
  const root = resolve(here, '..', 'content', 'passages');
  let targets = [];
  if (values.file) {
    targets = [resolve(values.file)];
  } else if (values.month) {
    targets = listPassageFiles(join(root, values.month));
  } else {
    console.error('usage: validate-content --month YYYY-MM [--profile auto|high|middle|elementary]  |  --file path.json [--profile ...]');
    process.exit(2);
  }

  let failures = 0;
  const allPassages = [];
  for (const f of targets) {
    const data = JSON.parse(readFileSync(f, 'utf8'));
    allPassages.push(data);
    const { ok, errors, warnings, profile } = validatePassage(data, { profile: values.profile });
    if (ok) {
      console.log(`OK  [${profile}] ${f}`);
    } else {
      failures++;
      console.error(`FAIL [${profile}] ${f}`);
      for (const e of errors) {
        console.error(`     ${e.instancePath || '(root)'}: ${e.message}`);
      }
    }
    for (const w of (warnings || [])) {
      console.warn(`WARN [${profile}] ${f}\n     ${w.instancePath || '(root)'}: ${w.message}`);
    }
  }

  // Cross-passage balance check — warnings only, doesn't fail the build
  if (allPassages.length >= 5) {
    const { distribution, warnings } = checkBalance(allPassages);
    console.log(`\n과목 분포: ${Object.entries(distribution).map(([s, n]) => `${s}:${n}`).join(' / ')}`);
    for (const w of warnings) console.warn(`WARN  ${w}`);
    const answerBalance = checkAnswerBalance(allPassages);
    if (Object.keys(answerBalance.distribution).length) {
      console.log(`정답 분포: ${Object.entries(answerBalance.distribution).map(([s, n]) => `${s}:${n}`).join(' / ')}`);
      for (const w of answerBalance.warnings) console.warn(`WARN  ${w}`);
    }
  }

  if (failures) {
    console.error(`\n${failures} file(s) failed validation`);
    process.exit(1);
  }
}

const isDirectRun = process.argv[1] && import.meta.url.startsWith('file:') && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isDirectRun) cli();
