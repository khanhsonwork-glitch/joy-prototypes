// The approved sub-menu of each module (joy-admin-revamp-map), shown as pills on the module's list pages so every
// page in the map is one click away even though the Shopify app nav only shows the top level.
import React from 'react';
import {Box} from '@shopify/polaris';
import {ModuleNav} from './parts.jsx';
import {useStore} from '../state/store.jsx';
import {useRoute} from '../shell/router.jsx';

export function SectionNav({section, bare = false}) {
  const {db} = useStore();
  const {path} = useRoute();
  const pending = db.reviewQueue.filter(q => q.status === 'pending').length;
  const sets = {
    programs: [['All programs', '/programs'], ['Points', '/programs/points'], ['Referrals', '/programs/referrals'], ['Milestones', '/programs/milestones'], ['Quizzes', '/programs/quizzes']],
    vip: [['Overview', '/vip'], ['VIP tiers', '/vip/tiers'], ['Member deals', '/vip/deals'], ['Paid membership', '/vip/paid'], db.shop.b2b && ['Partner tiers', '/vip/partners']],
    customers: [['Customers', '/customers'], ['To review', '/customers/review', pending], ['Activity', '/customers/activity'], db.shop.b2b && ['Companies', '/customers/companies']],
    store: [['Where customers see it', '/store'], ['Wallet pass', '/store/wallet']],
  };
  const items = (sets[section] ?? []).filter(Boolean).map(([label, url, count]) => ({label, url, count, active: path === url}));
  return bare ? <ModuleNav items={items} /> : <Box paddingBlockEnd="400"><ModuleNav items={items} /></Box>;
}
