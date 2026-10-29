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

// Reward methods as the Joy admin names them today (ProgramOptionConfig.customerReferralRewardType / discountReferralType),
// plus the new referrer method this feature adds. Its label is a taste call for Alex: ?label=b shows the second wording.
export const TIERS_METHOD = 'point_order_tiers';
export const TIERS_METHOD_LABELS = {
  a: "Points by friend's first order value (tiers)",
  b: 'Points by order value tiers',
};
export const FRIEND_METHODS = [
  {label: 'Discount percentage', value: 'percentage'},
  {label: 'Discount fixed amount', value: 'amount'},
  {label: 'Store credit', value: 'store_credit_fixed'},
];
export const referrerMethods = (labelKey = 'a') => [
  {label: 'Store credit based on order value (Recommend)', value: 'store_credit_order_value'},
  {label: 'Points based on order value', value: 'point_order_value'},
  {label: TIERS_METHOD_LABELS[labelKey] || TIERS_METHOD_LABELS.a, value: TIERS_METHOD},
  {label: 'Store credit', value: 'store_credit_fixed'},
  {label: 'Discount percentage', value: 'percentage'},
  {label: 'Discount fixed amount', value: 'amount'},
  {label: 'Points reward', value: 'point'},
];
export const REFERRER_METHODS = referrerMethods();
// The friend's discount can follow tiers only when it is a code applied at checkout; store credit is given at claim.
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

/** The program as merchants have it today: one friend discount with a minimum order, a flat 100 points for the referrer. */
export const BASE_PROGRAM = {
  friendMethod: 'amount',
  friendValue: 5,
  friendMinOrder: 50,
  friendTiersOn: false,
  friendSameAmounts: true,
  friendTierValues: {},
  friendTiers: [],
  referrerMethod: 'point',
  referrerValue: 100,
  referrerVipRates: false,
  referrerMaxOn: true,
  referrerMax: 200,
  referrerTiers: [],
};

// Release 1: the referrer earns by the friend's first order value. Tier 1 = the old minimum and the old 100 points.
export const REFERRER_TIERS = [
  {id: 't1', min: '50', points: '100'},
  {id: 't2', min: '100.01', points: '200'},
];
// Release 2: the friend's discount by the same amounts.
export const FRIEND_TIER_VALUES = {t1: '5', t2: '10'};
// Worst case: a duplicate start amount, a tier that pays less than the one below, a blank value, 5 tiers.
export const WORST_TIERS = [
  {id: 'w1', min: '50', points: '100'},
  {id: 'w2', min: '250', points: '80'},
  {id: 'w3', min: '250', points: '2500'},
  {id: 'w4', min: '5000', points: ''},
  {id: 'w5', min: '12500.50', points: '100000'},
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
