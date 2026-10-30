import React, {useEffect} from 'react';
import {AppProvider, Card, Frame, Page} from '@shopify/polaris';
import en from '@shopify/polaris/locales/en.json';
import {AdminChrome} from './shell/AdminChrome.jsx';
import {HashLink, RouterProvider, useRoute} from './shell/router.jsx';
import {ShellProvider} from './shell/ShellContext.jsx';
import {ScenarioProvider} from './kit/scenario.jsx';
import {ProtoControls} from './kit/ProtoControls.jsx';
import {EmptyView} from './kit/StateView.jsx';
import {LinksProvider} from './state/links.jsx';
import {Programs} from './pages/Programs.jsx';
import {Settings} from './pages/Settings.jsx';
import {RewardEdit} from './pages/RewardEdit.jsx';
import {MilestoneEdit} from './pages/MilestoneEdit.jsx';
import {WaysToEarn} from './pages/WaysToEarn.jsx';
import './styles/links.css';
import {KitPage} from './pages/KitPage.jsx';
import {DEMO} from './demo.config.js';

// Routes: #/demo (list) · #/demo/new · #/demo/<id> · #/kit (components). Replace the reward screens with your feature.
function NotFound() {
  return (
    <Page title="Page not found">
      <Card>
        <EmptyView heading="There's no page at this address" action={{content: 'Back to Settings', url: '/settings'}}>
          Check the link, or go back to the list.
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
  let page = <NotFound />;
  // #/settings (Settings › General › Redemption behavior) · #/reward (Free product edit) · #/milestone (Milestone edit)
  // · #/earn?program=order|instagram (On-site content › Ways to earn › Edit) · #/programs?type=redeem|milestone (the lists that open them) · #/kit
  if (segments[0] === 'settings' && segments.length === 1) page = <Settings />;
  else if (segments[0] === 'reward' && segments.length === 1) page = <RewardEdit />;
  else if (segments[0] === 'milestone' && segments.length === 1) page = <MilestoneEdit />;
  else if (segments[0] === 'earn' && segments.length === 1) page = <WaysToEarn />;
  else if ((segments[0] === 'programs' || segments[0] === 'demo') && segments.length === 1) page = <Programs />;
  else if (segments[0] === 'kit' && segments.length === 1) page = <KitPage />;
  return <AdminChrome>{page}</AdminChrome>;
}

export default function App() {
  return (
    <AppProvider i18n={en} linkComponent={HashLink}>
      <RouterProvider>
        <ScenarioProvider>
          <LinksProvider>
            <Frame>
              <ShellProvider>
                <Screen />
                <ProtoControls />
              </ShellProvider>
            </Frame>
          </LinksProvider>
        </ScenarioProvider>
      </RouterProvider>
    </AppProvider>
  );
}
