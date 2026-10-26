// Screenshot a demo's review screen for its hub card: npm run shot -- <slug> [--replace]
// Builds the hub, opens /<product>/<slug>/ like a visitor, saves hub/public/shots/<product>-<slug>.jpg (1280×720)
// and sets "shot" in hub/data/registry.json.
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import {spawn} from 'node:child_process';
import {ROOT, fail, requireNode, run} from './lib.mjs';

requireNode();
const slug = process.argv[2];
const registryPath = path.join(ROOT, 'hub/data/registry.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
if (!slug || slug.startsWith('--')) fail('Dùng: npm run shot -- <slug>   (slug là tên thư mục trong demos/)');
const feature = registry.features.find(f => f.slug === slug && f.migrated);
if (!feature) fail(`Không có demo "${slug}" dựng từ demos/. Dùng: npm run shot -- <slug>`);
// An existing card image may be a hand-made crop that was already approved: never replace it silently.
if (feature.shot && !process.argv.includes('--replace')) fail(`Thẻ "${feature.name}" đã có ảnh ${feature.shot}. Muốn chụp lại thì thêm --replace.`);
run(path.join(ROOT, 'node_modules/.bin/playwright'), ['install', 'chromium']);
run(process.execPath, [path.join(ROOT, 'scripts/build.mjs'), 'hub']);
const port = await new Promise(resolve => {
  const probe = net.createServer().listen(0, '127.0.0.1', () => {const p = probe.address().port; probe.close(() => resolve(p));});
});
const server = spawn(process.execPath, [path.join(ROOT, 'scripts/serve.mjs'), 'hub', String(port)], {stdio: 'ignore'});
let browser;
try {
  const {chromium} = await import('playwright');
  browser = await chromium.launch({headless: true});
  const page = await browser.newPage({viewport: {width: 1280, height: 720}});
  for (let i = 0; i < 50; i++) {
    try {await fetch(`http://127.0.0.1:${port}/`); break;} catch {await new Promise(r => setTimeout(r, 100));}
  }
  await page.goto(`http://127.0.0.1:${port}/${feature.product}/${slug}`, {waitUntil: 'networkidle'});
  await page.locator('#root *').first().waitFor();
  await page.evaluate(() => document.fonts.ready);
  const name = `${feature.product}-${slug}.jpg`;
  await page.screenshot({path: path.join(ROOT, 'hub/public/shots', name), type: 'jpeg', quality: 85, animations: 'disabled'});
  feature.shot = `/shots/${name}`;
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n');
  console.log(`Đã lưu hub/public/shots/${name} và gắn vào thẻ "${feature.name}". Mở ảnh xem lại trước khi gửi duyệt.`);
} finally {
  await browser?.close();
  server.kill();
}
