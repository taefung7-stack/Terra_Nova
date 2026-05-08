// One-shot fix: strip blank-fill answer spoilers from 2026-06 (Saturn) passages.
//   1) page3.sentences[*].segments[*].text  : remove "  (= phrase)" right after "____"
//   2) page3.translation_ko                  : remove "(spoiler)" right after "____"
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dir = resolve(here, '..', 'content', 'passages', '2026-06');
const files = readdirSync(dir).filter(f => /^\d+\.json$/.test(f)).sort();

let totalEng = 0, totalKor = 0;

for (const f of files) {
  const path = join(dir, f);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  let modified = false;

  for (const sent of data.page3?.sentences ?? []) {
    for (const seg of sent.segments ?? []) {
      if (typeof seg.text === 'string' && /_+\s*\(/.test(seg.text)) {
        const before = seg.text;
        seg.text = seg.text.replace(/(_+)\s*\(=?\s*[^)]+\)/g, '$1');
        if (seg.text !== before) { modified = true; totalEng++; }
      }
    }
  }

  if (typeof data.page3?.translation_ko === 'string') {
    const before = data.page3.translation_ko;
    data.page3.translation_ko = data.page3.translation_ko.replace(
      /(_+)\s*\([^)]+\)/g,
      '$1',
    );
    if (data.page3.translation_ko !== before) { modified = true; totalKor++; }
  }

  if (modified) {
    writeFileSync(path, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`  ${f}: stripped`);
  }
}

console.log(`\nDone. ${totalEng} English segments, ${totalKor} Korean translations cleaned.`);
