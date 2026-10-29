// Gate for "the prototype sits on the real Joy screen": every demo card opens straight on a screen (#/… deep link),
// and every demo folder says which real admin screen it changes (REFERENCE.md: menu path, real screen, comparison
// image). Cards and demos that existed before this gate (29/10/2026) are listed as warnings, not failures.
// Usage: node scripts/check-reference.mjs
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ROOT, fail} from './lib.mjs';

// Present when the gate landed; they get a warning until someone fills them in. Never add a new slug here.
export const GRANDFATHERED = new Set([
  'analytics-revamp', 'app-migration', 'cross-app-menu', 'custom-plan', 'earning-by-market', 'email-builder',
  'home-dashboard', 'instagram-dm-automation', 'joy-pulse', 'max-discount-uses', 'member-exclusive-deal',
  'metrics-revamp', 'milestone-insights', 'milestones-by-market', 'paid-membership', 'place-order-templates',
  'points-giveaway', 'quiz-builder', 'redeem-by-market', 'redemption-schedule', 'referral-order-tiers',
  'referral-order-value', 'repeat-milestone', 'reward-unlocks', 'sea-survey', 'send-gift-to-friend',
  'sync-shopify-discounts', 'unified-widget', 'vip-sandbox-mode', 'whats-new', 'whatsapp-consent-reward',
]);

export const FIELDS = [
  ['Menu', 'đường menu thật theo admin Joy bản mới nhất, nối bằng › (ví dụ Reward programs › Referrals › Edit)'],
  ['Màn thật', 'tên màn thật và đã xem ở đâu (staging hay ảnh chụp), ngày xem'],
  ['Ảnh so sánh', 'ảnh màn thật để reviewer so: file trong thư mục demo (reference/…png) hoặc "ngoài repo" + ai giữ'],
];

// "#/" followed by a route (hub demos route by hash), or an old external build whose path names a screen: the link
// opens on a screen, not on the demo's landing.
export const deepLink = url => /#\/[A-Za-z0-9]/.test(url || '') || /^https?:\/\/[^/]+\/[A-Za-z0-9]/.test(url || '');

export function referenceProblems(text, demoPath) {
  if (text == null) return ['thiếu REFERENCE.md'];
  const problems = [];
  for (const [field, hint] of FIELDS) {
    const line = text.split('\n').find(l => l.trim().toLowerCase().startsWith(field.toLowerCase() + ':'));
    const value = line ? line.slice(line.indexOf(':') + 1).trim() : '';
    if (!value || value.startsWith('<')) {problems.push(`REFERENCE.md chưa điền "${field}:" (${hint})`); continue;}
    if (field === 'Menu' && !/[›>]/.test(value)) problems.push(`REFERENCE.md "Menu:" phải là cả đường menu → trang → panel, nối bằng › (đang là "${value}")`);
    if (field === 'Ảnh so sánh' && demoPath) {
      const file = value.match(/^[\w./-]+\.(png|jpe?g|webp)\b/i)?.[0];
      if (file && !fs.existsSync(path.join(demoPath, file))) problems.push(`REFERENCE.md "Ảnh so sánh:" trỏ tới ${file} nhưng file không có trong thư mục demo`);
    }
  }
  return problems;
}

export function scanReferences(registry, root = ROOT) {
  const errors = [], warnings = [];
  const demosDir = path.join(root, 'demos');
  const demos = fs.existsSync(demosDir)
    ? fs.readdirSync(demosDir, {withFileTypes: true}).filter(e => e.isDirectory() && !e.name.startsWith('.')).map(e => e.name)
    : [];
  const report = (slug, problem) => (GRANDFATHERED.has(slug) ? warnings : errors).push(`${slug}: ${problem}`);
  for (const card of registry.features || []) {
    if (card.quarantined) continue;
    if (!deepLink(card.reviewUrl)) report(card.slug, `link thẻ không mở thẳng một màn (cần #/<màn>…): ${card.reviewUrl || '(trống)'}`);
  }
  for (const slug of demos) {
    if (!(registry.features || []).some(card => card.slug === slug)) continue;   // a folder without a card is the hub test's job
    const file = path.join(demosDir, slug, 'REFERENCE.md');
    const text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
    for (const problem of referenceProblems(text, path.join(demosDir, slug))) report(slug, problem);
  }
  return {errors, warnings, demos: demos.length};
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const registry = JSON.parse(fs.readFileSync(path.join(ROOT, 'hub/data/registry.json'), 'utf8'));
  const {errors, warnings, demos} = scanReferences(registry);
  if (warnings.length) console.log(`CẢNH BÁO reference (demo có trước 29/10, chưa đánh đỏ — sửa khi đụng tới demo đó):\n  ${warnings.join('\n  ')}`);
  if (errors.length) {
    console.log(`FAIL reference\n  ${errors.join('\n  ')}`);
    fail('Demo mới phải mở thẳng màn có thay đổi và có REFERENCE.md ghi màn thật (GUIDELINE §4). Điền rồi chạy lại.');
  }
  console.log(`PASS reference: ${registry.features.length} thẻ, ${demos} demo; ${warnings.length} cảnh báo cho demo cũ`);
}
