#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
const f = 'content/passages/2026-07-Sun/14.json';
const d = JSON.parse(readFileSync(f, 'utf8'));
d.page3.sentences[7].segments[1].note = '명사절 S+V+O+C, help O (to) V';
writeFileSync(f, JSON.stringify(d, null, 2));
console.log('fixed #14 note length');
