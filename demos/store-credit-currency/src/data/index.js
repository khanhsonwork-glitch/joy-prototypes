// Pomelo Park: the fictional skincare shop used across Joy prototypes.
// Every person, email and number here is made up. Never paste real merchant or customer data.

export const STORE = {
  name: 'Pomelo Park',
  domain: 'pomelopark.com',
  email: 'hello@pomelopark.com',
  owner: 'Rosa',
  ownerEmail: 'rosa@pomelopark.com',
  plan: 'Advanced',
  currency: 'USD',
};

const POINTS = {point: 1240, totalEarned: 1640, totalExpired: 0, totalAdminAdjustments: 0, totalRedeemed: 400, totalRefunded: 0};

/**
 * One customer per review scenario (?state=…). `orderCurrency` is the currency of the customer's most recent
 * order (null = no orders). `accounts` mirrors Shopify: one store credit account per currency, zero balances included.
 * `statsByCurrency` mirrors customer.storeCreditStats.byCurrency on the real page.
 */
export const CUSTOMERS = {
  // Shop in USD, customer pays in SGD; an admin credited $20 in the shop currency, the SGD account is empty.
  default: {
    id: 'mia-tan',
    name: 'Mia Tan',
    email: 'mia.tan@example.com',
    phone: '+6565550142',
    lastOrder: '2 weeks ago',
    locale: 'English (Singapore) (en-SG)',
    since: '11 months ago',
    country: 'Singapore (auto)',
    stats: {aov: 41.2, ltv: 370.8, orders: 9, rfm: 'Loyal'},
    orderCurrency: 'SGD',
    accounts: [
      {currencyCode: 'USD', amount: 20},
      {currencyCode: 'SGD', amount: 0},
    ],
    statsByCurrency: {USD: {totalAdded: 20, totalDeducted: 0}},
    points: POINTS,
    tags: ['Active subscriber', 'Login with Shop', 'newsletter', 'source:popup'],
    activities: [
      {day: 'November 2, 2026', rows: [{text: 'Admin credited 20.00 USD store credit', time: '10:02 AM'}]},
      {day: 'October 20, 2026', rows: [{text: 'User placed order', time: '8:14 PM'}]},
    ],
  },
  // Customer only ever paid in the shop currency (rule B8).
  same: {
    id: 'ava-nguyen',
    name: 'Ava Nguyen',
    email: 'ava@example.com',
    phone: '+12025550173',
    lastOrder: '5 days ago',
    locale: 'English (United States) (en-US)',
    since: '1 year ago',
    country: 'United States (auto)',
    stats: {aov: 52.4, ltv: 628.8, orders: 12, rfm: 'Active'},
    orderCurrency: 'USD',
    accounts: [{currencyCode: 'USD', amount: 20}],
    statsByCurrency: {USD: {totalAdded: 25, totalDeducted: 5}},
    points: {...POINTS, point: 860, totalEarned: 1260},
    tags: ['newsletter', 'VIP'],
    activities: [
      {day: 'October 29, 2026', rows: [{text: 'User placed order', time: '11:40 AM'}]},
    ],
  },
  // No store credit account yet, orders paid in EUR (rule B3: EUR is offered and preselected).
  new: {
    id: 'lena-hoffmann',
    name: 'Lena Hoffmann',
    email: 'lena.hoffmann@example.com',
    phone: '+4930555019',
    lastOrder: '3 days ago',
    locale: 'German (Germany) (de-DE)',
    since: '4 months ago',
    country: 'Germany (auto)',
    stats: {aov: 38.9, ltv: 116.7, orders: 3, rfm: 'Promising'},
    orderCurrency: 'EUR',
    accounts: [],
    statsByCurrency: {},
    points: {...POINTS, point: 120, totalEarned: 120, totalRedeemed: 0},
    tags: ['newsletter'],
    activities: [
      {day: 'October 31, 2026', rows: [{text: 'User placed order', time: '9:05 AM'}]},
    ],
  },
  // Signed up, never ordered: no order currency, so no hint (rule B7).
  noorders: {
    id: 'ben-carter',
    name: 'Ben Carter',
    email: 'ben@example.com',
    phone: '',
    lastOrder: '',
    locale: 'English (United States) (en-US)',
    since: '2 weeks ago',
    country: 'United States (auto)',
    stats: {aov: 0, ltv: 0, orders: 0, rfm: 'Prospects'},
    orderCurrency: null,
    accounts: [],
    statsByCurrency: {},
    points: {...POINTS, point: 100, totalEarned: 100, totalRedeemed: 0},
    tags: [],
    activities: [{day: 'October 20, 2026', rows: [{text: 'Sign Up', time: '4:31 PM'}]}],
  },
};
