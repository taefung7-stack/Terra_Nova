#!/usr/bin/env node
/**
 * 2026-07 고등부(Saturn 고1 / Jupiter 고2 / Sun 고3) 보호 + 샘플 빌더.
 *
 * 왜 별도 스크립트인가:
 *   build-protected.mjs 는 6월 레이아웃(dist/{month}-{Level}/ + 본문 풀북 + 표지 따로)을 전제로
 *   cover+colophon 을 직접 합본한다. 그러나 7월 최종본(2026-07-{Level}.pdf)은
 *   _finalize-2026-07-highschool.mjs 가 이미
 *     앞표지 → 백지 → 판권(colophon) → 백지 → 본문 → 백지 → 뒷표지  (140~141p)
 *   로 합본·압축까지 끝낸 상태다. 그래서 여기서는 "합본"은 하지 않고
 *   ① 풀북 보호(인쇄 허용/복사 차단)  ② 샘플 추출 후 보호(전부 차단) 만 한다.
 *
 * 입력 : dist/2026-07/2026-07-{Level} (학년)/2026-07-{Level}.pdf   (압축된 최종본, <50MB)
 * 출력 : 같은 폴더에
 *   - 2026-07-{Level}-fullbook.pdf   (보호: print only)        ← 판매본(textbook-pdfs 업로드용)
 *   - 2026-07-{Level}-sample.pdf     (보호: 전부 차단, 12p)    ← 무료 샘플(sample-pdfs 업로드용)
 *
 * 샘플 구성(6월과 동일한 의도: 표지 + 판권 + 본문 앞부분):
 *   앞표지(p1) + 판권(p3) + 본문 10p(p5..p14)  = 12p   (백지 2장은 건너뜀)
 *
 * 보안 (muhammara, owner password 잠금, user password 없음):
 *   fullbook userProtectionFlag 4  = print only
 *   sample   userProtectionFlag 0  = 전부 차단
 *
 * 사용: node tools/_protect-sample-2026-07-highschool.mjs
 *        node tools/_protect-sample-2026-07-highschool.mjs --levels Saturn
 * 환경변수: TN_PDF_OWNER_PW (없으면 6월과 동일한 기본값 — 운영 일관성 유지)
 */
import muhammara from 'muhammara';
import { PDFDocument } from 'pdf-lib';
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const MONTH = '2026-07';

const BOOKS = [
  { level: 'Saturn',  dir: '2026-07-Saturn (고1)' },
  { level: 'Jupiter', dir: '2026-07-Jupiter (고2)' },
  { level: 'Sun',     dir: '2026-07-Sun (고3)' },
];

const OWNER_PW = process.env.TN_PDF_OWNER_PW || 'tn-2026-owner-DO-NOT-SHARE-9f4a2c';
if (!process.env.TN_PDF_OWNER_PW) {
  console.warn('⚠  TN_PDF_OWNER_PW 미설정 — 6월과 동일한 기본값 사용(운영 일관성).');
}

const { values } = parseArgs({ options: { levels: { type: 'string' } } });
const wanted = values.levels ? values.levels.split(',').map(s => s.trim().toLowerCase()) : null;

// 샘플 페이지 인덱스(0-base): 표지(0) + 판권(2) + 본문 10p(4..13)
const SAMPLE_INDICES = [0, 2, ...Array.from({ length: 10 }, (_, i) => 4 + i)];

const tmpDir = resolve(root, 'dist', '_protect07-tmp');
if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

function protectPdf(srcPath, outPath, allowPrint) {
  const writer = muhammara.createWriter(outPath, {
    userPassword: '',
    ownerPassword: OWNER_PW,
    userProtectionFlag: allowPrint ? 4 : 0,
  });
  const cpy = writer.createPDFCopyingContext(srcPath);
  const total = cpy.getSourceDocumentParser().getPagesCount();
  for (let i = 0; i < total; i++) cpy.appendPDFPageFromPDF(i);
  writer.end();
  return total;
}

const mb = p => (statSync(p).size / 1024 / 1024).toFixed(1);
const results = [];

for (const { level, dir } of BOOKS) {
  if (wanted && !wanted.includes(level.toLowerCase())) continue;
  const finalPath = resolve(root, 'dist', MONTH, dir, `${MONTH}-${level}.pdf`);
  if (!existsSync(finalPath)) { console.error(`[${level}] 최종본 없음: ${finalPath} — skip`); continue; }

  console.log(`\n=== ${level} ===`);
  const src = readFileSync(finalPath);
  const doc = await PDFDocument.load(src, { ignoreEncryption: true, updateMetadata: false });
  const totalPages = doc.getPageCount();

  // 1) 샘플 추출 (plain) → tmp
  const sampleDoc = await PDFDocument.create();
  const indices = SAMPLE_INDICES.filter(i => i < totalPages);
  const copied = await sampleDoc.copyPages(doc, indices);
  copied.forEach(p => sampleDoc.addPage(p));
  sampleDoc.setTitle(`Terra Nova ${MONTH} ${level} Sample`);
  sampleDoc.setProducer('Terra Nova English');
  sampleDoc.setCreator('Terra Nova Build Pipeline');
  const tmpSample = join(tmpDir, `${MONTH}-${level}-sample-plain.pdf`);
  // muhammara(구 PDF 파서)가 pdf-lib 의 object-stream 압축본을 못 읽어 copying context 생성에 실패.
  // useObjectStreams:false 로 저장해 호환성 확보.
  writeFileSync(tmpSample, await sampleDoc.save({ useObjectStreams: false }));
  console.log(`  1/3 sample extracted (${indices.length}p of ${totalPages}p: idx ${indices.join(',')})`);

  // 2) 풀북 보호 (print only) — 입력이 이미 합본·압축된 최종본
  const outFull = resolve(root, 'dist', MONTH, dir, `${MONTH}-${level}-fullbook.pdf`);
  const fullPages = protectPdf(finalPath, outFull, true);
  console.log(`  2/3 fullbook protected (${fullPages}p, print=allow, ${mb(outFull)}MB): ${outFull}`);

  // 3) 샘플 보호 (전부 차단)
  const outSample = resolve(root, 'dist', MONTH, dir, `${MONTH}-${level}-sample.pdf`);
  const sampPages = protectPdf(tmpSample, outSample, false);
  console.log(`  3/3 sample protected (${sampPages}p, print=block, ${mb(outSample)}MB): ${outSample}`);

  results.push({ level, fullPages, sampPages, fullMb: mb(outFull), sampMb: mb(outSample) });
}

rmSync(tmpDir, { recursive: true, force: true });

console.log('\n=== Summary ===');
for (const r of results) {
  console.log(`${r.level}: fullbook ${r.fullPages}p (${r.fullMb}MB) | sample ${r.sampPages}p (${r.sampMb}MB)`);
}
const over = results.filter(r => Number(r.fullMb) >= 50 || Number(r.sampMb) >= 50);
if (over.length) { console.error('\n❌ 50MB 초과 있음:', over.map(r => r.level).join(',')); process.exit(1); }
console.log('\n완료. 다음: textbook-pdfs/2026-07/ + sample-pdfs/2026-07/ 업로드.');
