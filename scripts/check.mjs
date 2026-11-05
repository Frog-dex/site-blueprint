// Zero-dependency sanity checks: every inline <script> parses, every local
// href/src that should exist does, and every page has the basics.
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pages = readdirSync(root).filter(f => f.endsWith('.html'));
// radio-plan.html intentionally references the owner's live-site assets (assets/, images/) and draws stand-ins when they're absent
const OPTIONAL_PREFIXES = ['assets/', 'images/'];
const tmp = mkdtempSync(join(tmpdir(), 'bp-check-'));
let failures = 0;
const fail = (f, msg) => { failures++; console.error(`✗ ${f}: ${msg}`); };

for (const f of pages) {
  const html = readFileSync(join(root, f), 'utf8');
  if (!/<!doctype html>/i.test(html)) fail(f, 'missing <!doctype html>');
  if (!/<meta name="viewport"/i.test(html)) fail(f, 'missing viewport meta');
  if (!/<title>[^<]+<\/title>/i.test(html)) fail(f, 'missing <title>');

  [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)].forEach((m, i) => {
    const js = join(tmp, `${f}.${i}.js`);
    writeFileSync(js, m[1]);
    try { execFileSync(process.execPath, ['--check', js], { stdio: 'pipe' }); }
    catch (e) { fail(f, `inline script #${i + 1} does not parse:\n${e.stderr}`); }
  });

  for (const [, ref] of html.matchAll(/\b(?:href|src)="([^"#?:]+)(?:[?#][^"]*)?"/g)) {
    if (ref.startsWith('//') || OPTIONAL_PREFIXES.some(p => ref.startsWith(p))) continue;
    if (!existsSync(join(root, ref))) fail(f, `broken local reference: ${ref}`);
  }
  console.log(`✓ ${f}`);
}
rmSync(tmp, { recursive: true, force: true });
if (failures) { console.error(`\n${failures} problem(s)`); process.exit(1); }
console.log(`\nall ${pages.length} pages OK`);
