#!/usr/bin/env node
/**
 * Terra Nova 모의고사 워크북 빌더 (9-STEP)
 *
 * 사용법:
 *   node builder/build-workbook.mjs <data-dir> [<dist-dir>]
 *   node builder/build-workbook.mjs 2026-march-grade2/data
 *   node builder/build-workbook.mjs 2026-march-grade2/data 2026-march-grade2/dist
 *
 * data/{N}.json + data/{N}-workbook.json 을 결합해 workbook-{N}.html 생성.
 *
 * 9-STEP 구성:
 *   1. 본문 + 해석 + 단어 정리
 *   2. 어법 양자택일
 *   3. 어휘 양자택일
 *   4. 빈칸 첫글자 쓰기
 *   5. 한글 해석 (영문 → 한글)
 *   6. 영문 배열 (jumble)
 *   7. 통문장 영작 (한글 → 영문)
 *   8. 종합 문제 (mixed)
 *   9. 정답지
 */

import fs from 'node:fs/promises';
import path from 'node:path';

// ─────────────────────────────────────────────────────────────
// 유틸
// ─────────────────────────────────────────────────────────────

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const STEP_META = {
  1: { title: '본문과 해석',         desc: '본문 + 해석 + 핵심 어휘 정리',                    color: 'mint'   },
  2: { title: '어법 양자택일',       desc: '둘 중 어법상 알맞은 것을 고르시오.',                color: 'sky'    },
  3: { title: '어휘 양자택일',       desc: '둘 중 문맥상 알맞은 것을 고르시오.',                color: 'butter' },
  4: { title: '빈칸 첫글자 쓰기',    desc: '빈칸에 알맞은 단어를 첫 글자를 참고하여 쓰시오.',   color: 'coral'  },
  5: { title: '한글 해석 연습',      desc: '주어진 영문을 한글로 해석하시오.',                  color: 'sage'   },
  6: { title: '영문 배열 연습',      desc: '주어진 단어를 배열하여 문장을 완성하시오.',         color: 'sky'    },
  7: { title: '통문장 영작',         desc: '주어진 한글을 영어 문장으로 옮겨 쓰시오.',          color: 'coral'  },
  8: { title: '종합 문제',           desc: 'STEP 2~7 유형을 모두 섞은 종합 점검입니다.',        color: 'butter' },
  9: { title: '정답 · 해설',         desc: '워크북 전체 정답과 핵심 해설입니다.',               color: 'mint'   }
};

// ─────────────────────────────────────────────────────────────
// 공통 컴포넌트
// ─────────────────────────────────────────────────────────────

function pageHead({ exam, grade, qno, stepNum }) {
  const meta = STEP_META[stepNum];
  return `  <header class="page-head">
    <span class="exam-tag">${esc(exam)}</span>
    <span class="sep">|</span>
    <span class="grade-tag">${esc(grade)}</span>
    <span class="sep">|</span>
    <span class="qno">${esc(qno)}번</span>
    <span class="sep">·</span>
    <span class="step-subtitle">${esc(meta.title)}</span>
    <span class="wb-chip">WORKBOOK</span>
  </header>`;
}

function stepBanner(stepNum) {
  const meta = STEP_META[stepNum];
  return `    <div class="step-banner">
      <div class="step-left">
        <div class="step-tag">STEP ${String(stepNum).padStart(2, '0')}</div>
        <div class="step-num">${stepNum}</div>
      </div>
      <div class="step-right">
        <div class="step-title">${esc(meta.title)}</div>
        <div class="step-desc">${esc(meta.desc)}</div>
      </div>
    </div>`;
}

function directive(label, text) {
  return `    <div class="directive">
      <span class="di-mark"></span>
      <span class="di-label">${esc(label)}</span>
      <span class="di-text">${esc(text)}</span>
    </div>`;
}

function pageFoot(pageNum, brand = 'Terra Nova · Workbook') {
  return `  <footer class="page-foot">
    <span class="brand">${esc(brand)}</span>
    <span class="pageno">${pageNum}</span>
  </footer>`;
}

function pageWrap({ stepNum, headOpts, pageNum, body }) {
  return `<section class="page" data-step="${stepNum}">
${pageHead(headOpts)}
  <div class="page-body">
${stepBanner(stepNum)}
${body}
  </div>
${pageFoot(pageNum)}
</section>`;
}

