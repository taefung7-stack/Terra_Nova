import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const passageFile = (...parts) => JSON.parse(readFileSync(join(root, 'content', 'passages', ...parts), 'utf8'));
// Use a 2026-07 passage as the "clean" fixture: the 2026-06 sample predates the
// 밑줄 정합(underline-consistency) rule and now legitimately fails it (a real,
// already-shipped defect we don't retro-fix). 2026-07-Sun/01 has no underline-
// citation question, so it stays errors-clean.
const currentPassage = () => passageFile('2026-07-Sun', '01.json');
const VALIDATE_SNIPPET = `
import { validatePassage } from './tools/validate-content.mjs';
let input = '';
for await (const chunk of process.stdin) input += chunk;
process.stdout.write(JSON.stringify(validatePassage(JSON.parse(input))));
`;

function validatePassageInNode(data) {
  return JSON.parse(execFileSync(
    process.execPath,
    ['--input-type=module', '-e', VALIDATE_SNIPPET],
    { cwd: root, input: JSON.stringify(data), encoding: 'utf8' }
  ));
}

describe('passage schema validator (v2.0)', () => {
  it('accepts a valid passage', () => {
    const result = validatePassageInNode(currentPassage());
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects body longer than 3200 characters', () => {
    const passage = currentPassage();
    passage.page1.body = 'word '.repeat(700).trim();
    const result = validatePassageInNode(passage);
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.instancePath.includes('/page1/body'))).toBe(true);
  });

  it('rejects when questions array is not exactly 4', () => {
    const passage = currentPassage();
    passage.page2.questions.pop();
    const result = validatePassageInNode(passage);
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.instancePath.includes('/page2/questions'))).toBe(true);
  });

  it('enforces word count 290–360 in page1.body', () => {
    const passage = currentPassage();
    // 500 words — passes char-length AJV check (2500 chars), fails word-count (>360)
    passage.page1.body = 'word '.repeat(500).trim();
    const result = validatePassageInNode(passage);
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.message.includes('word count'))).toBe(true);
  });

  it('enforces 3 mock_objective + 1 school_descriptive composition', () => {
    const passage = currentPassage();
    // replace descriptive with a structurally-valid 4th mock_objective → 4 mock, 0 descriptive
    passage.page2.questions[3] = {
      type: 'mock_objective',
      style: '요약',
      stem: '다음 글의 요약으로 가장 적절한 것은?',
      choices: ['first valid choice', 'second valid choice', 'third valid choice', 'fourth valid choice', 'fifth valid choice'],
      answer_index: 0
    };
    const result = validatePassageInNode(passage);
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.message.includes('mock_objective'))).toBe(true);
  });

  it('accepts an elementary Mars passage with the elementary profile', () => {
    const result = validatePassageInNode(passageFile('2026-06-Mars', '01.json'));
    expect(result.ok).toBe(true);
    expect(result.profile).toBe('elementary');
  });

  it('uses the middle-school profile and blocks unverified NCIC alignment', () => {
    const result = validatePassageInNode(passageFile('2026-06-N', '01.json'));
    expect(result.ok).toBe(false);
    expect(result.profile).toBe('middle');
    expect(result.errors.some(e => e.instancePath === '/meta/achievement_verified')).toBe(true);
  });
});
