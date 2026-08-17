#!/usr/bin/env node
/* ===================================================================
 * 무관한 문장(irrelevant) 정답 위치 분산 — 일회성
 * ===================================================================
 * irrelevant 6문항이 ④④④④③③ 으로 몰려 있다. 이 유형의 ①~⑤ 는 본문
 * '문장 위치' 이므로 choices 를 섞을 수 없고, **무관 문장 자체를 다른
 * 자리로 옮겨야** 한다.
 *
 * 안전 조건: 무관 문장은 앞뒤와 논리적으로 연결되지 않는 '삽입된 딴소리'
 * 이므로, 옮겨도 나머지 문장의 상대 순서가 유지되면 흐름은 그대로다.
 * 따라서 나머지 4문장의 순서는 절대 바꾸지 않고, 무관 문장만 목표 위치로
 * 이동한다. 단 1번(첫 문장) 자리는 intro 직후 흐름을 끊어 어색하므로 제외.
 *
 * 목표: P1..P6 → 2, 5, 4, 2, 5, 3  (기존 4,4,4,4,3,3 에서 분산)
 *
 * 사용법: node _oneoff-천재영어2-L3/fix-irrelevant-position.mjs [--dry]
 * =================================================================== */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(HERE, 'data');
const DRY = process.argv.includes('--dry');

const TARGET = [2, 5, 4, 2, 5, 3]; // P1..P6

async function main() {
  for (let i = 1; i <= 6; i++) {
    const file = path.join(DATA, `${i}-variant.json`);
    const d = JSON.parse(await fs.readFile(file, 'utf8'));
    const q = d.by_type?.irrelevant;
    if (!q) continue;

    const target = TARGET[i - 1];
    const cur = q.answer;
    if (cur === target) { console.log(`  P${i}: 이미 ${target} — 유지`); continue; }
    if (target < 2 || target > q.sentences.length) throw new Error(`P${i}: 목표 위치 ${target} 부적절`);

    const odd = q.sentences[cur - 1];
    const rest = q.sentences.filter((_, k) => k !== cur - 1); // 나머지 상대순서 유지
    const next = [...rest];
    next.splice(target - 1, 0, odd);

    if (next.length !== q.sentences.length) throw new Error(`P${i}: 문장 수 변동`);
    if (next[target - 1] !== odd) throw new Error(`P${i}: 목표 위치에 무관문장 없음`);

    q.sentences = next;
    q.answer = target;
    // distractor_ko 가 번호로 흐름을 설명하면 무효화되므로 번호 없는 문구로 교체
    if (q.distractor_ko && /[①②③④⑤]/.test(q.distractor_ko)) {
      q.distractor_ko = '나머지 네 문장은 씨앗을 퍼뜨리는 과정을 순서대로 잇고 있어 모두 글의 흐름에 맞는다.';
    }
    if (q.explanation_ko) {
      const CIRCLED = ['①', '②', '③', '④', '⑤'];
      q.explanation_ko = q.explanation_ko.split(CIRCLED[cur - 1]).join(CIRCLED[target - 1]);
    }
    console.log(`  P${i}: ${cur} → ${target}`);
    if (!DRY) await fs.writeFile(file, JSON.stringify(d, null, 2) + '\n', 'utf8');
  }
  console.log(DRY ? '\n(dry-run)' : '\n✅ 무관문장 위치 분산 완료');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
