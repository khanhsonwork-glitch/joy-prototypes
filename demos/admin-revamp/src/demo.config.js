// The one file `npm run new` rewrites for a new prototype. Edit by hand to rename or re-point the app nav.
// Revamp menu: the program is set up in one place (Program), Membership and Reward programs are gone as separate
// modules. No Home item: the app name row in Shopify's nav already opens the app home (Alex 18/11).
export const DEMO = {
  name: "Admin revamp — Polaris 2",
  product: "loyalty",
  pageTitle: 'Loyalty program',
  detailTitle: 'All tiers side by side',
  titles: {home: 'Home', demo: 'Home', program: 'Program', referrals: 'Program', customers: 'Customers'},
  menu: [
    {id: 'program', label: 'Program', href: '#/program', routes: ['program', 'referrals']},
    {id: 'customers', label: 'Customers', href: '#/customers', routes: ['customers']},
    {id: 'onsite', label: 'On your store'},
    {id: 'analytics', label: 'Analytics'},
    {id: 'settings', label: 'Settings'},
  ],
};
