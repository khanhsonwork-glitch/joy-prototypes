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
import {Onsite} from './pages/Onsite.jsx';
import {LoyaltyPageEditor} from './pages/LoyaltyPageEditor.jsx';
import './styles/editor.css';
import './styles/storefront.css';
import {KitPage} from './pages/KitPage.jsx';
import {DEMO} from './demo.config.js';

// Routes: #/onsite · #/loyalty-page-editor · #/loyalty-page-editor/milestones (block selected) · #/kit (components).
function NotFound() {
  return (
    <Page title="Page not found">
      <Card>
        <EmptyView heading="There's no page at this address" action={{content: 'Back to On-site content', url: '/onsite'}}>
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
  if (segments[0] === 'onsite' && segments.length === 1) page = <Onsite />;
  else if (segments[0] === 'loyalty-page-editor' && segments.length <= 2) page = <LoyaltyPageEditor key={segments[1] || 'editor'} />;
  else if (segments[0] === 'kit' && segments.length === 1) page = <KitPage />;
  return <AdminChrome wide={segments[0] === 'loyalty-page-editor'}>{page}</AdminChrome>;
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
