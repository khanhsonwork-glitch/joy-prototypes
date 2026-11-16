// Fake Joy code formats, shop codes and checks for the fictional North Bloom shop (Joy prefix NB-).
// Every code here is invented: random letters in the shape Joy uses, never a real merchant's code.

export const DEFAULT_MESSAGE = '{code} has been removed. Only {max} reward code(s) can be used per order.';
export const MESSAGE_MAX = 150;

const AN = {label: 'A–Z, 0–9', re: /^[A-Z0-9]+$/};
const BASE32 = {label: 'A–Z, 2–7', re: /^[A-Z2-7]+$/};

const fmt = (prefix, length, chars, example, from, last, extra = {}) => ({
  id: `${prefix || 'none'}${length}`,
  prefix,
  length,
  chars,
  example,
  from,
  last,
  label: prefix ? `${prefix} + ${length} characters${extra.hideChars ? '' : ` (${chars.label})`}` : `${length} characters (${chars.label}), no prefix`,
  ...extra,
});

/** What Joy treats as a Joy code at checkout, one row per format (newest issue first). */
export const FORMATS = [
  fmt('NB-', 12, AN, 'NB-O8QY6BW9J3FC', '$5 / $10 / $20 Off coupon, Free product rewards, VIP tier rewards', 'Today'),
  fmt('BDAY-', 10, BASE32, 'BDAY-K7BR2QXDHL', 'Birthday reward', 'Nov 14'),
  fmt('JOY-', 12, AN, 'JOY-7K2MQ9XW4PLA', 'Joy default prefix (always counted)', 'Oct 30'),
  fmt('OLD-', 12, AN, 'OLD-H3XW2M8Q1ZPC', 'Previous prefix — no longer issued, 34 unused codes still valid', 'Aug 02', {hideChars: true, retired: true}),
];
export const EXACT = [{code: 'VIP10', label: 'VIP10 (exact code)', example: 'VIP10', from: 'Fixed code reward', last: 'Nov 10'}];

/** A reward whose program prefix is blank: its codes are 12 random characters (shown in the "Reward with no prefix" state). */
export const NO_PREFIX = fmt('', 12, AN, '8KQ2M7XW4PLA', 'Free shipping reward (no prefix set)', 'Nov 12');

/** Before the first code is issued, Joy still knows the shop prefix and its own default. */
export const EMPTY_FORMATS = [
  fmt('NB-', 12, AN, 'NB- + 12 random characters', 'Default discount code prefix', 'Not yet'),
  fmt('JOY-', 12, AN, 'JOY- + 12 random characters', 'Joy default prefix (always counted)', 'Not yet'),
];

const TIER_NAMES = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'EVERGREEN-CIRCLE', 'WILDFLOWER-INSIDER', 'MIDNIGHT-BLOOM', 'FOUNDING-MEMBER'];
/** Overflow: the longest prefix Joy allows in the field plus 18 formats (the most any shop had in the last 90 days). */
export const OVERFLOW_FORMATS = [
  fmt('NORTHBLOOM-WINTER-WELLNESS-REWARDS-', 12, AN, 'NORTHBLOOM-WINTER-WELLNESS-REWARDS-Q7M2XK9PLW4B', '$5 / $10 / $20 / $25 / $50 Off coupon, 15% Off coupon, Free product rewards, Free shipping, Referral reward for the friend who was referred', 'Today'),
  ...FORMATS.slice(0, 3),
  ...TIER_NAMES.map((t, i) => fmt(`${t}-`, 12, AN, `${t}-${'K2PL9X4WQ7MZ'.slice(i % 3)}${'H3XW2M8Q1ZPC'.slice(0, i % 3)}`, `VIP tier reward: ${t.toLowerCase().replace(/-/g, ' ')} tier`, ['Today', 'Nov 15', 'Nov 13', 'Nov 11', 'Nov 08', 'Nov 02', 'Oct 28', 'Oct 19', 'Oct 04'][i])),
  fmt('REF-', 12, AN, 'REF-W4PLA7K2MQ9X', 'Referral reward', 'Nov 15'),
  fmt('MILESTONE-', 12, AN, 'MILESTONE-9XW4PLA7K2MQ', 'Milestone reward', 'Nov 09'),
  fmt('GIFT-', 12, AN, 'GIFT-2MQ9XW4PLA7K', 'Free gift reward', 'Oct 22'),
  fmt('POS-', 12, AN, 'POS-XW4PLA7K2MQ9', 'Rewards redeemed at the counter (Point of Sale)', 'Oct 17'),
  fmt('OLD-', 12, AN, 'OLD-H3XW2M8Q1ZPC', 'Previous prefix — no longer issued, 12,408 unused codes still valid', 'Aug 02', {hideChars: true, retired: true}),
];

