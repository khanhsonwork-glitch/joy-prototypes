// The tier rules the prototype shows. Pure functions so every screen (admin, widget, checkout, email) agrees.
// Referrer tiers belong to the new referrer reward method; friend tiers belong to the friend's discount.
import {CALC_AMOUNT, MAX_TIERS, TIERABLE_FRIEND, money, num} from '../data/index.js';

const n = (v) => (v === '' || v === null || v === undefined ? NaN : Number(v));

/** Tiers sorted by their start amount; rows without a valid amount keep their place at the end. */
export function sortTiers(tiers) {
  return [...tiers].sort((a, b) => {
    const x = n(a.min);
    const y = n(b.min);
    if (Number.isNaN(x)) return 1;
    if (Number.isNaN(y)) return -1;
    return x - y;
  });
}

export const referrerTiered = (p) => p.referrerMethod === 'point_order_value' && p.referrerCalc === CALC_AMOUNT;
export const friendTiered = (p) => p.friendTiersOn && TIERABLE_FRIEND.includes(p.friendMethod);
/** The friend's tiers reuse the referrer's amounts while that link is on and the referrer is on tiers. */
export const friendLinked = (p) => friendTiered(p) && p.friendSameAmounts && referrerTiered(p);

/** [{id, min, value}] for each side, sorted. */
export const referrerTiers = (p) => sortTiers(p.referrerTiers).map((t) => ({id: t.id, min: t.min, value: t.points}));
export function friendTiers(p) {
  if (friendLinked(p)) return sortTiers(p.referrerTiers).map((t) => ({id: t.id, min: t.min, value: p.friendTierValues[t.id] ?? ''}));
  return sortTiers(p.friendTiers).map((t) => ({id: t.id, min: t.min, value: t.value}));
}

const firstMin = (tiers) => {
  const t = tiers.find((x) => n(x.min) > 0);
  return t ? n(t.min) : null;
};
export const referrerMin = (p) => (referrerTiered(p) ? firstMin(referrerTiers(p)) : null);
export const friendMin = (p) => (friendTiered(p) ? firstMin(friendTiers(p)) : Number(p.friendMinOrder) || 0);

/** The tier an order falls in: the highest "from" amount the subtotal reaches. Null = below the first tier. */
export function matchTier(tiers, subtotal) {
  let hit = null;
  tiers.filter((t) => n(t.min) > 0).forEach((t, i) => {
    if (subtotal >= n(t.min)) hit = {...t, index: i};
  });
  return hit;
}

export function friendValueText(method, value) {
  if (value === '' || value === undefined) return '—';
  if (method === 'percentage') return `${num(value)}% off`;
  if (method === 'store_credit_fixed') return `${money(value)} store credit`;
  return `${money(value)} off`;
}

export const pointsText = (value) => `${num(value)} ${Number(value) === 1 ? 'point' : 'points'}`;

export function referrerValueText(method, value) {
  if (value === '' || value === undefined) return '—';
  if (method === 'point') return pointsText(value);
  if (method === 'percentage') return `${num(value)}% off coupon`;
  if (method === 'amount') return `${money(value)} off coupon`;
  if (method === 'store_credit_fixed') return `${money(value)} store credit`;
  if (method === 'point_order_value') return `${num(value)} points per $1 spent`;
  return `${num(value)}% store credit`;
}

export function unitFor(method) {
  if (method === 'point') return {suffix: 'points'};
  if (method === 'percentage') return {suffix: '%'};
  return {prefix: '$'};
}

/** Discount the friend's code takes off a cart, in dollars. */
export function friendDiscount(p, subtotal) {
  let value;
  if (friendTiered(p)) value = n(matchTier(friendTiers(p), subtotal)?.value) || 0;
  else value = subtotal >= friendMin(p) ? n(p.friendValue) : 0;
  if (!value) return 0;
  const raw = p.friendMethod === 'percentage' ? (subtotal * value) / 100 : value;
  return Math.min(raw, subtotal);
}

/**
 * What each side gets for a cart subtotal (after other discounts, before the referral code).
 * The referrer side counts what Joy already counts for "Points based on order value": the order subtotal after
 * every discount, the referral code included (Alex 29/10 17:56). The friend's code can only look at the cart before itself.
 */
export function outcome(p, subtotal) {
  const discount = friendDiscount(p, subtotal);
  const counted = Math.round(Math.max(subtotal - discount, 0) * 100) / 100;
  const fTier = friendTiered(p) ? matchTier(friendTiers(p), subtotal) : null;
  const friend = friendTiered(p)
    ? (fTier ? friendValueText(p.friendMethod, fTier.value) : null)
    : (subtotal >= friendMin(p) ? friendValueText(p.friendMethod, p.friendValue) : null);

  const min = referrerMin(p);
  let tier = null;
  let referrer;
  if (referrerTiered(p)) {
    tier = matchTier(referrerTiers(p), counted);
    referrer = tier ? pointsText(tier.value) : null; // below tier 1: the referral stays pending
  } else if (p.referrerVipRates) referrer = "their VIP tier's reward";
  else if (p.referrerMethod === 'point_order_value' || p.referrerMethod === 'store_credit_order_value') {
    const paid = counted;
    const rate = Number(p.referrerMethod === 'point_order_value' ? p.referrerRate : p.referrerValue) || 0;
    const raw = Math.floor(paid * rate);
    const cap = p.referrerMaxOn ? Number(p.referrerMax) || 0 : 0;
    referrer = p.referrerMethod === 'point_order_value'
      ? pointsText(cap && raw > cap ? cap : raw)
      : `${money(Math.round(paid * rate) / 100)} store credit`;
  } else referrer = referrerValueText(p.referrerMethod, p.referrerValue);
  return {tier, fTier, friend, referrer, min, discount, counted, qualifies: !(min !== null && counted < min)};
}

