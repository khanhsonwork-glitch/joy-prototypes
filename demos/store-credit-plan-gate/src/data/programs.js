// Reward programs of the fictional shop (Pomelo Park). Labels are the Joy admin's English text; numbers are made up.

/** Plan the badge names (Joy: getLabelPlan of the preferred Essential plan). */
export const BADGE_PLAN = 'Essential';

/**
 * "Add new redeem program" options, in the order the modal lists them (spendingProgramsI18n minus the
 * events the Online store modal excludes: Free shipping, Free product, Custom partner voucher).
 * proPlan = already paid-only today. storeCredit = the option this feature gates for new Free shops.
 */
export const REDEEM_OPTIONS = [
  {slug: 'discount-amount', title: 'Discount amount', icon: 'money',
    subtitle: 'Recommended: Fixed amounts make cashback predictable and easy to control.'},
  {slug: 'discount-percentage', title: 'Discount percentage', icon: 'percent',
    subtitle: 'Use with caution: Percentage discounts change with cart value, so rewards can be less predictable and harder to manage.'},
  {slug: 'store-credit', title: 'Store credit', icon: 'money', storeCredit: true,
    subtitle: 'Let customers redeem points for store credit they can spend on any order.'},
  {slug: 'buy-x-get-y', title: 'Buy X get Y', icon: 'product', proPlan: true,
    subtitle: 'Buy X Get Y is ideal for boosting order size or moving specific products.'},
  {slug: 'gift-card', title: 'Gift card', icon: 'gift-card',
    subtitle: 'Reward customers with a Shopify gift card delivered by email. Works for self-redeem and gifting.'},
  {slug: 'environmental-impact', title: 'Environmental impact', icon: 'leaf', proPlan: true,
    subtitle: 'Let customers redeem points to fund environmental impact projects.'},
];

const LONG_TITLE = 'Spend your points on the Glow Getter Set, the Overnight Glow Mask and every refill in the Night Notes collection';

/** Redeeming programs tab, block by block. Rows depend on the shop: a new Free shop cannot have a store credit program. */
export function redeemData(shop) {
  if (shop.state === 'empty') return {discount: [], storeCredit: []};
  const discount = [
    {id: 'd1', title: '$5 off coupon', type: 'Discount amount', icon: 'money', status: 'active', desc: 'Discount $5 for 500 points'},
    {id: 'd2', title: '10% off coupon', type: 'Discount percentage', icon: 'percent', status: 'draft', desc: 'Discount 10% for 1,000 points'},
  ];
  const storeCredit = shop.storeCreditLocked ? [] : [
    {id: 's1', title: '$5 store credit', type: 'Store credit', icon: 'money', status: 'active', desc: '$5 store credit for 500 points'},
  ];
  if (!shop.long) return {discount, storeCredit};
  const long = [
    {id: 'o1', title: LONG_TITLE, type: 'Discount amount', icon: 'money', status: 'active', desc: 'Discount $1,250 for 98,765,432 points'},
    ...discount,
  ];
  if (shop.state === 'overflow') return {discount: long, storeCredit};
  return {
    discount: [
      ...long,
      ...Array.from({length: 9}, (_, i) => ({
        id: `w${i}`, title: `Seasonal coupon ${i + 1}: ${['Spring', 'Summer', 'Autumn', 'Winter'][i % 4]} collection, members only`,
        type: i % 2 ? 'Discount percentage' : 'Discount amount', icon: i % 2 ? 'percent' : 'money', status: i % 3 ? 'active' : 'draft',
        desc: i % 2 ? `Discount ${5 + i}% for ${(i + 1) * 250} points` : `Discount $${5 + i} for ${(i + 1) * 250} points`,
      })),
    ],
    storeCredit,
  };
}

/** Earning programs tab: Purchase rewards and Engagement rewards. `route` = the edit page this prototype builds. */
export function earningData(shop) {
  if (shop.state === 'empty') return {purchase: [], engagement: []};
  const purchase = [
    {id: 'p1', title: shop.long ? LONG_TITLE : 'Place an order', event: 'Place order', reward: shop.long ? 'Earn 98,765 points for every $1' : 'Earn 1 point for every $1',
      priority: 99, start: '2026-11-20', end: '', status: 'active', route: '/earning-place-order', icon: 'order'},
  ];
  const engagement = [
    {id: 'e1', title: 'Sign Up', event: 'Sign up', reward: 'Earn 100 points', start: '2026-11-20', end: '', status: 'active', route: '/earning-sign-up', icon: 'person'},
    {id: 'e2', title: 'Sign up for newsletter', event: 'Sign up for newsletter', reward: 'Earn 50 points', start: '2026-11-20', end: '', status: 'inactive', route: '/earning-newsletter', icon: 'email'},
  ];
  if (shop.state !== 'worst') return {purchase, engagement};
  return {
    purchase: [
      ...purchase,
      ...Array.from({length: 6}, (_, i) => ({
        id: `wp${i}`, title: `Place an order · ${['Spring', 'Summer', 'Autumn', 'Winter'][i % 4]} double points week ${i + 1}`, event: 'Place order',
        reward: `Earn ${2 + i} points for every $1`, priority: 90 + i, start: '2026-12-01', end: '2026-12-31', status: 'inactive', route: '/earning-place-order', icon: 'order',
      })),
    ],
    engagement,
  };
}

/** Referrer ("Rewards for referrers") reward methods: customerReferralRewardTypeI18n, in the app's order. */
export const REFERRER_METHODS = [
  {label: 'Store credit based on order value (Recommend)', value: 'store_credit_order_value', storeCredit: true},
  {label: 'Points based on order value', value: 'point_order_value'},
  {label: 'Store credit', value: 'store_credit_fixed', storeCredit: true},
  {label: 'Discount percentage', value: 'percentage'},
  {label: 'Discount fixed amount', value: 'fixed_amount'},
  {label: 'Points reward', value: 'point'},
];

/** Referee ("Rewards for referees") reward methods: discountReferralTypeI18n. */
export const FRIEND_METHODS = [
  {label: 'Discount percentage', value: 'percentage'},
  {label: 'Discount fixed amount', value: 'fixed_amount'},
  {label: 'Store credit', value: 'store_credit_fixed', storeCredit: true},
];

export const methodLabel = (list, value) => list.find((m) => m.value === value)?.label ?? value;

/** Place an order › Rewarding method (earnPointOptions): wording follows the reward type. */
export const EARN_METHODS = {
  point: [
    {label: 'Give X points for every Y amount spent', value: 'price'},
    {label: 'Give X points once when spending reaches Y', value: 'fixed_price'},
    {label: 'Give X points for every Y items purchased', value: 'quantity'},
    {label: 'Give X points for each order', value: 'order'},
  ],
  store_credit: [
    {label: 'Give X store credit for every Y amount spent', value: 'price'},
    {label: 'Give X store credit once when spending reaches Y', value: 'fixed_price'},
    {label: 'Give X store credit for every Y items purchased', value: 'quantity'},
    {label: 'Give X store credit for each order', value: 'order'},
  ],
};

/** Plans page stub: monthly price and free orders from the 2026 plan table. */
export const PLANS = [
  {id: 'free', name: 'Starter', price: 'Free forever', orders: 250},
  {id: 'essential', name: 'Essential', price: '$29/month', orders: 500},
  {id: 'advanced', name: 'Advanced', price: '$129/month', orders: 2000},
  {id: 'ultimate', name: 'Ultimate', price: '$499/month', orders: 7000},
];
