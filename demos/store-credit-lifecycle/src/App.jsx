import React, {useEffect} from 'react';
import {AppProvider, Card, Frame, Page} from '@shopify/polaris';
import en from '@shopify/polaris/locales/en.json';
import {AdminChrome} from './shell/AdminChrome.jsx';
import {HashLink, RouterProvider, useRoute} from './shell/router.jsx';
import {ShellProvider} from './shell/ShellContext.jsx';
import {ScenarioProvider} from './kit/scenario.jsx';
import {ProtoControls} from './kit/ProtoControls.jsx';
import {EmptyView} from './kit/StateView.jsx';
import {Storefront} from './pages/Storefront.jsx';
import {KlaviyoPage} from './pages/KlaviyoPage.jsx';
import {KitPage} from './pages/KitPage.jsx';
import './styles/feature.css';
import {DEMO} from './demo.config.js';

// Routes (each opens its screen directly):
//  #/widget                    Widget V4 home, store credit balance card with its expiry line
//  #/widget/store-credit       Widget V4 store credit history (tap the balance card)
//  #/account/rewards           Shopify customer account › Loyalty Hub page, "Store credit:" box, one expiry line per wallet
//  #/account/profile           Shopify customer account › Profile, Joy block, same per-wallet lines
//  #/integrations/klaviyo      Admin Joy › Integrations › Klaviyo (?triggers=open opens the trigger list)
//  #/kit                       Components and tokens
// ?state= picks the data on any route (Prototype button, bottom right).
function NotFound() {
  return (
    <Page title="Page not found">
      <Card>
        <EmptyView heading="There's no page at this address" action={{content: 'Open the widget', url: '/widget'}}>
          Check the link, or open the widget screen.
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
  const path = segments.join('/');
  if (['widget', 'widget/store-credit', 'account/rewards', 'account/profile', 'demo'].includes(path)) return <Storefront />;
  let page = <NotFound />;
  if (path === 'integrations/klaviyo') page = <KlaviyoPage />;
  else if (path === 'kit') page = <KitPage />;
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
