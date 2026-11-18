// Point economics. The one idea of this revamp: every number a merchant types is translated, right where they type
// it, into money (what it costs the shop) and effort (how much a customer must spend to get it). A merchant setting
// up loyalty thinks "is 5 points per $1 generous or stingy?", not "what is the earning multiplier".
import {money, num} from '../ui/kit.jsx';

export const pointValue = db => {
  const v = db.program?.point?.value ?? {points: 100, money: 1};
  return (Number(v.money) || 0) / (Number(v.points) || 1);
};
export const toMoney = (db, pts) => (Number(pts) || 0) * pointValue(db);
export const aov = db => db.stats?.last30?.aovMember ?? 70;

/** "500 points" with the shop's own point name and placement. */
export function pts(db, n) {
  const p = db.program?.point ?? {singular: 'point', plural: 'points', placement: 'after'};
  const label = Number(n) === 1 ? p.singular : p.plural;
  return p.placement === 'before' ? `${label} ${num(n)}` : `${num(n)} ${label}`;
}
export const pointWord = (db, plural = true) => (plural ? db.program?.point?.plural : db.program?.point?.singular) ?? 'points';

/** Points per $1 of order value for one earn rule (fixed-per-order rules use the member average order). */
export function ratePerDollar(rule, db) {
  if (!rule?.reward) return 0;
  const r = rule.reward;
  if (r.kind === 'per_money') return (Number(r.points) || 0) / (Number(r.per) || 1);
  if (r.kind === 'fixed') return (Number(r.points) || 0) / aov(db);
  if (r.kind === 'per_item') return ((Number(r.points) || 0) * 2.1) / aov(db); // 2.1 items per order in the sample shop
  return 0;
}

/** The shop's main order rule: active Place order, else any Place order. */
export const mainOrderRule = db => db.earn?.find(e => e.type === 'place_order' && e.status === 'active') ?? db.earn?.find(e => e.type === 'place_order');
export const baseRate = db => ratePerDollar(mainOrderRule(db), db);

/** % of an order a customer gets back at a given points-per-$ rate. */
export const giveBack = (db, rate) => rate * pointValue(db) * 100;

/** How much a customer must spend (at the main order rate) to collect `cost` points. */
export function spendFor(db, cost, multiplier = 1) {
  const rate = baseRate(db) * multiplier;
  if (!rate) return null;
  return cost / rate;
}

/** Money value a reward gives the customer (approximate, for "value per 100 points"). */
export function rewardValue(r) {
  switch (r.type) {
    case 'amount': case 'store_credit': case 'gift_card': return Number(r.value) || 0;
    case 'percent': return Math.min(((Number(r.value) || 0) / 100) * 72, Number(r.maxDiscount) || Infinity);
    case 'free_shipping': return Math.min(8, Number(r.maxShipping) || 8);
    case 'free_product': return r.productPrice ?? (r.photo === 'giftSet' ? 48 : 18);
    case 'bxgy': return 32;
    case 'impact': return 0.5;
    default: return 0;
  }
}

/** Plain sentence for what an earn rule gives: "5 points per $1 spent". */
export function earnGives(rule, db) {
  const r = rule.reward ?? {};
  if (r.type === 'store_credit') return `${money(r.points)} store credit${r.kind === 'per_money' ? ` per ${money(r.per || 1)} spent` : ''}`;
  if (r.kind === 'per_money') return `${pts(db, r.points)} per ${money(r.per || 1)} spent`;
  if (r.kind === 'per_item') return `${pts(db, r.points)} per item`;
  if (r.kind === 'discount') return `${r.discountType === 'percent' ? `${r.points}%` : money(r.points)} off coupon`;
  return pts(db, r.points);
}

/** Plain sentence for what a reward gives: "$5 off", "10% off, up to $30". */
export function rewardGives(r, db) {
  switch (r.type) {
    case 'amount': return r.flexible ? `${money(r.flexValue ?? 1)} off per ${pts(db, r.flexPoints ?? 100)}` : `${money(r.value)} off`;
    case 'percent': return `${r.value}% off${r.maxDiscount ? `, up to ${money(r.maxDiscount)}` : ''}`;
    case 'free_shipping': return r.maxShipping ? `Free shipping up to ${money(r.maxShipping)}` : 'Free shipping';
    case 'free_product': return `Free ${r.product || 'product'}`;
    case 'bxgy': return `Buy ${r.buy ?? 1}, get ${r.get ?? 1} ${r.getDiscount === 'percent' ? `${r.getValue ?? 50}% off` : 'free'}${r.collection ? ` · ${r.collection}` : ''}`;
    case 'store_credit': return `${money(r.value)} store credit`;
    case 'impact': return `Plant ${r.value ?? 1} ${Number(r.value) === 1 ? 'tree' : 'trees'}`;
    case 'gift_card': return `${money(r.value)} gift card`;
    default: return r.name;
  }
}

/** "≈ $100 in orders · 2 orders" — the effort to afford a reward at the main rate. */
export function effort(db, cost, multiplier = 1) {
  const spend = spendFor(db, cost, multiplier);
  if (spend == null) return 'Add a way to earn on orders to see this';
  const orders = Math.max(1, Math.round(spend / aov(db)));
  return `≈ ${money(Math.round(spend))} in orders · about ${orders} ${orders === 1 ? 'order' : 'orders'}`;
}

/** Tier progress unit follows the level-up rule. */
export function tierUnit(db, n) {
  const rule = db.tierSettings?.rule ?? 'spent';
  if (rule === 'points') return pts(db, n);
  if (rule === 'orders') return `${num(n)} ${Number(n) === 1 ? 'order' : 'orders'}`;
  return money(n);
}
export const RULE_LABEL = {spent: 'Money spent', points: 'Points earned', orders: 'Number of orders'};
export const PERIOD_LABEL = {rolling12: 'in the last 12 months', calendar: 'this calendar year', lifetime: 'since they joined'};
