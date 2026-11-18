// The seed of the one store (state/store.jsx). Each module owns its file; add slices here, never rename keys
// another module reads. Keys: shop, program, tiers, tierSettings, segments, earn, redeem, referral, milestones,
// quizzes, deals, paidPlans, partnerTiers, customers, activity, reviewQueue, companies, profiles, whitelist, imports, stats, settings, onsite,
// integrations.
import {shop, program, tiers, tierSettings, segments} from './shop.js';
import {earn, redeem} from './programs.js';
import {referral, milestones, quizzes} from './growth.js';
import {deals, paidPlans, partnerTiers} from './membership.js';
import {customers, activity, reviewQueue, companies} from './customers.js';
import {last30, daily} from './stats.js';
import {general, brand, email, notifications, order, prelaunch, translations, developers, additional} from './settings.js';
import {surfaces, wallet, theme} from './onsite.js';
import {apps} from './integrations.js';
import {home} from './home.js';
import {moreActivity, profiles, whitelist, imports, moreApps} from './opus.js';

export const SEED = {
  shop, program, tiers, tierSettings, segments,
  earn, redeem, referral, milestones, quizzes,
  deals, paidPlans, partnerTiers,
  customers, activity: [...activity, ...moreActivity], reviewQueue, companies, profiles, whitelist, imports,
  stats: {last30, daily},
  settings: {general, brand, email, order, prelaunch, translations, developers, additional},
  notifications,
  onsite: {surfaces, wallet, theme},
  integrations: [...apps, ...moreApps],
  home,
};
