import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { validatePassage } from '../tools/validate-content.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const fixture = (name) => JSON.parse(readFileSync(join(here, 'fixtures', name), 'utf8'));

describe('passage schema validator', () => {
  it('accepts a valid passage', () => {
    const result = validatePassage(fixture('passage.good.json'));
    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('rejects body longer than 1600 characters', () => {
    const result = validatePassage(fixture('passage.too-long.json'));
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.instancePath.includes('/page1/body'))).toBe(true);
  });

  it('rejects when questions array is not exactly 3', () => {
    const result = validatePassage(fixture('passage.wrong-question-count.json'));
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.instancePath.includes('/page2/questions'))).toBe(true);
  });

  it('enforces word count 150–200 in page1.body', () => {
    const passage = fixture('passage.good.json');
    passage.page1.body = 'shorttestword '.repeat(50).trimEnd();
    const result = validatePassage(passage);
    expect(result.ok).toBe(false);
    expect(result.errors.some(e => e.message.includes('word count'))).toBe(true);
  });
});
