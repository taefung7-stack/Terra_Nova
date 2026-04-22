#!/usr/bin/env node
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const here = dirname(fileURLToPath(import.meta.url));
const schemaPath = resolve(here, '..', 'schemas', 'passage.schema.json');
const schema = JSON.parse(readFileSync(schemaPath, 'utf8'));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const ajvValidate = ajv.compile(schema);

const BODY_WORD_MIN = 290;
const BODY_WORD_MAX = 360;

function countWords(text) {
  // Strip custom markers like <u>...</u> and <blank> before counting
  const cleaned = text
    .replace(/<\/?u>/g, ' ')
    .replace(/<blank>/g, ' blank ')
    .replace(/<\/?mark>/g, ' ');
  return cleaned.trim().split(/\s+/).filter(Boolean).length;
}

export function validatePassage(data) {
  const ok = ajvValidate(data);
  const errors = ok ? [] : (ajvValidate.errors ?? []).map(e => ({ ...e }));

  if (ok) {
    const wc = countWords(data.page1.body);
    if (wc < BODY_WORD_MIN || wc > BODY_WORD_MAX) {
      errors.push({
        instancePath: '/page1/body',
        message: `word count ${wc} is outside ${BODY_WORD_MIN}–${BODY_WORD_MAX}`
      });
    }

    const qs = data.page2.questions;
    const mockCount = qs.filter(q => q.type === 'mock_objective').length;
    const descCount = qs.filter(q => q.type === 'school_descriptive').length;
    if (mockCount !== 3 || descCount !== 1) {
      errors.push({
        instancePath: '/page2/questions',
        message: `expected 3 mock_objective + 1 school_descriptive, got ${mockCount} + ${descCount}`
      });
    }
  }

  return { ok: errors.length === 0, errors };
}

function listPassageFiles(monthDir) {
  return readdirSync(monthDir)
    .filter(n => /^\d{2}\.json$/.test(n))
    .map(n => join(monthDir, n))
    .sort();
}

async function cli() {
  const { values } = parseArgs({
    options: {
      month: { type: 'string' },
      file:  { type: 'string' }
    }
  });
  const root = resolve(here, '..', 'content', 'passages');
  let targets = [];
  if (values.file) {
    targets = [resolve(values.file)];
  } else if (values.month) {
    targets = listPassageFiles(join(root, values.month));
  } else {
    console.error('usage: validate-content --month YYYY-MM  |  --file path.json');
    process.exit(2);
  }

  let failures = 0;
  for (const f of targets) {
    const data = JSON.parse(readFileSync(f, 'utf8'));
    const { ok, errors } = validatePassage(data);
    if (ok) {
      console.log(`OK  ${f}`);
    } else {
      failures++;
      console.error(`FAIL ${f}`);
      for (const e of errors) {
        console.error(`     ${e.instancePath || '(root)'}: ${e.message}`);
      }
    }
  }
  if (failures) {
    console.error(`\n${failures} file(s) failed validation`);
    process.exit(1);
  }
}

const isDirectRun = process.argv[1] && import.meta.url.startsWith('file:') && fileURLToPath(import.meta.url) === resolve(process.argv[1]);
if (isDirectRun) cli();
