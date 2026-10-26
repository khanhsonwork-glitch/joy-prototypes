import React from 'react';
import {AppProvider, Badge, BlockStack, Button, Card, Frame, IndexTable, Page, Text} from '@shopify/polaris';
import en from '@shopify/polaris/locales/en.json';
import {AdminChrome} from './shell/AdminChrome.jsx';
import {HashLink, RouterProvider, useRoute} from './shell/router.jsx';
import {ShellProvider, useShell} from './shell/ShellContext.jsx';
import {MEMBERS, num} from './data/index.js';

// Replace this screen with the feature you are prototyping. Keep the admin chrome around it.
function DemoPage() {
  const {notify} = useShell();
  return (
    <Page title="__DEMO_NAME__" primaryAction={{content: 'Save', onAction: () => notify('Saved')}}>
      <BlockStack gap="400">
        <Card>
          <BlockStack gap="200">
            <Text as="h2" variant="headingMd">What this screen does</Text>
            <Text as="p" variant="bodyMd" tone="subdued">One sentence about the merchant problem this prototype answers.</Text>
          </BlockStack>
        </Card>
        <Card padding="0">
          <IndexTable
            resourceName={{singular: 'member', plural: 'members'}}
            itemCount={MEMBERS.length}
            selectable={false}
            headings={[{title: 'Customer'}, {title: 'Email'}, {title: 'Tier'}, {title: 'Points', alignment: 'end'}]}
          >
            {MEMBERS.map((m, index) => (
              <IndexTable.Row id={m.id} key={m.id} position={index}>
                <IndexTable.Cell><Text as="span" fontWeight="semibold">{m.name}</Text></IndexTable.Cell>
                <IndexTable.Cell>{m.email}</IndexTable.Cell>
                <IndexTable.Cell><Badge>{m.tier}</Badge></IndexTable.Cell>
                <IndexTable.Cell><Text as="span" alignment="end" numeric>{num(m.points)}</Text></IndexTable.Cell>
              </IndexTable.Row>
            ))}
          </IndexTable>
        </Card>
      </BlockStack>
    </Page>
  );
}

function NotFound() {
  return (
    <Page title="Page not found">
      <Card>
        <BlockStack gap="300">
          <Text as="p" variant="bodyMd">This prototype has no screen here yet.</Text>
          <div><Button url="/demo">Back to the demo</Button></div>
        </BlockStack>
      </Card>
    </Page>
  );
}

function Screen() {
  const {segments} = useRoute();
  return <AdminChrome>{segments[0] === 'demo' ? <DemoPage /> : <NotFound />}</AdminChrome>;
}

export default function App() {
  return (
    <AppProvider i18n={en} linkComponent={HashLink}>
      <RouterProvider>
        <Frame>
          <ShellProvider>
            <Screen />
          </ShellProvider>
        </Frame>
      </RouterProvider>
    </AppProvider>
  );
}
