// One-shot fix: strip blank-fill answer spoilers from 2026-06-Sun passages.
//   1) page3.sentences[*].segments[*].text  : remove "  (= phrase)" right after "____"
//   2) page3.translation_ko                  : remove "(spoiler)" right after "____"
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dir = 'c:/Users/user/OneDrive/Desktop/Terra Nova/textbook/content/passages/2026-06-Sun';
const files = readdirSync(dir).filter(f => /^\d+\.json$/.test(f)).sort();

let totalEng = 0, totalKor = 0;

for (const f of files) {
  const path = join(dir, f);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  let modified = false;

  // English: page3.sentences[*].segments[*].text — strip "  (= ...)"
  for (const sent of data.page3?.sentences ?? []) {
    for (const seg of sent.segments ?? []) {
      if (typeof seg.text === 'string' && /____.*\(=/.test(seg.text)) {
        const before = seg.text;
        // Match: optional whitespace, "(= ... )" right after "____"
        seg.text = seg.text.replace(/(_+)\s*\(=\s*[^)]+\)/g, '$1');
        if (seg.text !== before) { modified = true; totalEng++; }
      }
    }
  }

  // Korean: page3.translation_ko — strip "(spoiler)" right after "____"
  if (typeof data.page3?.translation_ko === 'string') {
    const before = data.page3.translation_ko;
    // Match underscores immediately followed (no space, optional space) by "(...)"
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
