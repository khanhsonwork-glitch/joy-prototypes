// Milestone programs of the fictional shop Pomelo Park, and one shopper's progress in each.
// Everything here is made up. Never paste real merchant or customer data.
// Card shape follows the merchant-approved custom Milestone block (progress card + one card per step with
// "Choose 1 reward" and Claim); statuses follow Widget V4 (joy-milestone-timeline _getStepStatus):
// claimed (completed) · ready (claimable) · current (in progress) · locked.

/** Each milestone program: what counts, the steps, and the reward(s) at each step. */
export const PROGRAMS = [
  {
    id: 'refer',
    name: 'Share more, unlock more',
    kind: 'referral',
    unit: ['friend', 'friends'],
    steps: [
      {at: 2, rewards: [
        {id: 'r2a', title: 'Free Cloud Cream mini', icon: 'gift'},
        {id: 'r2b', title: 'Free Rose Water Mist', icon: 'gift'},
        {id: 'r2c', title: '$10 off', sub: 'Min. order $40', icon: 'coupon'},
      ]},
      {at: 3, rewards: [
        {id: 'r3a', title: 'Free travel kit', icon: 'gift'},
        {id: 'r3b', title: '$20 off', sub: 'Min. order $60', icon: 'coupon'},
      ]},
      {at: 5, rewards: [{id: 'r5a', title: '$40 off', sub: 'Min. order $100', icon: 'coupon'}]},
    ],
  },
  {
    id: 'orders',
    name: 'Order milestones',
    kind: 'orders',
    unit: ['order', 'orders'],
    steps: [
      {at: 3, rewards: [{id: 'o3a', title: 'Free shipping', icon: 'shipping'}]},
      {at: 5, rewards: [{id: 'o5a', title: '$15 store credit', icon: 'credit'}]},
      {at: 10, rewards: [
        {id: 'o10a', title: 'Pomelo gift box', icon: 'gift'},
        {id: 'o10b', title: '$30 off', sub: 'Min. order $80', icon: 'coupon'},
      ]},
    ],
  },
  {
    id: 'spend',
    name: 'Glow spender',
    kind: 'spend',
    unit: null,
    steps: [
      {at: 200, rewards: [{id: 's200a', title: '5% off all orders', icon: 'coupon'}]},
      {at: 500, rewards: [{id: 's500a', title: '$25 off', sub: 'Min. order $75', icon: 'coupon'}]},
      {at: 1000, rewards: [{id: 's1000a', title: 'Pomelo gift box', icon: 'gift'}]},
    ],
  },
];

/** The "Overflow" state: longest names and biggest numbers a merchant could plausibly set. */
export const OVERFLOW_PROGRAMS = [
  {
    ...PROGRAMS[0],
    name: 'Bring your friends and family along for the whole summer season',
    steps: [
      {at: 2, rewards: [
        {id: 'x2a', title: 'Free Pomelo Cloud Cream full size, Rose Water Mist and Night Repair Serum', icon: 'gift'},
        {id: 'x2b', title: '2,500 points added to your balance', icon: 'points'},
      ]},
      {at: 10, rewards: [{id: 'x10a', title: '$100 off your next order', sub: 'Min. order $250 · Skincare and body care only', icon: 'coupon'}]},
      {at: 25, rewards: [{id: 'x25a', title: 'Lifetime free shipping', icon: 'shipping'}]},
      {at: 50, rewards: [{id: 'x50a', title: 'Private skincare consultation', icon: 'gift'}]},
    ],
  },
  {...PROGRAMS[1], name: 'Order milestones for our most loyal Pomelo Park regulars'},
  {...PROGRAMS[2], steps: [
    {at: 2000, rewards: [{id: 'y1', title: '5% off all orders', icon: 'coupon'}]},
    {at: 12500, rewards: [{id: 'y2', title: '$250 off', sub: 'Min. order $300', icon: 'coupon'}]},
    {at: 25000, rewards: [{id: 'y3', title: 'Pomelo gift box', icon: 'gift'}]},
  ]},
];

