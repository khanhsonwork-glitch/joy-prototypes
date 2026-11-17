import React, {useEffect} from 'react';
import {AppProvider, Card, Frame, Page} from '@shopify/polaris';
import en from '@shopify/polaris/locales/en.json';
import {AdminChrome} from './shell/AdminChrome.jsx';
import {HashLink, RouterProvider, useRoute} from './shell/router.jsx';
import {ShellProvider} from './shell/ShellContext.jsx';
import {ScenarioProvider} from './kit/scenario.jsx';
import {ProtoControls} from './kit/ProtoControls.jsx';
import {EmptyView} from './kit/StateView.jsx';
import {EditorProvider} from './state/editor.jsx';
import {OnSite} from './pages/OnSite.jsx';
import {EDITOR_SEGMENTS, WidgetEditor} from './pages/WidgetEditor.jsx';
import {KitPage} from './pages/KitPage.jsx';
import {DEMO} from './demo.config.js';

// Routes: #/on-site (where the editor opens from) · the editor: #/rich-text · #/image-with-text · #/off · #/members-only-existing · #/section-help · #/kit (components).
function NotFound() {
  return (
    <Page title="Page not found">
      <Card>
        <EmptyView heading="There's no page at this address" action={{content: 'Back to On-site content', url: '/on-site'}}>
          Check the link, or go back to On-site content.
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
  const editor = EDITOR_SEGMENTS.includes(segments[0]);
  let page = <NotFound />;
  // The editor opens full screen over On-site content, so closing it lands there.
  if (segments[0] === 'on-site' || editor) page = <OnSite />;
  else if (segments[0] === 'kit' && segments.length === 1) page = <KitPage />;
  return (
    <>
      <AdminChrome>{page}</AdminChrome>
      {editor ? <WidgetEditor /> : null}
    </>
  );
}

export default function App() {
  return (
    <AppProvider i18n={en} linkComponent={HashLink}>
      <RouterProvider>
        <ScenarioProvider>
          <EditorProvider>
            <Frame>
              <ShellProvider>
                <Screen />
                <ProtoControls />
              </ShellProvider>
            </Frame>
          </EditorProvider>
        </ScenarioProvider>
      </RouterProvider>
    </AppProvider>
  );
}
