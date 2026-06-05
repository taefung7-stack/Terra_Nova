#!/usr/bin/env node
/* ===================================================================
 * Terra Nova 모의고사 워크북 빌더 — v1.0 LOCKED (2026-05-26)
 * ===================================================================
 *
 * 이 빌더의 디자인 시스템은 사용자 검수를 거쳐 v1.0으로 확정됨.
 * 회차별 데이터(JSON)만 교체하면 동일 디자인으로 무한 확장.
 *
 * ── 설계 원칙 (변경 금지) ─────────────────────────────────────────
 *   1. 9-STEP 구성 고정 (Passage → Grammar → Vocab → Fill →
 *      Ko-Trans → Arrange → Sent-Trans → Mixed → Answers)
 *   2. STEP별 컬러 코딩 — 페이지마다 다른 파스텔 톤
 *      (1·9 Mint / 2·6 Sky / 3·8 Butter / 4·7 Coral / 5 Sage)
 *   3. A4 297mm 절대 초과 금지 — auto-fit으로 항목 자율 분배
 *      (justify-content: space-around: 첫 항목 위·마지막 아래 여백 보장)
 *   4. 폰트 전부 Pretendard 통일 (Inter 사용 금지)
 *   5. 푸터: 좌측 "Terra Nova · Workbook" / 우측 동그라미 페이지번호
 *   6. 분석지와 동일한 패턴: page-head 컬러 보더 + 페이지번호 동그라미
 *   7. 학습 페이지(2~8): 각 문항 위에 STEP 컬러 1px 가로선 구분
 *      (border-top, :first-child 제외)
 *   8. 답란은 컬러 박스 대신 항목 사이 auto-fit 여백으로 자연 확보
 *   9. STEP 9 정답지: 2단 컬럼(column-count: 2)으로 한 페이지 수용
 *
 * ── 빌드 검증 ──────────────────────────────────────────────────────
 *   node builder/check-overflow.mjs <html-file>
 *   → 9/9 페이지 overflow=NO, hits_foot=NO 확인 후 배포
 *
 * ── 회차 확장 절차 ─────────────────────────────────────────────────
 *   1) {새회차폴더}/data/{N}.json + {N}-workbook.json 작성
 *   2) npm run workbook:{회차}  (package.json scripts에 1줄 추가)
 *   3) check-overflow.mjs 로 9/9 통과 검증
 *
 * 사용법:
 *   node builder/build-workbook.mjs <data-dir> [<dist-dir>]
 *   node builder/build-workbook.mjs 2026-march-grade2/data
 * =================================================================== */

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
          <div class="qa-answer-line"></div>
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
          <div class="qa-answer-line"></div>
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
    const sentEn = data.passage[f.ref_sentence - 1] || '';
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
          <div class="qa-answer-line"></div>
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
          <div class="qa-answer-line"></div>
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
          <div class="qa-answer-line"></div>
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

// 어법/어휘/지칭 유형 원본 지문에 박힌 보기 표식 (a)~(e) 제거.
// 분석지(build.mjs)는 이 표식이 필요하지만 워크북 본문에는 깨끗한 문장이 들어가야 함.
// (사용자 결정 2026-06-06: 워크북은 전부 제거 = 깨끗한 본문)
function stripChoiceMarkers(s) {
  return String(s ?? '').replace(/\(\s*[a-e]\s*\)/g, '');
}

