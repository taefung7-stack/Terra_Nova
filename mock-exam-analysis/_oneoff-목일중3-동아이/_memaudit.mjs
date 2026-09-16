#!/usr/bin/env node
/* ===================================================================
 * 목일중3 동아(이병민) — 본문암기 산출물(PDF) 전수 검수
 * ===================================================================
 * verify.mjs 가 "데이터"를 보는 반면, 이 스크립트는 **실제로 찍힌 PDF**를 본다.
 * .page-body 가 overflow:hidden 이라 넘친 문항은 에러 없이 잘린 채 인쇄되므로,
 * 원문 전 문장이 정답면에 실제로 존재하는지 텍스트 덤프로 확인한다.
 *
 * 선행 조건 — 텍스트 덤프를 먼저 만들어야 한다(없으면 ENOENT 로 죽는다):
 *   python _memaudit-extract.py [L6|L7|L8]
 *
 * 사용법:
 *   node _memaudit.mjs        # L6·L7·L8
 *   node _memaudit.mjs L7     # 한 과만
 * =================================================================== */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SOURCE as SOURCE_L6 } from './_SOURCE-L6.js';
import { SOURCE as SOURCE_L7 } from './_SOURCE-L7.js';
import { SOURCE as SOURCE_L8 } from './_SOURCE-L8.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const LESSONS = {
  L6: { source: SOURCE_L6, label: 'Lesson 6 · Make the World Beautiful' },
  L7: { source: SOURCE_L7, label: 'Lesson 7 · Feel the Wonder' },
  L8: { source: SOURCE_L8, label: 'Lesson 8 · Up to You' },
};

/* 대조용 정규화.
   ★ 함정: 분석지·암기장 PDF 는 텍스트 레이어에서 영문이 자간 분리되어
     ("s c i e n t i f i c") 추출된다. 그래서 **공백을 전부 제거하고** 비교한다.
     곱슬따옴표·대시 변형도 흡수한다(표기 차이는 결함이 아니다). */
function squash(s) {
  return String(s ?? '')
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[‐-―–—]/g, '-')
    .replace(/\s+/g, '')
    .toLowerCase();
}

const only = (process.argv[2] || '').toUpperCase();
const targets = only ? [only] : Object.keys(LESSONS);
if (only && !LESSONS[only]) {
  console.error(`알 수 없는 과: ${only} (L6 / L7 / L8)`);
  process.exit(2);
}

let errors = 0;
console.log('🔍 목일중3 동아(이병민) — 본문암기 PDF 전수 검수\n');

for (const L of targets) {
  const { source, label } = LESSONS[L];
  const dumpPath = path.join(__dirname, 'dist', '_memaudit', `${L}.txt`);
  console.log(`${'═'.repeat(58)}\n${L} — ${label}\n${'═'.repeat(58)}`);

  let dump;
  try {
    dump = await fs.readFile(dumpPath, 'utf8');
  } catch {
    console.error(`   ❌ 텍스트 덤프 없음: dist/_memaudit/${L}.txt`);
    console.error('      → python _memaudit-extract.py ' + L + ' 를 먼저 실행할 것');
    errors++;
    continue;
  }

  const hay = squash(dump);
  const sentences = source.flatMap(ch => ch.sentences);
  let missing = 0;

  sentences.forEach((en, i) => {
    if (!hay.includes(squash(en))) {
      console.error(`   ❌ ${i + 1}번 문장이 정답면에 없음: ${en.slice(0, 64)}…`);
      missing++;
    }
  });

  const pages = dump.split('<<<PAGE>>>').length;
  if (missing) {
    console.error(`   ✗ ${L}: 원문 ${sentences.length}문장 중 ${missing}건 누락 (${pages}p)`);
    errors += missing;
  } else {
    console.log(`   ✅ 원문 ${sentences.length}문장 전수 수록 확인 (${pages}p)`);
  }
  console.log('');
}

if (errors) {
  console.error(`\n❌ 검수 실패 — ${errors}건`);
  process.exit(1);
}
console.log('✅ 검수 통과 — 문장 누락 0');
