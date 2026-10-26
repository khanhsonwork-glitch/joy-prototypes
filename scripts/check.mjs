// One command before a Pull Request (and the same one CI runs): build, privacy gates, hub browser test.
import net from 'node:net';
import path from 'node:path';
import {spawn, spawnSync} from 'node:child_process';
import {ROOT, fail, requireNode, run} from './lib.mjs';

requireNode();
const playwright = path.join(ROOT, 'node_modules/.bin/playwright');
run(playwright, ['install', ...(process.env.CI ? ['--with-deps'] : []), 'chromium']);
run(process.execPath, [path.join(ROOT, 'scripts/check-source.mjs')]);
run(process.execPath, [path.join(ROOT, 'scripts/check-images.mjs')]);
run(process.execPath, [path.join(ROOT, 'scripts/check-licenses.mjs')]);
run(process.execPath, [path.join(ROOT, 'test/gates-check.mjs')]);
run(process.execPath, [path.join(ROOT, 'test/scaffold-check.mjs')]);
run(process.execPath, [path.join(ROOT, 'scripts/build.mjs')]);
run(process.execPath, [path.join(ROOT, 'scripts/check-bundle.mjs')]);

// A free port picked by the OS, so a dev server already running on 4173 does not break the check.
const port = await new Promise(resolve => {
  const probe = net.createServer().listen(0, '127.0.0.1', () => {const {port} = probe.address(); probe.close(() => resolve(port));});
});
const server = spawn(process.execPath, [path.join(ROOT, 'scripts/serve.mjs'), 'hub', String(port)], {stdio: 'ignore'});
process.on('exit', () => server.kill());
async function ready(url) {
  for (let i = 0; i < 50; i++) {
    try {if ((await fetch(url)).status) return;} catch { /* still starting */ }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  fail(`Server local không chạy: ${url}`);
}
await ready(`http://127.0.0.1:${port}/`);
const result = spawnSync(process.execPath, [path.join(ROOT, 'test/hub-check.mjs'), `http://127.0.0.1:${port}`], {stdio: 'inherit'});
const starter = spawnSync(process.execPath, [path.join(ROOT, 'test/starter-check.mjs'), `http://127.0.0.1:${port}`], {stdio: 'inherit'});
server.kill();
if (result.status !== 0) fail('Hub chưa đạt. Sửa rồi chạy lại npm run check.');
if (starter.status !== 0) fail('Starter hoặc một demo chưa đạt. Sửa rồi chạy lại npm run check.');
console.log('\nTất cả kiểm tra PASS. Ảnh chụp ở evidence/.');