// ─────────────────────────────────────────────────────────────
// STEP 1 — 본문 + 해석 + 단어 정리
// ─────────────────────────────────────────────────────────────

function renderStep1({ data, wb, headOpts, pageNum }) {
  const enLines = data.passage.map((s, i) =>
    `<span class="sent-mark">${i + 1}</span>${esc(s)}`
  ).join(' ');
  const koLines = (data.passage_ko || []).map((s, i) =>
    `<span class="sent-mark">${i + 1}</span>${esc(s)}`
  ).join(' ');

  const vocabPrimary = data.vocab.slice(0, 20);
  const vocaItems = vocabPrimary.map((v, i) => `
        <div class="v-item">
          <span class="v-no">${i + 1}.</span>
          <span><span class="v-word">${esc(v.word)}</span><span class="v-pos">[${esc(v.pos)}]</span><span class="v-meaning">${esc(v.meaning)}</span></span>
        </div>`).join('');

  // 동의어 / 반의어 — 본문 vocab에서 상위 5개씩
  const synList = vocabPrimary.filter(v => v.syn).slice(0, 5);
  const antList = vocabPrimary.filter(v => v.ant).slice(0, 5);
  // 영영풀이 / 핵심 표현 — wb 데이터에서 가져오기
  const defs = wb.voca_check.definitions || [];
  const exprs = wb.voca_check.expressions || [];

  const synHtml = synList.map((v, i) =>
    `<div class="v-item"><span class="v-no">${i + 1}.</span><span><span class="v-word">${esc(v.word)}</span> = ${esc(v.syn)}</span></div>`
  ).join('');
  const antHtml = antList.map((v, i) =>
    `<div class="v-item"><span class="v-no">${i + 1}.</span><span><span class="v-word">${esc(v.word)}</span> ↔ ${esc(v.ant)}</span></div>`
  ).join('');
  const defHtml = defs.map((d, i) =>
    `<div class="v-item"><span class="v-no">${i + 1}.</span><span><span class="v-word">${esc(d.answer)}</span>: ${esc(d.def)}</span></div>`
  ).join('');
  const exprHtml = exprs.map((e, i) =>
    `<div class="v-item"><span class="v-no">${i + 1}.</span><span><span class="v-word">${esc(e.answer)}</span>: ${esc(e.ko)}</span></div>`
  ).join('');

  const body = `    <div class="passage-grid">
      <div class="passage-box">
        <div class="pb-label">원문 PASSAGE</div>
        <div class="pb-body">${enLines}</div>
      </div>
      <div class="passage-box ko">
        <div class="pb-label">전체 해석</div>
        <div class="pb-body">${koLines}</div>
      </div>
    </div>

    <div class="voca-block">
      <div class="vb-head">필수 단어</div>
      <div class="voca-grid">${vocaItems}
      </div>
    </div>

    <div class="voca-2col">
      <div class="voca-block">
        <div class="vb-head">동의어 ≈</div>
        <div class="voca-grid">${synHtml}</div>
      </div>
      <div class="voca-block">
        <div class="vb-head">반의어 ↔</div>
        <div class="voca-grid">${antHtml}</div>
      </div>
    </div>

    <div class="voca-2col">
      <div class="voca-block">
        <div class="vb-head">영영풀이</div>
        <div class="voca-grid">${defHtml}</div>
      </div>
      <div class="voca-block">
        <div class="vb-head">필수 표현</div>
        <div class="voca-grid">${exprHtml}</div>
      </div>
    </div>`;

  return pageWrap({ stepNum: 1, headOpts, pageNum, body });
}

// ─────────────────────────────────────────────────────────────
// 양자택일 토큰 변환 — {{N:A/B}} → <span class="alt">A <span class="slash">/</span> B</span>
// ─────────────────────────────────────────────────────────────

function renderChoiceTemplate(tmpl) {
  return esc(tmpl).replace(/\{\{(\d+):([^\/]+)\/([^}]+)\}\}/g, (_, n, a, b) => {
    return `<span class="alt"><sup class="alt-idx">${n}</sup>${a.trim()} <span class="slash">/</span> ${b.trim()}</span>`;
  });
}

// ─────────────────────────────────────────────────────────────
// STEP 2 — 어법 양자택일
// ─────────────────────────────────────────────────────────────

