/* ===================================================================
 * 봉영여중3 비상(김진완) — 챕터 JSON 저작 헬퍼
 * ===================================================================
 * _author-L{5,6,7}.mjs 의 간결한 저작 데이터를 builder/build.mjs 가 읽는
 * 분석지 JSON(data/{L}/{N}.json)으로 펼친다.
 *
 * 미니 마크업
 *   {english}   → <span style="font-family:Inter">english</span>  (한글 설명 속 영어)
 *   **굵게**    → <strong>굵게</strong>
 *   [g:…] [r:…] [h:…] → en_html 하이라이트 (hl-g / hl-r / hl)
 *   " | "       → 끊어읽기 슬래시 <span class="slash">/</span>
 * =================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SLASH = ' <span class="slash">/</span> ';

export const md = (s) => String(s ?? '')
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  .replace(/\{([^{}]+)\}/g, '<span style="font-family:Inter">$1</span>');

const hl = (s) => String(s)
  .replace(/\[g:([^\]]+)\]/g, '<span class="hl-g">$1</span>')
  .replace(/\[r:([^\]]+)\]/g, '<span class="hl-r">$1</span>')
  .replace(/\[h:([^\]]+)\]/g, '<span class="hl">$1</span>')
  .split(' | ').join(SLASH);

const POS = { 동: 1, 명: 1, 형: 1, 부: 1, 숙: 1, 전: 1, 접: 1, 대: 1, 조: 1 };

/* ★ 직선따옴표(")·〔 〕는 분석지 PDF 에서 빈칸으로 렌더된다(verify·overflow 로는 못 잡음).
 *   저작 문자열 전체를 훑어 "…" → “…” 로 바꾸고, 〔 〕 가 남아 있으면 중단한다. */
const curly = (v) => {
  if (typeof v === 'string') {
    if (/[〔〕「」]/.test(v)) throw new Error(`〔 〕「 」 사용 금지(PDF 빈칸 렌더): ${v.slice(0, 40)}`);
    return v.replace(/"([^"]*)"/g, '“$1”');
  }
  if (Array.isArray(v)) return v.map(curly);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, curly(x)]));
  return v;
};

export function writeChapter(lesson, source, raw) {
  const c = curly(raw);
  const ch = source.find(x => x.no === c.no);
  if (!ch) throw new Error(`${lesson} Ch${c.no}: 정본에 없음`);
  if (c.ko.length !== ch.sentences.length) {
    throw new Error(`${lesson} Ch${c.no}: 해석 ${c.ko.length} ≠ 원문 ${ch.sentences.length}`);
  }
  const choices = c.choices.map(([en, comment], i) => ({
    no: i + 1, en, ko: '', comment: md(comment), correct: i + 1 === c.answer,
  }));
  const sentences = c.cards.map(card => {
    const ko = card.ko ?? card.covers.map(n => c.ko[n - 1]).join(' | ');
    return {
      no: card.covers[0],
      covers: card.covers,
      tags: card.tags ?? ['grammar'],
      en_html: hl(card.en),
      ko_chunks: ko.split(' | ').join(SLASH),
      ko_full: ko.split(' | ').join(' '),
      note: md(card.note),
      points: card.points.map(([kind, text]) => ({ kind, text: md(text) })),
      paraphrasing: [],
    };
  });
  const vocab = c.vocab.map(line => {
    const [word, pos, meaning, syn = '—', ant = '—', deriv = '—'] = line.split('|').map(s => s.trim());
    if (!POS[pos]) throw new Error(`${lesson} Ch${c.no}: 품사 표기 이상 "${line}"`);
    return { word, pos, meaning, syn, ant, deriv };
  });
  const data = {
    $schema_version: '1.0',
    exam: c.exam ?? '봉영여중 3학년 · 비상(김진완)',   // 추가지문(EX)은 c.exam 으로 덮어쓴다
    question_no: c.no,
    subtitle: ch.subtitle,
    hide_answer: true,
    hide_brand: true,
    hide_head_no: true,
    type: c.type,
    score: 3,
    question_text: c.question,
    summary_ko: c.summary,
    main_idea_en: c.mainIdea,
    title_en: c.titleEn,
    illustration: { file: `assets/illust-${c.no}.png`, prompt: c.prompt },
    passage: ch.sentences,
    passage_ko: c.ko,
    choices,
    vocab,
    flow: c.flow.map(([emoji, title, body]) => ({ emoji, title, body: md(body) })),
    sentences,
  };
  const out = path.join(__dirname, 'data', lesson, `${c.no}.json`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(`  ${lesson}/${c.no}.json  문장 ${ch.sentences.length} · 카드 ${sentences.length} · 어휘 ${vocab.length} · 정답 ${c.answer}`);
}
