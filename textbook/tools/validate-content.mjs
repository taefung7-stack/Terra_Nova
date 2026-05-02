#!/usr/bin/env node
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const here = dirname(fileURLToPath(import.meta.url));
const schemaPath = resolve(here, '..', 'schemas', 'passage.schema.json');
const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const ajvValidate = ajv.compile(schema);

const BODY_WORD_MIN = 290;
const BODY_WORD_MAX = 360;   // raised 2026-05 (SUN run): page 1 left big blank above illustration; ~330-355 fills the body box. Page 3 still fits when sentences ≤ 20 (schema cap) and segments ≤ 16 each.

function countWords(text) {
  // Strip custom markers like <u>...</u> and <blank> before counting
  const cleaned = text
    .replace(/<\/?u>/g, ' ')
    .replace(/<blank>/g, ' blank ')
    .replace(/<\/?mark>/g, ' ');
  return cleaned.trim().split(/\s+/).filter(Boolean).length;
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
};

export function validatePassage(data) {
  const ok = ajvValidate(data);
  const errors = ok ? [] : (ajvValidate.errors ?? []).map(e => ({ ...e }));

  if (ok) {
    const wc = countWords(data.page1.body);
    if (wc < BODY_WORD_MIN || wc > BODY_WORD_MAX) {
      errors.push({
        instancePath: '/page1/body',
        message: `word count ${wc} is outside ${BODY_WORD_MIN}–${BODY_WORD_MAX}`
      });
    }

    const qs = data.page2.questions;
    const mockCount = qs.filter(q => q.type === 'mock_objective').length;
    const descCount = qs.filter(q => q.type === 'school_descriptive').length;
    if (mockCount !== 3 || descCount !== 1) {
      errors.push({
        instancePath: '/page2/questions',
        message: `expected 3 mock_objective + 1 school_descriptive, got ${mockCount} + ${descCount}`
      });
    }

    // R1 — NCIC verification flag
    // false = passage built from body-derived guess; not yet cross-checked
    // against the official 2022 개정 성취기준 catalog. Block builds.
    if (data.meta.achievement_verified !== true) {
      errors.push({
        instancePath: '/meta/achievement_verified',
        message: `NCIC 검증 미완 (achievement_verified=${data.meta.achievement_verified}). tools/mark-verified.mjs 후 재실행`
      });
    }

    // R2 — Subject label ↔ linked_unit keyword consistency
    // Catches the "사회 vs 도덕 (윤리)" class of mislabeling found in 2026-06-Sun
    // p06/p15 — the linked_unit name comes from the official 교육과정,
    // so its keywords should match the umbrella subject category.
    const subj = data.meta.subject;
    const unit = data.meta.linked_unit || '';
    const subjKeywords = UNIT_KEYWORDS_BY_SUBJECT[subj];
    if (subjKeywords && !subjKeywords.some(k => unit.includes(k))) {
      // Try to suggest the right umbrella by scanning all maps
      let suggested = null;
      for (const [sname, kws] of Object.entries(UNIT_KEYWORDS_BY_SUBJECT)) {
        if (kws.some(k => unit.includes(k))) { suggested = sname; break; }
      }
      errors.push({
        instancePath: '/meta/subject',
        message: `subject="${subj}"이 linked_unit="${unit}"의 키워드와 불일치` +
                 (suggested ? ` (suggest: "${suggested}")` : '')
      });
    }
  }

  return { ok: errors.length === 0, errors };
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
      file:  { type: 'string' }
    }
  });
  const root = resolve(here, '..', 'content', 'passages');
  let targets = [];
  if (values.file) {
    targets = [resolve(values.file)];
  } else if (values.month) {
    targets = listPassageFiles(join(root, values.month));
  } else {
    console.error('usage: validate-content --month YYYY-MM  |  --file path.json');
    process.exit(2);
  }

  let failures = 0;
  const allPassages = [];
  for (const f of targets) {
    const data = JSON.parse(readFileSync(f, 'utf8'));
    allPassages.push(data);
    const { ok, errors } = validatePassage(data);
    if (ok) {
      console.log(`OK  ${f}`);
    } else {
      failures++;
      console.error(`FAIL ${f}`);
      for (const e of errors) {
        console.error(`     ${e.instancePath || '(root)'}: ${e.message}`);
      }
    }
  }

  // Cross-passage balance check — warnings only, doesn't fail the build
  if (allPassages.length >= 5) {
    const { distribution, warnings } = checkBalance(allPassages);
    console.log(`\n과목 분포: ${Object.entries(distribution).map(([s, n]) => `${s}:${n}`).join(' / ')}`);
    for (const w of warnings) console.warn(`WARN  ${w}`);
  }

  if (failures) {
    console.error(`\n${failures} file(s) failed validation`);
    process.exit(1);
  }
}

const isDirectRun = process.argv[1] && import.meta.url.startsWith('file:') && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isDirectRun) cli();
