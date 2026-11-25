// _rawdiff-EX.py 용 — 정본과 data/EX/*.json 을 JSON 으로 내보낸다.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SOURCE } from './_SOURCE-EX.js';
const D = path.dirname(fileURLToPath(import.meta.url));
const data = {};
for (const c of SOURCE) data[c.no] = JSON.parse(fs.readFileSync(path.join(D, 'data', 'EX', `${c.no}.json`), 'utf8'));
process.stdout.write(JSON.stringify({ source: SOURCE, data }));
