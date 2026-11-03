import React, {useEffect} from 'react';
import {AppProvider, Card, Frame, Page} from '@shopify/polaris';
import en from '@shopify/polaris/locales/en.json';
import {AdminChrome} from './shell/AdminChrome.jsx';
import {HashLink, RouterProvider, useRoute} from './shell/router.jsx';
import {ShellProvider} from './shell/ShellContext.jsx';
import {ScenarioProvider, useScenario} from './kit/scenario.jsx';
import {ProtoControls} from './kit/ProtoControls.jsx';
import {EmptyView} from './kit/StateView.jsx';
import {CustomerDetail} from './pages/CustomerDetail.jsx';
import {DEMO} from './demo.config.js';

// Routes: #/customer (customer page, Store credit tab) · #/customer?modal=adjust (Adjust store credit modal open).
// Scenario: ?state=same|new|noorders|loading after the route.
function NotFound() {
  return (
    <Page title="Page not found">
      <Card>
        <EmptyView heading="There's no page at this address" action={{content: 'Back to customer', url: '/customer'}}>
          Check the link, or go back to the customer page.
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
  let page = <NotFound />;
  // Keyed by scenario: switching customer in the Prototype panel starts that customer's page fresh.
  if (segments[0] === 'customer' && segments.length === 1) page = <CustomerDetail key={state} />;
  return <AdminChrome>{page}</AdminChrome>;
}

export default function App() {
  return (
    <AppProvider i18n={en} linkComponent={HashLink}>
      <RouterProvider>
        <ScenarioProvider>
          <Frame>
            <ShellProvider>
              <Screen />
              <ProtoControls />
            </ShellProvider>
          </Frame>
        </ScenarioProvider>
      </RouterProvider>
    </AppProvider>
  );
}