function buildHtml({ data, wb }) {
  // 본문·해석에서 문제지 보기 표식 (a)~(e) 제거 (원본 객체는 보존, 얕은 복제)
  data = {
    ...data,
    passage: (data.passage || []).map(stripChoiceMarkers),
    passage_ko: (data.passage_ko || []).map(stripChoiceMarkers)
  };

  // 워크북 데이터의 표시 텍스트(en_template / ko_full / jumble)에서도 (a)~(e) 제거.
  // (어법·어휘·지칭 유형은 ko_full·en_template 에 표식이 섞여 들어옴 — 렌더 전 정제)
  const cleanField = (obj, key) => { if (obj && typeof obj[key] === 'string') obj[key] = stripChoiceMarkers(obj[key]); };
  for (const it of (wb.grammar_choice || [])) { cleanField(it, 'en_template'); cleanField(it, 'ko_full'); }
  for (const it of (wb.vocab_choice   || [])) { cleanField(it, 'en_template'); cleanField(it, 'ko_full'); }
  for (const it of (wb.fill_first_letter || [])) cleanField(it, 'ko_full');
  for (const it of (wb.jumble || [])) {
    cleanField(it, 'answer');
    if (Array.isArray(it.words)) it.words = it.words.map(stripChoiceMarkers);
  }

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
// 측정 기반 페이지 분할 (v1.1 — 긴 지문 전용, 짧은 지문 동작 불변)
// ─────────────────────────────────────────────────────────────
//
// build.mjs 의 measureAndChunk 와 동일한 철학: puppeteer 로 각 항목의
// 실제 높이를 측정해 본문 가용 높이를 넘는 STEP 만 연속 페이지로 분할.
// 6~10문장 워크북은 모든 STEP 이 1페이지에 들어가므로 분할이 발생하지 않아
// v1.0 LOCKED 산출물과 100% 동일. 13·25문장 같은 긴 지문에서만 STEP 이
// "9 → 9 / 9-2" 식으로 늘어난다 (CSS 무수정, 동일 마크업 재사용).
//
// 동작:
//   - 각 .page 의 .page-body 안쪽 "리스트 컨테이너"(.qa-list/.trans-list/
//     .jumble-list/.mixed-list/.answer-2col)의 직계 항목 높이를 측정.
//   - step-banner + 가용 높이를 계산해 그리디로 항목을 페이지에 분배.
//   - 넘칠 때만 같은 헤더/배너로 연속 페이지 생성, 푸터 페이지번호 재계산.

async function paginateOverflow(html, stylesHref, distDir) {
  const puppeteer = (await import('puppeteer')).default;
  const cssAbsPath = path.resolve(distDir, '..', 'styles', 'workbook.css');
  let cssContent = '';
  try { cssContent = await fs.readFile(cssAbsPath, 'utf8'); } catch {}

  const tmpPath = path.join(process.cwd(), `.tmp-wb-measure-${process.pid}-${Math.abs(hashStr(html))}.html`);
  const measureDoc = html.replace(
    /<link rel="stylesheet"[^>]*>/,
    `<style>${cssContent}</style>`
  );
  await fs.writeFile(tmpPath, measureDoc, 'utf8');

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 794, height: 1123 });
  await page.goto('file://' + tmpPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });

  const plan = await page.evaluate(() => {
    const LIST_SEL = '.qa-list, .trans-list, .jumble-list, .mixed-list, .answer-2col';
    const outerH = (c) => {
      const r = c.getBoundingClientRect();
      const cs = getComputedStyle(c);
      return r.height + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom);
    };
    const pages = [...document.querySelectorAll('.page')];
    return pages.map((p, idx) => {
      const body = p.querySelector('.page-body');
      const banner = p.querySelector('.step-banner');
      const list = p.querySelector(LIST_SEL);
      const bodyH = body.getBoundingClientRect().height;
      const bannerH = banner ? outerH(banner) : 0;
      const avail = Math.floor(bodyH - bannerH - 8);
      let contentH = 0;
      [...body.children].forEach(c => { contentH += outerH(c); });
      const overflow = contentH > bodyH + 1;

      const isAnswer = list && list.classList.contains('answer-2col');
      // STEP 1 (passage page) 은 list 컨테이너가 없다 — 본문 블록을 분할 대상으로
      const isPassage = !list && body.querySelector('.passage-grid');

      let itemHeights = [];
      if (list) {
        itemHeights = [...list.children].map(outerH);
      } else if (isPassage) {
        // page-body 직계 블록들(passage-grid, voca-block, voca-2col)을 분할 단위로
        itemHeights = [...body.children]
          .filter(c => !c.classList.contains('step-banner'))
          .map(outerH);
      }
      return {
        idx, overflow, avail,
        listClass: list ? list.getAttribute('class') : null,
        isAnswer, isPassage, itemHeights
      };
    });
  });

  await browser.close();
  try { await fs.unlink(tmpPath); } catch {}

  // overflow 페이지가 없으면 원본 그대로 반환 (짧은 워크북 = 변경 없음)
  if (!plan.some(p => p.overflow)) return html;

  // ── 항목 단위로 페이지 분할 ──
  // 정규식으로 각 <section class="page" ...> ... </section> 추출
  const sectionRe = /<section class="page"[\s\S]*?<\/section>/g;
  const sections = html.match(sectionRe) || [];

  const GAP = 6;       // auto-fit 항목 간 최소 간격 추정(여유분)
  const COLS = 2;      // answer-2col 컬럼 수
  const SAFETY = 0.94; // 가용 높이 안전 계수 (auto-fit space-around 여백 흡수)
  const newSections = [];

  // 항목 배열을 capacity 기준 그리디 분배
  function greedy(items, heights, capacity) {
    const groups = [];
    let cur = [], curH = 0;
    for (let k = 0; k < items.length; k++) {
      const h = heights[k];
      const addH = cur.length === 0 ? h : h + GAP;
      if (cur.length > 0 && curH + addH > capacity) { groups.push(cur); cur = []; curH = 0; }
      cur.push(items[k]);
      curH += (cur.length === 1 ? h : h + GAP);
    }
    if (cur.length) groups.push(cur);
    return groups;
  }
  function withContNote(head, gi) {
    if (gi === 0) return head;
    return head.replace(/(<span class="step-subtitle">[^<]*)(<\/span>)/,
      `$1 <span style="font-size:8pt;color:var(--c-muted)">(이어서 ${gi + 1})</span>$2`);
  }
  // CSS column-count:2 모사 — 섹션들을 순서대로 두 컬럼에 채울 때
  // 더 높은 컬럼의 높이를 추정 (col1 을 sum/2 직전까지 채우고 나머지 col2).
  function tallerColumnHeight(heights) {
    const total = heights.reduce((a, c) => a + c + GAP, 0);
    const half = total / 2;
    let col1 = 0, idx = 0;
    for (; idx < heights.length; idx++) {
      if (col1 + heights[idx] + GAP > half && col1 > 0) break;
      col1 += heights[idx] + GAP;
    }
    let col2 = 0;
    for (let k = idx; k < heights.length; k++) col2 += heights[k] + GAP;
    return Math.max(col1, col2);
  }
  // answer-2col 전용: 더 높은 컬럼이 avail 을 넘지 않도록 섹션을 페이지에 분배
  function greedyColumns(items, heights, avail) {
    const groups = [];
    let cur = [], curHs = [];
    for (let k = 0; k < items.length; k++) {
      const trial = [...curHs, heights[k]];
      if (curHs.length > 0 && tallerColumnHeight(trial) > avail) {
        groups.push(cur); cur = []; curHs = [];
      }
      cur.push(items[k]); curHs.push(heights[k]);
    }
    if (cur.length) groups.push(cur);
    return groups;
  }

  sections.forEach((sec, i) => {
    const info = plan[i];
    if (!info || !info.overflow) { newSections.push(sec); return; }

    // ── CASE A: STEP 1 passage 페이지 (리스트 컨테이너 없음) ──
    if (info.isPassage && !info.listClass) {
      // page-body 직계 블록(배너 제외)을 분할 단위로
      const pbOpenRe = /<div class="page-body">/;
      const pbm = sec.match(pbOpenRe);
      const footRe = /<footer class="page-foot">[\s\S]*?<\/footer>/;
      const fm = sec.match(footRe);
      if (!pbm || !fm) { newSections.push(sec); return; }
      const headTop = sec.slice(0, pbm.index + pbm[0].length); // <section..><header..><div page-body>
      const pbInner = sec.slice(pbm.index + pbm[0].length, sec.lastIndexOf('</div>', fm.index));
      const footer = fm[0];
      // 배너 분리
      const bannerRe = /<div class="step-banner">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
      // 배너는 3중 div — 안전하게 splitTopDivs 로 첫 블록 취득
      const blocks = splitTopDivs(pbInner, null);
      if (blocks.length < 2) { newSections.push(sec); return; }
      const banner = blocks[0];
      const contentBlocks = blocks.slice(1);
      if (contentBlocks.length !== info.itemHeights.length) { newSections.push(sec); return; }
      const cap = Math.floor(info.avail * SAFETY);
      const groups = greedy(contentBlocks, info.itemHeights, cap);
      const sectOpen = sec.slice(0, sec.indexOf('<header'));
      const header = sec.slice(sec.indexOf('<header'), sec.indexOf('<div class="page-body">'));
      groups.forEach((grp, gi) => {
        const head = withContNote(`${sectOpen}${header}<div class="page-body">\n${banner}\n`, gi);
        newSections.push(`${head}${grp.join('\n')}\n  </div>\n${footer}\n</section>`);
      });
      return;
    }

    if (!info.listClass) { newSections.push(sec); return; }

    // ── CASE B: 리스트 기반 STEP (2~9) ──
    const listOpenRe = new RegExp(`<div class="${escapeReg(info.listClass)}">`);
    const openMatch = sec.match(listOpenRe);
    if (!openMatch) { newSections.push(sec); return; }
    const listOpen = openMatch[0];
    const beforeList = sec.slice(0, openMatch.index);
    const afterOpenIdx = openMatch.index + listOpen.length;
    const listInnerAndRest = sec.slice(afterOpenIdx);
    const bodyCloseRe = /\s*<\/div>\s*<\/div>\s*<footer/;
    const bodyCloseMatch = listInnerAndRest.match(bodyCloseRe);
    if (!bodyCloseMatch) { newSections.push(sec); return; }
    const listInner = listInnerAndRest.slice(0, bodyCloseMatch.index);
    const tail = listInnerAndRest.slice(bodyCloseMatch.index);

    const items = splitTopDivs(listInner, null);
    if (items.length !== info.itemHeights.length) { newSections.push(sec); return; }

    // answer-2col 은 2단 컬럼 → 더 높은 컬럼이 avail 안에 들도록 컬럼 인지 분배.
    // 그 외 STEP 은 단일 컬럼 그리디.
    const groups = info.isAnswer
      ? greedyColumns(items, info.itemHeights, Math.floor(info.avail * SAFETY))
      : greedy(items, info.itemHeights, Math.floor(info.avail * SAFETY));

    groups.forEach((grp, gi) => {
      const head = withContNote(beforeList, gi);
      newSections.push(`${head}${listOpen}${grp.join('')}${tail}`);
    });
  });

  // 푸터 페이지 번호 재계산 (전체 순번)
  let pageNum = 0;
  const renumbered = newSections.map(sec => {
    pageNum += 1;
    return sec.replace(/<span class="pageno">\d+<\/span>/, `<span class="pageno">${pageNum}</span>`);
  });

  // 문서 재조립
  const firstSecIdx = html.indexOf(sections[0]);
  const docHead = html.slice(0, firstSecIdx);
  const lastSec = sections[sections.length - 1];
  const docTail = html.slice(html.indexOf(lastSec) + lastSec.length);
  return docHead + renumbered.join('\n\n') + docTail;
}

