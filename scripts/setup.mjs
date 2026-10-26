// Runs after `npm ci` at the repo root: installs the hub and every demo from their own lockfiles.
import path from 'node:path';
import {ROOT, requireNode, run, demoNames, demoDir} from './lib.mjs';

requireNode();
for (const dir of [path.join(ROOT, 'hub'), ...demoNames().map(demoDir)]) {
  console.log(`\n→ cài ${path.relative(ROOT, dir)}`);
  run('npm', ['ci', '--no-audit', '--no-fund'], {cwd: dir});
}
console.log('\nXong. Mở một demo: npm run dev -- <tên>   (danh sách: npm run dev)');
