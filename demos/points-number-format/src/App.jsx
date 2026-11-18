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
import {GeneralSettings} from './pages/GeneralSettings.jsx';
import {TranslationsPage} from './pages/TranslationsPage.jsx';
import {TranslationEditor} from './pages/TranslationEditor.jsx';
import {KitPage} from './pages/KitPage.jsx';
import './styles/feature.css';
import {DEMO} from './demo.config.js';

function NotFound() {
  return (
    <Page title="Page not found">
      <Card>
        <EmptyView heading="There's no page at this address" action={{content: 'Back to Settings', url: '/settings'}}>
          Check the link, or go back to Settings.
        </EmptyView>
      </Card>
    </Page>
  );
}

// Routes (the real admin path in brackets):
//  #/settings                  Settings › General, Number format card            [/settings?type=general]
//  #/settings/translations     Settings › Translations, language tables          [/settings?type=translations]
//  #/translations              Translations › Unified widget editor (?lang=it, ?field=number_format | points_api)
//                              [/settings/translations/editor?type=widget-v4]; #/settings/translations/editor is the same screen
//  #/kit                       Components and tokens
// ?state= (or ?mode=follow|same|translation) picks the screen state on any route.
function Screen() {
  const {segments} = useRoute();
  useEffect(() => {
    document.title = `${DEMO.name} · Joy prototype`;
  }, []);
  const path = segments.join('/');
  let page = <NotFound />;
  if (path === 'settings' || path === 'demo') page = <GeneralSettings />;
  else if (path === 'settings/translations') page = <TranslationsPage />;
  else if (path === 'translations' || path === 'settings/translations/editor') page = <TranslationEditor />;
  else if (path === 'kit') page = <KitPage />;
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