// 최상위 <div ...> 블록들을 균형 괄호로 분리
function splitTopDivs(htmlFrag, classHint) {
  const divs = [];
  let i = 0;
  const openTag = /<div\b[^>]*>/g;
  const s = htmlFrag;
  while (i < s.length) {
    openTag.lastIndex = i;
    const m = openTag.exec(s);
    if (!m) break;
    // 균형 맞는 닫기 찾기
    let depth = 0, j = m.index;
    const tagRe = /<\/?div\b[^>]*>/g;
    tagRe.lastIndex = m.index;
    let t;
    while ((t = tagRe.exec(s))) {
      if (t[0].startsWith('</')) { depth--; } else { depth++; }
      if (depth === 0) { j = tagRe.lastIndex; break; }
    }
    divs.push(s.slice(m.index, j));
    i = j;
  }
  return divs.filter(d => d.trim());
}

function escapeReg(str) { return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function hashStr(str) { let h = 0; for (let i = 0; i < str.length; i++) { h = (h * 31 + str.charCodeAt(i)) | 0; } return h; }

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

    let html = buildHtml({ data, wb });
    // 긴 지문(STEP overflow)만 연속 페이지로 분할 — 짧은 워크북은 변화 없음
    try {
      html = await paginateOverflow(html, '../styles/workbook.css', distDir);
    } catch (err) {
      console.warn(`   ⚠️  paginate skipped for ${qno}: ${err.message}`);
    }
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
