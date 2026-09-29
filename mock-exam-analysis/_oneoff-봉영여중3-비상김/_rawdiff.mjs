/* ===================================================================
 * 봉영여중3 비상(김진완) — PDF 원문(_RAW_RECHECK.txt) 기준 문자 단위 전수 대조
 * ===================================================================
 * _RAW_PDF.txt 는 사용자 제공 PDF 의 영어 단을 줄바꿈 그대로 옮긴 것(문장 분할 없음).
 * 사람이 문장 경계를 판단한 _TEXTBOOK.js 와 달리 전사 판단이 개입하지 않는다.
 *
 *   [0] 새 재전사 ↔ 기존 _PDF-RAW.txt  문단 단위 문자 diff(기존 기준 자체 검증)
 *   [1] 원문 ↔ 정본(_SOURCE)          문단 단위 문자 diff
 *   [2] 원문 ↔ 데이터 passage          문단 단위 문자 diff
 *   [3] 원문 ↔ 분석 카드(en_html)      문단 단위 문자 diff
 *   [4] 원문 ↔ 합본 PDF 본문 전문 페이지  단어 빈도 대조(한 단어 누락도 검출)
 *   [5] 원문 ↔ 암기장 PDF 정답면        단어 빈도 대조
 *
 * 비교 전 정규화: 공백 연속 → 1칸, 닫는 따옴표 앞 공백 제거(PDF 조판 "car! ”").
 * 사용법: node _rawdiff.mjs   (선행: 각 PDF 빌드 완료, python + pymupdf)
 * =================================================================== */
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = {
  L5: ['봉영여중3_비상김진완_Lesson5_본문분석_합본.pdf', '봉영여중3_비상김진완_Lesson5_본문암기.pdf', 2],
  L6: ['봉영여중3_비상김진완_Lesson6_본문분석_합본.pdf', '봉영여중3_비상김진완_Lesson6_본문암기.pdf', 2],
  L7: ['봉영여중3_비상김진완_Lesson7_본문분석_합본.pdf', '봉영여중3_비상김진완_Lesson7_본문암기.pdf', 2],
};

/* ── 원문 파싱 ── */
const raw = {};
let cur = null;
for (const line of (await fs.readFile(path.join(__dirname, '_RAW_RECHECK.txt'), 'utf8')).split(/\r?\n/)) {
  if (line.startsWith('@@ ')) { const [, L, n] = line.split(' '); cur = (raw[L] ??= {})[n] = []; continue; }
  if (!cur || line.startsWith('#') || !line.trim()) continue;
  cur.push(line.trim());
}
const old = {};
{ let c = null;
  for (const line of (await fs.readFile(path.join(__dirname, '_PDF-RAW.txt'), 'utf8')).split(/\r?\n/)) {
    if (line.startsWith('@')) { const [L, n] = line.slice(1).trim().split(/\s+/); c = (old[L] ??= {})[n] = []; continue; }
    if (!c || line.startsWith('#') || !line.trim()) continue;
    c.push(line.trim());
  } }
const norm = (s) => String(s).replace(/\s+/g, ' ').replace(/ ([”’])/g, '$1').trim();
const plain = (h) => h.replace(/<span class="slash">\s*\/\s*<\/span>/g, ' ').replace(/<[^>]+>/g, '')
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

let errors = 0, checks = 0;
const ok = (m) => { checks++; console.log(`   ✅ ${m}`); };
const bad = (m) => { checks++; errors++; console.log(`   ❌ ${m}`); };

function diff(label, want, got) {
  if (want === got) return ok(`${label} 일치 (${want.length}자)`);
  let i = 0; while (i < want.length && want[i] === got[i]) i++;
  bad(`${label} 불일치 @${i}자\n        원문: …${want.slice(Math.max(0, i - 50), i + 50)}\n        대상: …${got.slice(Math.max(0, i - 50), i + 50)}`);
}

