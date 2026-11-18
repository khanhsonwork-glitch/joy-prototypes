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
import {KitPage} from './pages/KitPage.jsx';
import {Home} from './pages/Home.jsx';
import {ProgramBuilder} from './pages/ProgramBuilder.jsx';
import {ProgramOverview} from './pages/ProgramOverview.jsx';
import {Customers, Referrals} from './pages/Others.jsx';
import {DEMO} from './demo.config.js';

// Routes: #/home · #/program (?tier=) · #/program/overview · #/referrals · #/customers (?tier=) · #/kit.
function NotFound() {
  return (
    <Page title="Page not found">
      <Card>
        <EmptyView heading="There's no page at this address" action={{content: 'Back to program', url: '/program'}}>
          Check the link, or go back to the program.
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
  if (first === 'home' || first === 'demo') page = <Home />;
  else if (first === 'program' && !second) page = <ProgramBuilder />;
  else if (first === 'program' && second === 'overview') page = <ProgramOverview />;
  else if (first === 'referrals') page = <Referrals />;
  else if (first === 'customers') page = <Customers />;
  else if (first === 'kit') page = <KitPage />;
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
