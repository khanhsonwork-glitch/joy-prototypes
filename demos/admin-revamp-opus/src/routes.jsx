// Route table: the first module whose resolve() returns an element wins. Modules never import each other's
// screens; cross-links are plain URLs (#/vip/tiers/t-gold).
import {resolve as home} from './modules/home/index.jsx';
import {resolve as programs} from './modules/programs/index.jsx';
import {resolve as vip} from './modules/vip/index.jsx';
import {resolve as store} from './modules/store/index.jsx';
import {resolve as customers} from './modules/customers/index.jsx';
import {resolve as analytics} from './modules/analytics/index.jsx';
import {resolve as integrations} from './modules/integrations/index.jsx';
import {resolve as settings} from './modules/settings/index.jsx';
import {resolve as crossapp} from './modules/crossapp/index.jsx';

export const RESOLVERS = [home, programs, vip, store, customers, analytics, integrations, settings, crossapp];
