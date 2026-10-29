import React, {useEffect} from 'react';
import {AppProvider, Card, Frame, Page} from '@shopify/polaris';
import en from '@shopify/polaris/locales/en.json';
import {AdminChrome} from './shell/AdminChrome.jsx';
import {HashLink, RouterProvider, useRoute} from './shell/router.jsx';
import {ShellProvider} from './shell/ShellContext.jsx';
import {ScenarioProvider} from './kit/scenario.jsx';
import {ProtoControls} from './kit/ProtoControls.jsx';
import {EmptyView} from './kit/StateView.jsx';
import {ProtoProvider} from './state/proto.jsx';
import {UpgradeProvider} from './pages/shared.jsx';
import {ProgramsPage} from './pages/ProgramsPage.jsx';
import {PlaceOrderEdit} from './pages/PlaceOrderEdit.jsx';
import {BirthdayEdit} from './pages/BirthdayEdit.jsx';
import {KitPage} from './pages/KitPage.jsx';
import {DEMO} from './demo.config.js';

// Routes: #/demo (Reward programs › Earning programs) · #/demo/place-order/<id> · #/demo/birthday · #/kit.
// ?shop=new|old|downgraded&plan=starter|essential|advanced in the hash picks the case under review.
function NotFound() {
  return (
    <Page title="Page not found">
      <Card>
        <EmptyView heading="There's no page at this address" action={{content: 'Back to reward programs', url: '/demo'}}>
          Check the link, or go back to your reward programs.
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
  if (segments[0] === 'demo' && segments.length === 1) page = <ProgramsPage />;
  else if (segments[0] === 'demo' && segments[1] === 'place-order' && segments.length <= 3) page = <PlaceOrderEdit />;
  else if (segments[0] === 'demo' && segments[1] === 'birthday' && segments.length === 2) page = <BirthdayEdit />;
  else if (segments[0] === 'kit' && segments.length === 1) page = <KitPage />;
  return <AdminChrome>{page}</AdminChrome>;
}

export default function App() {
  return (
    <AppProvider i18n={en} linkComponent={HashLink}>
      <RouterProvider>
        <ScenarioProvider>
          <Frame>
            <ShellProvider>
              <ProtoProvider>
                <UpgradeProvider>
                  <Screen />
                  <ProtoControls />
                </UpgradeProvider>
              </ProtoProvider>
            </ShellProvider>
          </Frame>
        </ScenarioProvider>
      </RouterProvider>
    </AppProvider>
  );
}