/**
 * Row errors (block saving) and warnings (shown, never block) for one side's tier list.
 * kind: 'points' | 'amount' | 'percentage'. checkMin = false when the amounts are copied from the other side.
 */
export function checkTierList(tiers, kind, {checkMin = true} = {}) {
  const errors = {};
  const warnings = {};
  const seen = new Set();
  tiers.forEach((t) => {
    const e = {};
    const min = n(t.min);
    if (checkMin) {
      if (!(min > 0)) e.min = 'Enter an amount above 0';
      else if (Math.round(min * 100) !== min * 100) e.min = 'Use up to 2 decimals';
      else if (seen.has(min)) e.min = 'Each row needs a different order amount';
      else seen.add(min);
    }
    const v = n(t.value);
    if (!(v > 0)) e.value = 'Number needs to be greater than 0';
    else if (kind === 'points' && !Number.isInteger(v)) e.value = 'Points must be a whole number';
    else if (kind === 'percentage' && v > 100) e.value = 'A percentage can be 100 at most';
    else if (kind === 'amount' && Math.round(v * 100) !== v * 100) e.value = 'Use up to 2 decimals';
    if (Object.keys(e).length) errors[t.id] = e;
  });
  tiers.forEach((t, i) => {
    const w = [];
    const below = tiers[i - 1];
    if (kind === 'amount' && n(t.value) >= n(t.min) && n(t.min) > 0) w.push(`A ${money(t.value)} discount is as big as this tier's starting amount (${money(t.min)})`);
    if (below && n(t.value) > 0 && n(t.value) < n(below.value)) w.push(`Less than the row above (${kind === 'points' ? pointsText(below.value) : friendValueText(kind, below.value)})`);
    if (w.length) warnings[t.id] = w;
  });
  const count = Object.values(errors).reduce((s, e) => s + Object.keys(e).length, 0);
  return {errors, warnings, count};
}

export const checkReferrer = (p) => (referrerTiered(p) ? checkTierList(referrerTiers(p), 'points') : {errors: {}, warnings: {}, count: 0});
export const checkFriend = (p) => (friendTiered(p) ? checkTierList(friendTiers(p), p.friendMethod, {checkMin: !friendLinked(p)}) : {errors: {}, warnings: {}, count: 0});

export const canAddTier = (tiers) => tiers.length < MAX_TIERS;

const range = (vals, fmt) => {
  const ok = vals.map(n).filter((v) => v > 0);
  if (!ok.length) return fmt('');
  const lo = Math.min(...ok);
  const hi = Math.max(...ok);
  return lo === hi ? fmt(lo) : `${fmt(lo).replace(/ .*/, '')}–${fmt(hi)}`;
};

/** Referrals page lines, in the app's words: "100 points reward", "$5 off coupon"; tiers add a range and a count. */
export function referrerSummary(p) {
  if (referrerTiered(p)) {
    const t = referrerTiers(p);
    return `${range(t.map((x) => x.value), pointsText)} · by order amount`;
  }
  if (p.referrerMethod === 'point') return `${pointsText(p.referrerValue)} reward`;
  if (p.referrerMethod === 'point_order_value') return `${num(p.referrerRate)} points per $1 spent`;
  return referrerValueText(p.referrerMethod, p.referrerValue);
}

export function friendSummary(p) {
  if (friendTiered(p)) {
    const t = friendTiers(p);
    return `${range(t.map((x) => x.value), (v) => friendValueText(p.friendMethod, v))} coupon · by order amount`;
  }
  if (p.friendMethod === 'store_credit_fixed') return friendValueText(p.friendMethod, p.friendValue);
  return `${friendValueText(p.friendMethod, p.friendValue)} coupon`;
}

/** "Up to 200 points" / "100 points": the storefront headline for one side. */
export function referrerHeadline(p) {
  if (referrerTiered(p)) {
    const vals = referrerTiers(p).map((t) => n(t.value)).filter((v) => v > 0);
    return vals.length > 1 ? `Up to ${pointsText(Math.max(...vals))}` : pointsText(vals[0] || 0);
  }
  if (p.referrerMethod === 'point_order_value') return `${num(p.referrerRate)} points per $1 spent`;
  return referrerValueText(p.referrerMethod, p.referrerValue);
}
export function friendHeadline(p) {
  if (friendTiered(p)) {
    const vals = friendTiers(p).map((t) => n(t.value)).filter((v) => v > 0);
    return vals.length > 1 ? `Up to ${friendValueText(p.friendMethod, Math.max(...vals))}` : friendValueText(p.friendMethod, vals[0] || 0);
  }
  return friendValueText(p.friendMethod, p.friendValue);
}

/** Two worked examples for the tier table's help text: a mid order in tier 1 and one in the top tier. */
export function examples(tiers) {
  const valid = tiers.filter((t) => n(t.min) > 0 && n(t.value) > 0);
  if (!valid.length) return [];
  const pick = (i) => {
    const lo = n(valid[i].min);
    const hi = valid[i + 1] ? n(valid[i + 1].min) : lo * 1.2;
    return Math.max(Math.round((lo + hi) / 2 / 5) * 5, Math.ceil(lo));
  };
  const idx = valid.length > 1 ? [0, valid.length - 1] : [0];
  return idx.map((i) => ({order: pick(i), tier: valid[i], index: tiers.indexOf(valid[i])}));
}

/** The cart amount (before the referral code) whose counted amount is `target`; iterates because a % code depends on the cart. */
export function orderFor(p, target) {
  let order = target;
  for (let i = 0; i < 4; i += 1) order = Math.round((target + friendDiscount(p, order)) * 100) / 100;
  return order;
}
