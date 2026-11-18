// Revamp menu, approved by Alex 18/11 (joy-admin-revamp-map.vercel.app). Order follows how a merchant builds a
// program: rules → loyalty perks → what customers see → customers → results. No Home item: the app name row in
// Shopify's nav opens the app home.
export const DEMO = {
  name: 'Joy admin revamp',
  product: 'loyalty',
  titles: {home: 'Home', programs: 'Programs', vip: 'VIP & membership', store: 'On your store', customers: 'Customers',
    analytics: 'Analytics', integrations: 'Integrations', settings: 'Settings', wishlist: 'Wishlist', subscription: 'Subscription'},
  menu: [
    {id: 'programs', label: 'Programs', href: '#/programs', routes: ['programs'], children: [
      {id: 'all', label: 'All programs', href: '#/programs', match: ['programs']},
      {id: 'points', label: 'Points', href: '#/programs/points', match: ['programs/points']},
      {id: 'referrals', label: 'Referrals', href: '#/programs/referrals', match: ['programs/referrals']},
      {id: 'milestones', label: 'Milestones', href: '#/programs/milestones', match: ['programs/milestones']},
      {id: 'quizzes', label: 'Quizzes', href: '#/programs/quizzes', match: ['programs/quizzes']},
    ]},
    {id: 'vip', label: 'VIP & membership', href: '#/vip', routes: ['vip'], children: [
      {id: 'overview', label: 'Overview', href: '#/vip', match: ['vip']},
      {id: 'tiers', label: 'VIP tiers', href: '#/vip/tiers', match: ['vip/tiers']},
      {id: 'deals', label: 'Member deals', href: '#/vip/deals', match: ['vip/deals']},
      {id: 'paid', label: 'Paid membership', href: '#/vip/paid', match: ['vip/paid']},
      {id: 'partners', label: 'Partner tiers', href: '#/vip/partners', match: ['vip/partners']},
    ]},
    {id: 'store', label: 'On your store', href: '#/store', routes: ['store']},
    {id: 'customers', label: 'Customers', href: '#/customers', routes: ['customers']},
    {id: 'analytics', label: 'Analytics', href: '#/analytics', routes: ['analytics']},
    {id: 'integrations', label: 'Integrations', href: '#/integrations', routes: ['integrations']},
    {id: 'settings', label: 'Settings', href: '#/settings', routes: ['settings']},
    {id: 'wishlist', label: 'Wishlist', href: '#/wishlist', routes: ['wishlist']},
    {id: 'subscription', label: 'Subscription', href: '#/subscription', routes: ['subscription']},
  ],
};
