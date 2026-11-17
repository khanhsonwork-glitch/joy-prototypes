import React, {useEffect} from 'react';
import {AppProvider, Card, Frame, Page} from '@shopify/polaris';
import en from '@shopify/polaris/locales/en.json';
import {AdminChrome} from './shell/AdminChrome.jsx';
import {HashLink, RouterProvider, useRoute} from './shell/router.jsx';
import {ShellProvider} from './shell/ShellContext.jsx';
import {ScenarioProvider, useScenario, useShop} from './kit/scenario.jsx';
import {ProtoControls} from './kit/ProtoControls.jsx';
import {EmptyView} from './kit/StateView.jsx';
import {StoreProvider} from './state/store.jsx';
import {MembershipPage} from './pages/MembershipPage.jsx';
import {PartnerTierPage} from './pages/PartnerTierPage.jsx';
import {SettingsPage} from './pages/SettingsPage.jsx';
import {KitPage} from './pages/KitPage.jsx';
import {DEMO} from './demo.config.js';

// Routes (hash): #/membership (default) · #/wholesale/vip (?type=design for the Design tab) · #/settings/general
// (?plan=essential[&excluded=1]) · #/kit (components sheet). Joy URLs: /membership, /wholesale/vip, /settings?type=general.
function NotFound() {
  return (
    <Page title="Page not found">
      <Card>
        <EmptyView heading="There's no page at this address" action={{content: 'Back to Membership', url: '/membership'}}>
          Check the link, or go back to Membership.
        </EmptyView>
      </Card>
    </Page>
  );
}

function Screen() {
  const {path} = useRoute();
  const {planKey} = useShop();
  useEffect(() => {
    document.title = `${DEMO.name} · Joy prototype`;
  }, []);
  let page = <NotFound />;
  if (path === '/membership') page = <MembershipPage />;
  else if (path === '/wholesale/vip') page = <PartnerTierPage />;
  else if (path === '/settings' || path === '/settings/general') page = <SettingsPage key={planKey} />;
  else if (path === '/kit') page = <KitPage />;
  return <AdminChrome>{page}</AdminChrome>;
}

/** Each shop starts from its own saved data. Unsaved edits on the open page stay, so a reviewer can tick
 *  "Exclude B2B customers", then switch shop and watch the warning come and go. */
function ShopStore({children}) {
  const {state} = useScenario();
  return <StoreProvider shopKey={state}>{children}</StoreProvider>;
}

export default function App() {
  return (
    <AppProvider i18n={en} linkComponent={HashLink}>
      <RouterProvider>
        <ScenarioProvider>
          <ShopStore>
            <Frame>
              <ShellProvider>
                <Screen />
                <ProtoControls />
              </ShellProvider>
            </Frame>
          </ShopStore>
        </ScenarioProvider>
      </RouterProvider>
    </AppProvider>
  );
}