/** How far the previewed member is, and which steps they already claimed (step value → reward id). */
export const PROGRESS = {
  member: {value: {refer: 2, orders: 4, spend: 320}, claimed: {refer: {}, orders: {3: 'o3a'}, spend: {200: 's200a'}}},
  done: {value: {refer: 5, orders: 10, spend: 1150}, claimed: {refer: {2: 'r2c', 3: 'r3a', 5: 'r5a'}, orders: {3: 'o3a', 5: 'o5a', 10: 'o10a'}, spend: {200: 's200a', 500: 's500a', 1000: 's1000a'}}},
  overflow: {value: {refer: 18, orders: 4, spend: 9870}, claimed: {refer: {10: 'x10a'}, orders: {3: 'o3a'}, spend: {2000: 'y1'}}},
};

export const money = (n) => `$${n.toLocaleString('en-US')}`;

/** "3 friends" / "1 order" / "$500". */
export function amount(program, n) {
  if (!program.unit) return money(n);
  return `${n.toLocaleString('en-US')} ${n === 1 ? program.unit[0] : program.unit[1]}`;
}

/** "2 of 5 friends referred" / "4 of 10 orders placed" / "$320 of $1,000 spent". */
export function progressText(program, value) {
  const max = program.steps[program.steps.length - 1].at;
  if (program.kind === 'referral') return {big: value.toLocaleString('en-US'), rest: `of ${max.toLocaleString('en-US')} friends referred`};
  if (program.kind === 'orders') return {big: value.toLocaleString('en-US'), rest: `of ${max.toLocaleString('en-US')} orders placed`};
  return {big: money(value), rest: `of ${money(max)} spent`};
}

/** Step title and the line under it, as on the custom block: "2 successful referrals" · "After referring 2 friends". */
export function stepTitle(program, at) {
  if (program.kind === 'referral') return `${at.toLocaleString('en-US')} successful referral${at === 1 ? '' : 's'}`;
  if (program.kind === 'orders') return `${at.toLocaleString('en-US')} order${at === 1 ? '' : 's'} placed`;
  return `${money(at)} spent`;
}
export function stepSub(program, at) {
  if (program.kind === 'referral') return `After referring ${amount(program, at)}`;
  if (program.kind === 'orders') return `After placing ${amount(program, at)}`;
  return `After spending ${money(at)}`;
}

/** What the shopper does to reach the next step. */
export function nextLine(program, left) {
  if (program.kind === 'referral') return `Refer ${amount(program, left)} more to unlock the next reward`;
  if (program.kind === 'orders') return `Place ${amount(program, left)} more to unlock the next reward`;
  return `Spend ${money(left)} more to unlock the next reward`;
}

/**
 * Derived numbers for one program: one formula for every surface (tab, accordion head, cards).
 * status per step: claimed · ready · current · locked (guest: always locked, no personal progress).
 */
export function progressOf(program, value, claimed = {}, guest = false) {
  let currentSet = false;
  const steps = program.steps.map((s) => {
    let status = 'locked';
    if (!guest) {
      if (claimed[s.at]) status = 'claimed';
      else if (value >= s.at) status = 'ready';
      else if (!currentSet) { status = 'current'; currentSet = true; }
    }
    return {...s, status, claimedId: claimed[s.at] || null};
  });
  const next = steps.find((s) => value < s.at) || null;
  const max = program.steps[program.steps.length - 1].at;
  return {
    steps,
    ready: steps.filter((s) => s.status === 'ready').length,
    unlocked: steps.filter((s) => s.status === 'claimed' || s.status === 'ready').length,
    total: steps.length,
    next,
    left: next ? next.at - value : 0,
    share: guest ? 0 : Math.max(0, Math.min(1, value / max)),
    max,
    value,
  };
}
