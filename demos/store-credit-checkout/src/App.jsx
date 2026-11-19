import React, {useEffect} from 'react';
import {AppProvider, Card, Frame, Page} from '@shopify/polaris';
import en from '@shopify/polaris/locales/en.json';
import {AdminChrome} from './shell/AdminChrome.jsx';
import {HashLink, RouterProvider, useRoute} from './shell/router.jsx';
import {ShellProvider} from './shell/ShellContext.jsx';
import {ScenarioProvider} from './kit/scenario.jsx';
import {ProtoControls} from './kit/ProtoControls.jsx';
import {EmptyView} from './kit/StateView.jsx';
import {OnsiteProvider} from './state/onsite.jsx';
import {OnsitePage} from './pages/OnsitePage.jsx';
import {KitPage} from './pages/KitPage.jsx';
import {DEMO} from './demo.config.js';
import './styles/feature.css';

// Routes: #/demo (On-site content → Checkout page, Quick Redeem card) · #/kit (components).
function NotFound() {
  return (
    <Page title="Page not found">
      <Card>
        <EmptyView heading="There's no page at this address" action={{content: 'Back to On-site content', url: '/demo'}}>
          Check the link, or go back.
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
  if (segments[0] === 'demo' && (segments.length === 1 || segments[1] === 'checkout-page')) page = <OnsitePage />;
  else if (segments[0] === 'kit' && segments.length === 1) page = <KitPage />;
  return <AdminChrome>{page}</AdminChrome>;
}

export default function App() {
  return (
    <AppProvider i18n={en} linkComponent={HashLink}>
      <RouterProvider>
        <ScenarioProvider>
          <OnsiteProvider>
            <Frame>
              <ShellProvider>
                <Screen />
                <ProtoControls />
              </ShellProvider>
            </Frame>
          </OnsiteProvider>
        </ScenarioProvider>
      </RouterProvider>
    </AppProvider>
  );
}
