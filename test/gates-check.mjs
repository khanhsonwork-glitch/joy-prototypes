// The privacy and license gates must fail on the things they exist to catch: plant each one and expect a FAIL.
// Runs in npm run check before the build. Usage: node test/gates-check.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {hiddenCardProblems, loadBlocklist} from '../scripts/lib.mjs';
import {scanImages, textProblems} from '../scripts/check-images.mjs';
import {accepted, fontProblems} from '../scripts/check-licenses.mjs';

let failed = 0, total = 0;
async function check(label, fn) {
  total++;
  try {await fn(); console.log(`PASS ${total}. ${label}`);} catch (error) {failed++; console.log(`FAIL ${total}. ${label}\n  ${error.message}`);}
}
const blocklist = loadBlocklist();
// Planted values are assembled at runtime so the source scan of this file stays clean.
const REAL_EMAIL = ['rosa', 'gmail.com'].join('@');
const NOTION_LINK = ['notion', 'so/abc123'].join('.');

await check('Hidden card with a link fails; hidden card without links and a normal card pass', () => {
  const card = {product: 'loyalty', slug: 'old-build', quarantined: true};
  assert.equal(hiddenCardProblems({features: [{...card, reviewUrl: 'https://old-build.example.com'}]}).length, 1);
  assert.equal(hiddenCardProblems({features: [{...card, legacy: [{url: 'https://old-build.example.com'}]}]}).length, 1);
  assert.equal(hiddenCardProblems({features: [{...card, alsoInUrls: {wishlist: 'https://old-build.example.com'}}]}).length, 1);
  assert.deepEqual(hiddenCardProblems({features: [{...card, legacy: []}]}), []);
  assert.deepEqual(hiddenCardProblems({features: [{product: 'loyalty', slug: 'live', reviewUrl: 'https://live.example.com'}]}), []);
});

await check('Image text rules: internal notes, task codes, internal links and real emails fail; sample data passes', () => {
  for (const text of ['Anh chup staging 7 ngay', 'UAT note round 2', 'see JOY-3901', NOTION_LINK, `contact ${REAL_EMAIL}`, 'SUA THANH: bo nut nay']) {
    assert(textProblems('planted', text, blocklist).length, `not caught: ${text}`);
  }
  for (const text of ['Ava Nguyen ava@example.com 1,240 points', 'Pomelo Park hello@pomelopark.com', 'for.anna@pomelo.example', 'Create reward Save']) {
    assert.deepEqual(textProblems('sample', text, blocklist), [], `false alarm: ${text}`);
  }
});

await check('OCR reads a planted card image and fails it', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ocr-gate-'));
  const file = path.join(dir, 'planted.png');
  const browser = await chromium.launch({headless: true});
  try {
    const page = await browser.newPage({viewport: {width: 900, height: 300}});
    await page.setContent(`<body style="margin:40px;font:28px/1.6 Arial,sans-serif;background:#fff;color:#111">UAT note: chup staging 14/10<br>Owner: ${REAL_EMAIL}</body>`);
    await page.screenshot({path: file});
  } finally {await browser.close();}
  const {problems} = await scanImages([file], blocklist);
  fs.rmSync(dir, {recursive: true, force: true});
  assert(problems.some(p => /công cụ nội bộ/.test(p)), `UAT/staging not caught: ${problems.join(' | ')}`);
  assert(problems.some(p => /email thật/.test(p)), `email not caught: ${problems.join(' | ')}`);
});

await check('License rules: permissive passes, copyleft and unknown fail', () => {
  for (const license of ['MIT', 'Apache-2.0', '(MIT OR Apache-2.0)', 'BSD-3-Clause', 'ISC']) assert(accepted(license), license);
  for (const license of ['GPL-3.0', 'AGPL-3.0-only', 'SEE LICENSE IN LICENSE.md', 'UNLICENSED', null, 'MIT AND GPL-2.0']) assert(!accepted(license), String(license));
});

await check('Font rules: a font without an OFL text beside it fails; with one it passes', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'font-gate-'));
  const font = path.join(dir, 'brand.woff2');
  fs.writeFileSync(font, 'x');
  assert.equal(fontProblems([font]).length, 1);
  fs.writeFileSync(path.join(dir, 'LICENSE.txt'), 'ITF Free Font License');
  assert.equal(fontProblems([font]).length, 1, 'non-OFL license must fail');
  fs.writeFileSync(path.join(dir, 'LICENSE.txt'), 'This Font Software is licensed under the SIL Open Font License, Version 1.1.');
  assert.deepEqual(fontProblems([font]), []);
  fs.rmSync(dir, {recursive: true, force: true});
});

console.log(`${total - failed}/${total} PASS (gates)`);
process.exit(failed ? 1 : 0);
