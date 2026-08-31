#!/usr/bin/env node
/* ===================================================================
 * 중2 동아(윤정미) 본문분석 산출물 전수 검수
 * ===================================================================
 * dist 의 실제 PDF 를 원문 정본(_SOURCE-*.js)과 대조한다.
 * verify.mjs 는 "데이터(JSON)" 를 보지만, 이 스크립트는 "산출물(PDF)" 를 본다.
 * =================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

/* PDF 텍스트 레이어는 영문이 자간 분리되어 추출되므로(s c i e n t i f i c)
   공백을 전부 제거하고 비교한다. */
const sq = (s) => String(s ?? '')
  .replace(/<[^>]+>/g, '')
  .replace(/[‘’ʼ]/g, "'").replace(/[“”]/g, '"')
  .replace(/ﬁ/g, 'fi').replace(/ﬂ/g, 'fl').replace(/ﬀ/g, 'ff')
  .replace(/[‐-―–—]/g, '-')
  .replace(/[^A-Za-z0-9']/g, '')
  .toLowerCase();

/* 한글은 공백·구두점만 제거(자간 분리는 한글엔 없음) */
const sqk = (s) => String(s ?? '')
  .replace(/<[^>]+>/g, '')
  .replace(/\s+/g, '')
  .replace(/[.,!?"'“”‘’()·…]/g, '');

const issues = [];
const warn = [];
const note = (arr, sev, where, msg) => arr.push({ sev, where, msg });

for (const L of ['L5', 'L6']) {
  const { SOURCE } = await import(`./_SOURCE-${L}.js`);
  const nCh = SOURCE.length;
  const combined = fs.readFileSync(path.join(HERE, `dist/_audit/${L}-combined.txt`), 'utf8');
  const cSq = sq(combined), cKo = sqk(combined);

  console.log(`\n${'='.repeat(64)}\n${L} — 챕터 ${nCh}개 · 원문 ${SOURCE.reduce((a, c) => a + c.sentences.length, 0)}문장\n${'='.repeat(64)}`);

  let gIdx = 0;
  for (const ch of SOURCE) {
    const jsonPath = path.join(HERE, `data/${L}/${ch.no}.json`);
    const d = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const chTxt = fs.readFileSync(path.join(HERE, `dist/_audit/${L}-${ch.no}.txt`), 'utf8');
    const chSq = sq(chTxt), chKo = sqk(chTxt);
    const W = `${L}/Ch${ch.no}`;

    /* ── 1. passage 가 정본과 verbatim 일치하는가 (데이터 층) */
    if (d.passage.length !== ch.sentences.length) {
      note(issues, 'BLOCK', W, `passage 문장 수 ${d.passage.length} ≠ 정본 ${ch.sentences.length}`);
    } else {
      ch.sentences.forEach((s, i) => {
        if (sq(d.passage[i]) !== sq(s)) {
          note(issues, 'BLOCK', W, `passage[${i + 1}] 정본 불일치\n        정본: ${s}\n        데이터: ${d.passage[i]}`);
        }
      });
    }

    /* ── 2. passage_ko 개수 */
    if (d.passage_ko.length !== d.passage.length) {
      note(issues, 'BLOCK', W, `passage_ko ${d.passage_ko.length} ≠ passage ${d.passage.length}`);
    }
    /* 빈 해석 */
    d.passage_ko.forEach((k, i) => {
      if (!String(k).trim()) note(issues, 'BLOCK', W, `passage_ko[${i + 1}] 비어 있음`);
    });

    /* ── 3. 각 문장이 챕터 PDF 에 실재하는가 (산출물 층) */
    ch.sentences.forEach((s, i) => {
      if (!chSq.includes(sq(s))) note(issues, 'BLOCK', W, `PDF 에 원문 ${i + 1}번 없음: ${s.slice(0, 60)}`);
    });
    d.passage_ko.forEach((k, i) => {
      if (!chKo.includes(sqk(k))) note(issues, 'BLOCK', W, `PDF 에 해석 ${i + 1}번 없음: ${String(k).slice(0, 40)}`);
    });

    /* ── 4. 합본에도 실재하는가 + 본문 전문 페이지 */
    ch.sentences.forEach((s, i) => {
      gIdx += 1;
      if (!cSq.includes(sq(s))) note(issues, 'BLOCK', W, `합본에 원문 ${i + 1}번 없음`);
    });

    /* ── 5. 분석 카드 covers 가 원문을 빠짐없이 1회씩 오름차순 커버 */
    const covered = [];
    for (const s of d.sentences) {
      if (!Array.isArray(s.covers) || !s.covers.length) {
        note(issues, 'BLOCK', W, `분석카드 #${s.no} covers 없음`);
        continue;
      }
      covered.push(...s.covers);
    }
    const expect = Array.from({ length: ch.sentences.length }, (_, i) => i + 1);
    if (JSON.stringify(covered) !== JSON.stringify(expect)) {
      note(issues, 'BLOCK', W, `covers 불일치\n        기대: [${expect}]\n        실제: [${covered}]`);
    }

    /* ── 6. 분석 카드 en_html 을 이어붙이면 원문 전문과 같은가 */
    const joined = sq(d.sentences.map(s => s.en_html).join(' '));
    const whole = sq(ch.sentences.join(' '));
    if (joined !== whole) {
      // 어디서 갈리는지 위치 찾기
      let lo = 0, hi = Math.min(joined.length, whole.length);
      while (lo < hi) { const m = (lo + hi + 1) >> 1; if (joined.slice(0, m) === whole.slice(0, m)) lo = m; else hi = m - 1; }
      note(issues, 'BLOCK', W, `분석카드 영어 이어붙임 ≠ 원문 (char ${lo} 부터 갈림)\n        원문: …${whole.slice(lo, lo + 60)}\n        카드: …${joined.slice(lo, lo + 60)}`);
    }

    /* ── 7. 카드의 ko_full 이 PDF 에 있는가 */
    d.sentences.forEach(s => {
      if (s.ko_full && !chKo.includes(sqk(s.ko_full))) {
        note(warn, 'WARN', W, `카드 #${s.no} ko_full 이 PDF 에 없음: ${s.ko_full.slice(0, 35)}`);
      }
    });

    /* ── 8. vocab 이 본문에 실제 등장하는가
       ★ 표제어는 사전형(build/fight/fall down)이고 본문은 활용형(built/fought/fell down)이라
         단순 문자열 비교로는 전부 오탐이 난다. 불규칙 변화표 + 어간 매칭으로 흡수한다.
         숙어(A/B 자리표시자 포함)는 내용어만 뽑아 각각 등장하는지로 판정한다. */
    const passSq = sq(ch.sentences.join(' '));
    const passRaw = ch.sentences.join(' ').toLowerCase();
    const IRREG = {
      build: ['built'], fight: ['fought'], lose: ['lost'], take: ['took', 'taken'],
      begin: ['began', 'begun'], fall: ['fell', 'fallen'], be: ['is', 'are', 'was', 'were', 'been'],
      get: ['got', 'gotten'], feel: ['felt'], hear: ['heard'], teach: ['taught'],
      see: ['saw', 'seen'], put: ['put'], make: ['made'], become: ['became'],
      grow: ['grew', 'grown'], have: ['has', 'had'], do: ['did', 'done'], go: ['went', 'gone'],
      keep: ['kept'], learn: ['learned', 'learnt'], stand: ['stood'], think: ['thought'],
      send: ['sent'], leave: ['left'], write: ['wrote', 'written'], come: ['came'],
      give: ['gave', 'given'], hide: ['hid', 'hidden'], hold: ['held'], meet: ['met'],
      die: ['died'], bury: ['buried'], drop: ['dropped'], stop: ['stopped'],
      know: ['knew', 'known'], say: ['said'], tell: ['told'], bring: ['brought'],
    };
    const formsOf = (w) => {
      const set = new Set([w]);
      (IRREG[w] || []).forEach(f => set.add(f));
      if (w.length >= 3) {
        const e = w.replace(/e$/, '');
        [w + 's', w + 'ed', w + 'ing', e + 'ed', e + 'ing', w + 'es',
         w.replace(/y$/, 'ies'), w.replace(/y$/, 'ied')].forEach(f => set.add(f));
      }
      return [...set];
    };
    for (const v of d.vocab) {
      const raw = String(v.word).toLowerCase();
      // 자리표시자(A/B)·관사·소유격을 걷어내고 내용어만 남긴다
      const words = raw.replace(/[^a-z' ]/g, ' ')
        .split(/\s+/)
        .filter(x => x && !['a', 'an', 'the', 'to', 'as', 'of', 'in', 'on', "one's", 'b'].includes(x));
      if (!words.length) continue;
      const hit = words.every(w =>
        formsOf(w).some(f => passRaw.includes(f) || passSq.includes(sq(f))));
      if (!hit) note(warn, 'WARN', W, `vocab "${v.word}" 본문 미등장`);
    }
    /* vocab 중복 */
    const seen = new Set();
    for (const v of d.vocab) {
      const k = String(v.word).toLowerCase();
      if (seen.has(k)) note(warn, 'WARN', W, `vocab "${v.word}" 중복`);
      seen.add(k);
    }
    /* vocab 이 PDF 에 렌더됐는가 */
    let vMiss = 0;
    for (const v of d.vocab) {
      if (!chSq.includes(sq(String(v.word).split(/\s+/)[0]))) vMiss++;
    }
    if (vMiss) note(warn, 'WARN', W, `vocab ${vMiss}개가 PDF 에서 확인 안 됨`);

    /* ── 9. flow 4단 + PDF 렌더 */
    if (!Array.isArray(d.flow) || d.flow.length !== 4) {
      note(warn, 'WARN', W, `flow 단계 ${d.flow?.length ?? 0}개 (기대 4)`);
    }
    (d.flow || []).forEach((f, i) => {
      if (!chKo.includes(sqk(f.title))) note(warn, 'WARN', W, `flow[${i + 1}] 제목 PDF 미확인: ${f.title}`);
    });

    /* ── 10. choices — 정답 정확히 1개 */
    const correct = (d.choices || []).filter(c => c.correct);
    if (correct.length !== 1) note(issues, 'BLOCK', W, `정답 보기 ${correct.length}개 (기대 1)`);
    if ((d.choices || []).length !== 5) note(issues, 'BLOCK', W, `보기 ${d.choices?.length ?? 0}개 (기대 5)`);
    /* 보기 번호 1..5 연속 */
    const nos = (d.choices || []).map(c => c.no).join(',');
    if (nos !== '1,2,3,4,5') note(issues, 'BLOCK', W, `보기 번호 [${nos}] (기대 1,2,3,4,5)`);
    /* 정답 = title_en 과 일치하는지(제목 유형만) */
    if (d.type === '제목' && correct[0] && d.title_en && sq(correct[0].en) !== sq(d.title_en)) {
      note(warn, 'WARN', W, `제목 유형인데 정답 보기 ≠ title_en\n        보기: ${correct[0].en}\n        title_en: ${d.title_en}`);
    }

    /* ── 11. subtitle / illustration 필드 */
    if (!d.illustration?.file) note(warn, 'WARN', W, 'illustration.file 없음');
    if (!d.illustration?.prompt) note(warn, 'WARN', W, 'illustration.prompt 없음');
    else {
      if (!/--ar\s*16:5/.test(d.illustration.prompt)) note(warn, 'WARN', W, '프롬프트에 --ar 16:5 없음');
      if (!/--v\s*8\.1/.test(d.illustration.prompt)) note(warn, 'WARN', W, '프롬프트에 --v 8.1 없음');
    }

    /* ── 12. 삽화 파일 실재 여부 */
    const illPath = path.join(HERE, 'dist', L, d.illustration?.file ?? '');
    if (d.illustration?.file && !fs.existsSync(illPath)) {
      note(warn, 'WARN', W, `삽화 파일 없음(placeholder): ${d.illustration.file}`);
    }

    console.log(`  Ch${ch.no}: 문장 ${ch.sentences.length} · 카드 ${d.sentences.length} · 어휘 ${d.vocab.length} · flow ${d.flow?.length ?? 0} · 보기 ${d.choices?.length ?? 0}`);
  }

  /* ── 13. 본문 전문 페이지(합본 2p)에 전 문장 + 해석 */
  const p2 = fs.readFileSync(path.join(HERE, `dist/_audit/${L}-combined.txt`), 'utf8');
  // 2페이지만 다시 뽑기 어려우니 합본 전체에서 확인(이미 개별로도 확인함)
  let g = 0;
  for (const ch of SOURCE) {
    const d = JSON.parse(fs.readFileSync(path.join(HERE, `data/${L}/${ch.no}.json`), 'utf8'));
    ch.sentences.forEach((s, i) => {
      g += 1;
      if (!sq(p2).includes(sq(s))) note(issues, 'BLOCK', `${L}/전문`, `본문전문 ${g}번 없음`);
      if (!sqk(p2).includes(sqk(d.passage_ko[i]))) note(issues, 'BLOCK', `${L}/전문`, `본문전문 해석 ${g}번 없음`);
    });
  }
}

console.log(`\n${'='.repeat(64)}`);
if (!issues.length && !warn.length) {
  console.log('✅ 차단 0 · 경고 0 — 결함 없음');
} else {
  if (issues.length) {
    console.log(`\n❌ 차단 ${issues.length}건`);
    issues.forEach(i => console.log(`  [${i.where}] ${i.msg}`));
  }
  if (warn.length) {
    console.log(`\n⚠️  경고 ${warn.length}건`);
    warn.forEach(i => console.log(`  [${i.where}] ${i.msg}`));
  }
}
console.log('');
process.exit(issues.length ? 1 : 0);
