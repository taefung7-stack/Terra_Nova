#!/usr/bin/env node
/* 2027 수능 회차 — 푸터 좌측 브랜드 "Terra Nova" → "TED KANG" (사용자 요청 2026-11-20)
 * builder/build.mjs(v1.0 LOCKED)가 푸터에 "Terra Nova · 모의고사 분석지"를 하드코딩하므로
 * 빌드 직후 이 회차 dist/*.html 에서만 바꾼다. build:suneung 에 연결돼 있다. */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const DIST = path.join(path.dirname(fileURLToPath(import.meta.url)), 'dist');
let files = 0, hits = 0;
for (const f of fs.readdirSync(DIST).filter(f => /^\d+\.html$/.test(f))) {
  const p = path.join(DIST, f);
  const s = fs.readFileSync(p, 'utf8');
  const out = s.replace(/<span class="brand">Terra Nova/g, () => { hits++; return '<span class="brand">TED KANG'; });
  if (out !== s) { fs.writeFileSync(p, out); files++; }
}
console.log(`✓ 푸터 브랜드 교체: ${files}개 파일 · ${hits}곳`);
