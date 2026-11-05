// Components and tokens sheet: every building block of the starter with its states, on one page.
// Reached from the Prototype panel, never from the app navigation (it is not product UI).
import React, {useState} from 'react';
import {
  Badge, Banner, BlockStack, Box, Button, ButtonGroup, Card, Checkbox, ChoiceList, DataTable, InlineGrid, InlineStack, Layout, Modal, Page,
  ResourceItem, ResourceList, Select, Tabs, Text, TextField,
} from '@shopify/polaris';
import {PlusIcon} from '@shopify/polaris-icons';
import {useShell} from '../shell/ShellContext.jsx';
import {Drawer} from '../kit/Drawer.jsx';
import {EmptyView, ErrorView, LoadingView} from '../kit/StateView.jsx';
import {MEMBERS, REWARDS, num, typeLabel} from '../data/index.js';

const COLOR_TOKENS = [
  '--p-color-bg', '--p-color-bg-surface', '--p-color-bg-surface-secondary', '--p-color-bg-fill-brand', '--p-color-bg-fill-critical',
  '--p-color-bg-fill-success', '--p-color-bg-fill-warning', '--p-color-text', '--p-color-text-secondary', '--p-color-border', '--p-color-border-focus',
  '--chrome-topbar', '--chrome-nav-bg', '--chrome-joy-red',
];
const SPACE_TOKENS = ['--p-space-100', '--p-space-200', '--p-space-300', '--p-space-400', '--p-space-600', '--p-space-800'];

function Section({title, children, description}) {
  return (
    <Layout.AnnotatedSection title={title} description={description}>
      <Card>
        <BlockStack gap="400">{children}</BlockStack>
      </Card>
    </Layout.AnnotatedSection>
  );
}

