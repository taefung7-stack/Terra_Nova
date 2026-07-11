#!/usr/bin/env node
// L1·L2 사전검사 수집기 — passage JSON + validate-content(--file) + lexile-audit 결과를
// 지문 단위로 병합해 audit/2026-07/_prepass.json 을 만든다. (검수 진단용, passage는 수정 안 함)
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');               // textbook/
const MONTH = process.env.AUDIT_MONTH || '2026-07';
const GRADES = [
  { key: 'saturn-g1',  dir: `content/passages/${MONTH}`,     lexGrade: '고1/Saturn' },
  { key: 'jupiter-g2', dir: `content/passages/${MONTH}-J`,   lexGrade: '고2/Jupiter' },
  { key: 'sun-g3',     dir: `content/passages/${MONTH}-Sun`, lexGrade: '고3/Sun' },
].filter(g => existsSync(resolve(root, g.dir)));
const outDir = resolve(root, `audit/${MONTH}`);
mkdirSync(outDir, { recursive: true });

// L1: validate-content 를 지문별 --file 로 실행. OK면 ok=true, 아니면 출력 캡처.
function runValidateFile(relFile) {
  try {
    const raw = execFileSync('node', ['tools/validate-content.mjs', '--file', relFile, '--profile', 'high'],
      { cwd: root, encoding: 'utf8' });
    return { ok: /^OK\b/m.test(raw), raw: raw.trim() };
  } catch (e) {
    return { ok: false, raw: ((e.stdout || '') + (e.stderr || '')).trim().slice(0, 4000) };
  }
}

// L2: lexile-audit-result.json (배열: {grade,folder,seq,file,declared,lex_est,fkg,fre,asl,...})
function loadLexile() {
  const p = resolve(root, 'tools/lexile-audit-result.json');
  if (!existsSync(p)) return [];
  try { return JSON.parse(readFileSync(p, 'utf8')); } catch { return []; }
}
const lexArr = loadLexile();
function lexFor(lexGrade, seq) {
  return lexArr.find(x => x.grade === lexGrade && x.seq === seq) || null;
}

const passages = [];
for (const g of GRADES) {
  const gdir = resolve(root, g.dir);
  const files = readdirSync(gdir).filter(f => /^\d{2}\.json$/.test(f)).sort();
  for (const f of files) {
    const seq = parseInt(f, 10);
    const relFile = `${g.dir}/${f}`;
    const data = JSON.parse(readFileSync(join(gdir, f), 'utf8'));
    const l1 = runValidateFile(relFile);
    const lex = lexFor(g.lexGrade, seq);
    // 라벨 vs 실측 괴리: 라벨(declared)과 lex_est 차가 120L 이상이면 mismatch 플래그
    let mismatch = false, delta = null;
    if (lex && typeof lex.declared === 'number' && typeof lex.lex_est === 'number') {
      delta = lex.lex_est - lex.declared;
      mismatch = Math.abs(delta) >= 120;
    }
    passages.push({
      grade: g.key, seq, file: relFile,
      l1: { ok: l1.ok, detail: l1.ok ? '' : l1.raw },
      l2: {
        lexile_label: data.meta?.lexile ?? null,
        lexile_declared: lex?.declared ?? null,
        lexile_measured: lex?.lex_est ?? null,
        lexile_delta: delta,
        lexile_mismatch: mismatch,
        fkg: lex?.fkg ?? null, fre: lex?.fre ?? null, asl: lex?.asl ?? null,
        achievement: data.meta?.achievement_standard ?? null,
        achievement_verified: data.meta?.achievement_verified ?? false,
      },
    });
  }
}

const l1Fail = passages.filter(p => !p.l1.ok).length;
const lexMis = passages.filter(p => p.l2.lexile_mismatch).length;
const out = {
  generated: process.env.AUDIT_TS || 'unstamped',
  total: passages.length,
  l1_fail: l1Fail,
  lexile_mismatch: lexMis,
  passages,
};
writeFileSync(join(outDir, '_prepass.json'), JSON.stringify(out, null, 2));
console.log(`[audit-prepass] ${passages.length} passages → audit/${MONTH}/_prepass.json  (L1 실패 ${l1Fail} / Lexile 괴리 ${lexMis})`);
