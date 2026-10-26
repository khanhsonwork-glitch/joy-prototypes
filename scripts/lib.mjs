// Shared helpers for the prototype scripts. Node built-ins only, so they run before any install.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const DIST = path.join(ROOT, 'dist');
export const SITES = ['hub'];

export function fail(message) {
  console.error(`\nLỖI: ${message}`);
  process.exit(1);
}

export function requireNode() {
  const [major, minor] = process.versions.node.split('.').map(Number);
  if (major < 22 || (major === 22 && minor < 12)) {
    fail(`Cần Node 22.12 trở lên, máy đang chạy ${process.version}. Cài như READ-BA: nvm install 22 && nvm use 22`);
  }
}

export function run(command, args, options = {}) {
  const result = spawnSync(command, args, {stdio: 'inherit', ...options});
  if (result.error) fail(`Không chạy được ${command}: ${result.error.message}`);
  if (result.status !== 0) fail(`${command} ${args.join(' ')} dừng với mã ${result.status}`);
  return result;
}

export function demoNames() {
  const dir = path.join(ROOT, 'demos');
  return fs.readdirSync(dir, {withFileTypes: true})
    .filter(entry => entry.isDirectory() && fs.existsSync(path.join(dir, entry.name, 'package.json')))
    .map(entry => entry.name)
    .sort();
}

export const demoDir = name => path.join(ROOT, 'demos', name);
export const viteBin = dir => path.join(dir, 'node_modules', 'vite', 'bin', 'vite.js');

export function ensureInstalled(dir) {
  if (fs.existsSync(path.join(dir, 'node_modules'))) return;
  if (!fs.existsSync(path.join(dir, 'package-lock.json'))) fail(`${path.relative(ROOT, dir)} thiếu package-lock.json`);
  run('npm', ['ci', '--no-audit', '--no-fund'], {cwd: dir});
}

// Generated folders only: refuse symlinks and anything outside dist/.
export function resetDir(dir) {
  const resolved = path.resolve(dir);
  if (!resolved.startsWith(DIST + path.sep)) fail(`Không xoá thư mục ngoài dist/: ${resolved}`);
  if (fs.existsSync(resolved)) {
    if (fs.lstatSync(resolved).isSymbolicLink()) fail(`${resolved} là symlink, không xoá`);
    fs.rmSync(resolved, {recursive: true});
  }
  fs.mkdirSync(resolved, {recursive: true});
}

export function walk(dir, base = dir) {
  return fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry => {
    const file = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) return [{file, rel: path.relative(base, file), symlink: true}];
    return entry.isDirectory() ? walk(file, base) : [{file, rel: path.relative(base, file)}];
  });
}

// Privacy blocklist: names of real merchants and brands are stored as rolling hashes,
// so the shared repo can check for them without listing them in plain text.
const B = 257, M = 2147483647;
export const compact = text => String(text).normalize('NFD').replace(/\p{Diacritic}/gu, '')
  .replace(/đ/gi, 'd').toLowerCase().replace(/[^a-z0-9]/g, '');
export function rollingHash(value) {
  let hash = 0;
  for (const char of value) hash = (hash * B + char.charCodeAt(0)) % M;
  return hash;
}
export function loadBlocklist() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'privacy', 'blocklist.json'), 'utf8'));
}
export function blockedMatches(text, entries) {
  const t = compact(text), hits = [];
  const byLength = new Map();
  for (const entry of entries) {
    if (!byLength.has(entry.len)) byLength.set(entry.len, new Set());
    byLength.get(entry.len).add(entry.hash);
  }
  for (const [len, hashes] of byLength) {
    if (t.length < len) continue;
    let power = 1;
    for (let i = 1; i < len; i++) power = (power * B) % M;
    let hash = rollingHash(t.slice(0, len));
    for (let i = 0; ; i++) {
      if (hashes.has(hash)) hits.push({at: i, len});
      if (i + len >= t.length) break;
      hash = (hash - (t.charCodeAt(i) * power) % M + M) % M;
      hash = (hash * B + t.charCodeAt(i + len)) % M;
    }
  }
  return hits;
}
export const hostBlocked = (url, blocklist) => {
  let host = '';
  try {host = new URL(url, 'https://joy-prototypes.web.app').hostname;} catch {return false;}
  return blocklist.hosts.includes(rollingHash(compact(host)));
};
