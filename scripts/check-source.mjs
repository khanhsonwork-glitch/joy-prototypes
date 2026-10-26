// Gate for the public repo itself (not just the bundle): every committed text file is scanned
// for secrets, real merchant names, internal links and real-looking email addresses.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {ROOT, fail, walk, loadBlocklist, blockedMatches, hiddenCardProblems} from './lib.mjs';
import {SECRETS} from './check-bundle.mjs';

const TEXT = /\.(html|js|jsx|mjs|cjs|ts|tsx|css|json|txt|svg|md|ya?ml|xml|csv|gitignore|npmrc|nvmrc)$|^[^.]+$/i;
const SKIP = /(^|\/)(node_modules|dist|evidence|\.git|\.firebase)(\/|$)|package-lock\.json$|privacy\/blocklist\.json$/;
export const INTERNAL = [
  [/notion\.(so|site)\//i, 'link Notion nội bộ'],
  [/gitlab\.com|git\.avada\.net|avada\.slack\.com|docs\.google\.com|drive\.google\.com/i, 'link nội bộ'],
  [/[a-z0-9-]+\.myshopify\.com/i, 'store Shopify', /pomelo-park-goods\.myshopify\.com/],
];
// Fake people use example.com or the fictional brand; the one product address is what Joy prints in every email.
export const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
export const ALLOWED_EMAIL = /@(example\.(com|org|net)|[a-z0-9.-]+\.example|pomelopark\.com)$|^joyio_noreply@send\.avada\.io$/i;

function sourceFiles() {
  const git = spawnSync('git', ['ls-files', '-co', '--exclude-standard'], {cwd: ROOT, encoding: 'utf8'});
  const list = git.status === 0 ? git.stdout.split('\n').filter(Boolean) : walk(ROOT).map(entry => entry.rel.split(path.sep).join('/'));
  return list.filter(rel => !SKIP.test(rel) && TEXT.test(path.basename(rel)) && fs.existsSync(path.join(ROOT, rel)));
}

export function scanSource(files = sourceFiles(), blocklist = loadBlocklist()) {
  const problems = [];
  for (const rel of files) {
    const text = fs.readFileSync(path.join(ROOT, rel), 'utf8');
    for (const [pattern, label] of SECRETS) if (pattern.test(text)) problems.push(`${rel}: có thể chứa ${label}`);
    for (const [pattern, label, allow] of INTERNAL) {
      const hits = (text.match(new RegExp(pattern, 'gi')) || []).filter(hit => !allow?.test(hit));
      if (hits.length) problems.push(`${rel}: ${label} (${hits[0]})`);
    }
    for (const email of text.match(EMAIL) || []) if (!ALLOWED_EMAIL.test(email)) problems.push(`${rel}: email thật? ${email} (dùng @example.com)`);
    if (blockedMatches(text, blocklist.keywords).length) problems.push(`${rel}: trùng tên merchant/brand thật trong privacy/blocklist.json`);
  }
  problems.push(...hiddenCardProblems(JSON.parse(fs.readFileSync(path.join(ROOT, 'hub/data/registry.json'), 'utf8'))));
  return {problems, files: files.length};
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const {problems, files} = scanSource();
  if (problems.length) {
    console.log(`FAIL source\n  ${problems.join('\n  ')}`);
    fail('Repo có thứ không được public. Gỡ ra rồi chạy lại.');
  }
  console.log(`PASS source: ${files} file, không thấy secret, link nội bộ, email thật hay tên merchant thật`);
}
