#!/usr/bin/env node
/**
 * 2026-07 중등 샘플만 재생성 (Day1~Day2 이틀치, 14p).
 * fullbook 은 이미 업로드됨 → 건드리지 않고 sample 만 다시 뽑는다.
 * 입력: dist/2026-07/2026-07-{Level} (학년)/2026-07-{Level}.pdf (raw 완성본 160p)
 * 출력: 같은 폴더 2026-07-{Level}-sample.pdf (14p, 전부차단 보안)
 *
 * 샘플 = 앞표지(0)+판권(2)+본문 12p(4..15) = 14p. Day1+Day2 각 4p 온전.
 * 샘플은 14p라 압축 불필요(수 MB). 표지 이미지 1장 외 대부분 벡터/텍스트.
 *
 * 사용: TN_PDF_OWNER_PW=... node tools/_resample-2026-07-midschool.mjs [--levels terra,neptune,uranus]
 */
import muhammara from 'muhammara';
import { PDFDocument } from 'pdf-lib';
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const MONTH = '2026-07';

const ALL = [
  { level: 'Terra',   dir: '2026-07-Terra (중1)'   },
  { level: 'Neptune', dir: '2026-07-Neptune (중2)' },
  { level: 'Uranus',  dir: '2026-07-Uranus (중3)'  },
];
const _arg = process.argv.find(a => a.startsWith('--levels='))?.split('=')[1]
  || (process.argv.includes('--levels') ? process.argv[process.argv.indexOf('--levels') + 1] : '');
const _want = _arg ? _arg.split(',').map(s => s.trim().toLowerCase()) : null;
const BOOKS = _want ? ALL.filter(b => _want.includes(b.level.toLowerCase())) : ALL;

// 앞표지(0)+판권(2)+본문 12p(4..15) = 14p. Day1+Day2 각 4p.
const SAMPLE_INDICES = [0, 2, ...Array.from({ length: 12 }, (_, i) => 4 + i)];
const OWNER_PW = process.env.TN_PDF_OWNER_PW || 'tn-2026-owner-DO-NOT-SHARE-9f4a2c';
if (!process.env.TN_PDF_OWNER_PW) console.warn('⚠  TN_PDF_OWNER_PW 미설정 — 기본값 사용(운영 일관성).');

const mb = p => (statSync(p).size / 1024 / 1024).toFixed(1);

function protect(src, out) {
  const w = muhammara.createWriter(out, { userPassword: '', ownerPassword: OWNER_PW, userProtectionFlag: 0 });
  const c = w.createPDFCopyingContext(src);
  const n = c.getSourceDocumentParser().getPagesCount();
  for (let i = 0; i < n; i++) c.appendPDFPageFromPDF(i);
  w.end();
  return n;
}

for (const b of BOOKS) {
  const distDir = resolve(root, 'dist', MONTH, b.dir);
  const srcPath = join(distDir, `${MONTH}-${b.level}.pdf`);
  const outSample = join(distDir, `${MONTH}-${b.level}-sample.pdf`);
  const tmpDir = join(root, 'dist', `_resample-${b.level.toLowerCase()}-tmp`);
  mkdirSync(tmpDir, { recursive: true });

  if (!existsSync(srcPath)) { console.error(`[${b.level}] 입력 없음: ${srcPath}`); continue; }
  console.log(`\n=== ${MONTH} ${b.level} 샘플 재생성 (이틀치 14p) ===`);

  const doc = await PDFDocument.load(readFileSync(srcPath), { ignoreEncryption: true });
  const total = doc.getPageCount();
  const sdoc = await PDFDocument.create();
  const idx = SAMPLE_INDICES.filter(i => i < total);
  (await sdoc.copyPages(doc, idx)).forEach(p => sdoc.addPage(p));
  sdoc.setTitle(`Terra Nova ${MONTH} ${b.level} Sample`);
  sdoc.setAuthor('Terra Nova English'); sdoc.setProducer('Terra Nova English'); sdoc.setCreator('Terra Nova Build Pipeline');
  const tmpS = join(tmpDir, 's.pdf');
  writeFileSync(tmpS, await sdoc.save({ useObjectStreams: false }));
  console.log(`  샘플 추출 ${idx.length}p (idx ${idx.join(',')})`);

  const sp = protect(tmpS, outSample);
  console.log(`  ✓ sample 보호(전부 차단) ${sp}p, ${mb(outSample)}MB → ${outSample}`);
  try { rmSync(tmpDir, { recursive: true, force: true }); } catch { /* OneDrive lock — 무해 */ }
}
console.log('\n완료. 다음: sample-pdfs/2026-07/ 재업로드.');
