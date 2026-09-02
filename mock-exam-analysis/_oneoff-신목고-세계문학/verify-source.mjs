#!/usr/bin/env node
/* ===================================================================
 * 원문 정본 채움 검사 (_SOURCE-U*.js)
 * ===================================================================
 * 분석지 JSON 을 쓰기 '전에' 정본이 제대로 채워졌는지 먼저 확인한다.
 * verify.mjs 는 정본과 JSON 을 대조하지만, 정본 자체가 비어 있으면
 * "둘 다 비어서 통과" 하는 착시가 생긴다. 그 구멍을 막는 검사다.
 *
 * 검사 항목
 *   1) 챕터별 sentences / blog.sentences 가 비어 있지 않은가
 *   2) 문장처럼 보이지 않는 원소(빈 문자열·공백·너무 짧은 조각)
 *   3) 문장 끝 구두점 누락 (전사 중 잘림 의심)
 *   4) 약어 오분할 흔적 (p.m. / a.m. / St. / Mr. 뒤에서 끊긴 조각)
 *   5) 중복 문장 (복붙 사고)
 *
 * 사용법:
 *   node _oneoff-신목고-세계문학/verify-source.mjs U2
 *   node _oneoff-신목고-세계문학/verify-source.mjs        # 전체
 * =================================================================== */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** 유닛 등록 — 새 유닛을 만들면 여기에 한 줄 추가한다. */
const UNITS = [
  { id: 'U1', file: './_SOURCE-U1.js', label: 'Unit 1 · Korean Culture from Different Angles', shape: 'comments' },
  { id: 'U2', file: './_SOURCE-U2.js', label: 'Unit 2 · A French Student in Dublin', shape: 'blog' },
];

const only = (process.argv[2] || '').toUpperCase();
const TARGETS = only ? UNITS.filter(u => u.id === only) : UNITS;
if (!TARGETS.length) {
  console.error(`알 수 없는 유닛: ${only} (${UNITS.map(u => u.id).join(', ')})`);
  process.exit(2);
}

let errors = 0;
let warns = 0;
const err = (m) => { console.error(`   ❌ ${m}`); errors++; };
const warn = (m) => { console.warn(`   ⚠️  ${m}`); warns++; };

/** 유닛 구조에 따라 '본문 묶음' 목록을 뽑는다.
 *  comments 형(U1): 게시글 + 댓글 N개
 *  blog 형(U2)    : PART 본문 + 블로그 1개 */
function groupsOf(ch, shape) {
  if (shape === 'blog') {
    return [
      { name: ch.part || '본문', sentences: ch.sentences || [] },
      { name: ch.blog?.title || 'Blog', sentences: ch.blog?.sentences || [] },
    ];
  }
  return [
    { name: '게시글', sentences: ch.sentences || [] },
    ...(ch.comments || []).map(c => ({ name: `댓글 ${c.user}`, sentences: c.sentences || [] })),
  ];
}

console.log('🔍 원문 정본 채움 검사\n');

for (const unit of TARGETS) {
  console.log(`${'═'.repeat(62)}\n${unit.id} — ${unit.label}\n${'═'.repeat(62)}`);

  let SOURCE;
  try {
    ({ SOURCE } = await import(unit.file));
  } catch (e) {
    err(`${unit.file} 을 읽을 수 없음: ${e.message}`);
    continue;
  }

  const seen = new Map();          // 중복 문장 탐지 (유닛 전체 기준)
  const rows = [];

  for (const ch of SOURCE) {
    const groups = groupsOf(ch, unit.shape);
    const counts = [];
    let chTotal = 0;

    console.log(`── Chapter ${ch.no} · ${ch.subtitle}  (${ch.page || '?'})`);

    for (const g of groups) {
      const list = g.sentences;
      chTotal += list.length;
      counts.push(`${g.name} ${list.length}`);

      if (!list.length) {
        err(`Ch${ch.no} "${g.name}" 이 비어 있음 ← 전사 미완료`);
        continue;
      }

      list.forEach((s, i) => {
        const at = `Ch${ch.no} "${g.name}" [${i}]`;

        if (typeof s !== 'string') { err(`${at} 문자열이 아님`); return; }
        const t = s.trim();
        if (!t) { err(`${at} 빈 문장`); return; }

        // 너무 짧은 조각 — 전사 중 잘렸을 가능성
        if (t.length < 8) warn(`${at} 가 너무 짧음: "${t}"`);

        // 문장 끝 구두점 — 인용부호로 닫히는 경우도 허용
        if (!/[.!?][")'\]]*$/.test(t)) {
          warn(`${at} 끝에 문장부호가 없음 (잘림 의심): "…${t.slice(-42)}"`);
        }

        // 약어에서 끊긴 흔적 — 조각이 약어로 끝나면 다음 조각과 붙어야 할 가능성
        if (/\b(p\.m|a\.m|St|Mr|Mrs|Ms|Dr|etc|vs|approx)\.$/i.test(t)) {
          warn(`${at} 가 약어 마침표로 끝남 ← 문장 오분할 의심: "…${t.slice(-42)}"`);
        }

        // 좌우 공백 / 이중 공백
        if (s !== t) warn(`${at} 앞뒤 공백이 있음`);
        if (/\s{2,}/.test(t)) warn(`${at} 이중 공백이 있음`);

        // 중복
        const key = t.replace(/\s+/g, ' ').toLowerCase();
        if (seen.has(key)) warn(`${at} 가 ${seen.get(key)} 와 동일한 문장 ← 복붙 의심`);
        else seen.set(key, at);
      });
    }

    console.log(`   ${counts.join(' · ')}  →  계 ${chTotal}`);
    rows.push({ no: ch.no, counts, total: chTotal });
    console.log('');
  }

  const grand = rows.reduce((a, r) => a + r.total, 0);
  console.log('─'.repeat(62));
  console.log(`${unit.id} 총 문장: ${grand}`);
  if (grand) {
    console.log('\n  | Ch | ' + '구성'.padEnd(28) + ' | 계 |');
    console.log('  |----|' + '-'.repeat(30) + '|----|');
    for (const r of rows) {
      console.log(`  | ${String(r.no).padEnd(2)} | ${r.counts.join(' · ').padEnd(28)} | ${String(r.total).padStart(2)} |`);
    }
  }
  console.log('');
}

console.log('═'.repeat(62));
if (errors) {
  console.error(`\n❌ 정본 미완성 — 오류 ${errors}건, 경고 ${warns}건`);
  console.error('   원문을 채운 뒤 다시 실행하세요. (분석지 JSON 작성은 그 다음입니다)');
  process.exit(1);
}
console.log(`\n✅ 정본 채움 확인 — 오류 0건, 경고 ${warns}건`);
