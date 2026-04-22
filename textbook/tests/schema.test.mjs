import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validatePassage } from '../tools/validate-content.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = (name) => JSON.parse(readFileSync(join(here, 'fixtures', name), 'utf8'));

describe('passage schema validator (v2.0)', () => {
  it('accepts a valid passage', () => {
    const result = validatePassage(fixture('passage.good.json'));
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects body longer than 3200 characters', () => {
    const result = validatePassage(fixture('passage.too-long.json'));
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.instancePath.includes('/page1/body'))).toBe(true);
  });

  it('rejects when questions array is not exactly 4', () => {
    const result = validatePassage(fixture('passage.wrong-question-count.json'));
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.instancePath.includes('/page2/questions'))).toBe(true);
  });

  it('enforces word count 290–360 in page1.body', () => {
    const passage = fixture('passage.good.json');
    // 500 words — passes char-length AJV check (2500 chars), fails word-count (>360)
    passage.page1.body = 'word '.repeat(500).trim();
    const result = validatePassage(passage);
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.message.includes('word count'))).toBe(true);
  });

  it('enforces 3 mock_objective + 1 school_descriptive composition', () => {
    const passage = fixture('passage.good.json');
    // replace descriptive with a structurally-valid 4th mock_objective → 4 mock, 0 descriptive
    passage.page2.questions[3] = {
      type: 'mock_objective',
      style: '요약',
      stem: '다음 글의 요약으로 가장 적절한 것은?',
      choices: ['first valid choice', 'second valid choice', 'third valid choice', 'fourth valid choice', 'fifth valid choice'],
      answer_index: 0
    };
    const result = validatePassage(passage);
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.message.includes('mock_objective'))).toBe(true);
  });
});
