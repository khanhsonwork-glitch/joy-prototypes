// Create demos/<slug> from the golden starter (templates/demo), register it in the hub, install it and photograph its card.
// Usage: npm run new -- <slug> "<Feature name>" [--product loyalty|wishlist] [--area "<Area>"] [--no-install] [--no-shot]
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ROOT, fail, requireNode, run} from './lib.mjs';

requireNode();
const USAGE = 'Dùng: npm run new -- <slug> "<Tên tính năng>"   ví dụ: npm run new -- birthday-reward "Birthday reward"';
// Names the hub, the build or the starter already use at the top of a URL or folder.
export const RESERVED = ['hub', 'app', 'templates', 'starter', 'archive', 'shots', 'brand', 'fonts', 'assets', 'img', 'loyalty', 'wishlist', 'demo', 'kit', 'new', 'info'];

export function validate({slug, name, product}) {
  if (!slug || !name) return USAGE;
  if (slug.length > 50 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return `slug "${slug}" phải viết thường, chữ/số nối bằng gạch ngang, tối đa 50 ký tự (ví dụ birthday-reward)`;
  if (/-(r\d+|v\d+|final|uat|copy|new|test)$/.test(slug)) return `slug "${slug}" không được có đuôi phiên bản (-v2, -r3, -final, -uat, -copy, -new, -test): sửa demo cũ thay vì tạo bản mới`;
  if (RESERVED.includes(slug)) return `"${slug}" là tên dành riêng (${RESERVED.join(', ')}), chọn slug khác`;
  const clean = name.trim();
  if (clean.length < 2 || clean.length > 60) return 'Tên tính năng cần 2–60 ký tự';
  if (/[<>"`\\\u0000-\u001f]/.test(clean)) return 'Tên tính năng không được chứa < > " ` \\ hay ký tự điều khiển';
  if (!['loyalty', 'wishlist'].includes(product)) return '--product chỉ nhận loyalty hoặc wishlist';
  return null;
}

function parse(argv) {
  const options = {product: 'loyalty', area: 'Prototype', install: true, shot: true, root: ROOT};
  const positional = [];
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (['--product', '--area', '--root'].includes(arg)) {
      if (!argv[i + 1]) fail(`${arg} cần một giá trị`);
      options[arg.slice(2)] = argv[++i];
    } else if (arg === '--no-install') options.install = false;
    else if (arg === '--no-shot') options.shot = false;
    else if (arg.startsWith('--')) fail(`Không hiểu tuỳ chọn ${arg}\n${USAGE}`);
    else positional.push(arg);
  }
  if (positional.length !== 2) fail(USAGE);
  return {...options, slug: positional[0], name: positional[1].trim()};
}

function main() {
  const options = parse(process.argv.slice(2));
  const problem = validate(options);
  if (problem) fail(problem);
  const {slug, name, product, area, root} = options;
  const template = path.join(root, 'templates/demo');
  const target = path.join(root, 'demos', slug);
  const registryPath = path.join(root, 'hub/data/registry.json');
  // Never overwrite: an existing folder, or a card with the same slug in either product.
  if (fs.existsSync(target)) fail(`demos/${slug} đã có. Chọn slug khác hoặc sửa demo đó.`);
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const clash = registry.features.find(f => f.slug === slug || (f.alsoIn || []).includes(slug));
  if (clash) fail(`Hub đã có thẻ "${clash.name}" với slug ${slug}. Chọn slug khác.`);

  // Copy into a temporary folder, then rename: a failure never leaves a half-made demo behind.
  fs.mkdirSync(path.join(root, 'demos'), {recursive: true});
  const staging = fs.mkdtempSync(path.join(root, 'demos', `.new-${slug}-`));
  try {
    fs.cpSync(template, staging, {
      recursive: true,
      filter: source => !/(^|[/\\])(node_modules|dist)([/\\]|$)/.test(path.relative(template, source)),
    });
    fs.rmSync(path.join(staging, 'README.md'), {force: true});
    fs.writeFileSync(path.join(staging, 'src/demo.config.js'), `// The one file \`npm run new\` rewrites for a new prototype. Edit by hand to rename or re-point the app nav.
export const DEMO = {
  name: ${JSON.stringify(name)},
  product: ${JSON.stringify(product)},
};
`);
    for (const file of ['package.json', 'package-lock.json']) {
      const full = path.join(staging, file);
      const json = JSON.parse(fs.readFileSync(full, 'utf8'));
      json.name = `joy-demo-${slug}`;
      if (json.packages?.['']) json.packages[''].name = `joy-demo-${slug}`;
      fs.writeFileSync(full, JSON.stringify(json, null, 2) + '\n');
    }
    // Which real admin screen this demo changes: filled in BEFORE drawing; `npm run check` stays red until it is.
    fs.writeFileSync(path.join(staging, 'REFERENCE.md'), `# Màn thật mà demo này sửa

Điền trước khi vẽ (GUIDELINE §4): tra đường menu thật theo admin Joy bản mới nhất, mở màn đó (staging hoặc ảnh chụp),
rồi đặt thay đổi đúng chỗ đó, cùng loại control. \`npm run check\` đỏ tới khi đủ ba dòng dưới.

Menu: <đường menu → trang → panel/field, nối bằng ›>
Màn thật: <tên màn thật, đã xem ở đâu (staging hay ảnh chụp), ngày>
Ảnh so sánh: <reference/real.png trong thư mục này, hoặc "ngoài repo" + ai giữ>
`);
    fs.renameSync(staging, target);
  } catch (error) {
    fs.rmSync(staging, {recursive: true, force: true});
    fail(`Không tạo được demos/${slug}: ${error.message}`);
  }

  // The hub sorts cards itself, so file order is free: insert by slug instead of appending, so two branches
  // that each add a demo touch different lines of registry.json and merge without a conflict.
  const at = registry.features.findIndex(f => f.slug.localeCompare(slug) > 0);
  registry.features.splice(at === -1 ? registry.features.length : at, 0, {
    product, slug, name, area, surfaces: ['Admin'],
    status: 'review', stage: null, updated: new Date().toISOString().slice(0, 10), round: null,
    notion: null, prd: null, migrated: true, shot: null,
    reviewUrl: `/${product}/${slug}/#/demo`, kind: 'prototype', aliases: [], legacy: [], parity: null,
  });
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2) + '\n');
  console.log(`Đã tạo demos/${slug} từ starter và thêm thẻ "${name}" vào hub (Đang review).`);

  if (options.install) run('npm', ['ci', '--no-audit', '--no-fund'], {cwd: target});
  if (options.shot) run(process.execPath, [path.join(root, 'scripts/shot.mjs'), slug], {cwd: root});
  console.log(`
Tiếp theo:
  điền demos/${slug}/REFERENCE.md   màn thật: đường menu, màn, ảnh so sánh (trước khi vẽ)
  sửa reviewUrl của thẻ thành #/<màn có thay đổi> để link mở thẳng màn đó
  npm run dev -- ${slug}      sửa màn trong demos/${slug}/src/pages (trình duyệt tự tải lại)
  npm run check               kiểm trước khi mở Pull Request
${options.shot ? `Sửa xong màn thì chụp lại ảnh thẻ: npm run shot -- ${slug} --replace` : `Chưa có ảnh thẻ: npm run shot -- ${slug}`}`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
