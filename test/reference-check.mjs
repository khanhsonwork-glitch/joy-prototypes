// The "real screen" gate must catch what it exists for (a demo nobody mapped to the real admin screen, a card link that
// does not open on the changed screen) and must not block a demo that is filled in, nor turn the old demos red.
// Runs in npm run check. Usage: node test/reference-check.mjs
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {GRANDFATHERED, referenceProblems, scanReferences} from '../scripts/check-reference.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0, total = 0;
function check(label, fn) {
  total++;
  try {fn(); console.log(`PASS ${total}. ${label}`);} catch (error) {failed++; console.log(`FAIL ${total}. ${label}\n  ${error.message}`);}
}

const FILLED = `# Màn thật mà demo này sửa

Menu: On-site content › Unified widget › Setup › Extensions › Wishlist
Màn thật: Widget editor, panel Wishlist, field "Wishlist layout"; xem trên staging 29/10
Ảnh so sánh: reference/real.png
`;
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'joy-reference-'));
function demo(slug, reference, image = true) {
  const dir = path.join(tmp, 'demos', slug);
  fs.mkdirSync(path.join(dir, 'reference'), {recursive: true});
  fs.writeFileSync(path.join(dir, 'package.json'), '{}');
  if (reference != null) fs.writeFileSync(path.join(dir, 'REFERENCE.md'), reference);
  if (image) fs.writeFileSync(path.join(dir, 'reference/real.png'), '');
}
const card = (slug, reviewUrl) => ({product: 'loyalty', slug, name: slug, reviewUrl});

check('FR92-like: a new demo with no REFERENCE.md and a landing-only link fails', () => {
  demo('wishlist-title-expand', null);
  const {errors} = scanReferences({features: [card('wishlist-title-expand', '/loyalty/wishlist-title-expand/')]}, tmp);
  assert(errors.some(e => /không mở thẳng/.test(e)), `deep link not caught: ${errors}`);
  assert(errors.some(e => /thiếu REFERENCE\.md/.test(e)), `missing REFERENCE.md not caught: ${errors}`);
});

check('the template npm run new writes (placeholders) fails until it is filled in', () => {
  const template = 'Menu: <đường menu → trang → panel/field, nối bằng ›>\nMàn thật: <tên màn thật>\nẢnh so sánh: <reference/real.png>\n';
  assert.equal(referenceProblems(template).length, 3);
});

check('a menu that is one word, not a path, fails', () => {
  assert(referenceProblems(FILLED.replace(/^Menu:.*$/m, 'Menu: Referrals')).some(p => /cả đường menu/.test(p)));
});

check('a comparison image that is not in the demo folder fails', () => {
  demo('missing-image', FILLED, false);
  assert(referenceProblems(FILLED, path.join(tmp, 'demos/missing-image')).some(p => /không có trong thư mục demo/.test(p)));
});

check('a filled-in demo with a deep link passes', () => {
  demo('wishlist-layout', FILLED);
  const {errors, warnings} = scanReferences({features: [card('wishlist-layout', '/wishlist/wishlist-layout/#/branding/widget?panel=wishlist')]}, tmp);
  assert.deepEqual(errors, []); assert.deepEqual(warnings, []);
});

check('"Ảnh so sánh: ngoài repo" (the image kept private) passes', () => {
  assert.deepEqual(referenceProblems(FILLED.replace(/^Ảnh so sánh:.*$/m, 'Ảnh so sánh: ngoài repo, Alex giữ ảnh staging'), tmp), []);
});

check('an old demo (before the gate) only warns', () => {
  assert(GRANDFATHERED.has('points-giveaway'));
  demo('points-giveaway', null);
  const {errors, warnings} = scanReferences({features: [card('points-giveaway', 'https://old.example.com')]}, tmp);
  assert.deepEqual(errors, []); assert(warnings.length >= 2, warnings.join('; '));
});

check('the real repo passes the gate (old demos may warn, nothing new is red)', () => {
  const result = spawnSync(process.execPath, [path.join(root, 'scripts/check-reference.mjs')], {encoding: 'utf8'});
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

fs.rmSync(tmp, {recursive: true, force: true});
console.log(`${total - failed}/${total} PASS (reference)`);
process.exit(failed ? 1 : 0);
