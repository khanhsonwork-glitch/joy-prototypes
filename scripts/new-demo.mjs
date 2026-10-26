// Create demos/<slug> from templates/demo and add it to the hub registry.
// Usage: npm run new-demo -- <slug> "<Tên tính năng>" [--product loyalty|wishlist] [--area "<Khu vực>"]
import fs from 'node:fs';
import path from 'node:path';
import {ROOT, fail, requireNode, demoDir} from './lib.mjs';

requireNode();
const args = process.argv.slice(2);
const options = {product: 'loyalty', area: 'Prototype'};
const positional = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--product' || args[i] === '--area') {
    if (!args[i + 1]) fail(`${args[i]} cần một giá trị`);
    options[args[i].slice(2)] = args[++i];
  } else if (args[i].startsWith('--')) fail(`Không hiểu tuỳ chọn ${args[i]}`);
  else positional.push(args[i]);
}
const [slug, name] = positional;
if (!slug || !name || positional.length !== 2) fail('Dùng: npm run new-demo -- <slug> "<Tên tính năng>"   ví dụ: npm run new-demo -- birthday-reward "Birthday reward"');
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || /-(r\d+|v\d+|final|uat)$/.test(slug)) fail(`slug "${slug}" phải viết thường-gạch-nối, không đuôi -v2/-r3/-final/-uat`);
if (['hub', 'app', 'templates'].includes(slug)) fail(`"${slug}" là tên dành riêng, chọn slug khác`);
if (!['loyalty', 'wishlist'].includes(options.product)) fail('--product chỉ nhận loyalty hoặc wishlist');
const target = demoDir(slug);
if (fs.existsSync(target)) fail(`demos/${slug} đã có. Chọn slug khác hoặc sửa demo đó.`);
const registryPath = path.join(ROOT, 'hub/data/registry.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
if (registry.features.some(f => f.slug === slug && f.product === options.product)) fail(`Registry đã có ${options.product}/${slug}`);

fs.cpSync(path.join(ROOT, 'templates/demo'), target, {
  recursive: true,
  filter: source => !/(^|[/\\])(node_modules|dist)([/\\]|$)/.test(path.relative(path.join(ROOT, 'templates/demo'), source)),
});
for (const file of ['index.html', 'src/App.jsx']) {
  const full = path.join(target, file);
  fs.writeFileSync(full, fs.readFileSync(full, 'utf8').replaceAll('__DEMO_NAME__', name));
}
for (const file of ['package.json', 'package-lock.json']) {
  const full = path.join(target, file);
  const json = JSON.parse(fs.readFileSync(full, 'utf8'));
  json.name = `joy-demo-${slug}`;
  if (json.packages?.['']) json.packages[''].name = `joy-demo-${slug}`;
  fs.writeFileSync(full, JSON.stringify(json, null, 2) + '\n');
}
fs.rmSync(path.join(target, 'README.md'));
// The hub sorts cards itself, so file order is free: insert by slug instead of appending, so two branches
// that each add a demo touch different lines of registry.json and merge without a conflict.
const at = registry.features.findIndex(f => f.slug.localeCompare(slug) > 0);
registry.features.splice(at === -1 ? registry.features.length : at, 0, {
  product: options.product, slug, name, area: options.area, surfaces: ['Admin'],
  status: 'review', stage: null, updated: new Date().toISOString().slice(0, 10), round: null,
  notion: null, prd: null, migrated: true, shot: null,
  reviewUrl: `/${options.product}/${slug}/#/demo`, kind: 'prototype', aliases: [], legacy: [], parity: null,
});
fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n');
console.log(`Đã tạo demos/${slug} và thêm "${name}" vào hub (Đang review).
Tiếp theo:
  npm run dev -- ${slug}    sửa và xem trên máy
  npm run check             kiểm cả hub trước khi mở Pull Request
Sửa xong màn demo thì chụp ảnh thẻ cho hub (npm run check đòi có ảnh):
  npm run shot -- ${slug}`);
