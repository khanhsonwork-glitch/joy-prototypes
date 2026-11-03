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
  // Currencies the shop sells in today (its markets), shop currency first.
  currencies: ['USD', 'SGD', 'EUR'],
};

const POINTS = {point: 1240, totalEarned: 1640, totalExpired: 0, totalAdminAdjustments: 0, totalRedeemed: 400, totalRefunded: 0};

/**
 * One customer per review scenario (?state=…).
 * orders12m: orders of the last 12 months by the currency paid at checkout. lastBrowsedCurrency: storefront currency
 * of the last visit. addressMarketCurrency: currency of the market that contains the default address.
 * accounts mirrors Shopify: one store credit account per currency, zero balances included.
 * statsByCurrency mirrors customer.storeCreditStats.byCurrency on the real page.
 */
const MIA = {
  id: 'mia-tan',
  name: 'Mia Tan',
  email: 'mia.tan@example.com',
  phone: '+6565550142',
  lastOrder: '2 weeks ago',
  locale: 'English (Singapore) (en-SG)',
  since: '11 months ago',
  country: 'Singapore (auto)',
  stats: {aov: 41.2, ltv: 370.8, orders: 9, rfm: 'Loyal'},
  orders12m: [
    {currencyCode: 'SGD', count: 8, lastOrderAt: '2026-10-20'},
    {currencyCode: 'USD', count: 1, lastOrderAt: '2026-03-02'},
  ],
  lastBrowsedCurrency: 'SGD',
  addressMarketCurrency: 'SGD',
  accounts: [
    {currencyCode: 'USD', amount: 20},
    {currencyCode: 'SGD', amount: 0},
  ],
  statsByCurrency: {USD: {totalAdded: 20, totalDeducted: 0}},
  points: POINTS,
  tags: ['Active subscriber', 'Login with Shop', 'newsletter', 'source:popup'],
  activities: [
    {day: 'November 2, 2026', rows: [{storeCredit: {amount: 20, code: 'USD'}, time: '10:02 AM'}]},
    {day: 'October 20, 2026', rows: [{text: 'User placed order', time: '8:14 PM'}]},
  ],
};

export const CUSTOMERS = {
  // Shop in USD, most orders paid in SGD (step a); an admin credited $20 in USD, the SGD account is empty.
  default: MIA,
  // Customer only ever paid in the shop currency: suggestion = USD, nothing to explain.
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
    orders12m: [{currencyCode: 'USD', count: 12, lastOrderAt: '2026-10-29'}],
    lastBrowsedCurrency: 'USD',
    addressMarketCurrency: 'USD',
    accounts: [{currencyCode: 'USD', amount: 20}],
    statsByCurrency: {USD: {totalAdded: 25, totalDeducted: 5}},
    points: {...POINTS, point: 860, totalEarned: 1260},
    tags: ['newsletter', 'VIP'],
    activities: [{day: 'October 29, 2026', rows: [{text: 'User placed order', time: '11:40 AM'}]}],
  },
  // No orders, last browsed the storefront in EUR, no default address (step b).
  browsed: {
    id: 'lena-hoffmann',
    name: 'Lena Hoffmann',
    email: 'lena.hoffmann@example.com',
    phone: '',
    lastOrder: '',
    locale: 'German (Germany) (de-DE)',
    since: '3 weeks ago',
    country: '',
    stats: {aov: 0, ltv: 0, orders: 0, rfm: 'Prospects'},
    orders12m: [],
    lastBrowsedCurrency: 'EUR',
    addressMarketCurrency: null,
    accounts: [],
    statsByCurrency: {},
    points: {...POINTS, point: 100, totalEarned: 100, totalRedeemed: 0},
    tags: ['newsletter'],
    activities: [{day: 'October 13, 2026', rows: [{text: 'Sign Up', time: '9:05 AM'}]}],
  },
  // No orders, never browsed, default address in Singapore (step c). Typical of customers imported from another app.
  address: {
    id: 'hana-lim',
    name: 'Hana Lim',
    email: 'hana.lim@example.com',
    phone: '+6565550188',
    lastOrder: '',
    locale: 'English (Singapore) (en-SG)',
    since: '1 week ago',
    country: 'Singapore (auto)',
    stats: {aov: 0, ltv: 0, orders: 0, rfm: 'Prospects'},
    orders12m: [],
    lastBrowsedCurrency: null,
    addressMarketCurrency: 'SGD',
    accounts: [],
    statsByCurrency: {},
    points: {...POINTS, point: 0, totalEarned: 0, totalRedeemed: 0},
    tags: [],
    activities: [{day: 'October 27, 2026', rows: [{text: 'Sign Up', time: '2:16 PM'}]}],
  },
  // Nothing to go on: no orders, no browsing, no default address (step d, shop currency).
  noorders: {
    id: 'ben-carter',
    name: 'Ben Carter',
    email: 'ben@example.com',
    phone: '',
    lastOrder: '',
    locale: 'English (United States) (en-US)',
    since: '2 weeks ago',
    country: '',
    stats: {aov: 0, ltv: 0, orders: 0, rfm: 'Prospects'},
    orders12m: [],
    lastBrowsedCurrency: null,
    addressMarketCurrency: null,
    accounts: [],
    statsByCurrency: {},
    points: {...POINTS, point: 100, totalEarned: 100, totalRedeemed: 0},
    tags: [],
    activities: [{day: 'October 20, 2026', rows: [{text: 'Sign Up', time: '4:31 PM'}]}],
  },
  // Same customer as default, but the suggestion could not be worked out.
  error: {...MIA, suggestionFailed: true},
  // Same customer as default while Joy is still working out the suggestion.
  loading: {...MIA, suggestionPending: true},
  // Shop that sells only USD: the Currency field stays locked, the tab only gains codes.
  single: {
    id: 'noah-williams',
    name: 'Noah Williams',
    email: 'noah.williams@example.com',
    phone: '+12025550119',
    lastOrder: '3 weeks ago',
    locale: 'English (United States) (en-US)',
    since: '8 months ago',
    country: 'United States (auto)',
    stats: {aov: 47.5, ltv: 285, orders: 6, rfm: 'Active'},
    orders12m: [{currencyCode: 'USD', count: 6, lastOrderAt: '2026-10-12'}],
    lastBrowsedCurrency: 'USD',
    addressMarketCurrency: 'USD',
    accounts: [{currencyCode: 'USD', amount: 15}],
    statsByCurrency: {USD: {totalAdded: 15, totalDeducted: 0}},
    points: {...POINTS, point: 540, totalEarned: 540, totalRedeemed: 0},
    tags: ['newsletter'],
    activities: [
      {day: 'October 14, 2026', rows: [{storeCredit: {amount: 15, code: 'USD'}, time: '3:20 PM'}]},
      {day: 'October 12, 2026', rows: [{text: 'User placed order', time: '6:02 PM'}]},
    ],
  },
};

/** The shop each scenario runs in: the single-currency scenario sells only USD. */
export const shopFor = (state) => (state === 'single' ? {...STORE, currencies: ['USD']} : STORE);
