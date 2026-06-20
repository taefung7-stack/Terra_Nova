#!/usr/bin/env node
// 고2 validate 실패 2건 교정: #03 비허용 role APP→C, #20 note 길이 단축.
import { readFileSync, writeFileSync } from 'node:fs';

const f3 = 'content/passages/2026-07-J/03.json';
const d3 = JSON.parse(readFileSync(f3, 'utf8'));
const seg3 = d3.page3.sentences[1].segments[3];
if (seg3.role === 'APP') { seg3.role = 'C'; }  // 콜론 뒤 명사 동격 → 보어 격으로 처리(스키마 허용 role)
writeFileSync(f3, JSON.stringify(d3, null, 2));
console.log('fixed #03 role APP→C');

const f20 = 'content/passages/2026-07-J/20.json';
const d20 = JSON.parse(readFileSync(f20, 'utf8'));
d20.page3.sentences[17].segments[4].note = 'not A but B + 관계절, 빈칸(부사 worst)';
writeFileSync(f20, JSON.stringify(d20, null, 2));
console.log('fixed #20 note length');
