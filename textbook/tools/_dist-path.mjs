// 콘텐츠 월 인자(content/passages/<arg>) → dist 출력 경로 매핑.
//
// 교재는 월별 폴더(dist/{YYYY-MM}/) 안에 레벨별 폴더(dist/{YYYY-MM}/{YYYY-MM}-{Level} (학년)/)로
// 정리한다(2026-06 정리본과 동일 컨벤션). 콘텐츠 폴더는 "행성 접미사" 규칙을 쓰므로
// (예: 2026-07=고1 Saturn, 2026-07-J=고2 Jupiter, 2026-07-Sun=고3 Sun) 여기서 정규화한다.
//
// import { distLevelDir } from './_dist-path.mjs';
// const outDir = distLevelDir(root, values.month);  // .../dist/2026-07/2026-07-Saturn (고1)

import { join } from 'node:path';

// 행성(레벨) → 학년 라벨
const LEVEL_GRADE = {
  Moon: '초3', Mercury: '초4', Mars: '초5', Venus: '초6',
  Terra: '중1', Neptune: '중2', Uranus: '중3',
  Saturn: '고1', Jupiter: '고2', Sun: '고3',
};

// 콘텐츠 월 인자의 접미사 → 정식 레벨(행성). 접미사 없으면 그 달의 기본 레벨.
// 약어(-J, -N, -Sun)와 정식 행성명(-Mars, -Venus...) 모두 허용.
const SUFFIX_LEVEL = {
  '': 'Saturn',          // 접미사 없음 = 고1 Saturn (고등부 신간 기본)
  'J': 'Jupiter', 'Sun': 'Sun', 'N': 'Neptune',
  'Moon': 'Moon', 'Mercury': 'Mercury', 'Mars': 'Mars', 'Venus': 'Venus',
  'Terra': 'Terra', 'Neptune': 'Neptune', 'Uranus': 'Uranus',
  'Saturn': 'Saturn', 'Jupiter': 'Jupiter',
};

// "2026-07-J" → { month: "2026-07", suffix: "J" }, "2026-06" → { month, suffix: "" }
export function parseMonthArg(monthArg) {
  const m = monthArg.match(/^(\d{4}-\d{2})(?:-(.+))?$/);
  if (!m) return { month: monthArg, suffix: '', level: null, grade: null };
  const month = m[1];
  const suffix = m[2] || '';
  const level = SUFFIX_LEVEL[suffix] || null;
  const grade = level ? LEVEL_GRADE[level] : null;
  return { month, suffix, level, grade };
}

// dist 레벨 폴더 경로. 레벨을 못 알아내면 월 폴더 바로 아래에 인자명 그대로(역호환).
export function distLevelDir(root, monthArg) {
  const { month, level, grade } = parseMonthArg(monthArg);
  if (!level) return join(root, 'dist', month, monthArg);
  const leaf = grade ? `${month}-${level} (${grade})` : `${month}-${level}`;
  return join(root, 'dist', month, leaf);
}

export { LEVEL_GRADE };
