#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');

const proc = spawn('npx', ['sirv', '.', '--port', '4173', '--host', '127.0.0.1', '--dev'], {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32'
});

proc.on('exit', (code) => process.exit(code ?? 0));
