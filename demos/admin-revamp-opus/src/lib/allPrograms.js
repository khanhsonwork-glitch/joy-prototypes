// Every program the shop runs, as one flat list: earn, rewards, referral, milestones, quizzes, VIP perks, member
// deals, paid membership. Built from the store each render, never a second copy.
import {earnGives, pts, rewardGives} from './econ.js';
import {eligibilityLabel, money, num} from '../ui/kit.jsx';

export const KINDS = [
  {id: 'earn', label: 'Ways to earn', one: 'Way to earn'},
  {id: 'reward', label: 'Rewards', one: 'Reward'},
  {id: 'referral', label: 'Referral', one: 'Referral'},
  {id: 'milestone', label: 'Milestones', one: 'Milestone'},
  {id: 'quiz', label: 'Quizzes', one: 'Quiz'},
  {id: 'perk', label: 'VIP perks', one: 'VIP perk'},
  {id: 'deal', label: 'Member deals', one: 'Member deal'},
  {id: 'paid', label: 'Paid membership', one: 'Paid membership'},
];

const stepGives = (s, db) => {
  const r = s.reward ?? {};
  if (r.type === 'points') return pts(db, r.value);
  if (r.type === 'amount') return `${money(r.value)} off`;
  if (r.type === 'percent') return `${r.value}% off`;
  if (r.type === 'free_shipping') return 'Free shipping';
  if (r.type === 'store_credit') return `${money(r.value)} store credit`;
  if (r.type === 'tree') return 'Plant a tree';
  return `Free ${r.value}`;
};
/** One short value for a list row: the only step, or how many steps. */
export const milestoneShort = (m, db) => ((m.steps ?? []).length === 1 ? `${m.steps[0].at} → ${stepGives(m.steps[0], db)}` : `${(m.steps ?? []).length} steps`);
export const milestoneGives = (m, db) => (m.steps ?? []).map(s => `${s.at} → ${stepGives(s, db)}`).join(' · ');
export const referralGives = (ref, db) => {
  const side = (x) => {
    if (!x) return '';
    if (x.type === 'points') return pts(db, x.value);
    if (x.type === 'amount') return `${money(x.value)} off`;
    if (x.type === 'percent') return `${x.value}% off`;
    if (x.type === 'store_credit') return `${money(x.value)} store credit`;
    if (x.type === 'free_shipping') return 'free shipping';
    return x.value;
  };
  return `Friend gets ${side(ref.friend)}, referrer gets ${side(ref.referrer)}`;
};
const tierReward = (e, db) => {
  if (!e) return null;
  if (e.type === 'points') return pts(db, e.value);
  if (e.type === 'discount') return `${e.value}% off coupon`;
  if (e.type === 'free_shipping') return 'Free shipping coupon';
  if (e.type === 'store_credit') return `${money(e.value)} store credit`;
  return `Free ${e.value}`;
};
export const dealGives = d => (d.discount?.type === 'percent' ? `${d.discount.value}% off` : d.discount?.type === 'amount' ? `${money(d.discount.value)} off` : d.discount?.type === 'free_shipping' ? 'Free shipping' : `Fixed price ${money(d.discount?.value)}`) + (d.products ? ` · ${d.products}` : '');

export function allPrograms(db) {
  const rows = [];
  const on = s => s === 'active' || s === 'scheduled';
  db.earn.forEach(e => rows.push({id: e.id, kind: 'earn', name: e.name, who: e.eligibility, gives: earnGives(e, db), on: on(e.status), status: e.status, last30: e.completions, unit: 'done', url: `/programs/points/earn/${e.id}`, coll: 'earn', item: e, type: e.type}));
  db.redeem.forEach(r => rows.push({id: r.id, kind: 'reward', name: r.name, who: r.eligibility, gives: `${pts(db, r.cost)} → ${rewardGives(r, db)}`, on: on(r.status), status: r.status, last30: r.redemptions, unit: 'redeemed', url: `/programs/points/rewards/${r.id}`, coll: 'redeem', item: r, type: r.type, photo: r.photo}));
  if (db.referral) rows.push({id: 'referral', kind: 'referral', name: db.referral.name, who: {mode: 'all'}, gives: referralGives(db.referral, db), on: db.referral.status === 'active', status: db.referral.status, last30: db.referral.stats?.referred, unit: 'friends', url: '/programs/referrals', single: 'referral'});
  db.milestones.forEach(m => rows.push({id: m.id, kind: 'milestone', name: m.name, who: m.eligibility ?? {mode: 'members'}, gives: milestoneGives(m, db), on: on(m.status), status: m.status, last30: m.reached, unit: 'reached', url: `/programs/milestones/${m.id}`, coll: 'milestones', item: m}));
  db.quizzes.forEach(q => rows.push({id: q.id, kind: 'quiz', name: q.name, who: q.eligibility, gives: q.reward?.type === 'points' ? pts(db, q.reward.value) : q.reward?.type === 'percent' ? `${q.reward.value}% off` : money(q.reward?.value), on: on(q.status), status: q.status, last30: q.completions, unit: 'done', url: `/programs/quizzes/${q.id}`, coll: 'quizzes', item: q}));
  if (db.tierSettings?.enabled) {
    db.tiers.forEach(t => {
      if (t.multiplier > 1) rows.push({id: `${t.id}-mult`, kind: 'perk', name: `${t.multiplier}× ${db.program.point.plural} on orders`, who: {mode: 'tiers', tiers: [t.id]}, gives: `${t.multiplier}× the base rate`, tierId: t.id, last30: t.members, unit: 'members', url: `/vip/tiers/${t.id}`});
      if (t.entryReward) rows.push({id: `${t.id}-entry`, kind: 'perk', name: `Welcome to ${t.name}`, who: {mode: 'tiers', tiers: [t.id]}, gives: tierReward(t.entryReward, db), tierId: t.id, last30: t.members, unit: 'members', url: `/vip/tiers/${t.id}`});
      (t.perks ?? []).forEach((p, i) => rows.push({id: `${t.id}-p${i}`, kind: 'perk', name: typeof p === 'string' ? p : p.name, who: {mode: 'tiers', tiers: [t.id]}, gives: 'Tier perk', tierId: t.id, last30: t.members, unit: 'members', url: `/vip/tiers/${t.id}`}));
    });
  }
  db.deals.forEach(d => rows.push({id: d.id, kind: 'deal', name: d.name, who: d.eligibility, gives: dealGives(d), on: on(d.status), status: d.status, last30: d.used, unit: 'used', url: `/vip/deals/${d.id}`, coll: 'deals', item: d}));
  db.paidPlans.forEach(p => rows.push({id: p.id, kind: 'paid', name: p.name, who: {mode: 'all'}, gives: `${money(p.price)}/${p.interval} · ${(p.perks ?? []).slice(0, 2).join(', ')}`, on: on(p.status), status: p.status, last30: p.subscribers, unit: 'subscribers', url: `/vip/paid/${p.id}`, coll: 'paidPlans', item: p}));
  return rows.map(r => ({...r, whoLabel: eligibilityLabel(r.who, db), last30Label: r.last30 == null ? '—' : `${num(r.last30)} ${r.unit}`}));
}

/** Does a program reach a customer in `lens` ('all' | 'members' | tier id)? */
export function reaches(row, lens) {
  if (lens === 'all') return true;
  const w = row.who ?? {mode: 'all'};
  if (row.kind === 'paid') return true;
  if (w.mode === 'all' || w.mode === 'members') return true;
  if (lens === 'members') return false;
  if (w.mode === 'tiers') return (w.tiers ?? []).includes(lens);
  return false;
}
