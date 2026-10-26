// Gate: every installed package (root, hub, starter template, each demo, nested deps included) carries a license
// we have read and accept. Unknown or new licenses fail the check until someone reads them and adds them here.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {ROOT, fail, demoNames, demoDir} from './lib.mjs';

// Permissive open-source licenses: use, modify, ship with attribution.
const ALLOWED = new Set(['MIT', 'ISC', 'BSD-2-Clause', 'BSD-3-Clause', 'Apache-2.0', '0BSD', 'BlueOak-1.0.0', 'CC0-1.0', 'CC-BY-4.0', 'Python-2.0', 'Unlicense']);
// Read by hand (THIRD_PARTY_LICENSES.md): MIT text plus "only to develop applications that integrate or interoperate
// with Shopify software or services". These prototypes design an embedded Shopify app, which is that use.
const REVIEWED = {'@shopify/polaris': 'Shopify (MIT + Shopify-apps clause)', '@shopify/polaris-icons': 'Shopify (MIT + Shopify-apps clause)', '@shopify/polaris-tokens': 'Shopify (MIT + Shopify-apps clause)'};

function licenseOf(pkg) {
  const raw = pkg.license ?? pkg.licenses;
  if (!raw) return null;
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) return raw.map(l => l.type || l).join(' OR ');
  return raw.type || null;
}

export function accepted(expression) {
  if (!expression) return false;
  const text = expression.replace(/[()]/g, ' ').trim();
  if (/\bAND\b/.test(text)) return text.split(/\s+AND\s+/).every(part => accepted(part));
  return text.split(/\s+OR\s+/).some(part => ALLOWED.has(part.trim()));
}

function* packages(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    if (!entry.isDirectory() || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.name.startsWith('@')) {
      yield* packages(full);
      continue;
    }
    const manifest = path.join(full, 'package.json');
    if (fs.existsSync(manifest)) yield {dir: full, pkg: JSON.parse(fs.readFileSync(manifest, 'utf8'))};
    yield* packages(path.join(full, 'node_modules'));
  }
}

export function scanLicenses(roots) {
  const problems = [], seen = new Map();
  for (const root of roots) {
    for (const {dir, pkg} of packages(path.join(root, 'node_modules'))) {
      const key = `${pkg.name}@${pkg.version}`;
      if (seen.has(key)) continue;
      const license = licenseOf(pkg);
      seen.set(key, REVIEWED[pkg.name] || license);
      if (REVIEWED[pkg.name] || accepted(license)) continue;
      problems.push(`${key}: license "${license ?? 'không ghi'}" chưa được duyệt (${path.relative(ROOT, dir)})`);
    }
  }
  return {problems, seen};
}

// Font files are assets too: each one ships next to its license text (SIL OFL), never a font whose license forbids
// publishing the file (26/10/2026: General Sans, ITF Free Font License, was taken out for that reason).
export function fontProblems(files) {
  return files.filter(rel => /\.(woff2?|ttf|otf)$/i.test(rel)).flatMap(rel => {
    const dir = path.dirname(path.resolve(ROOT, rel));
    const license = fs.readdirSync(dir).find(name => /(^|-)(OFL|LICENSE)[^/]*\.(txt|md)$/i.test(name));
    if (!license) return [`${rel}: font không có file license (OFL.txt) cùng thư mục`];
    return /SIL Open Font License/.test(fs.readFileSync(path.join(dir, license), 'utf8')) ? [] : [`${rel}: license font không phải SIL OFL, cần đọc trước khi public`];
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const tracked = spawnSync('git', ['ls-files', '-co', '--exclude-standard'], {cwd: ROOT, encoding: 'utf8'}).stdout.split('\n').filter(Boolean)
    .filter(rel => !/(^|\/)node_modules\//.test(rel) && fs.existsSync(path.join(ROOT, rel)));
  const fonts = fontProblems(tracked);
  if (fonts.length) {
    console.log(`FAIL fonts\n  ${fonts.join('\n  ')}`);
    fail('Font chưa rõ license. Chỉ dùng font SIL OFL và để OFL.txt cạnh file font.');
  }
  const roots = [ROOT, path.join(ROOT, 'hub'), path.join(ROOT, 'templates/demo'), ...demoNames().map(demoDir)];
  const missing = roots.filter(root => !fs.existsSync(path.join(root, 'node_modules')));
  if (missing.length) fail(`Chưa cài: ${missing.map(r => path.relative(ROOT, r) || '.').join(', ')}. Chạy npm ci.`);
  const {problems, seen} = scanLicenses(roots);
  if (problems.length) {
    console.log(`FAIL licenses\n  ${problems.join('\n  ')}`);
    fail('Có dependency với license chưa đọc. Đọc license, rồi thêm vào scripts/check-licenses.mjs và THIRD_PARTY_LICENSES.md nếu dùng được.');
  }
  const counts = {};
  for (const license of seen.values()) counts[license] = (counts[license] || 0) + 1;
  console.log(`PASS licenses: font SIL OFL có kèm license; ${seen.size} gói — ${Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([l, n]) => `${l} ${n}`).join(', ')}`);
}
