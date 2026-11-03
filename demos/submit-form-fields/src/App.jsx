import React, {useEffect} from 'react';
import {AppProvider, Card, Frame, Page} from '@shopify/polaris';
import en from '@shopify/polaris/locales/en.json';
import {AdminChrome} from './shell/AdminChrome.jsx';
import {HashLink, RouterProvider, useRoute} from './shell/router.jsx';
import {ShellProvider} from './shell/ShellContext.jsx';
import {ScenarioProvider} from './kit/scenario.jsx';
import {ProtoControls} from './kit/ProtoControls.jsx';
import {EmptyView} from './kit/StateView.jsx';
import {FormProvider} from './state/form.jsx';
import {ProgramsPage} from './pages/ProgramsPage.jsx';
import {SubmitFormEdit} from './pages/SubmitFormEdit.jsx';
import {Activities} from './pages/Activities.jsx';
import {KitPage} from './pages/KitPage.jsx';
import {DEMO} from './demo.config.js';
import './styles/form.css';

// Routes: #/demo (Reward programs) · #/demo/submit-form (Rule tab) · #/demo/activities (Submit Form Activities) · #/kit.
// ?v=today shows the screen as it is on avada/master today; no v (or v=new) shows form fields + tags.
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
  else if (segments[0] === 'demo' && segments[1] === 'submit-form' && segments.length === 2) page = <SubmitFormEdit />;
  else if (segments[0] === 'demo' && segments[1] === 'activities' && segments.length === 2) page = <Activities />;
  else if (segments[0] === 'kit' && segments.length === 1) page = <KitPage />;
  return <AdminChrome>{page}</AdminChrome>;
}

export default function App() {
  return (
    <AppProvider i18n={en} linkComponent={HashLink}>
      <RouterProvider>
        <ScenarioProvider>
          <FormProvider>
            <Frame>
              <ShellProvider>
                <Screen />
                <ProtoControls />
              </ShellProvider>
            </Frame>
          </FormProvider>
        </ScenarioProvider>
      </RouterProvider>
    </AppProvider>
  );
}
