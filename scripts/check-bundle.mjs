// Gate run before every upload: the public bundle may hold built demos and assets only.
// Usage: node scripts/check-bundle.mjs [hub|<folder>]   (no argument = dist/hub)
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ROOT, DIST, SITES, fail, walk, loadBlocklist, blockedMatches} from './lib.mjs';

const TEXT = /\.(html|js|mjs|css|json|txt|svg|md|map|xml|csv)$/i;
const FORBIDDEN_PATHS = [
  [/(^|\/)\.git(\/|$)/, '.git'],
  [/(^|\/)\.env/, 'file .env'],
  [/(^|\/)\.firebase(\/|$)/, 'thư mục .firebase'],
  [/(^|\/)node_modules(\/|$)/, 'node_modules'],
  [/(^|\/)packages(\/|$)/, 'thư mục packages/ (code production)'],
  [/(^|\/)app(\/|$)/, '/app runtime (code Joy thật)'],
  [/\.map$/, 'source map'],
  [/\.(pem|key|p12|crt)$/i, 'file khoá/chứng chỉ'],
];
export const SECRETS = [
  [/glpat-[A-Za-z0-9_-]{20,}/, 'GitLab token'],
  [/xox[abprs]-[A-Za-z0-9-]{10,}/, 'Slack token'],
  [/gh[pousr]_[A-Za-z0-9]{30,}/, 'GitHub token'],
  [/AKIA[0-9A-Z]{16}/, 'AWS key'],
  [/sk-(?:ant-|proj-)?[A-Za-z0-9_-]{24,}/, 'API key'],
  [/AIza[0-9A-Za-z_-]{35}/, 'Google API key'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'private key'],
  [/shp(?:at|ca|pa|ss)_[a-fA-F0-9]{32}/, 'Shopify token'],
  [/\/Users\/[a-z][\w.-]+\//, 'đường dẫn máy cá nhân'],
];

export function scanBundle(dir, blocklist = loadBlocklist()) {
  const problems = [];
  if (!fs.existsSync(path.join(dir, 'index.html'))) return [`${dir}: không có index.html (chưa build?)`];
  let bytes = 0;
  const files = walk(dir);
  for (const {file, rel, symlink} of files) {
    const posix = rel.split(path.sep).join('/');
    if (symlink) {problems.push(`${posix}: symlink`); continue;}
    for (const [pattern, label] of FORBIDDEN_PATHS) if (pattern.test(posix)) problems.push(`${posix}: ${label}`);
    const size = fs.statSync(file).size;
    bytes += size;
    if (!TEXT.test(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    for (const [pattern, label] of SECRETS) if (pattern.test(text)) problems.push(`${posix}: có thể chứa ${label}`);
    if (blockedMatches(text, blocklist.keywords).length) problems.push(`${posix}: trùng tên merchant/brand thật trong privacy/blocklist.json`);
  }
  return {problems, files: files.length, bytes};
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const arg = process.argv[2];
  const dirs = !arg ? SITES.map(site => path.join(DIST, site)) : SITES.includes(arg) ? [path.join(DIST, arg)] : [path.resolve(arg)];
  let bad = 0;
  for (const dir of dirs) {
    const result = scanBundle(dir);
    if (Array.isArray(result)) {console.log(`FAIL ${path.relative(ROOT, dir) || dir}\n  ${result.join('\n  ')}`); bad++; continue;}
    if (result.problems.length) {console.log(`FAIL ${path.relative(ROOT, dir) || dir}\n  ${result.problems.join('\n  ')}`); bad++;}
    else console.log(`PASS ${path.relative(ROOT, dir) || dir}: ${result.files} file, ${(result.bytes / 1e6).toFixed(1)} MB, không thấy secret/dữ liệu khách/code production`);
  }
  if (bad) fail('Bundle chưa sạch, không được upload.');
}
