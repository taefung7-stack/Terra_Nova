#!/usr/bin/env node
/* ===================================================================
 * 목일중3 추가지문 — 변형문제 반쪽 페이지 합치기 (일회성 후처리)
 * ===================================================================
 * build-variant.mjs 는 유형마다 새 페이지를 열고 지문별 문항을 좌·우 2단에 채운다.
 * 지문이 1개뿐이면 객관식 11유형이 전부 "왼쪽 단만 찬 반쪽 페이지"가 된다.
 * 공용 빌더는 건드리지 않고, 연속된 반쪽 객관식 페이지 두 장을 한 장의 좌·우 단으로
 * 합친 뒤 페이지 번호를 다시 매긴다(머리글 유형 태그는 "A · B").
 *
 * 합친 뒤에는 반드시 _measure-clip.mjs / _measure-pages.mjs 로 잘림·푸터 침범 0 을 확인할 것.
 * 사용법: node _pack-variant.mjs <variant-book.html>   (제자리 덮어쓰기)
 * =================================================================== */
import fs from 'node:fs';

const file = process.argv[2];
if (!file) { console.error('Usage: node _pack-variant.mjs <variant-book.html>'); process.exit(1); }
const html = fs.readFileSync(file, 'utf8');

const SEC_RE = /<section class="page[^"]*">[\s\S]*?<\/section>/g;
const sections = html.match(SEC_RE) || [];
const HALF_TAIL = '</div>\n      <div class="vq-col"></div>\n    </div>';

/* 왼쪽 단에 문항 카드 1개만 있고 오른쪽 단이 빈 객관식 페이지인가 */
function halfCard(sec) {
  if (!sec.includes('<div class="vq-cols">') || !sec.includes(HALF_TAIL)) return null;
  const tag = (sec.match(/<div class="head-tag">([^<]*)<\/div>/) || [])[1] || '';
  if (/서술형|정답/.test(tag)) return null;
  const start = sec.indexOf('<div class="vq-col">') + '<div class="vq-col">'.length;
  const end = sec.indexOf(HALF_TAIL);
  const card = sec.slice(start, end);
  if ((card.match(/<div class="vq">/g) || []).length !== 1) return null;
  return { tag, card };
}

const out = [];
let merged = 0;
for (let i = 0; i < sections.length; i++) {
  const a = halfCard(sections[i]);
  const b = i + 1 < sections.length ? halfCard(sections[i + 1]) : null;
  if (a && b) {
    out.push(sections[i]
      .replace(/<div class="head-tag">[^<]*<\/div>/, `<div class="head-tag">${a.tag} · ${b.tag}</div>`)
      .replace(HALF_TAIL, `</div>\n      <div class="vq-col">${b.card}</div>\n    </div>`));
    merged++;
    i++;
  } else {
    out.push(sections[i]);
  }
}

// 페이지 번호 재부여
const renum = out.map((sec, i) => sec.replace(/(<span class="pageno">)\d+(<\/span>)/, `$1${i + 1}$2`));

let k = 0;
const result = html.replace(SEC_RE, () => (k < renum.length ? renum[k++] : ''));
fs.writeFileSync(file, result, 'utf8');
console.log(`✓ ${file}: ${sections.length}p → ${renum.length}p (반쪽 페이지 ${merged}쌍 합침)`);
