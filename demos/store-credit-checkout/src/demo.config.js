// The one file `npm run new` rewrites for a new prototype. Edit by hand to rename or re-point the app nav.
export const DEMO = {
  name: "Store credit at checkout",
  product: "loyalty",
  pageTitle: "On-site content",
  titleFor: () => "On-site content",
  backFor: () => null,
  menu: [
    {id: 'customers', label: 'Customers'},
    {id: 'rewards', label: 'Reward programs'},
    {id: 'membership', label: 'Membership'},
    {id: 'onsite', label: 'On-site content', href: '#/demo', routes: ['demo']},
    {id: 'analytics', label: 'Analytics'},
    {id: 'integrations', label: 'Integrations'},
    {id: 'settings', label: 'Settings'},
  ],
};
