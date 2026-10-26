// The scaffold command, run for real in a throwaway copy of the repo layout: bad names, reserved names,
// clashes and overwrites must fail without touching anything; a good name must produce a ready demo + hub card.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'joy-scaffold-'));
fs.cpSync(path.join(root, 'templates/demo'), path.join(tmp, 'templates/demo'), {recursive: true, filter: s => !/node_modules|[/\\]dist([/\\]|$)/.test(s)});
fs.mkdirSync(path.join(tmp, 'hub/data'), {recursive: true});
fs.copyFileSync(path.join(root, 'hub/data/registry.json'), path.join(tmp, 'hub/data/registry.json'));
fs.mkdirSync(path.join(tmp, 'demos/points-giveaway'), {recursive: true});
fs.writeFileSync(path.join(tmp, 'demos/points-giveaway/package.json'), '{}');

const scaffold = (...args) => spawnSync(process.execPath, [path.join(root, 'scripts/new-demo.mjs'), ...args, '--root', tmp, '--no-install', '--no-shot'], {encoding: 'utf8'});
const snapshot = () => crypto.createHash('sha256').update(JSON.stringify([
  fs.readFileSync(path.join(tmp, 'hub/data/registry.json'), 'utf8'),
  fs.readdirSync(path.join(tmp, 'demos')).sort(),
  fs.readFileSync(path.join(tmp, 'demos/points-giveaway/package.json'), 'utf8'),
])).digest('hex');

let failed = 0, total = 0;
function check(label, fn) {
  total++;
  try {fn(); console.log(`PASS ${total}. ${label}`);} catch (error) {failed++; console.log(`FAIL ${total}. ${label}\n  ${error.message}`);}
}

const refusals = [
  ['no arguments', []],
  ['missing name', ['birthday-reward']],
  ['uppercase slug', ['Birthday-Reward', 'Birthday reward']],
  ['spaces in slug', ['birthday reward', 'Birthday reward']],
  ['version suffix', ['birthday-reward-v2', 'Birthday reward']],
  ['reserved slug', ['starter', 'Starter']],
  ['reserved slug (route)', ['kit', 'Kit']],
  ['name too short', ['birthday-reward', 'B']],
  ['markup in name', ['birthday-reward', '<b>Birthday</b>']],
  ['unknown product', ['birthday-reward', 'Birthday reward', '--product', 'shop']],
  ['existing demo folder', ['points-giveaway', 'Points Giveaway again']],
  ['slug already on the hub', ['custom-plan', 'Custom plan again']],
];
for (const [label, args] of refusals) {
  check(`refuses: ${label}`, () => {
    const before = snapshot();
    const result = scaffold(...args);
    assert.notEqual(result.status, 0, `exit 0 for ${label}`);
    assert.match(result.stderr, /LỖI:/, 'explains the refusal');
    assert.equal(snapshot(), before, 'nothing changed');
    assert(!fs.readdirSync(path.join(tmp, 'demos')).some(name => name.startsWith('.new-')), 'no staging folder left');
  });
}

check('creates a demo from the starter and registers it on the hub', () => {
  const result = scaffold('birthday-reward', 'Birthday reward', '--area', 'Programs');
  assert.equal(result.status, 0, result.stderr);
  const dir = path.join(tmp, 'demos/birthday-reward');
  for (const file of ['index.html', 'package.json', 'package-lock.json', 'vite.config.js', 'src/App.jsx', 'src/kit/Drawer.jsx', 'src/pages/RewardsList.jsx', 'src/fonts/inter-var.woff2', 'public/img/icon.png']) assert(fs.existsSync(path.join(dir, file)), `missing ${file}`);
  assert(!fs.existsSync(path.join(dir, 'README.md')), 'template README must not be copied');
  assert(!fs.existsSync(path.join(dir, 'node_modules')), 'node_modules must not be copied');
  assert.match(fs.readFileSync(path.join(dir, 'src/demo.config.js'), 'utf8'), /name: "Birthday reward",\n  product: "loyalty"/);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir, 'package.json'), 'utf8')).name, 'joy-demo-birthday-reward');
  const lock = JSON.parse(fs.readFileSync(path.join(dir, 'package-lock.json'), 'utf8'));
  assert.equal(lock.name, 'joy-demo-birthday-reward'); assert.equal(lock.packages[''].name, 'joy-demo-birthday-reward');
  const registry = JSON.parse(fs.readFileSync(path.join(tmp, 'hub/data/registry.json'), 'utf8'));
  const index = registry.features.findIndex(f => f.slug === 'birthday-reward');
  const card = registry.features[index];
  assert.equal(card.name, 'Birthday reward'); assert.equal(card.area, 'Programs'); assert.equal(card.status, 'review');
  assert.equal(card.migrated, true); assert.equal(card.reviewUrl, '/loyalty/birthday-reward/#/demo');
  assert(index === 0 || registry.features[index - 1].slug.localeCompare('birthday-reward') < 0, 'inserted in slug order');
  assert(index === registry.features.length - 1 || registry.features[index + 1].slug.localeCompare('birthday-reward') > 0, 'inserted in slug order');
});

check('never overwrites the demo it just made', () => {
  const marker = path.join(tmp, 'demos/birthday-reward/src/pages/RewardsList.jsx');
  fs.appendFileSync(marker, '\n// edited by its owner\n');
  const before = snapshot();
  const result = scaffold('birthday-reward', 'Birthday reward');
  assert.notEqual(result.status, 0);
  assert.equal(snapshot(), before);
  assert.match(fs.readFileSync(marker, 'utf8'), /edited by its owner/);
});

check('wishlist product writes the product into the config and the route', () => {
  const result = scaffold('wishlist-share', 'Share a wishlist', '--product', 'wishlist');
  assert.equal(result.status, 0, result.stderr);
  assert.match(fs.readFileSync(path.join(tmp, 'demos/wishlist-share/src/demo.config.js'), 'utf8'), /product: "wishlist"/);
  const card = JSON.parse(fs.readFileSync(path.join(tmp, 'hub/data/registry.json'), 'utf8')).features.find(f => f.slug === 'wishlist-share');
  assert.equal(card.reviewUrl, '/wishlist/wishlist-share/#/demo');
});

fs.rmSync(tmp, {recursive: true, force: true});
console.log(`${total - failed}/${total} PASS (scaffold)`);
process.exit(failed ? 1 : 0);
