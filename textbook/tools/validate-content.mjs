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

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export function validatePassage(data) {
  const ok = ajvValidate(data);
  const errors = ok ? [] : (ajvValidate.errors ?? []).map(e => ({ ...e }));

  if (ok) {
    const wc = countWords(data.page1.body);
    if (wc < 150 || wc > 200) {
      errors.push({
        instancePath: '/page1/body',
        message: `word count ${wc} is outside 150–200`
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