function renderStep2({ wb, headOpts, pageNum }) {
  const items = wb.grammar_choice.map(g => `
      <div class="qa-item">
        <div class="qa-no">${g.no}.</div>
        <div class="qa-body">
          <div class="qa-en">${renderChoiceTemplate(g.en_template)}</div>
          <div class="qa-ko">${esc(g.ko_full)}</div>
        </div>
      </div>`).join('');

  const body = `    <div class="qa-list auto-fit">${items}
    </div>`;

  return pageWrap({ stepNum: 2, headOpts, pageNum, body });
}

// ─────────────────────────────────────────────────────────────
// STEP 3 — 어휘 양자택일
// ─────────────────────────────────────────────────────────────

function renderStep3({ wb, headOpts, pageNum }) {
  const items = wb.vocab_choice.map(g => `
      <div class="qa-item">
        <div class="qa-no">${g.no}.</div>
        <div class="qa-body">
          <div class="qa-en">${renderChoiceTemplate(g.en_template)}</div>
          <div class="qa-ko">${esc(g.ko_full)}</div>
        </div>
      </div>`).join('');

  const body = `    <div class="qa-list auto-fit">${items}
    </div>`;

  return pageWrap({ stepNum: 3, headOpts, pageNum, body });
}

// ─────────────────────────────────────────────────────────────
// STEP 4 — 빈칸 첫글자 쓰기
// ─────────────────────────────────────────────────────────────

function renderStep4({ data, wb, headOpts, pageNum }) {
  const items = wb.fill_first_letter.map(f => {
    // ref_sentence 에서 본문 가져와 hints 위치에 빈칸 삽입
    const sentEn = data.passage[f.ref_sentence - 1] || '';
    // 간단 전략: 본문 문장 통째로 보여주되, hints 단어를 첫글자+밑줄로 치환
    let rendered = esc(sentEn);
    f.hints.forEach((h, idx) => {
      const re = new RegExp(`\\b${h.answer}\\b`, 'i');
      const replacement = `<span class="first-hint"><span class="fh-num">${idx + 1})</span><span class="fh-letter">${h.letter}</span></span> <span class="blank-line short"></span>`;
      rendered = rendered.replace(re, replacement);
    });
    return `
      <div class="qa-item">
        <div class="qa-no">${f.no}.</div>
        <div class="qa-body">
          <div class="qa-en">${rendered}</div>
          <div class="qa-ko">${esc(f.ko_full)}</div>
        </div>
      </div>`;
  }).join('');

  const body = `    <div class="qa-list auto-fit">${items}
    </div>`;

  return pageWrap({ stepNum: 4, headOpts, pageNum, body });
}

// ─────────────────────────────────────────────────────────────
// STEP 5 — 한글 해석 연습 (영문 → 한글)
// ─────────────────────────────────────────────────────────────

function renderStep5({ data, wb, headOpts, pageNum }) {
  const items = wb.ko_translation.map(t => {
    const en = data.passage[t.ref_sentence - 1] || '';
    return `
      <div class="trans-item">
        <div class="ti-no">${t.no}.</div>
        <div>
          <div class="ti-given">${esc(en)}</div>
          <div class="ti-answer-line"></div>
        </div>
      </div>`;
  }).join('');

  const body = `    <div class="trans-list auto-fit">${items}
    </div>`;

  return pageWrap({ stepNum: 5, headOpts, pageNum, body });
}

// ─────────────────────────────────────────────────────────────
// STEP 6 — 영문 배열 (jumble)
// ─────────────────────────────────────────────────────────────

function renderStep6({ wb, headOpts, pageNum }) {
  const items = wb.jumble.map(j => `
      <div class="jumble-item">
        <div class="ji-no">${j.no}.</div>
        <div>
          <div class="ji-words">[ ${j.words.map(esc).join(' <span class="sep">/</span> ')} ]</div>
          <div class="ji-ko">${esc(wb._refs?.[j.ref_sentence]?.ko || '')}</div>
          <div class="ji-answer-line"></div>
        </div>
      </div>`).join('');

  const body = `    <div class="jumble-list auto-fit">${items}
    </div>`;

  return pageWrap({ stepNum: 6, headOpts, pageNum, body });
}

// ─────────────────────────────────────────────────────────────
// STEP 7 — 통문장 영작 (한글 → 영문)
// ─────────────────────────────────────────────────────────────

