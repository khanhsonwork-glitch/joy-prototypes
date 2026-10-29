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

export const VIP_TIERS = [
  {id: 'silver', name: 'Silver'},
  {id: 'gold', name: 'Gold'},
  {id: 'platinum', name: 'Platinum'},
];

// Reward methods as the Joy admin names them today.
export const FRIEND_METHODS = [
  {label: 'Discount fixed amount', value: 'amount'},
  {label: 'Discount percentage', value: 'percentage'},
  {label: 'Store credit', value: 'store_credit_fixed'},
];
export const REFERRER_METHODS = [
  {label: 'Store credit based on order value (Recommend)', value: 'store_credit_order_value'},
  {label: 'Points based on order value', value: 'point_order_value'},
  {label: 'Store credit', value: 'store_credit_fixed'},
  {label: 'Discount percentage', value: 'percentage'},
  {label: 'Discount fixed amount', value: 'amount'},
  {label: 'Points reward', value: 'point'},
];

// Methods whose value can change per tier. The two "based on order value" methods already grow with the order,
// and the friend's store credit is given when the friend claims, before any cart exists.
export const TIERABLE_REFERRER = ['point', 'amount', 'percentage', 'store_credit_fixed'];
export const TIERABLE_FRIEND = ['amount', 'percentage'];
export const MAX_TIERS = 5;

export const methodLabel = (list, value) => list.find((m) => m.value === value)?.label ?? value;

const two = new Intl.NumberFormat('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
const whole = new Intl.NumberFormat('en-US', {maximumFractionDigits: 2});
export const num = (n) => whole.format(Number(n) || 0);
/** $50 · $100.01 · $12,500.50 — cents only when there are cents. */
export const money = (n) => {
  const v = Number(n) || 0;
  return `$${Number.isInteger(v) ? whole.format(v) : two.format(v)}`;
};
/** Always two decimals, the way checkout prints amounts. */
export const money2 = (n) => `$${two.format(Number(n) || 0)}`;

/** The program as saved before this feature: one friend reward with a minimum order, one referrer reward. */
export const BASE_PROGRAM = {
  friendMethod: 'amount',
  friendValue: 5,
  friendMinOrder: 50,
  referrerMethod: 'point',
  referrerValue: 100,
  referrerVipRates: false,
  referrerMaxOn: true,
  referrerMax: 200,
  tiersOn: false,
  tierFriend: true,
  tierReferrer: true,
  tiers: [],
};

export const CONFIGURED_TIERS = [
  {id: 't1', min: '50', friend: '5', referrer: '100'},
  {id: 't2', min: '100.01', friend: '10', referrer: '200'},
];

export const OVERFLOW_TIERS = [
  {id: 'o1', min: '50', friend: '5', referrer: '100'},
  {id: 'o2', min: '250', friend: '25', referrer: '2500'},
  {id: 'o3', min: '1000', friend: '100', referrer: '25000'},
  {id: 'o4', min: '5000', friend: '500', referrer: '250000'},
  {id: 'o5', min: '12500.50', friend: '1250', referrer: '1000000'},
];

// Worst case: a duplicate start amount, a tier that pays less than the one below, a discount bigger than its order, a blank value.
export const WORST_TIERS = [
  {id: 'w1', min: '50', friend: '5', referrer: '100'},
  {id: 'w2', min: '250', friend: '25', referrer: '80'},
  {id: 'w3', min: '250', friend: '300', referrer: '25000'},
  {id: 'w4', min: '5000', friend: '', referrer: '250000'},
  {id: 'w5', min: '12500.50', friend: '1250', referrer: '1000000'},
];

/** Referrals of the signed-in member, as the storefront lists them. */
export const MY_REFERRALS = [
  {id: 'f1', name: 'Ben Carter', status: 'completed', subtotal: 120, reward: '200 points'},
  {id: 'f2', name: 'Chloe Martin', status: 'pending', subtotal: 45},
  {id: 'f3', name: 'Dana Lee', status: 'pending', subtotal: null},
];

// Kept for the component sheet at #/kit.
export const REWARDS = [
  {id: 'r1', name: '$5 off your next order', type: 'amount', value: 5, points: 500, status: 'active', redemptions: 1284},
  {id: 'r2', name: '10% off sitewide', type: 'percent', value: 10, points: 1000, status: 'active', redemptions: 642},
  {id: 'r3', name: 'Free shipping', type: 'shipping', value: 0, points: 300, status: 'active', redemptions: 2210},
];
export const typeLabel = (value) => ({amount: 'Amount discount', percent: 'Percentage discount', shipping: 'Free shipping'})[value] ?? value;
