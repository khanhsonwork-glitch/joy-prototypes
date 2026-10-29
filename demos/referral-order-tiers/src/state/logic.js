// The tier rules the prototype shows. Pure functions so every screen (admin, widget, checkout, email) agrees.
import {MAX_TIERS, TIERABLE_FRIEND, TIERABLE_REFERRER, money, num} from '../data/index.js';

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

export const friendTiered = (p) => p.tiersOn && p.tierFriend && TIERABLE_FRIEND.includes(p.friendMethod);
export const referrerTiered = (p) => p.tiersOn && p.tierReferrer && TIERABLE_REFERRER.includes(p.referrerMethod) && !p.referrerVipRates;

/** The tier an order falls in: the highest "from" amount the subtotal reaches. Null = below the first tier. */
export function matchTier(tiers, subtotal) {
  const valid = sortTiers(tiers).filter((t) => n(t.min) > 0);
  let hit = null;
  for (const t of valid) if (subtotal >= n(t.min)) hit = t;
  return hit;
}

export function friendValueText(method, value) {
  if (value === '' || value === undefined) return '—';
  if (method === 'percentage') return `${num(value)}% off`;
  if (method === 'store_credit_fixed') return `${money(value)} store credit`;
  return `${money(value)} off`;
}

export function referrerValueText(method, value) {
  if (value === '' || value === undefined) return '—';
  if (method === 'point') return `${num(value)} ${Number(value) === 1 ? 'point' : 'points'}`;
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

/** What each side gets for a first-order subtotal, under the program as it is now (tiers on or off). */
export function outcome(p, subtotal) {
  const fT = friendTiered(p);
  const rT = referrerTiered(p);
  const tier = p.tiersOn ? matchTier(p.tiers, subtotal) : null;
  const first = sortTiers(p.tiers).find((t) => n(t.min) > 0);
  const min = p.tiersOn && first ? n(first.min) : null;
  const friendMin = p.tiersOn && min !== null ? min : Number(p.friendMinOrder) || 0;

  let friend;
  if (fT) friend = tier ? friendValueText(p.friendMethod, tier.friend) : null;
  else friend = subtotal >= friendMin ? friendValueText(p.friendMethod, p.friendValue) : null;

  let referrer;
  if (p.tiersOn && (rT || fT) && min !== null && subtotal < min) referrer = null; // below the first tier: nobody is rewarded yet
  else if (rT) referrer = tier ? referrerValueText(p.referrerMethod, tier.referrer) : null;
  else if (p.referrerMethod === 'point_order_value' || p.referrerMethod === 'store_credit_order_value') {
    // Amount still comes from the order subtotal after every discount, the referral discount included (as today).
    const paid = Math.max(subtotal - friendDiscount(p, subtotal), 0);
    const rate = Number(p.referrerValue) || 0;
    const raw = Math.floor(paid * rate);
    const cap = p.referrerMaxOn ? Number(p.referrerMax) || 0 : 0;
    referrer = p.referrerMethod === 'point_order_value'
      ? `${num(cap && raw > cap ? cap : raw)} points (${num(rate)} per $1 on ${money(paid)} after the referral discount${cap && raw > cap ? `, ${num(raw)} capped at ${num(cap)}` : ''})`
      : `${money(Math.round(paid * rate) / 100)} store credit (${num(rate)}% of ${money(paid)})`;
  } else referrer = referrerValueText(p.referrerMethod, p.referrerValue);
  return {tier, friend, referrer, min, qualifies: !(p.tiersOn && min !== null && subtotal < min)};
}

/** Discount the friend's code takes off a cart, in dollars. */
export function friendDiscount(p, subtotal) {
  const fT = friendTiered(p);
  const tier = fT ? matchTier(p.tiers, subtotal) : null;
  const first = sortTiers(p.tiers).find((t) => n(t.min) > 0);
  const min = p.tiersOn && first ? n(first.min) : Number(p.friendMinOrder) || 0;
  const value = fT ? (tier ? n(tier.friend) : 0) : subtotal >= min ? n(p.friendValue) : 0;
  if (!value) return 0;
  const raw = p.friendMethod === 'percentage' ? (subtotal * value) / 100 : value;
  return Math.min(raw, subtotal);
}

/** Row errors (block saving) and warnings (shown, never block). */
export function checkTiers(p) {
  const errors = {};
  const warnings = {};
  if (!p.tiersOn) return {errors, warnings, count: 0, general: null};
  const fT = friendTiered(p);
  const rT = referrerTiered(p);
  let general = null;
  const fCan = TIERABLE_FRIEND.includes(p.friendMethod);
  const rCan = TIERABLE_REFERRER.includes(p.referrerMethod) && !p.referrerVipRates;
  if (!p.tiers.length) general = 'Add at least one tier, or turn order value tiers off';
  const seen = new Map();
  p.tiers.forEach((t) => {
    const e = {};
    const min = n(t.min);
    if (!(min > 0)) e.min = 'Enter an amount above 0';
    else if (Math.round(min * 100) !== min * 100) e.min = 'Use up to 2 decimals';
    else if (seen.has(min)) e.min = 'Each tier needs a different starting amount';
    else seen.set(min, t.id);
    if (fT) {
      const f = n(t.friend);
      if (!(f > 0)) e.friend = 'Enter a value above 0';
      else if (p.friendMethod === 'percentage' && f > 100) e.friend = 'A percentage can be 100 at most';
      else if (p.friendMethod === 'amount' && Math.round(f * 100) !== f * 100) e.friend = 'Use up to 2 decimals';
    }
    if (rT) {
      const r = n(t.referrer);
      if (!(r > 0)) e.referrer = 'Enter a value above 0';
      else if (p.referrerMethod === 'point' && !Number.isInteger(r)) e.referrer = 'Points must be a whole number';
      else if (p.referrerMethod === 'percentage' && r > 100) e.referrer = 'A percentage can be 100 at most';
    }
    if (Object.keys(e).length) errors[t.id] = e;
  });
  // Warnings compare each tier with the one below it, after sorting.
  const sorted = sortTiers(p.tiers);
  sorted.forEach((t, i) => {
    const w = [];
    const below = sorted[i - 1];
    if (fT && p.friendMethod === 'amount' && n(t.friend) >= n(t.min) && n(t.min) > 0) {
      w.push(`A ${money(t.friend)} discount is as big as this tier's starting amount (${money(t.min)})`);
    }
    if (below && fT && n(t.friend) > 0 && n(t.friend) < n(below.friend)) w.push(`Friend gets less than in the tier below (${friendValueText(p.friendMethod, below.friend)})`);
    if (below && rT && n(t.referrer) > 0 && n(t.referrer) < n(below.referrer)) w.push(`Referrer gets less than in the tier below (${referrerValueText(p.referrerMethod, below.referrer)})`);
    if (w.length) warnings[t.id] = w;
  });
  const count = Object.values(errors).reduce((s, e) => s + Object.keys(e).length, 0) + (general ? 1 : 0);
  return {errors, warnings, count, general};
}

export const canAddTier = (p) => p.tiers.length < MAX_TIERS;

/** Short lines for summaries: "Up to $10 off · orders from $50". */
export function friendSummary(p) {
  if (friendTiered(p) && p.tiers.length) {
    const vals = sortTiers(p.tiers).map((t) => n(t.friend)).filter((v) => v > 0);
    const top = Math.max(...vals, 0);
    const first = sortTiers(p.tiers).find((t) => n(t.min) > 0);
    return `Up to ${friendValueText(p.friendMethod, top)} coupon · orders from ${first ? money(first.min) : '—'}`;
  }
  const min = p.tiersOn ? sortTiers(p.tiers).find((t) => n(t.min) > 0)?.min : p.friendMinOrder;
  return `${friendValueText(p.friendMethod, p.friendValue)} coupon${Number(min) > 0 ? ` · orders from ${money(min)}` : ''}`;
}

export function referrerSummary(p) {
  if (referrerTiered(p) && p.tiers.length) {
    const vals = sortTiers(p.tiers).map((t) => n(t.referrer)).filter((v) => v > 0);
    return `Up to ${referrerValueText(p.referrerMethod, Math.max(...vals, 0))} · ${p.tiers.length} ${p.tiers.length === 1 ? 'tier' : 'tiers'}`;
  }
  const capped = p.referrerMethod === 'point_order_value' && p.referrerMaxOn && Number(p.referrerMax) > 0;
  return `${referrerValueText(p.referrerMethod, p.referrerValue)}${capped ? `, up to ${num(p.referrerMax)} points` : ''}`;
}

/** One line per tier, for the storefront: "Orders from $50 · $5 off for your friend · 100 points for you". */
export function tierLines(p) {
  return sortTiers(p.tiers)
    .filter((t) => n(t.min) > 0)
    .map((t) => ({
      id: t.id,
      from: money(t.min),
      friend: friendTiered(p) ? friendValueText(p.friendMethod, t.friend) : friendValueText(p.friendMethod, p.friendValue),
      referrer: referrerTiered(p) ? referrerValueText(p.referrerMethod, t.referrer) : referrerValueText(p.referrerMethod, p.referrerValue),
    }));
}
