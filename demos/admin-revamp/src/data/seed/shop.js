// Shop-level sample data: the fictional skincare shop Pomelo Park. Made up; no real merchant or customer data.
export const shop = {
  name: 'Pomelo Park', domain: 'pomelopark.com', email: 'hello@pomelopark.com', owner: 'Rosa', ownerEmail: 'rosa@pomelopark.com',
  plan: 'advanced', shopifyPlan: 'Shopify', currency: 'USD', timezone: '(UTC-08:00) Pacific Time', b2b: true, shopifyPlus: false,
  createdAt: '2025-03-02',
};

// Program status, the point itself and the base earn rate. Points module owns editing these.
export const program = {
  status: 'live', // live | sandbox | paused
  launchedAt: '2025-04-01',
  testCustomers: ['ava@example.com'],
  point: {singular: 'point', plural: 'points', placement: 'after', value: {points: 100, money: 1}},
  expiry: {mode: 'inactivity', months: 12, remindDays: 14}, // never | inactivity | fixed
};

export const tiers = [
  {id: 't-member', name: 'Member', status: 'active', threshold: 0, multiplier: 1, color: '#d9d9d9', members: 3912, keep: null, tag: 'joy-member', hideDefault:false, tierPoints:0, additionalName:'',
    perks: ['Birthday reward'], entryReward: null, icon: 'bronze', exclusive: false, preReward: {enabled: false, within: 50, type: 'points', value: 50}},
  {id: 't-silver', name: 'Silver', status: 'active', threshold: 300, multiplier: 1.25, color: '#c0c6cf', members: 984, keep: 12, tag: 'joy-silver', hideDefault:false, tierPoints:300, additionalName:'',
    perks: ['Free shipping over $40', 'Early access to sales'], entryReward: {type: 'points', value: 200}, icon: 'silver', exclusive: false, preReward: {enabled: false, within: 50, type: 'points', value: 50}},
  {id: 't-gold', name: 'Gold', status: 'active', threshold: 800, multiplier: 1.5, color: '#e3b44f', members: 351, keep: 12, tag: 'joy-gold', hideDefault:false, tierPoints:800, additionalName:'',
    perks: ['Free shipping on every order', 'Early access to sales', 'Free gift twice a year'], entryReward: {type: 'discount', value: 10}, icon: 'gold', exclusive: false, preReward: {enabled: true, within: 100, type: 'points', value: 100}},
  {id: 't-vip', name: 'VIP', status: 'active', threshold: 2000, multiplier: 2, color: '#1f1f1f', members: 72, keep: 12, tag: 'joy-vip', hideDefault:false, tierPoints:2000, additionalName:'',
    perks: ['Free shipping on every order', 'Private sale', 'Personal skin consult', 'Free gift every quarter'], entryReward: {type: 'product', value: 'Glow Getter Set'}, icon: 'black', exclusive: false, preReward: {enabled: false, within: 100, type: 'points', value: 100}},
];

export const tierSettings = {
  enabled: true, rule: 'spent', // spent | points | orders
  period: 'rolling12', startDate: '2025-04-01', demotion: {mode: 'end_of_period', graceDays: 30},
  syncTags: true, syncMetafields: true, tagPrefix: 'joy', pointsFrom: 'paid', excludeRefunds: true,
  entryRewardOnRelaunch: false, entryRewardRepeat: false, launchStatus: 'launched',
  demotionNotify: true, demotionGraceDays: 30, inactiveDays: 180,
  design: {view:'after',badgeStyle: 'rounded', showProgress: true, showStoreCredit: true, balanceLayout: 'columns', balanceOrder: 'points', hideZeroCredit: true, cardFooter: 'background', alignment: 'center', opacity: 100, boxColor:'#ffffff', textColor:'#101010', iconColor:'#101010', buttonColor:'#0c0c0c'},
  tierPointEditing:false, demotionAction:'previous', warningDays:14, tierAssessment:false, assessmentCycle:12, assessmentOffset:0, rewardAudience:'skip', launchNotes:'',
  partnerB2B: {rule:'spent',startDate:'2025-04-01',status:'active',syncTags:true,launchStatus:'launched'},
};

export const segments = [
  {id: 'seg-vip-spenders', name: 'Spent over $500', size: 1260},
  {id: 'seg-lapsed', name: 'No order in 90 days', size: 2714},
  {id: 'seg-newsletter', name: 'Newsletter subscribers', size: 5402},
];
