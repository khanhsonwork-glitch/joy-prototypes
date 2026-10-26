// Text gate for images: OCR every committed image and run the words through the same rules as the source scan,
// plus markers of internal notes (a card image must show the prototype, not a UAT note or a ticket).
// Offline: Tesseract and its English model come from node_modules. Usage: node scripts/check-images.mjs [file…]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {ROOT, fail, loadBlocklist, blockedMatches} from './lib.mjs';
import {SECRETS} from './check-bundle.mjs';
import {INTERNAL, EMAIL, ALLOWED_EMAIL} from './check-source.mjs';

const IMAGE = /\.(png|jpe?g|webp|gif|bmp)$/i;
const SKIP = /(^|\/)(node_modules|dist|evidence|\.git|\.firebase)(\/|$)/;
// Words that only appear in internal notes, tickets and staging tools, never in a prototype screen.
export const NOTE_MARKERS = [
  [/\b(UAT|staging|stg\d*|Jira|Notion|Slack|Crisp)\b/i, 'chữ của công cụ nội bộ'],
  [/\bJOY-\d{3,}\b/i, 'mã task nội bộ'],
  [/\b(S[UỬ]A THANH|CHO DEV|DEV CHEP|ANH CHUP)\b/i, 'ghi chú tiếng Việt cho dev'],
];

function imageFiles() {
  const git = spawnSync('git', ['ls-files', '-co', '--exclude-standard'], {cwd: ROOT, encoding: 'utf8'});
  if (git.status !== 0) fail('check-images cần chạy trong thư mục git của repo');
  return git.stdout.split('\n').filter(rel => rel && IMAGE.test(rel) && !SKIP.test(rel) && fs.existsSync(path.join(ROOT, rel)));
}

export function textProblems(label, text, blocklist) {
  const problems = [];
  // OCR reads "@" and "." reliably enough on UI text; spaces it inserts around them are removed first.
  const joined = text.replace(/\s*([@.])\s*/g, '$1');
  for (const [pattern, what] of SECRETS) if (pattern.test(joined)) problems.push(`${label}: có thể chứa ${what}`);
  for (const [pattern, what, allow] of INTERNAL) {
    const hits = (joined.match(new RegExp(pattern, 'gi')) || []).filter(hit => !allow?.test(hit));
    if (hits.length) problems.push(`${label}: ${what} (${hits[0]})`);
  }
  for (const email of joined.match(EMAIL) || []) if (!ALLOWED_EMAIL.test(email)) problems.push(`${label}: email thật? ${email}`);
  for (const [pattern, what] of NOTE_MARKERS) {
    const hit = text.match(pattern);
    if (hit) problems.push(`${label}: ${what} ("${hit[0]}")`);
  }
  if (blockedMatches(text, blocklist.keywords).length) problems.push(`${label}: trùng tên merchant/brand thật trong privacy/blocklist.json`);
  return problems;
}

export async function scanImages(files = imageFiles(), blocklist = loadBlocklist()) {
  const {createWorker} = await import('tesseract.js');
  const langPath = path.join(ROOT, 'node_modules/@tesseract.js-data/eng/4.0.0_best_int');
  if (!fs.existsSync(path.join(langPath, 'eng.traineddata.gz'))) fail('Thiếu mô hình OCR. Chạy lại: npm ci');
  const worker = await createWorker('eng', 1, {langPath, cachePath: fs.mkdtempSync(path.join(os.tmpdir(), 'ocr-')), gzip: true});
  const problems = [], texts = {};
  try {
    for (const rel of files) {
      const {data} = await worker.recognize(path.resolve(ROOT, rel));
      texts[rel] = data.text;
      problems.push(...textProblems(rel, data.text, blocklist));
    }
  } finally {
    await worker.terminate();
  }
  return {problems, files: files.length, texts};
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const only = process.argv.slice(2);
  const {problems, files, texts} = await scanImages(only.length ? only.map(file => path.relative(ROOT, path.resolve(file))) : undefined);
  if (process.env.OCR_DUMP) fs.writeFileSync(process.env.OCR_DUMP, JSON.stringify(texts, null, 2));
  if (problems.length) {
    console.log(`FAIL images\n  ${problems.join('\n  ')}`);
    fail('Ảnh có chữ không được public. Thay ảnh (npm run shot -- <slug> --replace) rồi chạy lại.');
  }
  console.log(`PASS images: OCR ${files} ảnh, không thấy secret, link nội bộ, email thật, tên merchant hay ghi chú nội bộ`);
}