function renderStep7({ data, wb, headOpts, pageNum }) {
  const items = wb.sentence_translation.map(t => {
    const ko = data.passage_ko[t.ref_sentence - 1] || '';
    return `
      <div class="trans-item">
        <div class="ti-no">${t.no}.</div>
        <div>
          <div class="ti-given ko">${esc(ko)}</div>
          <div class="ti-answer-line"></div>
        </div>
      </div>`;
  }).join('');

  const body = `    <div class="trans-list auto-fit">${items}
    </div>`;

  return pageWrap({ stepNum: 7, headOpts, pageNum, body });
}

// ─────────────────────────────────────────────────────────────
// STEP 8 — 종합 문제 (mixed)
// ─────────────────────────────────────────────────────────────

function renderStep8({ data, wb, headOpts, pageNum }) {
  const lookup = {
    grammar: id => wb.grammar_choice.find(x => x.no === id),
    vocab:   id => wb.vocab_choice.find(x => x.no === id),
    fill:    id => wb.fill_first_letter.find(x => x.no === id),
    ko:      id => wb.ko_translation.find(x => x.no === id),
    jumble:  id => wb.jumble.find(x => x.no === id),
    sent:    id => wb.sentence_translation.find(x => x.no === id),
  };

  const KIND_LABEL = {
    grammar: '어법', vocab: '어휘', fill: '빈칸',
    ko: '해석', jumble: '배열', sent: '영작'
  };

  const items = wb.mixed.map(m => {
    const src = lookup[m.kind](m.ref);
    if (!src) return '';
    const kindLabel = `<span class="alt" style="margin-right:8px;font-size:7.5pt;padding:1px 7px">${KIND_LABEL[m.kind]}</span>`;

    if (m.kind === 'grammar' || m.kind === 'vocab') {
      return `
      <div class="qa-item">
        <div class="qa-no">${m.no}.</div>
        <div class="qa-body">
          <div class="qa-en">${kindLabel}${renderChoiceTemplate(src.en_template)}</div>
          <div class="qa-ko">${esc(src.ko_full)}</div>
        </div>
      </div>`;
    }
    if (m.kind === 'fill') {
      const sentEn = data.passage[src.ref_sentence - 1] || '';
      let rendered = esc(sentEn);
      src.hints.forEach((h, idx) => {
        const re = new RegExp(`\\b${h.answer}\\b`, 'i');
        rendered = rendered.replace(re, `<span class="first-hint"><span class="fh-num">${idx + 1})</span><span class="fh-letter">${h.letter}</span></span> <span class="blank-line short"></span>`);
      });
      return `
      <div class="qa-item">
        <div class="qa-no">${m.no}.</div>
        <div class="qa-body">
          <div class="qa-en">${kindLabel}${rendered}</div>
          <div class="qa-ko">${esc(src.ko_full)}</div>
        </div>
      </div>`;
    }
    if (m.kind === 'ko') {
      const en = data.passage[src.ref_sentence - 1] || '';
      return `
      <div class="trans-item">
        <div class="ti-no">${m.no}.</div>
        <div>
          <div class="ti-given">${kindLabel}${esc(en)}</div>
          <div class="ti-answer-line"></div>
        </div>
      </div>`;
    }
    if (m.kind === 'jumble') {
      return `
      <div class="jumble-item">
        <div class="ji-no">${m.no}.</div>
        <div>
          <div class="qa-en" style="margin-bottom:6px">${kindLabel}</div>
          <div class="ji-words">[ ${src.words.map(esc).join(' <span class="sep">/</span> ')} ]</div>
          <div class="ji-answer-line"></div>
        </div>
      </div>`;
    }
    if (m.kind === 'sent') {
      const ko = data.passage_ko[src.ref_sentence - 1] || '';
      return `
      <div class="trans-item">
        <div class="ti-no">${m.no}.</div>
        <div>
          <div class="ti-given ko">${kindLabel}${esc(ko)}</div>
          <div class="ti-answer-line"></div>
        </div>
      </div>`;
    }
    return '';
  }).join('');

  const body = `    <div class="mixed-list auto-fit">${items}
    </div>`;

  return pageWrap({ stepNum: 8, headOpts, pageNum, body });
}

// ─────────────────────────────────────────────────────────────
// STEP 9 — 정답지
// ─────────────────────────────────────────────────────────────

