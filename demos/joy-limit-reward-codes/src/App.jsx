import React, {useEffect} from 'react';
import {AppProvider, Card, Frame, Page} from '@shopify/polaris';
import en from '@shopify/polaris/locales/en.json';
import {AdminChrome} from './shell/AdminChrome.jsx';
import {HashLink, RouterProvider, useRoute} from './shell/router.jsx';
import {ShellProvider} from './shell/ShellContext.jsx';
import {ScenarioProvider, useScenario} from './kit/scenario.jsx';
import {ProtoControls} from './kit/ProtoControls.jsx';
import {EmptyView} from './kit/StateView.jsx';
import {LimitProvider} from './state/limit.jsx';
import {Settings} from './pages/Settings.jsx';
import {Checkout} from './pages/Checkout.jsx';
import {KitPage} from './pages/KitPage.jsx';
import {DEMO} from './demo.config.js';

// Routes: #/settings (Settings › Additional features, new card; ?type=general for General) · #/checkout (Shopify checkout) · #/kit.
// The Checkout state (#/settings?state=checkout) shows the checkout too, so every state has a link on #/settings.
function NotFound() {
  return (
    <Page title="Page not found">
      <Card>
        <EmptyView heading="There's no page at this address" action={{content: 'Back to Settings', url: '/settings'}}>
          Check the link, or go back to Settings.
        </EmptyView>
      </Card>
    </Page>
  );
}

function Screen() {
  const {segments} = useRoute();
  const {state} = useScenario();
  useEffect(() => {
    document.title = `${DEMO.name} · Joy prototype`;
  }, []);
  if (segments[0] === 'checkout' || (segments[0] === 'settings' && state === 'checkout')) return <Checkout key={state} />;
  let page = <NotFound />;
  if (segments[0] === 'settings' && segments.length === 1) page = <Settings />;
  else if (segments[0] === 'kit' && segments.length === 1) page = <KitPage />;
  return <AdminChrome>{page}</AdminChrome>;
}

export default function App() {
  return (
    <AppProvider i18n={en} linkComponent={HashLink}>
      <RouterProvider>
        <ScenarioProvider>
          <LimitProvider>
            <Frame>
              <ShellProvider>
                <Screen />
                <ProtoControls />
              </ShellProvider>
            </Frame>
          </LimitProvider>
        </ScenarioProvider>
      </RouterProvider>
    </AppProvider>
  );
}
