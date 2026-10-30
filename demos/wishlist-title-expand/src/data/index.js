// Pomelo Park: the fictional skincare shop used across Joy prototypes.
// Every person, email and number here is made up. Never paste real merchant or customer data.

export const STORE = {
  name: 'Pomelo Park',
  domain: 'pomelopark.com',
  email: 'hello@pomelopark.com',
  owner: 'Rosa',
  ownerEmail: 'rosa@pomelopark.com',
  plan: 'Advanced',
};

export const MEMBERS = [
  {id: 'm1', name: 'Ava Nguyen', email: 'ava@example.com', points: 1240, tier: 'Gold'},
  {id: 'm2', name: 'Ben Carter', email: 'ben@example.com', points: 320, tier: 'Silver'},
  {id: 'm3', name: 'Chloe Martin', email: 'chloe@example.com', points: 0, tier: 'Member'},
];

export const REWARD_TYPES = [
  {label: 'Amount discount', value: 'amount'},
  {label: 'Percentage discount', value: 'percent'},
  {label: 'Free shipping', value: 'shipping'},
  {label: 'Free product', value: 'product'},
];

export const typeLabel = (value) => REWARD_TYPES.find((t) => t.value === value)?.label ?? value;

/** Redemption rewards of the fictional shop: the sample feature the starter screens are built on. */
export const REWARDS = [
  {id: 'r1', name: '$5 off your next order', type: 'amount', value: 5, points: 500, status: 'active', redemptions: 1284, minSpend: 30, updated: '2026-10-21',
    activity: [
      {id: 'a1', who: 'Ava Nguyen', what: 'Redeemed for order #1043', when: 'Oct 24, 2026 · 2:12 PM'},
      {id: 'a2', who: 'Rosa (staff)', what: 'Changed points from 400 to 500', when: 'Oct 21, 2026 · 9:30 AM'},
      {id: 'a3', who: 'Ben Carter', what: 'Redeemed for order #1031', when: 'Oct 19, 2026 · 6:47 PM'},
    ]},
  {id: 'r2', name: '10% off sitewide', type: 'percent', value: 10, points: 1000, status: 'active', redemptions: 642, minSpend: 0, updated: '2026-10-18',
    activity: [{id: 'a4', who: 'Chloe Martin', what: 'Redeemed for order #1040', when: 'Oct 23, 2026 · 11:05 AM'}]},
  {id: 'r3', name: 'Free shipping', type: 'shipping', value: 0, points: 300, status: 'active', redemptions: 2210, minSpend: 25, updated: '2026-10-02', activity: []},
  {id: 'r4', name: 'Free Pomelo Cloud Cream mini', type: 'product', value: 18, points: 1500, status: 'draft', redemptions: 0, minSpend: 0, updated: '2026-10-25', activity: []},
  {id: 'r5', name: '$15 off orders over $100', type: 'amount', value: 15, points: 1200, status: 'draft', redemptions: 0, minSpend: 100, updated: '2026-10-25', activity: []},
];

/** Overflow state: the longest values a merchant can realistically type, to prove nothing breaks or hides. */
export const OVERFLOW_REWARDS = [
  {id: 'o1', name: '$25 off the Glow Getter Set, the Overnight Glow Mask and every refill cartridge in the Night Notes collection', type: 'amount', value: 25, points: 2500000, status: 'active', redemptions: 98765432, minSpend: 1000, updated: '2026-10-25', activity: []},
  {id: 'o2', name: 'Free-shipping-for-VIP-members-only-during-the-holiday-season-campaign-2026', type: 'shipping', value: 0, points: 1, status: 'draft', redemptions: 0, minSpend: 0, updated: '2026-10-25', activity: []},
  ...REWARDS.slice(0, 3),
];

/** Worst case: overflow plus many rows (and the screens add a failed-sync banner). */
export const WORST_REWARDS = [
  ...OVERFLOW_REWARDS,
  ...Array.from({length: 24}, (_, i) => ({
    id: `w${i + 1}`, name: `Seasonal reward ${i + 1} — ${['Spring', 'Summer', 'Autumn', 'Winter'][i % 4]} collection, members only`,
    type: REWARD_TYPES[i % 4].value, value: 5 + i, points: 250 * (i + 1), status: i % 3 ? 'active' : 'draft', redemptions: i * 137, minSpend: i * 5, updated: '2026-10-20', activity: [],
  })),
];

export const num = (n) => Math.round(n).toLocaleString('en-US');
export const pointsLabel = (n) => `${num(n)} ${Math.round(n) === 1 ? 'point' : 'points'}`;
export const money = (n) => `$${Number(n).toLocaleString('en-US', {maximumFractionDigits: 2})}`;
export const dateLabel = (iso) => new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
