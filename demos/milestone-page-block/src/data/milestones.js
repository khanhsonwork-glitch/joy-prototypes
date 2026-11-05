// Milestone programs of the fictional shop Pomelo Park, and one shopper's progress in each.
// Everything here is made up. Never paste real merchant or customer data.

/** Each milestone program: what counts, the steps, and the reward at each step. */
export const PROGRAMS = [
  {
    id: 'refer',
    name: 'Bring your friends',
    adminLabel: 'Successful referrals',
    kind: 'referral',
    unit: ['friend', 'friends'],
    steps: [
      {at: 1, reward: '200 points', icon: 'points'},
      {at: 3, reward: '$10 off coupon', icon: 'coupon'},
      {at: 5, reward: 'Free Cloud Cream mini', icon: 'gift'},
    ],
  },
  {
    id: 'orders',
    name: 'Order milestones',
    adminLabel: 'Number of orders',
    kind: 'orders',
    unit: ['order', 'orders'],
    steps: [
      {at: 3, reward: 'Free shipping', icon: 'shipping'},
      {at: 5, reward: '$15 store credit', icon: 'credit'},
      {at: 10, reward: 'Free travel kit', icon: 'gift'},
    ],
  },
  {
    id: 'spend',
    name: 'Glow spender',
    adminLabel: 'Amount spent',
    kind: 'spend',
    unit: null,
    steps: [
      {at: 200, reward: '5% off all orders', icon: 'coupon'},
      {at: 500, reward: '$25 off coupon', icon: 'coupon'},
      {at: 1000, reward: 'Pomelo gift box', icon: 'gift'},
    ],
  },
];

/** The "Overflow" state: longest names and biggest numbers a merchant could plausibly set. */
export const OVERFLOW_PROGRAMS = [
  {
    ...PROGRAMS[0],
    name: 'Bring your friends and family along for the whole summer season',
    steps: [
      {at: 2, reward: '2,500 points added to your balance', icon: 'points'},
      {at: 10, reward: '$100 off your next order over $250', icon: 'coupon'},
      {at: 25, reward: 'Free Pomelo Cloud Cream full size, Rose Water Mist and Night Repair Serum', icon: 'gift'},
      {at: 50, reward: 'Lifetime free shipping', icon: 'shipping'},
      {at: 100, reward: 'Private skincare consultation', icon: 'gift'},
    ],
  },
  {...PROGRAMS[1], name: 'Order milestones for our most loyal Pomelo Park regulars'},
  {...PROGRAMS[2], steps: [{at: 2000, reward: '5% off all orders', icon: 'coupon'}, {at: 12500, reward: '$250 off coupon', icon: 'coupon'}, {at: 25000, reward: 'Pomelo gift box', icon: 'gift'}]},
];

/** How far the previewed member is. `done` = every step reached. */
export const PROGRESS = {
  member: {refer: 2, orders: 4, spend: 320},
  done: {refer: 5, orders: 10, spend: 1150},
  overflow: {refer: 18, orders: 4, spend: 9870},
  guest: {refer: 0, orders: 0, spend: 0},
};

export const money = (n) => `$${n.toLocaleString('en-US')}`;

/** "3 friends" / "1 order" / "$500". */
export function amount(program, n) {
  if (!program.unit) return money(n);
  return `${n.toLocaleString('en-US')} ${n === 1 ? program.unit[0] : program.unit[1]}`;
}

/** What the shopper does to move forward, as the progress card's headline. */
export function nextAction(program, left) {
  if (program.kind === 'referral') return `Refer ${amount(program, left)} more`;
  if (program.kind === 'orders') return `Place ${amount(program, left)} more`;
  return `Spend ${money(left)} more`;
}

/** Derived numbers for one program at one progress value: one formula for every surface. */
export function progressOf(program, value) {
  const steps = program.steps.map((s) => ({...s, reached: value >= s.at}));
  const reached = steps.filter((s) => s.reached).length;
  const next = steps.find((s) => !s.reached) || null;
  const prevAt = reached ? steps[reached - 1].at : 0;
  const share = next ? Math.max(0, Math.min(1, (value - prevAt) / (next.at - prevAt))) : 1;
  return {steps, reached, total: steps.length, next, prevAt, share, left: next ? next.at - value : 0, value};
}
