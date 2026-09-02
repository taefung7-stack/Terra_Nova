#!/usr/bin/env node
/* ===================================================================
 * _ILLUSTRATION_PROMPTS.md → data/{L}/{N}.json 의 illustration.prompt 동기화
 * -------------------------------------------------------------------
 * 빌드는 JSON 을 읽으므로, 문서만 고치면 산출물에 반영되지 않는다.
 * 이 스크립트가 문서의 코드블록을 파싱해 JSON 에 밀어 넣는다.
 * 저장 경로(`dist/{L}/assets/illust-{N}.png`) 주석에서 과·챕터를 읽는다.
 * =================================================================== */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const md = fs.readFileSync(path.join(HERE, '_ILLUSTRATION_PROMPTS.md'), 'utf8');

/* "저장 경로: `dist/L5/assets/illust-1.png`" 뒤에 오는 첫 코드블록을 짝짓는다. */
/* ★ 코드블록 안에 '--ar' 가 있는 것만 프롬프트로 인정한다.
   그러지 않으면 탐욕 매칭이 문서 끝의 bash 예시 블록까지 삼켜 파싱이 어긋난다. */
/* ★ 파일이 CRLF 로 저장되므로 줄바꿈은 \r?\n 으로 받아야 한다. */
/* ★ 프롬프트 본문은 'Photorealistic' 로 시작한다 — 이걸 앵커로 잡아야
   앞의 불릿 설명(- 본문 근거: …)까지 삼키지 않는다. */
const re = /저장 경로:\s*`dist\/(L\d)\/(assets\/illust-(\d+)\.png)`[\s\S]*?```\r?\n(Photorealistic[^`]*?--ar[^`]*?)\r?\n```/g;
let m, n = 0;
const found = [];
while ((m = re.exec(md))) {
  found.push({ L: m[1], file: m[2], ch: Number(m[3]), prompt: m[4].trim() });
}

if (!found.length) { console.error('프롬프트를 하나도 파싱하지 못했다 — 문서 형식 확인'); process.exit(1); }

for (const f of found) {
  const p = path.join(HERE, 'data', f.L, `${f.ch}.json`);
  if (!fs.existsSync(p)) { console.error(`✗ 없는 챕터: ${f.L}/${f.ch}`); process.exitCode = 1; continue; }
  const d = JSON.parse(fs.readFileSync(p, 'utf8'));

  /* 규격 검사 — 빠뜨리면 비율·버전이 어긋난 이미지가 나온다 */
  if (!/--ar\s*16:5/.test(f.prompt)) { console.error(`✗ ${f.L}/${f.ch}: --ar 16:5 없음`); process.exitCode = 1; continue; }
  if (!/--v\s*8\.1/.test(f.prompt)) { console.error(`✗ ${f.L}/${f.ch}: --v 8.1 없음`); process.exitCode = 1; continue; }

  /* 지시부 = `--no` 파라미터 앞부분. 부정은 전부 `--no` 로 보내므로
   * 금지어·길이 검사는 반드시 그 앞만 본다(뒤까지 보면 전부 오탐한다). */
  const body = f.prompt.split(/--no\b/)[0];

  /* 인라인 `NO xxx` 금지 — 미드저니에서 부정으로 작동하지 않고 오히려
   * 그 물건을 불러온다. 부정은 `--no a, b, c` 로만 전달할 것. */
  if (/\bNO\b[ ]+[a-z]/.test(body)) {
    console.error(`✗ ${f.L}/${f.ch}: 지시부에 인라인 NO — 부정은 --no 파라미터로`);
    process.exitCode = 1; continue;
  }

  /* 지시부가 길수록 주제가 희석된다 */
  if (body.length > 800) { console.error(`✗ ${f.L}/${f.ch}: 지시부 ${body.length}자 (800 초과)`); process.exitCode = 1; continue; }

  /* 다크 키워드는 지시부 금지 — `--no` 뒤에 있는 건 오히려 정상이다 */
  const banned = ['golden hour', 'dramatic lighting', 'chiaroscuro', 'moody', 'neon', 'night scene', 'sunlit', 'twilight', 'sunset'];
  const hit = banned.filter(b => new RegExp(b, 'i').test(body));
  if (hit.length) { console.error(`✗ ${f.L}/${f.ch}: 지시부에 금지어 [${hit}]`); process.exitCode = 1; continue; }

  /* 교재에 가짜 글자·사람 얼굴이 인쇄되면 치명적이므로 차단을 강제한다 */
  const neg = f.prompt.split(/--no\b/)[1] || '';
  /* ★ 문자열 리터럴 안의 '\b' 는 정규식 단어경계가 아니라 백스페이스 문자다.
   *   RegExp 로 넘기려면 '\\b' 로 이스케이프해야 한다(안 하면 전부 오탐). */
  const missing = ['text', 'letters', 'words', 'face', 'people']
    .filter(w => !new RegExp('\\b' + w + '\\b', 'i').test(neg));
  if (missing.length) { console.error(`✗ ${f.L}/${f.ch}: --no 에 [${missing}] 누락`); process.exitCode = 1; continue; }

  const changed = d.illustration?.prompt !== f.prompt || d.illustration?.file !== f.file;
  d.illustration = { file: f.file, prompt: f.prompt };
  fs.writeFileSync(p, JSON.stringify(d, null, 2) + '\n', 'utf8');
  console.log(`  ${changed ? '↻' : '='} ${f.L}/${f.ch}  ${f.file}  (${f.prompt.length}자)`);
  n++;
}
console.log(`\n동기화 ${n}장`);
