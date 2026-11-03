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
import {PlansPage} from './pages/PlansPage.jsx';
import {OnboardingPlanPage} from './pages/OnboardingPlanPage.jsx';
import {DashboardPage} from './pages/DashboardPage.jsx';
import {KitPage} from './pages/KitPage.jsx';
import {DEMO} from './demo.config.js';
import './styles/pricing.css';

// Routes: #/plans (Settings › Subscription › View plans) · #/onboarding-plan (Onboarding V2, plan step)
// · #/dashboard (Home, promotional banner slot) · #/kit (components).
function NotFound() {
  return (
    <Page title="Page not found">
      <Card>
        <EmptyView heading="There's no page at this address" action={{content: 'Back to plans', url: '/plans'}}>
          Check the link, or go back to the plans.
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
  if (segments[0] === 'plans' && segments.length === 1) page = <PlansPage />;
  else if (segments[0] === 'onboarding-plan' && segments.length === 1) page = <OnboardingPlanPage />;
  else if (segments[0] === 'dashboard' && segments.length === 1) page = <DashboardPage />;
  else if (segments[0] === 'kit' && segments.length === 1) page = <KitPage />;
  return <AdminChrome>{page}</AdminChrome>;
}

export default function App() {
  return (
    <AppProvider i18n={en} linkComponent={HashLink}>
      <RouterProvider>
        <ScenarioProvider>
          <ProtoProvider>
            <Frame>
              <ShellProvider>
                <Screen />
                <ProtoControls />
              </ShellProvider>
            </Frame>
          </ProtoProvider>
        </ScenarioProvider>
      </RouterProvider>
    </AppProvider>
  );
}