export function KitPage() {
  const {notify} = useShell();
  const [tab, setTab] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [text, setText] = useState('Spring rewards');
  const [checked, setChecked] = useState(true);
  const [choice, setChoice] = useState(['email']);
  const [points, setPoints] = useState('0');
  const [type, setType] = useState('amount');
  const [filter, setFilter] = useState('');

  return (
    <Page
      backAction={{content: 'Rewards', url: '/demo'}}
      title="Components and tokens"
      titleMetadata={<Badge tone="attention">Prototype only</Badge>}
      subtitle="Hover or Tab through any control to see its hover and focus states."
    >
      <Layout>
        <Section title="Buttons" description="One primary action per screen. Destructive actions confirm in a modal.">
          <InlineStack gap="200" wrap>
            <Button variant="primary" onClick={() => notify('Primary action')}>Primary</Button>
            <Button onClick={() => notify('Secondary action')}>Secondary</Button>
            <Button variant="tertiary" onClick={() => notify('Tertiary action')}>Tertiary</Button>
            <Button variant="plain" onClick={() => notify('Plain action')}>Plain</Button>
            <Button tone="critical" variant="primary" onClick={() => setModalOpen(true)}>Delete</Button>
            <Button icon={PlusIcon} accessibilityLabel="Add" onClick={() => notify('Added')} />
          </InlineStack>
          <InlineStack gap="200" wrap>
            <Button variant="primary" disabled>Disabled</Button>
            <Button disabled>Disabled</Button>
            <Button variant="primary" loading>Saving</Button>
            <ButtonGroup variant="segmented">
              <Button pressed>Day</Button>
              <Button>Week</Button>
              <Button>Month</Button>
            </ButtonGroup>
          </InlineStack>
        </Section>

        <Section title="Badges and banners" description="Tone carries meaning: success, attention, warning, critical, info.">
          <InlineStack gap="200" wrap>
            <Badge tone="success">Active</Badge>
            <Badge>Draft</Badge>
            <Badge tone="attention">Scheduled</Badge>
            <Badge tone="warning">Expiring</Badge>
            <Badge tone="critical">Failed</Badge>
            <Badge tone="info">New</Badge>
          </InlineStack>
          <Banner tone="info" title="Info">Only active rewards appear in the widget.</Banner>
          <Banner tone="success" title="Success">12 members joined this week.</Banner>
          <Banner tone="warning" title="Warning">This reward expires in 3 days.</Banner>
          <Banner tone="critical" title="Critical" action={{content: 'Try again', onAction: () => notify('Retrying')}}>The sync to Shopify failed.</Banner>
        </Section>

        <Section title="Forms" description="Labels always visible; errors say how to fix; disabled fields explain why nearby.">
          <TextField label="Reward name" value={text} onChange={setText} helpText="Members see this in the widget." autoComplete="off" />
          <TextField label="Points cost" type="number" value={points} onChange={setPoints} error={Number.isInteger(Number(points)) && Number(points) >= 1 ? undefined : 'Points must be a whole number of 1 or more'} autoComplete="off" />
          <TextField label="Store currency" value="USD" disabled helpText="Set in Shopify settings." autoComplete="off" />
          <Select label="Reward type" options={[{label: 'Amount discount', value: 'amount'}, {label: 'Free shipping', value: 'shipping'}]} value={type} onChange={setType} />
          <Checkbox label="Show in the loyalty widget" checked={checked} onChange={setChecked} />
          <ChoiceList title="Notify members by" choices={[{label: 'Email', value: 'email'}, {label: 'SMS', value: 'sms'}, {label: 'Off', value: 'off'}]} selected={choice} onChange={setChoice} />
        </Section>

        <Section title="Tabs" description="Tabs filter one list; counts in brackets.">
          <Tabs tabs={[{id: 'all', content: 'All (5)'}, {id: 'active', content: 'Active (3)'}, {id: 'draft', content: 'Draft (2)'}]} selected={tab} onSelect={setTab} />
          <Text as="p" tone="subdued">Selected: {['All', 'Active', 'Draft'][tab]}</Text>
        </Section>

        <Section title="Table and list" description="Tables for comparing numbers; lists for people and items with an action.">
          <DataTable
            columnContentTypes={['text', 'text', 'numeric', 'numeric']}
            headings={['Reward', 'Type', 'Points', 'Redemptions']}
            rows={REWARDS.slice(0, 3).map((r) => [r.name, typeLabel(r.type), num(r.points), num(r.redemptions)])}
          />
          <ResourceList
            resourceName={{singular: 'member', plural: 'members'}}
            items={MEMBERS}
            renderItem={(m) => (
              <ResourceItem id={m.id} onClick={() => notify(`Open ${m.name}`)} accessibilityLabel={`Open ${m.name}`}>
                <InlineStack align="space-between" gap="200" wrap={false}>
                  <BlockStack gap="050">
                    <Text as="span" fontWeight="semibold">{m.name}</Text>
                    <Text as="span" tone="subdued">{m.email}</Text>
                  </BlockStack>
                  <Text as="span" numeric>{num(m.points)} points</Text>
                </InlineStack>
              </ResourceItem>
            )}
          />
        </Section>

        <Section title="Empty, loading, error" description="Every list and detail screen has these three bodies.">
          <InlineGrid columns={{xs: 1, md: 3}} gap="400">
            <Box borderColor="border" borderWidth="025" borderRadius="200">
              <EmptyView heading="No rewards yet" action={{content: 'Create reward', onAction: () => notify('Create reward')}}>Create one to start.</EmptyView>
            </Box>
            <LoadingView rows={4} />
            <ErrorView title="Couldn't load rewards" onRetry={() => notify('Retrying')}>Nothing was changed.</ErrorView>
          </InlineGrid>
        </Section>

        <Section title="Overlays" description="Toast confirms; modal asks before something can't be undone; drawer shows secondary detail.">
          <InlineStack gap="200" wrap>
            <Button onClick={() => notify('Reward saved')}>Show toast</Button>
            <Button onClick={() => notify('Couldn’t save reward', {error: true})}>Show error toast</Button>
            <Button onClick={() => setModalOpen(true)}>Open modal</Button>
            <Button onClick={() => setDrawerOpen(true)}>Open drawer</Button>
          </InlineStack>
        </Section>

        <Section title="Tokens" description="Polaris tokens (var(--p-…)) first; admin chrome colours live in styles/tokens.css.">
          <div className="kit-swatches">
            {COLOR_TOKENS.map((token) => (
              <div className="kit-swatch" key={token}>
                <span className="kit-swatch__chip" style={{background: `var(${token})`}} />
                <code>{token}</code>
              </div>
            ))}
          </div>
          <InlineStack gap="400" blockAlign="end" wrap>
            {SPACE_TOKENS.map((token) => (
              <BlockStack gap="100" key={token} inlineAlign="center">
                <span style={{display: 'block', width: `var(${token})`, height: `var(${token})`, background: 'var(--p-color-bg-fill-brand)', borderRadius: 2}} />
                <code>{token.replace('--p-space-', 'space ')}</code>
              </BlockStack>
            ))}
          </InlineStack>
          <BlockStack gap="100">
            <Text as="p" variant="headingXl">Heading XL · Inter</Text>
            <Text as="p" variant="headingMd">Heading MD</Text>
            <Text as="p" variant="bodyMd">Body MD — the default size for admin copy.</Text>
            <Text as="p" variant="bodySm" tone="subdued">Body SM subdued — help text and metadata.</Text>
          </BlockStack>
        </Section>
      </Layout>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Delete Spring rewards?"
        primaryAction={{content: 'Delete', destructive: true, onAction: () => { setModalOpen(false); notify('Deleted'); }}}
        secondaryActions={[{content: 'Cancel', onAction: () => setModalOpen(false)}]}
      >
        <Modal.Section>
          <Text as="p">This can't be undone.</Text>
        </Modal.Section>
      </Modal>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Drawer" primaryAction={{content: 'Apply', onAction: () => { setDrawerOpen(false); notify('Applied'); }}}>
        <BlockStack gap="300">
          <Text as="p">Use a drawer for filters, activity or help that sits beside the page.</Text>
          <TextField label="Filter by name" value={filter} onChange={setFilter} autoComplete="off" />
        </BlockStack>
      </Drawer>
    </Page>
  );
}
