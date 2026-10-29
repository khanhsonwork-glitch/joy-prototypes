import React, {useEffect} from 'react';
import {AppProvider, Card, Frame, Page} from '@shopify/polaris';
import en from '@shopify/polaris/locales/en.json';
import {AdminChrome} from './shell/AdminChrome.jsx';
import {HashLink, RouterProvider, useRoute} from './shell/router.jsx';
import {ShellProvider} from './shell/ShellContext.jsx';
import {ScenarioProvider} from './kit/scenario.jsx';
import {ProtoControls} from './kit/ProtoControls.jsx';
import {EmptyView} from './kit/StateView.jsx';
import {ProgramProvider} from './state/program.jsx';
import {ReferralProgram} from './pages/ReferralProgram.jsx';
import {RefereeRewards, ReferrerRewards} from './pages/RewardEditPages.jsx';
import {Storefront} from './pages/Storefront.jsx';
import {KitPage} from './pages/KitPage.jsx';
import {DEMO} from './demo.config.js';

// Routes: #/demo (Reward programs ▸ Referrals) · #/demo/referrer (tiers: new reward method) · #/demo/referee (release 2) ·
// #/demo/storefront (widget, claim popup, checkout, email; no admin chrome) · #/kit (components).
function NotFound() {
  return (
    <Page title="Page not found">
      <Card>
        <EmptyView heading="There's no page at this address" action={{content: 'Back to referral program', url: '/demo'}}>
          Check the link, or go back to the referral program.
        </EmptyView>
      </Card>
    </Page>
  );
}

function Screen() {
  const {segments} = useRoute();
  useEffect(() => {
    document.title = `${DEMO.name} · Joy prototype`;
  }, []);
  if (segments[0] === 'demo' && segments[1] === 'storefront' && segments.length === 2) return <Storefront />;
  let page = <NotFound />;
  if (segments[0] === 'demo' && segments.length === 1) page = <ReferralProgram />;
  else if (segments[0] === 'demo' && segments[1] === 'referrer' && segments.length === 2) page = <ReferrerRewards />;
  else if (segments[0] === 'demo' && segments[1] === 'referee' && segments.length === 2) page = <RefereeRewards />;
  else if (segments[0] === 'kit' && segments.length === 1) page = <KitPage />;
  return <AdminChrome>{page}</AdminChrome>;
}

export default function App() {
  return (
    <AppProvider i18n={en} linkComponent={HashLink}>
      <RouterProvider>
        <ScenarioProvider>
          <ProgramProvider>
            <Frame>
              <ShellProvider>
                <Screen />
                <ProtoControls />
              </ShellProvider>
            </Frame>
          </ProgramProvider>
        </ScenarioProvider>
      </RouterProvider>
    </AppProvider>
  );
}