/** Codes Joy issued, so a test can say which reward a code came from. */
export const ISSUED = {
  'NB-O8QY6BW9J3FC': '$10 Off coupon',
  'NB-K2PL9X4WQ7MZ': '$5 Off coupon',
  'BDAY-K7BR2QXDHL': 'Birthday reward',
  'JOY-7K2MQ9XW4PLA': '$5 Off coupon',
  'OLD-H3XW2M8Q1ZPC': '$20 Off coupon',
};

/** The shop's own Shopify codes that happen to match a Joy format (found by the daily check). */
export const CLASHES = [
  {code: 'NB-SUMMERSALE26', orders: 41},
  {code: 'NB-WELCOME2026A', orders: 12},
];
export const WORST_CLASHES = [
  ...CLASHES,
  {code: 'GOLD-VIPWEEKEND26', orders: 1_204},
  {code: 'SILVER-FRIENDSDAY26', orders: 388},
  {code: 'REF-SPRINGPOPUP1', orders: 97},
  {code: 'GIFT-WITHPURCHASE', orders: 63},
  {code: 'BRONZE-WELCOMEBACK1', orders: 9},
  {code: 'DIAMOND-LAUNCHPARTY1', orders: 1},
];

export const CHECKED = {default: 2148, overflow: 1_248_906};

const plural = (n, one, many = `${one}s`) => `${n.toLocaleString('en-US')} ${n === 1 ? one : many}`;

/**
 * Does Joy count `raw` as a Joy code, and why — the same rule the checkout uses:
 * a code is a Joy code when it is one of the exact codes, or it starts with a Joy prefix and the rest has exactly the
 * format's length and characters. Case does not matter. Codes the merchant excluded never count.
 * Returns {joy, code, text} or null for an empty box.
 */
export function testCode(raw, {formats, exact = EXACT, excluded = [], clashes = []}) {
  const code = raw.trim().toUpperCase();
  if (!code) return null;
  if (excluded.includes(code)) return {joy: false, code, text: 'Not a Joy code. You chose not to count this code as a Joy code.'};
  const fixed = exact.find((e) => e.code === code);
  if (fixed) return {joy: true, code, text: `Joy code. Matches the exact code ${fixed.code} (from ${fixed.from}).`};

  // Longest prefix first, so NORTHBLOOM-… is judged by its own format, not by a shorter one that also fits.
  const ordered = [...formats].sort((a, b) => b.prefix.length - a.prefix.length);
  const own = clashes.some((c) => c.code === code) ? ' It is one of your own codes: choose Don’t count as Joy code above to stop counting it.' : '';
  for (const f of ordered) {
    if (!f.prefix) continue;
    if (!code.startsWith(f.prefix)) continue;
    const rest = code.slice(f.prefix.length);
    if (rest.length !== f.length) {
      return {joy: false, code, text: `Not a Joy code. It starts with ${f.prefix} but has ${plural(rest.length, 'character')} after it; Joy codes have ${f.length}.`};
    }
    if (!f.chars.re.test(rest)) {
      return {joy: false, code, text: `Not a Joy code. It starts with ${f.prefix} and has ${f.length} characters after it, but Joy codes in this format use only ${f.chars.label.replace(', ', ' and ')}.`};
    }
    const from = ISSUED[code] ? ` (from ${ISSUED[code]})` : '';
    return {joy: true, code, text: `Joy code. Matches ${f.prefix} + ${f.length} characters${from}.${own}`};
  }
  const blank = formats.find((f) => !f.prefix);
  if (blank && code.length === blank.length && blank.chars.re.test(code)) {
    return {joy: true, code, text: `Joy code. Matches ${blank.length} characters with no prefix, the format of rewards that have no prefix.${own}`};
  }
  // "NB15": the prefix letters without the hyphen.
  const near = ordered.find((f) => f.prefix.endsWith('-') && code.startsWith(f.prefix.slice(0, -1)));
  if (near) {
    return {joy: false, code, text: `Not a Joy code. It starts with ${near.prefix.slice(0, -1)}, not ${near.prefix}, so it doesn't match ${near.prefix} + ${near.length} characters.`};
  }
  const prefixes = formats.filter((f) => f.prefix).map((f) => f.prefix);
  const list = prefixes.length > 4 ? `${prefixes.slice(0, 4).join(', ')} or ${prefixes.length - 4} more` : prefixes.join(', ');
  return {joy: false, code, text: `Not a Joy code. It doesn't start with a Joy prefix (${list}) and isn't one of Joy's exact codes.`};
}

/** Fill {code} and {max} the way the checkout does. */
export const fillMessage = (template, code, max) => template.replaceAll('{code}', code).replaceAll('{max}', String(max));

export const num = (n) => n.toLocaleString('en-US');
