import React, {useEffect} from 'react';
import {AppProvider, Card, Frame, Page} from '@shopify/polaris';
import en from '@shopify/polaris/locales/en.json';
import {AdminChrome} from './shell/AdminChrome.jsx';
import {HashLink, RouterProvider, useRoute} from './shell/router.jsx';
import {ShellProvider} from './shell/ShellContext.jsx';
import {ScenarioProvider, useShop} from './kit/scenario.jsx';
import {ProtoControls} from './kit/ProtoControls.jsx';
import {EmptyView} from './kit/StateView.jsx';
import {StoreProvider} from './state/store.jsx';
import {UpgradeProvider} from './components/UpgradeDialog.jsx';
import {ProgramsPage} from './pages/ProgramsPage.jsx';
import {PlaceOrderEdit, SignUpEdit} from './pages/EarningEdit.jsx';
import {FriendRewardEdit, ReferrerRewardEdit} from './pages/ReferralRewardEdit.jsx';
import {PlansPage} from './pages/PlansPage.jsx';
import {RedeemCreate} from './pages/RedeemCreate.jsx';
import {KitPage} from './pages/KitPage.jsx';
import {DEMO} from './demo.config.js';

// Routes (hash): #/redeem-add (default) · #/redeem · #/redeem-new/<option> · #/earning · #/earning-place-order ·
// #/earning-sign-up · #/earning-newsletter · #/referral · #/referral-reward · #/referral-friend-reward · #/plans · #/kit
// (#/milestones, #/quizzes, #/point-expiration, #/subscription-membership: tabs this prototype does not redraw)
const PROGRAM_TABS = ['earning', 'redeem', 'redeem-add', 'referral', 'milestones', 'quizzes', 'point-expiration', 'subscription-membership'];
const PAGES = {
  'earning-place-order': () => <PlaceOrderEdit />,
  'earning-sign-up': () => <SignUpEdit variant="sign-up" />,
  'earning-newsletter': () => <SignUpEdit variant="newsletter" />,
  'referral-reward': () => <ReferrerRewardEdit />,
  'referral-friend-reward': () => <FriendRewardEdit />,
  plans: () => <PlansPage />,
  kit: () => <KitPage />,
};

function NotFound() {
  return (
    <Page title="Page not found">
      <Card>
        <EmptyView heading="There's no page at this address" action={{content: 'Back to Reward programs', url: '/earning'}}>
          Check the link, or go back to Reward programs.
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
  const [first, second] = segments;
  let page = <NotFound />;
  if (segments.length === 1 && PROGRAM_TABS.includes(first)) page = <ProgramsPage />;
  else if (segments.length === 1 && PAGES[first]) page = PAGES[first]();
  else if (segments.length === 2 && first === 'redeem-new') page = <RedeemCreate key={second} slug={second} />;
  return <AdminChrome>{page}</AdminChrome>;
}

/** Saved edits live per shop: switching Free new / Free old / Essential starts from that shop's own programs. */
function ShopStore({children}) {
  const shop = useShop();
  return <StoreProvider key={shop.state} long={shop.long}>{children}</StoreProvider>;
}

export default function App() {
  return (
    <AppProvider i18n={en} linkComponent={HashLink}>
      <RouterProvider>
        <ScenarioProvider>
          <ShopStore>
            <Frame>
              <ShellProvider>
                <UpgradeProvider>
                  <Screen />
                  <ProtoControls />
                </UpgradeProvider>
              </ShellProvider>
            </Frame>
          </ShopStore>
        </ScenarioProvider>
      </RouterProvider>
    </AppProvider>
  );
}
