/* ===================================================================
 * 신서중3 동아(윤정미) — 저작 원고(_author/L*.mjs) → 분석지 데이터 JSON
 * ===================================================================
 * 저작 원고는 손으로 쓰기 쉬운 압축 문법을 쓰고, 이 스크립트가 빌더가
 * 읽는 data/{L}/{N}.json 스키마(목일중3 동아이와 동일)로 펼친다.
 *
 *   본문(passage)·소제목(subtitle)은 _SOURCE 정본에서 가져온다(원고에 안 씀).
 *   카드 ko_full 은 passage_ko 에서 covers 로 조립한다(해석 이중 관리 방지).
 *
 * 압축 문법
 *   영어 카드 en :  [[x]] → hl   {{x}} → hl-g   ((x)) → hl-r   " / " → 끊어읽기
 *   한글 청크 ko :  " / " → 끊어읽기
 *   설명 텍스트  :  `x` → Inter(영어) 서체   **x** → 굵게
 *
 * 사용법: node _oneoff-신서중3-동아윤/_gen-data.mjs [L5|L6|L7]
 * =================================================================== */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EXAM = '신서중 3학년 · 동아(윤정미)';
const QTEXT = {
  제목: '다음 글의 제목으로 가장 적절한 것은?',
  주제: '다음 글의 주제로 가장 적절한 것은?',
  요지: '다음 글의 요지로 가장 적절한 것은?',
  내용일치: '다음 글의 내용과 일치하는 것은?',
  내용불일치: '다음 글의 내용과 일치하지 않는 것은?',
};

const SLASH = ' <span class="slash">/</span> ';
const txt = (s) => String(s ?? '')
  .replace(/`([^`]+)`/g, '<span style="font-family:Inter">$1</span>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
const en = (s) => String(s)
  .replace(/\[\[(.+?)\]\]/g, '<span class="hl">$1</span>')
  .replace(/\{\{(.+?)\}\}/g, '<span class="hl-g">$1</span>')
  .replace(/\(\((.+?)\)\)/g, '<span class="hl-r">$1</span>')
  .replace(/ \/ /g, SLASH);
const ko = (s) => String(s).replace(/ \/ /g, SLASH);
const plain = (h) => h.replace(/<span class="slash">\/<\/span>/g, ' ')
  .replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

const targets = process.argv[2] ? [process.argv[2].toUpperCase()] : ['L5', 'L6', 'L7'];
let fail = 0;

for (const L of targets) {
  const { SOURCE } = await import(`./_SOURCE-${L}.js`);
  const { CHAPTERS } = await import(`./_author/${L}.mjs`);
  const outDir = path.join(__dirname, 'data', L);
  await fs.mkdir(outDir, { recursive: true });

  for (const c of CHAPTERS) {
    const src = SOURCE.find(s => s.no === c.no);
    const passage = src.sentences;
    if (c.ko.length !== passage.length) {
      console.error(`✗ ${L} Ch${c.no}: 해석 ${c.ko.length} ≠ 원문 ${passage.length}`); fail++;
    }
    const sentences = c.cards.map(k => ({
      no: k.c[0],
      covers: k.c,
      tags: [k.tag || 'grammar'],
      en_html: en(k.en),
      ko_chunks: ko(k.ko),
      ko_full: k.c.map(n => c.ko[n - 1]).join(' '),
      note: txt(k.note),
      points: k.pts.map(([kind, t]) => ({ kind, text: txt(t) })),
      paraphrasing: [],
    }));
    // 카드 영어를 이어붙이면 원문 전체와 같아야 한다(생성 단계 1차 방어).
    const a = sentences.map(s => plain(s.en_html)).join(' ');
    const b = passage.join(' ');
    if (a !== b) {
      let i = 0; while (a[i] === b[i]) i++;
      console.error(`✗ ${L} Ch${c.no}: 카드≠원문 @${i}\n  카드: …${a.slice(i - 40, i + 40)}\n  원문: …${b.slice(i - 40, i + 40)}`);
      fail++;
    }
    const json = {
      $schema_version: '1.0',
      exam: EXAM,
      question_no: c.no,
      subtitle: src.subtitle,
      hide_answer: true,
      hide_brand: true,
      hide_head_no: true,
      type: c.type,
      score: 3,
      question_text: c.q || QTEXT[c.type],
      summary_ko: c.summary,
      main_idea_en: c.main_idea_en,
      title_en: c.title_en,
      illustration: { file: `assets/illust-${c.no}.png`, prompt: c.illust.replace(/\s+/g, ' ').trim() },
      passage,
      passage_ko: c.ko,
      choices: c.choices.map(([t, cm], i) => ({
        no: i + 1, en: t, ko: '', comment: txt(cm), correct: i + 1 === c.answer,
      })),
      vocab: c.vocab.map(([word, pos, meaning, syn, ant, deriv]) => ({ word, pos, meaning, syn, ant, deriv })),
      flow: c.flow.map(([emoji, title, body]) => ({ emoji, title: txt(title), body: txt(body) })),
      sentences,
    };
    await fs.writeFile(path.join(outDir, `${c.no}.json`), JSON.stringify(json, null, 2) + '\n');
    console.log(`✓ ${L}/${c.no}.json  문장 ${passage.length} · 카드 ${sentences.length} · 어휘 ${json.vocab.length} · 정답 ${c.answer}`);
  }
}
if (fail) { console.error(`\n✗ 생성 오류 ${fail}건`); process.exit(1); }
