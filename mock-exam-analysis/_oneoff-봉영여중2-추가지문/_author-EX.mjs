/* 봉영여중2 영어B 기말 추가지문 — 본문분석 저작 진입점
 * 실행: node _author-EX.mjs  → data/EX/{7,8,9,10,11}.json
 * 원고: _author-EX-1.mjs (7·8) / _author-EX-2.mjs (9·10·11). JSON 은 직접 고치지 말 것. */
import { writeChapter } from './_author.mjs';
import { SOURCE } from './_SOURCE-EX.js';
import { chapters as A } from './_author-EX-1.mjs';
import { chapters as B } from './_author-EX-2.mjs';

for (const c of [...A, ...B]) writeChapter('EX', SOURCE, c);
