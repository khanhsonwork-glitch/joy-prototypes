// Shop-level sample data: the fictional skincare shop North Bloom. Made up; no real merchant or customer data.
export const shop = {
  name: 'North Bloom', domain: 'northbloom.com', email: 'hello@northbloom.example', owner: 'Rosa', ownerEmail: 'rosa@northbloom.example',
  plan: 'advanced', shopifyPlan: 'Shopify', currency: 'USD', timezone: '(UTC-08:00) Pacific Time', b2b: true, shopifyPlus: false,
  createdAt: '2025-03-02',
};

// Program status, the point itself and the base earn rate. Points module owns editing these.
export const program = {
  status: 'live', // live | sandbox | paused
  launchedAt: '2025-04-01',
  testCustomers: ['ava@inbox.example'],
  point: {singular: 'point', plural: 'points', placement: 'after', value: {points: 100, money: 1}},
  expiry: {mode: 'inactivity', months: 12, remindDays: 14}, // never | inactivity | fixed
};

export const tiers = [
  {id: 't-member', name: 'Member', threshold: 0, multiplier: 1, color: '#d9d9d9', members: 3912, keep: null, tag: 'joy-member',
    perks: ['Birthday reward'], entryReward: null},
  {id: 't-silver', name: 'Silver', threshold: 300, multiplier: 1.25, color: '#c0c6cf', members: 984, keep: 12, tag: 'joy-silver',
    perks: ['Free shipping over $40', 'Early access to sales'], entryReward: {type: 'points', value: 200}},
  {id: 't-gold', name: 'Gold', threshold: 800, multiplier: 1.5, color: '#e3b44f', members: 351, keep: 12, tag: 'joy-gold',
    perks: ['Free shipping on every order', 'Early access to sales', 'Free gift twice a year'], entryReward: {type: 'discount', value: 10}},
  {id: 't-vip', name: 'VIP', threshold: 2000, multiplier: 2, color: '#1f1f1f', members: 72, keep: 12, tag: 'joy-vip',
    perks: ['Free shipping on every order', 'Private sale', 'Personal skin consult', 'Free gift every quarter'], entryReward: {type: 'product', value: 'Glow Getter Set'}},
];

export const tierSettings = {
  enabled: true, rule: 'spent', // spent | points | orders
  period: 'rolling12', startDate: '2025-04-01', demotion: {mode: 'end_of_period', graceDays: 30},
  syncTags: true, entryRewardOnRelaunch: false,
};

export const segments = [
  {id: 'seg-vip-spenders', name: 'Spent over $500', size: 1260},
  {id: 'seg-lapsed', name: 'No order in 90 days', size: 2714},
  {id: 'seg-newsletter', name: 'Newsletter subscribers', size: 5402},
];