function renderStep9({ data, wb, headOpts, pageNum }) {
  // 어법/어휘 정답 — 해설 생략(공간 절약), 정답만 표시
  const grammarAns = wb.grammar_choice.map(g =>
    `<div class="al-row"><div class="al-no">${g.no}</div><div class="al-body">${g.answers.map(a => `<span class="ans-hl">${esc(a)}</span>`).join(' / ')}</div></div>`
  ).join('');

  const vocabAns = wb.vocab_choice.map(g =>
    `<div class="al-row"><div class="al-no">${g.no}</div><div class="al-body">${g.answers.map(a => `<span class="ans-hl">${esc(a)}</span>`).join(' / ')}</div></div>`
  ).join('');

  const fillAns = wb.fill_first_letter.map(f =>
    `<div class="al-row"><div class="al-no">${f.no}</div><div class="al-body">${f.hints.map(h => `<span class="ans-hl">${esc(h.answer)}</span>`).join(' · ')}</div></div>`
  ).join('');

  // 한글 해석 정답
  const koAns = wb.ko_translation.map(t =>
    `<div class="al-row"><div class="al-no">${t.no}</div><div class="al-body">${esc(data.passage_ko[t.ref_sentence - 1])}</div></div>`
  ).join('');

  // 배열/영작 정답 — 영문 원문 그대로
  const jumbleAns = wb.jumble.map(j =>
    `<div class="al-row"><div class="al-no">${j.no}</div><div class="al-body"><span class="en">${esc(j.answer)}</span></div></div>`
  ).join('');

  const sentAns = wb.sentence_translation.map(t =>
    `<div class="al-row"><div class="al-no">${t.no}</div><div class="al-body"><span class="en">${esc(data.passage[t.ref_sentence - 1])}</span></div></div>`
  ).join('');

  const body = `    <div class="answer-2col">
      <div class="answer-section">
        <div class="as-head">
          <span class="as-tag">STEP 2</span>
          <span class="as-title">어법 양자택일</span>
          <span class="as-sub">${wb.grammar_choice.length}문항</span>
        </div>
        <div class="answer-list">${grammarAns}</div>
      </div>

      <div class="answer-section">
        <div class="as-head">
          <span class="as-tag">STEP 3</span>
          <span class="as-title">어휘 양자택일</span>
          <span class="as-sub">${wb.vocab_choice.length}문항</span>
        </div>
        <div class="answer-list">${vocabAns}</div>
      </div>

      <div class="answer-section">
        <div class="as-head">
          <span class="as-tag">STEP 4</span>
          <span class="as-title">빈칸 첫글자 쓰기</span>
          <span class="as-sub">${wb.fill_first_letter.length}문항</span>
        </div>
        <div class="answer-list">${fillAns}</div>
      </div>

      <div class="answer-section">
        <div class="as-head">
          <span class="as-tag">STEP 5</span>
          <span class="as-title">한글 해석</span>
          <span class="as-sub">${wb.ko_translation.length}문항</span>
        </div>
        <div class="answer-list">${koAns}</div>
      </div>

      <div class="answer-section">
        <div class="as-head">
          <span class="as-tag">STEP 6</span>
          <span class="as-title">영문 배열</span>
          <span class="as-sub">${wb.jumble.length}문항</span>
        </div>
        <div class="answer-list">${jumbleAns}</div>
      </div>

      <div class="answer-section">
        <div class="as-head">
          <span class="as-tag">STEP 7</span>
          <span class="as-title">통문장 영작</span>
          <span class="as-sub">${wb.sentence_translation.length}문항</span>
        </div>
        <div class="answer-list">${sentAns}</div>
      </div>
    </div>`;

  return pageWrap({ stepNum: 9, headOpts, pageNum, body });
}

// ─────────────────────────────────────────────────────────────
// 문서 빌드
// ─────────────────────────────────────────────────────────────

