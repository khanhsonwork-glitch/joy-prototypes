// Pomelo Park's loyalty program, laid out the way a merchant thinks about it:
// which tiers → what each tier earns → what points buy → what the tier card looks like.
// Every number is made up. One formula (rewardsRate) feeds the header chip, the overview table and the simulator.

export const POINT_VALUE = 0.01; // $ of reward per point, read from the cheapest reward ($5 off for 500 points)

export const TIERS = [
  {id: 'member', name: 'Member', look: 'bronze', reach: null, keep: null, multiplier: 1, members: 3912, tag: 'joy-member',
    perks: []},
  {id: 'silver', name: 'Silver', look: 'silver', reach: 300, keep: 12, multiplier: 1.25, members: 984, tag: 'joy-silver',
    perks: [{id: 'p1', icon: 'gift', label: 'Welcome gift', value: '$5 off'}]},
  {id: 'gold', name: 'Gold', look: 'gold', reach: 800, keep: 12, multiplier: 1.5, members: 351, tag: 'joy-gold',
    perks: [{id: 'p2', icon: 'gift', label: 'Welcome gift', value: '$10 off'},
      {id: 'p3', icon: 'delivery', label: 'Free shipping', value: 'Every order'}]},
  {id: 'vip', name: 'VIP', look: 'black', reach: 2000, keep: 12, multiplier: 2, members: 65, tag: 'joy-vip',
    perks: [{id: 'p4', icon: 'gift', label: 'Welcome gift', value: 'Cloud Cream mini'},
      {id: 'p5', icon: 'delivery', label: 'Free shipping', value: 'Every order'},
      {id: 'p6', icon: 'calendar', label: 'Early access to drops', value: '48 hours'}]},
];

export const BASE_RATE = {points: 5, per: 1}; // 5 points for every $1 spent

export const EARN_RULES = [
  {id: 'e1', icon: 'order', name: 'First order bonus', reward: '+250 points', scales: false},
  {id: 'e2', icon: 'personAdd', name: 'Create an account', reward: '100 points', scales: false},
  {id: 'e3', icon: 'email', name: 'Subscribe to emails', reward: '150 points', scales: false},
  {id: 'e4', icon: 'cake', name: 'Birthday', reward: '300 points', scales: true},
  {id: 'e5', icon: 'star', name: 'Write a product review', reward: '50 points', scales: true},
  {id: 'e6', icon: 'instagram', name: 'Follow on Instagram', reward: '75 points', scales: false},
];

export const REWARDS = [
  {id: 'r1', icon: 'discount', name: '$5 off', cost: 500, minTier: 'member'},
  {id: 'r2', icon: 'wallet', name: 'Store credit', detail: '$1 for every 100 points', cost: 100, minTier: 'member', isNew: true},
  {id: 'r3', icon: 'delivery', name: 'Free shipping', cost: 300, minTier: 'member'},
  {id: 'r4', icon: 'discount', name: '15% off', cost: 1500, minTier: 'silver'},
  {id: 'r5', icon: 'product', name: 'Free Cloud Cream mini', cost: 1800, minTier: 'gold'},
];

export const PROGRAM = {status: 'live', members: TIERS.reduce((sum, t) => sum + t.members, 0), expireMonths: 12};

export const tierById = id => TIERS.find(t => t.id === id) ?? TIERS[0];
export const tierIndex = id => TIERS.findIndex(t => t.id === id);

/** Points a tier earns for every $1: the base rate times the tier multiplier. */
export const pointsPerDollar = tier => (BASE_RATE.points / BASE_RATE.per) * tier.multiplier;

/** Share of spend that comes back as rewards, in %: points per $ × $ value of a point. */
export const rewardsRate = tier => pointsPerDollar(tier) * POINT_VALUE * 100;

export function rateLabel(rate) {
  if (rate < 3) return 'Light';
  if (rate < 6) return 'Balanced';
  if (rate < 9) return 'Generous';
  return 'Very generous';
}

export const pct = n => `${n.toFixed(1)}%`;
export const money = n => `$${Math.round(n).toLocaleString('en-US')}`;
export const num = n => Math.round(n).toLocaleString('en-US');
export const reachLabel = tier => (tier.reach == null ? 'Joins when they sign up' : `Spend ${money(tier.reach)} in 12 months`);

/** Rewards available to a tier: everything whose minimum tier is this tier or lower. */
export const rewardsFor = tier => REWARDS.filter(r => tierIndex(r.minTier) <= tierIndex(tier.id));

/**
 * A customer who spends `monthly` dollars every month for a year: which tier they reach and when,
 * and how much comes back as rewards. Tiers are reached on 12-month spend, points use the tier
 * they are in that month. Same formula as rewardsRate, month by month.
 */
export function simulateYear(monthly) {
  let spent = 0;
  let points = 0;
  const reached = [];
  let current = TIERS[0];
  for (let month = 1; month <= 12; month++) {
    points += monthly * pointsPerDollar(current);
    spent += monthly;
    const next = [...TIERS].reverse().find(t => t.reach != null && spent >= t.reach);
    if (next && tierIndex(next.id) > tierIndex(current.id)) {
      current = next;
      reached.push({tier: next, month});
    }
  }
  const back = points * POINT_VALUE;
  return {spent, points, back, rate: spent ? (back / spent) * 100 : 0, reached, finalTier: current};
}
