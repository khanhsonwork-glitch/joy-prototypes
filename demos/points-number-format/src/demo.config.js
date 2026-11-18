// The one file `npm run new` rewrites for a new prototype. Edit by hand to rename or re-point the app nav.
// Menu = Joy's sub-items in the new Shopify admin nav (getAppNavigation.js on avada/master; Integrations sits under
// View more on the 17/11 production screenshot).
export const DEMO = {
  name: 'Points number format',
  product: 'loyalty',
  home: '#/settings',
  menu: [
    {id: 'customers', label: 'Customers'},
    {id: 'rewards', label: 'Reward programs'},
    {id: 'membership', label: 'Membership'},
    {id: 'onsite', label: 'On-site content'},
    {id: 'analytics', label: 'Analytics'},
    {id: 'settings', label: 'Settings', href: '#/settings', routes: ['settings', 'translations']},
    {id: 'more', label: 'View more'},
  ],
  // Title bar text per route, like the admin title bar Joy fills from each page's title.
  titleFor: (segments) => {
    if (segments[0] === 'kit') return 'Components and tokens';
    if (segments[0] === 'translations' || segments[2] === 'editor') return 'Unified widget';
    if (segments[0] === 'settings' && segments[1] === 'translations') return 'Translations';
    if (segments[0] === 'settings' && segments.length === 1) return 'General';
    return 'Page not found';
  },
  // Parent crumb before the title, as the real title bar shows 'Back to Translations / Unified widget' (18/11/2026).
  crumbFor: (segments) => (segments[0] === 'translations' || segments[2] === 'editor' ? 'Back to Translations' : null),
  // Back chevron: the editor goes back to Settings › Translations (backAction in Translations/Sections/index.js).
  backFor: (segments) => (segments[0] === 'translations' || segments[2] === 'editor' ? '/settings/translations' : null),
};
