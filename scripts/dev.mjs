// Hot-reload one piece: npm run dev -- hub | <demo name>
import fs from 'node:fs';
import path from 'node:path';
import {ROOT, fail, requireNode, run, demoNames, demoDir, viteBin, ensureInstalled} from './lib.mjs';

requireNode();
const name = process.argv[2];
const choices = ['hub', ...demoNames()];
if (!name) {
  console.log(`Chọn một: ${choices.join(', ')}\nVí dụ: npm run dev -- points-giveaway`);
  process.exit(0);
}
if (!choices.includes(name)) fail(`Không có "${name}". Chọn một trong: ${choices.join(', ')}`);
const dir = name === 'hub' ? path.join(ROOT, 'hub') : demoDir(name);
ensureInstalled(dir);
if (!fs.existsSync(viteBin(dir))) fail(`Thiếu Vite trong ${path.relative(ROOT, dir)}. Chạy lại: npm ci`);
run(process.execPath, [viteBin(dir), '--host', '127.0.0.1'], {cwd: dir});