/* 단어 빈도 — 영어 단어(어포스트로피 포함)만. 곱슬/직선 어포스트로피 통일. */
const words = (s) => (s.replace(/[’‘]/g, "'").match(/[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)*/g) || []);
const freq = (arr) => arr.reduce((m, w) => m.set(w, (m.get(w) || 0) + 1), new Map());
function wordCheck(label, want, got, allowExtra = new Set()) {
  const a = freq(words(want)), b = freq(words(got));
  const miss = [], extra = [];
  for (const [w, n] of a) if ((b.get(w) || 0) < n) miss.push(`${w}×${n - (b.get(w) || 0)}`);
  for (const [w, n] of b) if ((a.get(w) || 0) < n && !allowExtra.has(w)) extra.push(`${w}×${n - (a.get(w) || 0)}`);
  if (!miss.length && !extra.length) return ok(`${label} 단어 ${words(want).length}개 빈도 완전 일치`);
  if (miss.length) bad(`${label} 누락 단어: ${miss.join(', ')}`);
  if (extra.length) bad(`${label} 원문에 없는 단어: ${extra.join(', ')}`);
}

function pdfPages(file, from, to) {
  const py = `import fitz,sys\nd=fitz.open(sys.argv[1])\nprint('\\n'.join(d[i].get_text() for i in range(int(sys.argv[2]), min(int(sys.argv[3]), len(d)))))`;
  const txt = execFileSync('python', ['-c', py, file, String(from), String(to)],
    { encoding: 'utf8', maxBuffer: 1 << 26, env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });
  /* 영어 본문 줄만 남긴다 — 한글 해석·제시문 줄(Sherpa라는 …), 번호 배지(숫자만), 머리글 제외. */
  return txt.split(/\r?\n/)
    .filter(l => !/[가-힣]/.test(l) && !/^\s*\d+\.?\s*$/.test(l))
    .map(l => l.replace(/^\s*\d+\.?\s+(?=[A-Z“‘\"])/, ''))   // 암기장 문항 번호(줄 머리) — 뒤가 대문자·따옴표일 때만. '20 percent' 처럼 줄바꿈된 숫자는 보존
    .join('\n');
}
const pdfPageCount = (file) => Number(execFileSync('python', ['-c', 'import fitz,sys;print(len(fitz.open(sys.argv[1])))', file], { encoding: 'utf8' }));

for (const L of ['L5', 'L6', 'L7']) {
  const { SOURCE } = await import(`./_SOURCE-${L}.js`);
  console.log(`\n${'═'.repeat(64)}\n${L}\n${'═'.repeat(64)}`);
  let allRaw = '';
  for (const ch of SOURCE) {
    const want = norm(raw[L][ch.no].join(' '));
    allRaw += ' ' + want;
    const data = JSON.parse(await fs.readFile(path.join(__dirname, 'data', L, `${ch.no}.json`), 'utf8'));
    console.log(` 본문 ${ch.no}`);
    diff('[0] 기존 _PDF-RAW', want, norm((old[L]?.[ch.no] ?? []).join(' ')));
    diff('[1] 정본', want, norm(ch.sentences.join(' ')));
    diff('[2] 데이터 passage', want, norm(data.passage.join(' ')));
    diff('[3] 분석 카드', want, norm(data.sentences.map(s => plain(s.en_html)).join(' ')));
  }
  allRaw = norm(allRaw);
  const [combined, memo, ftPages] = OUT[L];
  const dist = path.join(__dirname, 'dist', L);
  console.log(' PDF');
  // 합본: p1 표지, p2~ 본문 전문(ftPages 장)
  const ft = pdfPages(path.join(dist, combined), 1, 1 + ftPages);
  wordCheck(`[4] 합본 본문 전문(${ftPages}p)`, allRaw, ft, new Set(['FULL', 'TEXT']));
  // 암기장: 마지막 페이지 = 정답면
  const memoFile = path.join(dist, memo);
  const n = pdfPageCount(memoFile);
  const ans = pdfPages(memoFile, n - 1, n);
  wordCheck('[5] 암기장 정답면', allRaw, ans, new Set(['ANSWER', 'KEY', 'Lesson', String(L.slice(1))]));
}

console.log(`\n${'═'.repeat(64)}\n검사 ${checks}건 · 오류 ${errors}건`);
process.exit(errors ? 1 : 0);
