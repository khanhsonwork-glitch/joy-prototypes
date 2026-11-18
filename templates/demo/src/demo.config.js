// The one file `npm run new` rewrites for a new prototype. Edit by hand to rename or re-point the app nav.
export const DEMO = {
  name: 'Starter kit',
  product: 'loyalty',
  pageTitle: 'Rewards',
  detailTitle: 'Reward details',
  menu: [
    {id: 'customers', label: 'Customers'},
    {id: 'rewards', label: 'Reward programs', href: '#/demo', routes: ['demo']},
    {id: 'membership', label: 'Membership'},
    {id: 'onsite', label: 'On-site content'},
    {id: 'analytics', label: 'Analytics'},
    {id: 'integrations', label: 'Integrations'},
    {id: 'more', label: 'View more'},
  ],
};
