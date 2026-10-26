// Add a real merchant/brand name to the hashed blocklist: npm run privacy:add -- "<tên>"
import fs from 'node:fs';
import path from 'node:path';
import {ROOT, fail, compact, rollingHash, loadBlocklist} from './lib.mjs';

const name = process.argv.slice(2).join(' ').trim();
const key = compact(name);
if (key.length < 4) fail('Dùng: npm run privacy:add -- "<tên merchant hoặc brand>" (ít nhất 4 chữ/số)');
const blocklist = loadBlocklist();
const entry = {len: key.length, hash: rollingHash(key)};
if (blocklist.keywords.some(k => k.len === entry.len && k.hash === entry.hash)) {
  console.log('Tên này đã có trong danh sách chặn.');
} else {
  blocklist.keywords.push(entry);
  fs.writeFileSync(path.join(ROOT, 'privacy/blocklist.json'), JSON.stringify(blocklist, null, 1) + '\n');
  console.log(`Đã thêm (${blocklist.keywords.length} tên). Tên không được ghi ra file, chỉ lưu mã băm.`);
}
