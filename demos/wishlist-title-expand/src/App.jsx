import React, {useEffect} from 'react';
import {AppProvider, Card, Frame, Page} from '@shopify/polaris';
import en from '@shopify/polaris/locales/en.json';
import {AdminChrome} from './shell/AdminChrome.jsx';
import {HashLink, RouterProvider, useRoute} from './shell/router.jsx';
import {ShellProvider} from './shell/ShellContext.jsx';
import {ScenarioProvider} from './kit/scenario.jsx';
import {ProtoControls} from './kit/ProtoControls.jsx';
import {EmptyView} from './kit/StateView.jsx';
import {SettingsProvider} from './state/settings.jsx';
import {OnsiteContent} from './pages/OnsiteContent.jsx';
import {WidgetEditor} from './editor/WidgetEditor.jsx';
import {Storefront} from './pages/Storefront.jsx';
import {KitPage} from './pages/KitPage.jsx';
import {DEMO} from './demo.config.js';

// Routes: #/demo (admin: On-site content) · #/demo/widget-editor (Widget design editor, opened from Unified widget › Setup)
// · #/demo/storefront (shopper view, no admin chrome) · #/kit (components).
function NotFound() {
  return (
    <Page title="Page not found">
      <Card>
        <EmptyView heading="There's no page at this address" action={{content: 'Back to On-site content', url: '/demo'}}>
          Check the link, or go back to the list.
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
  if (segments[0] === 'demo' && segments[1] === 'storefront' && segments.length === 2) return <Storefront />;
  let page = <NotFound />;
  if (segments[0] === 'demo' && segments.length === 1) page = <OnsiteContent />;
  else if (segments[0] === 'demo' && segments[1] === 'widget-editor' && segments.length === 2) {
    return (
      <>
        <AdminChrome>
          <OnsiteContent />
        </AdminChrome>
        <WidgetEditor />
      </>
    );
  }
  else if (segments[0] === 'kit' && segments.length === 1) page = <KitPage />;
  return <AdminChrome>{page}</AdminChrome>;
}

export default function App() {
  return (
    <AppProvider i18n={en} linkComponent={HashLink}>
      <RouterProvider>
        <ScenarioProvider>
          <SettingsProvider>
            <Frame>
              <ShellProvider>
                <Screen />
                <ProtoControls />
              </ShellProvider>
            </Frame>
          </SettingsProvider>
        </ScenarioProvider>
      </RouterProvider>
    </AppProvider>
  );
}
