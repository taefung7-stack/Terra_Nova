#!/usr/bin/env node
/* ===================================================================
 * 워크북 양자택일 "정답이 항상 앞" 유출 차단 — 빌드 후 HTML 후처리
 * ===================================================================
 * build-workbook.mjs 는 {{n:A/B}} 를 적힌 순서(A=정답, verify 규약) 그대로
 * "A / B" 로 찍는다. 그대로면 STEP 2·3·8 의 정답이 전부 앞에 와서 순서로 답이 샌다
 * (project_terra_nova_workbook_choice_order_leak).
 * JSON 은 verify-workbook.mjs 규약대로 두고, 렌더된 HTML 에서 슬롯마다 결정적 해시로
 * 약 절반을 "B / A" 로 뒤집는다. 정답지(STEP 9)는 answers 배열을 쓰므로 영향 없음.
 *
 *   node _flip-wb-choices.mjs dist/WE      (build-workbook 직후, pdf-image 전에)
 * =================================================================== */
import fs from 'node:fs';
import path from 'node:path';

const dir = process.argv[2];
if (!dir) { console.error('usage: node _flip-wb-choices.mjs <dist dir>'); process.exit(2); }
const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
const RE = /<span class="alt"><sup class="alt-idx">(\d+)<\/sup>([\s\S]*?) <span class="slash">\/<\/span> ([\s\S]*?)<\/span>/g;

for (const f of fs.readdirSync(dir).filter(f => /^workbook-\d+\.html$/.test(f))) {
  const p = path.join(dir, f);
  let html = fs.readFileSync(p, 'utf8');
  if (html.includes('data-wb-flipped')) { console.log(`· ${f} 이미 처리됨`); continue; }
  let k = 0, front = 0, back = 0;
  html = html.replace(RE, (m, n, a, b) => {
    const flip = hash(`${f}|${k++}|${a}|${b}`) % 2 === 1;
    flip ? back++ : front++;
    return flip ? `<span class="alt"><sup class="alt-idx">${n}</sup>${b} <span class="slash">/</span> ${a}</span>` : m;
  });
  html = html.replace('<body', '<body data-wb-flipped="1"');
  fs.writeFileSync(p, html);
  console.log(`✓ ${f}  정답 위치 앞 ${front} · 뒤 ${back}`);
}