function buildHtml({ data, wb }) {
  const exam = data.exam || '';
  // exam 형식: "[2026] 3월 모의고사 2학년" → 학년 분리
  const gradeMatch = exam.match(/(\d학년)/);
  const grade = gradeMatch ? gradeMatch[1] : '';
  const examShort = exam.replace(/\s*\d학년\s*$/, '').trim();

  const headOpts = { exam: examShort, grade, qno: data.question_no, stepNum: 1 };

  // jumble의 ko 힌트 — 본문 한글 해석에서 가져옴
  wb._refs = {};
  wb.jumble.forEach(j => {
    wb._refs[j.ref_sentence] = { ko: data.passage_ko[j.ref_sentence - 1] || '' };
  });

  const pages = [
    renderStep1({ data, wb, headOpts: { ...headOpts, stepNum: 1 }, pageNum: 1 }),
    renderStep2({ wb,        headOpts: { ...headOpts, stepNum: 2 }, pageNum: 2 }),
    renderStep3({ wb,        headOpts: { ...headOpts, stepNum: 3 }, pageNum: 3 }),
    renderStep4({ data, wb, headOpts: { ...headOpts, stepNum: 4 }, pageNum: 4 }),
    renderStep5({ data, wb, headOpts: { ...headOpts, stepNum: 5 }, pageNum: 5 }),
    renderStep6({ wb,        headOpts: { ...headOpts, stepNum: 6 }, pageNum: 6 }),
    renderStep7({ data, wb, headOpts: { ...headOpts, stepNum: 7 }, pageNum: 7 }),
    renderStep8({ data, wb, headOpts: { ...headOpts, stepNum: 8 }, pageNum: 8 }),
    renderStep9({ data, wb, headOpts: { ...headOpts, stepNum: 9 }, pageNum: 9 })
  ];

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<title>${esc(exam)} · ${esc(data.question_no)}번 워크북 — Terra Nova</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<link rel="stylesheet" href="../styles/workbook.css">
</head>
<body>

${pages.join('\n\n')}

</body>
</html>
`;
}

// ─────────────────────────────────────────────────────────────
// 메인
// ─────────────────────────────────────────────────────────────

async function main() {
  const dataArg = process.argv[2];
  const distArg = process.argv[3];
  if (!dataArg) {
    console.error('Usage: node builder/build-workbook.mjs <data-dir> [<dist-dir>]');
    process.exit(1);
  }
  const dataDir = path.resolve(process.cwd(), dataArg);
  const distDir = path.resolve(process.cwd(), distArg || path.join(dataArg, '..', 'dist'));

  await fs.mkdir(distDir, { recursive: true });

  // workbook json만 처리 (-workbook.json 접미사)
  const all = await fs.readdir(dataDir);
  const wbFiles = all.filter(f => /-workbook\.json$/.test(f)).sort();

  if (!wbFiles.length) {
    console.error(`No *-workbook.json files in ${dataDir}`);
    process.exit(1);
  }

  console.log(`📚 Building ${wbFiles.length} workbook(s)...`);

  const indexLinks = [];
  for (const wbFile of wbFiles) {
    const qno = wbFile.replace(/-workbook\.json$/, '');
    const dataFile = path.join(dataDir, `${qno}.json`);
    const wb   = JSON.parse(await fs.readFile(path.join(dataDir, wbFile), 'utf8'));
    const data = JSON.parse(await fs.readFile(dataFile, 'utf8'));

    const html = buildHtml({ data, wb });
    const outName = `workbook-${qno}.html`;
    await fs.writeFile(path.join(distDir, outName), html, 'utf8');
    indexLinks.push(`<a href="${outName}">${esc(data.exam)} · ${esc(data.question_no)}번 워크북</a>`);
    console.log(`   ✓ ${wbFile}  →  ${outName}`);
  }

  // 인덱스 — 기존 index.html이 있으면 워크북 섹션만 병합/생성
  const indexPath = path.join(distDir, 'index.html');
  let existing = '';
  try { existing = await fs.readFile(indexPath, 'utf8'); } catch {}

  const wbSection = `<div class="index-wrap" data-section="workbook">
  <h1>📚 워크북</h1>
  ${indexLinks.join('\n  ')}
</div>`;

  if (existing && existing.includes('data-section="workbook"')) {
    // 기존 워크북 섹션 교체
    existing = existing.replace(/<div class="index-wrap" data-section="workbook">[\s\S]*?<\/div>/, wbSection);
  } else if (existing) {
    // 분석지 index 끝에 워크북 섹션 추가
    existing = existing.replace(/<\/body>/, `\n${wbSection}\n</body>`);
  } else {
    existing = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>Terra Nova 워크북</title><link rel="stylesheet" href="../styles/workbook.css"></head><body>\n${wbSection}\n</body></html>`;
  }
  await fs.writeFile(indexPath, existing, 'utf8');

  console.log('✅ Done.');
}

main().catch(err => { console.error(err); process.exit(1); });
