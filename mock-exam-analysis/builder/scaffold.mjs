#!/usr/bin/env node
/**
 * Terra Nova 분석지 스캐폴드 생성기
 *
 * 본문(passage)만 가진 최소 입력을 받아 빈 필드를 자동으로 채운
 * data/{번호}.json 초안을 생성합니다.
 *
 * 사용법 1) 입력 파일에서 생성:
 *   node builder/scaffold.mjs <input.json> <data-dir>
 *
 * 사용법 2) stdin에서 본문만 받기:
 *   echo "본문 영어" | node builder/scaffold.mjs --stdin --no=21 --exam="[2026] 3월 모의고사 2학년" 2026-march-grade2/data
 *
 * 입력 최소 스펙 (input.json 예시):
 *   {
 *     "exam": "[2026] 3월 모의고사 2학년",
 *     "question_no": 21,
 *     "type": "밑줄 추론",
 *     "score": 3,
 *     "question_text": "...",
 *     "passage": ["문장 1", "문장 2", ...],
 *     "passage_ko": ["해석 1", "해석 2", ...],   // 있으면 사용, 없으면 빈 칸
 *     "choices": [...],                          // 있으면 사용
 *     "answer_no": 2,
 *     "key_words": ["establish", "respectful", ...]   // 단어장 후보
 *   }
 *
 * 빈 필드(summary_ko, main_idea_en, title_en, flow, sentences 등)는 TODO 마커로 채워
 * 사람이 빠르게 채울 수 있도록 합니다.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

// ─────────────────────────────────────────────────────────────
// 본문에서 자주 등장하는 단어를 뽑는 간이 어휘 추출기
// (불용어 + 길이 4↑ 기준, 빈도 상위 25개)
// ─────────────────────────────────────────────────────────────
const STOPWORDS = new Set('the a an and or but if when while because as of in on at to from by with for that this these those is are was were be been being have has had do does did not no so it its we you they he she his her their our your my me them us i an by for of on or to up at no'
  .split(/\s+/));

function extractKeyWords(passage, maxCount = 25) {
  const text = passage.join(' ').toLowerCase();
  const tokens = text.match(/[a-z][a-z'-]+/g) || [];
  const freq = new Map();
  for (const t of tokens) {
    if (STOPWORDS.has(t)) continue;
    if (t.length < 4) continue;
    freq.set(t, (freq.get(t) || 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, maxCount)
    .map(([w]) => w);
}

// ─────────────────────────────────────────────────────────────
// 출제 가능성 자동 태깅 (간이 휴리스틱)
//  - 첫·마지막 문장 → title
//  - "It is ... that/to" 구문, 명사절 주어 → write
//  - 접속부사로 시작(However, Moreover, As a result...) → order
//  - 추상 대명사 this/that이 문장 시작 → insert
// ─────────────────────────────────────────────────────────────
function guessTags(s, idx, total) {
  const tags = [];
  if (idx === 0 || idx === total - 1) tags.push('title');
  if (/^It is\b/.test(s) || /\bthat\b/.test(s) || /\bto\b/.test(s)) tags.push('write');
  if (/^(However|Moreover|Therefore|As a result|In contrast|On the other hand|Nevertheless|Furthermore|Thus|Hence)\b/i.test(s)) tags.push('order');
  if (/^(This|That|These|Those|Such)\b/.test(s)) tags.push('insert');
  // 중복 제거 + 최대 3개
  return [...new Set(tags)].slice(0, 3);
}

function makeSentenceStub(en, ko, idx, total) {
  return {
    no: idx + 1,
    tags: guessTags(en, idx, total),
    en_html: en,                                  // TODO: 슬래시/형광펜 마크업 추가
    ko_chunks: ko || 'TODO 끊어읽기 해석',
    ko_full: ko || 'TODO 매끄러운 해석',
    note: null,
    points: [
      { kind: 'grammar', text: 'TODO 어법 포인트' },
      { kind: 'vocab',   text: 'TODO 어휘 포인트' }
    ],
    paraphrasing: []                              // TODO: 핵심 문장에만 상/중/하 추가
  };
}

function makeVocabStub(word) {
  return {
    word,
    pos: '',
    meaning: 'TODO 뜻',
    syn: 'TODO 동의어',
    ant: 'TODO 반의어',
    deriv: 'TODO 파생어'
  };
}

function makeFlowStub() {
  return [
    { emoji: '🌱', title: 'TODO STEP 1 제목', body: 'TODO 본문 요약 1' },
    { emoji: '🙋', title: 'TODO STEP 2 제목', body: 'TODO 본문 요약 2' },
    { emoji: '🤔', title: 'TODO STEP 3 제목', body: 'TODO 본문 요약 3' },
    { emoji: '🎯', title: 'TODO STEP 4 제목', body: 'TODO 본문 요약 4' }
  ];
}

function makeChoicesStub(answerNo) {
  return Array.from({ length: 5 }, (_, i) => ({
    no: i + 1,
    en: 'TODO 영어 보기 ' + (i + 1),
    ko: 'TODO 한국어 의미',
    comment: 'TODO 한 줄 해설',
    correct: (i + 1) === Number(answerNo)
  }));
}

// ─────────────────────────────────────────────────────────────
// 메인
// ─────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const opts = { stdin: false, dataDir: null, inputFile: null, no: null, exam: null };
  const rest = [];
  for (const a of argv) {
    if (a === '--stdin') opts.stdin = true;
    else if (a.startsWith('--no=')) opts.no = a.slice(5);
    else if (a.startsWith('--exam=')) opts.exam = a.slice(7);
    else rest.push(a);
  }
  if (opts.stdin) opts.dataDir = rest[0];
  else { opts.inputFile = rest[0]; opts.dataDir = rest[1]; }
  return opts;
}

async function readStdin() {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  return Buffer.concat(chunks).toString('utf8');
}

function splitPassage(text) {
  // 마침표/물음표/느낌표 뒤 공백으로 끊되, 인용부호 안 마침표는 보호
  return text
    .replace(/\s+/g, ' ')
    .trim()
    .match(/[^.!?]+[.!?](?:["')\]]+)?/g) || [];
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (!opts.dataDir) {
    console.error('Usage:\n  node builder/scaffold.mjs <input.json> <data-dir>\n  echo "본문..." | node builder/scaffold.mjs --stdin --no=21 --exam="..." <data-dir>');
    process.exit(1);
  }

  let input;
  if (opts.stdin) {
    const raw = (await readStdin()).trim();
    input = {
      exam: opts.exam || 'TODO 회차',
      question_no: Number(opts.no || 21),
      type: 'TODO 유형',
      score: 3,
      question_text: 'TODO 질문',
      passage: splitPassage(raw),
      passage_ko: []
    };
  } else {
    input = JSON.parse(await fs.readFile(opts.inputFile, 'utf8'));
  }

  const passage = input.passage || [];
  const keyWords = (input.key_words && input.key_words.length)
    ? input.key_words
    : extractKeyWords(passage);

  const data = {
    exam: input.exam || 'TODO 회차',
    question_no: input.question_no || 0,
    type: input.type || 'TODO 유형',
    score: input.score || 3,
    question_text: input.question_text || 'TODO 질문',

    summary_ko: input.summary_ko || 'TODO 한 줄 요약',
    main_idea_en: input.main_idea_en || 'TODO main idea in English',
    title_en: input.title_en || 'TODO English title',

    illustration: input.illustration || {
      file: `assets/illust-${input.question_no || 0}.png`,
      prompt: 'TODO 미드저니 프롬프트 (16:5 --v 7)'
    },

    passage,
    passage_ko: input.passage_ko && input.passage_ko.length === passage.length
      ? input.passage_ko
      : passage.map(() => 'TODO 한국어 해석'),

    choices: input.choices && input.choices.length
      ? input.choices
      : makeChoicesStub(input.answer_no || 2),

    vocab: keyWords.map(makeVocabStub),

    flow: input.flow || makeFlowStub(),

    sentences: passage.map((en, i) => makeSentenceStub(en, input.passage_ko?.[i], i, passage.length))
  };

  const outDir = path.resolve(process.cwd(), opts.dataDir);
  await fs.mkdir(outDir, { recursive: true });
  const outPath = path.join(outDir, `${data.question_no}.json`);
  await fs.writeFile(outPath, JSON.stringify(data, null, 2), 'utf8');

  console.log(`✅ Scaffold generated: ${path.relative(process.cwd(), outPath)}`);
  console.log(`   passage sentences: ${passage.length}`);
  console.log(`   vocab candidates:  ${keyWords.length}`);
  console.log(`\nNext steps:`);
  console.log(`  1. ${outPath} 파일을 열어 TODO 마커를 채우세요`);
  console.log(`  2. node builder/build.mjs ${opts.dataDir}`);
}

main().catch(err => { console.error(err); process.exit(1); });
