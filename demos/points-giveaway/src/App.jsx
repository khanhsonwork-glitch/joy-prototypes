import React from 'react';
import {AppProvider, BlockStack, Button, Card, Frame, Page, Text} from '@shopify/polaris';
import en from '@shopify/polaris/locales/en.json';
import {AdminChrome} from './shell/AdminChrome.jsx';
import {HashLink, RouterProvider, useRoute} from './shell/router.jsx';
import {ShellProvider} from './shell/ShellContext.jsx';
import {StoreProvider} from './state/store.jsx';
import HomePage from './pages/HomePage.jsx';
import MembershipPage from './pages/MembershipPage.jsx';
import GiveawayList from './pages/GiveawayList.jsx';
import GiveawayEditor from './pages/GiveawayEditor.jsx';
import GiveawayDetail from './pages/GiveawayDetail.jsx';
import CustomersPage from './pages/CustomersPage.jsx';
import Journey from './storefront/Journey.jsx';
import ViewControls from './shell/ViewControls.jsx';
import {useStore} from './state/store.jsx';
import {isGiven} from './data/giveaways.js';

function NotFound() {
  return (
    <Page title="Page not found" backAction={{content: 'Membership', url: '/membership'}}>
      <Card>
        <BlockStack gap="300">
          <Text as="p" variant="bodyMd">
            The page you’re looking for could not be found.
          </Text>
          <div>
            <Button url="/membership">Back to Membership</Button>
          </div>
        </BlockStack>
      </Card>
    </Page>
  );
}

function GiveawayRoute({id}) {
  const {giveaways} = useStore();
  if (!id) return <GiveawayList />;
  if (id === 'new') return <GiveawayEditor key="new" />;
  const g = giveaways.find((x) => x.id === id);
  if (!g) return <NotFound />;
  return isGiven(g) ? <GiveawayDetail key={`${id}-given`} g={g} /> : <GiveawayEditor key={`${id}-edit`} existing={g} />;
}

function Routes() {
  const {segments} = useRoute();
  switch (segments[0]) {
    case 'home':
      return <HomePage />;
    case 'membership':
      return <MembershipPage />;
    case 'customers':
      return <CustomersPage />;
    case 'points-giveaway':
      return <GiveawayRoute id={segments[1]} />;
    default:
      return <NotFound />;
  }
}

function Screen() {
  const route = useRoute();
  const section = route.segments[0];
  React.useEffect(() => {
    if (section !== 'store') document.title = section === 'points-giveaway' ? 'Points Giveaway · Joy' : 'Joy: Loyalty Program';
  }, [section, route.path]);
  if (section === 'store') return <Journey />;
  return (
    <>
      <AdminChrome>
        <Routes />
      </AdminChrome>
      <ViewControls />
    </>
  );
}

export default function App() {
  return (
    <AppProvider i18n={en} linkComponent={HashLink}>
      <RouterProvider>
        <StoreProvider>
          <Frame>
            <ShellProvider>
              <Screen />
            </ShellProvider>
          </Frame>
        </StoreProvider>
      </RouterProvider>
    </AppProvider>
  );
}
