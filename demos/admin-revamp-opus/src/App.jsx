import React, {useEffect} from 'react';
import {AppProvider, Card, Frame} from '@shopify/polaris';
import en from '@shopify/polaris/locales/en.json';
import {AdminChrome} from './shell/AdminChrome.jsx';
import {HashLink, RouterProvider, useRoute} from './shell/router.jsx';
import {ShellProvider} from './shell/ShellContext.jsx';
import {ScenarioProvider} from './kit/scenario.jsx';
import {ProtoControls} from './kit/ProtoControls.jsx';
import {EmptyView} from './kit/StateView.jsx';
import {StoreProvider} from './state/store.jsx';
import {SaveBarProvider} from './ui/SaveBar.jsx';
import {PageFrame, TitleBarProvider} from './ui/page.jsx';
import {KitPage} from './pages/KitPage.jsx';
import {RESOLVERS} from './routes.jsx';
import {DEMO} from './demo.config.js';

function NotFound() {
  return (
    <PageFrame title="Page not found">
      <Card>
        <EmptyView heading="There's no page at this address" action={{content: 'Go to Home', url: '/home'}}>
          Check the link, or open a page from the menu.
        </EmptyView>
      </Card>
    </PageFrame>
  );
}

function Screen() {
  const {segments, query} = useRoute();
  const first = segments[0] || 'home';
  useEffect(() => {
    document.title = `${DEMO.titles[first] ?? 'Joy'} · Joy admin revamp`;
  }, [first]);
  let page = null;
  if (first === 'kit') page = <KitPage />;
  else {
    const route = segments.length ? segments : ['home'];
    for (const resolve of RESOLVERS) {
      page = resolve(route, query);
      if (page) break;
    }
  }
  return <AdminChrome>{page ?? <NotFound />}</AdminChrome>;
}

export default function App() {
  return (
    <AppProvider i18n={en} linkComponent={HashLink}>
      <RouterProvider>
        <ScenarioProvider>
          <StoreProvider>
            <Frame>
              <ShellProvider>
                <TitleBarProvider>
                  <SaveBarProvider>
                    <Screen />
                    <ProtoControls />
                  </SaveBarProvider>
                </TitleBarProvider>
              </ShellProvider>
            </Frame>
          </StoreProvider>
        </ScenarioProvider>
      </RouterProvider>
    </AppProvider>
  );
}
