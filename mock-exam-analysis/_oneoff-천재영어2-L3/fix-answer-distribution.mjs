#!/usr/bin/env node
/* ===================================================================
 * 변형문제 정답 위치 재배치 — 일회성 수정 스크립트
 * ===================================================================
 * 문제: 5지선다 의미추론 6유형(theme/gist/title/implication/blank/summary)의
 *       정답이 P1~P6 전부 ① 이라 학생이 ①만 찍어도 36문항을 맞힌다.
 *       빌더에 셔플이 없어 저작 순서가 그대로 인쇄된다.
 *
 * 왜 이 6유형만 건드리는가:
 *   grammar / vocab / irrelevant / insert 는 choices 가 ①~⑤ '플레이스홀더'이고
 *   번호가 **본문 밑줄·문장·슬롯 위치**에 묶여 있다. 순서를 바꾸면 본문과
 *   어긋나므로 절대 재배치 대상이 아니다. order 는 보기 자체가 (A)-(B)-(C)
 *   문자열이라 위치 이동이 무의미하고 이미 3·3·2·3·4·3 으로 분산돼 있다.
 *
 * 무엇을 함께 고치는가 (정합성 필수):
 *   1) choices / options 배열을 목표 위치로 순환 이동
 *   2) answer 를 새 정답 위치로 갱신
 *   3) distractor_ko 안의 ①~⑤ 마커를 새 번호로 remap
 *      (마커별 해설 조각을 파싱 → 원래 가리키던 보기의 새 위치로 재부여)
 *   4) summary 는 options[].no 를 1..5 로 재부여 (렌더러가 no 를 표시)
 *
 * 목표 분포: 유형별로 P1~P6 정답이 서로 다른 위치가 되도록 순환(1→2→3→4→5→1).
 *
 * 사용법: node _oneoff-천재영어2-L3/fix-answer-distribution.mjs [--dry]
 * =================================================================== */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DATA = path.join(HERE, 'data');
const DRY = process.argv.includes('--dry');

// 재배치 대상 — 실제 텍스트 보기를 가진 유형만.
const PERMUTABLE = ['theme', 'gist', 'title', 'implication', 'blank', 'summary'];

const CIRCLED = ['①', '②', '③', '④', '⑤'];

// 목표 정답 위치: 유형마다 시작점을 달리 두어 유형 간에도 패턴이 겹치지 않게 한다.
// passage i(1..6) → 정답 위치. 6개 지문에 1~5 를 순환 배치.
const TARGET = {
  theme:       [1, 2, 3, 4, 5, 3],
  gist:        [2, 3, 4, 5, 1, 4],
  title:       [3, 4, 5, 1, 2, 5],
  implication: [4, 5, 1, 2, 3, 1],
  blank:       [5, 1, 2, 3, 4, 2],
  summary:     [2, 4, 1, 5, 3, 1],
};

/**
 * distractor_ko 를 마커 단위로 쪼갠다.
 * "② ...설명... ③ ...설명... ⑤ ..." → Map(2 => '...', 3 => '...', 5 => '...')
 * 마커가 전혀 없으면 null (그대로 둔다).
 */
function parseDistractor(text) {
  if (!text) return null;
  const idx = [];
  for (let i = 0; i < text.length; i++) {
    const k = CIRCLED.indexOf(text[i]);
    if (k > -1) idx.push({ pos: i, num: k + 1 });
  }
  if (!idx.length) return null;
  // 첫 마커 앞에 붙은 도입 문구(있으면) 보존
  const prefix = text.slice(0, idx[0].pos).trim();
  const parts = new Map();
  idx.forEach((cur, n) => {
    const end = n + 1 < idx.length ? idx[n + 1].pos : text.length;
    parts.set(cur.num, text.slice(cur.pos + 1, end).trim());
  });
  return { prefix, parts };
}

/** old→new 매핑으로 distractor_ko 를 재조립. 오답 번호 순으로 정렬해 출력. */
function remapDistractor(text, oldToNew) {
  const parsed = parseDistractor(text);
  if (!parsed) return text;
  const out = [];
  for (const [oldNo, body] of parsed.parts) {
    const newNo = oldToNew.get(oldNo);
    if (!newNo) continue; // 매핑에 없으면(이상값) 버리지 않고 아래에서 경고
    out.push({ no: newNo, body });
  }
  if (out.length !== parsed.parts.size) {
    throw new Error('distractor remap lost an entry');
  }
  out.sort((a, b) => a.no - b.no);
  const joined = out.map(o => `${CIRCLED[o.no - 1]} ${o.body}`).join(' ');
  return parsed.prefix ? `${parsed.prefix} ${joined}` : joined;
}

/**
 * arr 을 재배치해 oldAnswerIdx 가 targetIdx 로 가게 한다(0-based).
 * 정답만 목표 위치로 옮기고 나머지는 원래 상대순서를 유지(삽입 이동).
 * 반환: { arr: 새배열, oldToNew: Map(1-based old → 1-based new) }
 */
function movePosition(arr, oldAnswerIdx, targetIdx) {
  const rest = arr.filter((_, i) => i !== oldAnswerIdx);
  const restOldIdx = arr.map((_, i) => i).filter(i => i !== oldAnswerIdx);
  const next = [...rest];
  const nextOld = [...restOldIdx];
  next.splice(targetIdx, 0, arr[oldAnswerIdx]);
  nextOld.splice(targetIdx, 0, oldAnswerIdx);
  const oldToNew = new Map();
  nextOld.forEach((oldI, newI) => oldToNew.set(oldI + 1, newI + 1));
  return { arr: next, oldToNew };
}

async function main() {
  const report = [];
  for (let i = 1; i <= 6; i++) {
    const file = path.join(DATA, `${i}-variant.json`);
    const d = JSON.parse(await fs.readFile(file, 'utf8'));
    let touched = false;

    for (const t of PERMUTABLE) {
      const q = d.by_type?.[t];
      if (!q) continue;
      const target = TARGET[t][i - 1];
      const oldAns = q.answer;
      if (oldAns === target) { report.push(`P${i} ${t}: 이미 ${target} — 유지`); continue; }

      const isSummary = t === 'summary';
      const list = isSummary ? q.options : q.choices;
      if (!Array.isArray(list) || list.length !== 5) {
        throw new Error(`P${i} ${t}: choices/options 길이 이상`);
      }
      if (!isSummary && list[0] === '①') {
        throw new Error(`P${i} ${t}: 플레이스홀더 보기 — 재배치 금지 대상`);
      }

      const { arr, oldToNew } = movePosition(list, oldAns - 1, target - 1);
      const newAns = oldToNew.get(oldAns);
      if (newAns !== target) throw new Error(`P${i} ${t}: 목표 위치 불일치`);

      if (isSummary) {
        q.options = arr.map((o, k) => ({ ...o, no: k + 1 }));
      } else {
        q.choices = arr;
      }
      q.answer = target;
      if (q.distractor_ko) q.distractor_ko = remapDistractor(q.distractor_ko, oldToNew);

      touched = true;
      report.push(`P${i} ${t}: ${oldAns} → ${target}`);
    }

    if (touched && !DRY) await fs.writeFile(file, JSON.stringify(d, null, 2) + '\n', 'utf8');
  }
  report.forEach(r => console.log('  ' + r));
  console.log(DRY ? '\n(dry-run — 파일 미저장)' : '\n✅ 정답 위치 재배치 완료');
}
main().catch(e => { console.error('❌', e.message); process.exit(1); });
