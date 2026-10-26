import React, {useEffect} from 'react';
import {AppProvider, Card, Frame, Page} from '@shopify/polaris';
import en from '@shopify/polaris/locales/en.json';
import {AdminChrome} from './shell/AdminChrome.jsx';
import {HashLink, RouterProvider, useRoute} from './shell/router.jsx';
import {ShellProvider} from './shell/ShellContext.jsx';
import {ScenarioProvider} from './kit/scenario.jsx';
import {ProtoControls} from './kit/ProtoControls.jsx';
import {EmptyView} from './kit/StateView.jsx';
import {RewardsProvider} from './state/rewards.jsx';
import {RewardsList} from './pages/RewardsList.jsx';
import {RewardEdit} from './pages/RewardEdit.jsx';
import {KitPage} from './pages/KitPage.jsx';
import {DEMO} from './demo.config.js';

// Routes: #/demo (list) · #/demo/new · #/demo/<id> · #/kit (components). Replace the reward screens with your feature.
function NotFound() {
  return (
    <Page title="Page not found">
      <Card>
        <EmptyView heading="There's no page at this address" action={{content: 'Back to rewards', url: '/demo'}}>
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
  if (segments[0] === 'demo' && segments.length === 1) page = <RewardsList />;
  else if (segments[0] === 'demo' && segments.length === 2) page = <RewardEdit key={segments[1]} id={segments[1]} />;
  else if (segments[0] === 'kit' && segments.length === 1) page = <KitPage />;
  return <AdminChrome>{page}</AdminChrome>;
}

export default function App() {
  return (
    <AppProvider i18n={en} linkComponent={HashLink}>
      <RouterProvider>
        <ScenarioProvider>
          <RewardsProvider>
            <Frame>
              <ShellProvider>
                <Screen />
                <ProtoControls />
              </ShellProvider>
            </Frame>
          </RewardsProvider>
        </ScenarioProvider>
      </RouterProvider>
    </AppProvider>
  );
}
