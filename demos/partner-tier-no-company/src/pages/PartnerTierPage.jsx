// #/wholesale/vip: Membership › Partner tier › Set up = "Partner tier programs" (pages/VIPTiers/B2bVipTiers.js and
// SubMenu/B2bSubMenu/TierB2bSettings.js on avada/master), Advanced plan, program not launched yet.
// Change: with 0 Shopify companies the Tiers tab opens with the same warning banner as the Membership card.
// Launch stays enabled: the merchant can build and launch tiers before the first company exists.
import React, {useState} from 'react';
import {
  ActionList, BlockStack, Box, Button, Card, Divider, Icon, InlineStack, Modal, Page, Popover, Select, Tabs, Text, TextField,
} from '@shopify/polaris';
import {CalendarIcon, CheckSmallIcon, ChevronRightIcon, ChevronUpIcon, DeleteIcon, MenuHorizontalIcon, PlusCircleIcon, RefreshIcon} from '@shopify/polaris-icons';
import {useShell} from '../shell/ShellContext.jsx';
import {useShop} from '../kit/scenario.jsx';
import {useStore} from '../state/store.jsx';
import {NoCompanyBanner} from '../components/NoCompanyWarning.jsx';

const money = (n) => `$${Number(n || 0).toLocaleString('en-US')}`;

function TierMenu({tier, onDelete}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover
      active={open}
      onClose={() => setOpen(false)}
      activator={<Button variant="tertiary" icon={MenuHorizontalIcon} accessibilityLabel={`More actions for ${tier.name}`} onClick={() => setOpen((v) => !v)} />}
    >
      <ActionList items={[{content: 'Delete tier', icon: DeleteIcon, destructive: true, onAction: () => {setOpen(false); onDelete(tier);}}]} />
    </Popover>
  );
}

function TierLevels() {
  const {tiers, setTiers} = useStore();
  const {notify} = useShell();
  const [openId, setOpenId] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const change = (id, field) => (value) => setTiers((list) => list.map((t) => (t.id === id ? {...t, [field]: value} : t)));
  const add = () => {
    const id = `new-${Date.now()}`;
    setTiers((list) => [...list, {id, name: 'New tier', target: ''}]);
    setOpenId(id);
  };
  return (
    <Card padding="0">
      <Box padding="400">
        <BlockStack gap="300">
          <Text as="h2" variant="headingSm">Partner tier levels</Text>
          <Text as="p" tone="subdued">Set up rules for each level, including requirements and rewards.</Text>
        </BlockStack>
      </Box>
      <Divider />
      {tiers.map((tier) => {
        const open = openId === tier.id;
        return (
          <div key={tier.id} className="pt-tier">
            <div className={open ? 'pt-tier__row is-open' : 'pt-tier__row'}>
              <BlockStack gap="100">
                <Text as="h3" variant="bodyMd" fontWeight="medium">{tier.name || 'New tier'}</Text>
                <Text as="p" tone="subdued">
                  {tier.standard ? 'New business account start at this tier.' : 'For business partners with higher order volume, unlocking exclusive benefits.'}
                </Text>
              </BlockStack>
              <InlineStack gap="200" blockAlign="center" wrap={false}>
                {tier.standard ? null : <TierMenu tier={tier} onDelete={setToDelete} />}
                <Button variant="tertiary" icon={open ? ChevronUpIcon : ChevronRightIcon} accessibilityLabel={tier.name} onClick={() => setOpenId(open ? null : tier.id)} />
              </InlineStack>
            </div>
            {open ? (
              <Box paddingInline="400" paddingBlockEnd="400">
                <BlockStack gap="200">
                  <TextField label="Tier name" value={tier.name} onChange={change(tier.id, 'name')} autoComplete="off" />
                  <TextField
                    label="Milestone to achieve"
                    type="number"
                    prefix="$"
                    min={0}
                    value={String(tier.target)}
                    disabled={tier.standard}
                    helpText={tier.standard ? 'This tier must have a goal of 0 to allow customers to use this as the base tier' : undefined}
                    onChange={change(tier.id, 'target')}
                    autoComplete="off"
                  />
                </BlockStack>
              </Box>
            ) : null}
            <Divider />
          </div>
        );
      })}
      <Box padding="400">
        <Button variant="tertiary" fullWidth icon={PlusCircleIcon} onClick={add}>Add new tier</Button>
      </Box>
      <Modal
        open={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        title="Delete tier"
        primaryAction={{
          content: 'Delete',
          destructive: true,
          onAction: () => {
            setTiers((list) => list.filter((t) => t.id !== toDelete.id));
            setToDelete(null);
            notify('Deleted tier successfully');
          },
        }}
        secondaryActions={[{content: 'Cancel', onAction: () => setToDelete(null)}]}
      >
        <Modal.Section>
          <Text as="p">This tier will be permanently deleted and cannot be undone. Are you sure you want to proceed?</Text>
        </Modal.Section>
      </Modal>
    </Card>
  );
}

function TierConfiguration() {
  const [startDate, setStartDate] = useState('November 17, 2026');
  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h2" variant="headingSm">Tier configuration settings</Text>
        <Text as="p" tone="subdued">Configure the method for calculating tiers and set the start date for determining customer tiers.</Text>
        <Select label="Level-up rule" options={[{label: 'Amount spent', value: 'spent'}]} value="spent" onChange={() => {}} />
        <TextField
          label="Start date"
          value={startDate}
          onChange={setStartDate}
          prefix={<Icon source={CalendarIcon} tone="subdued" />}
          autoComplete="off"
          helpText="The start date is the date when the tier calculation begins. Customers will be assigned to tiers based on their spending from this date onwards."
        />
      </BlockStack>
    </Card>
  );
}

function Check() {
  return <span className="pt-check"><Icon source={CheckSmallIcon} tone="subdued" /></span>;
}

function Summary({active}) {
  const {tiers} = useStore();
  return (
    <div className="pt-summary">
      <Card>
        <BlockStack gap="200">
          <Text as="h2" variant="headingSm">Summary</Text>
          <Text as="p">Your VIP tier B2B program is currently {active ? 'active' : 'inactive'}</Text>
          <div className="pt-summary__box">
            <BlockStack gap="200">
              <Text as="p">General</Text>
              <div className="pt-summary__line"><Check /><Text as="p">Tier is calculated by <Text as="span" fontWeight="bold">Amount spent</Text></Text></div>
              <Text as="p">Tier rule</Text>
              {tiers.map((tier) => (
                <div key={tier.id} className="pt-summary__line">
                  <Check />
                  <Text as="p"><Text as="span" fontWeight="bold">{tier.name}</Text> - achieve with {money(tier.target)} spent</Text>
                </div>
              ))}
            </BlockStack>
          </div>
        </BlockStack>
      </Card>
    </div>
  );
}

export function PartnerTierPage() {
  const {hasB2bCompanies} = useShop();
  const {partnerActive, setPartnerActive} = useStore();
  const {notify} = useShell();
  const [launching, setLaunching] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const launch = () => {
    setLaunching(true);
    setTimeout(() => {
      setLaunching(false);
      setPartnerActive(true);
      notify('Published successfully');
    }, 600);
  };
  const sync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 1500);
  };

  return (
    <Page
      backAction={{content: 'Membership', url: '/membership'}}
      title="Partner tier programs"
      primaryAction={partnerActive ? undefined : {content: 'Launch', onAction: launch, loading: launching}}
      actionGroups={partnerActive ? [{
        title: 'Status: Active',
        actions: [
          {content: 'Active', active: true, onAction: () => {}},
          {content: 'Inactive', onAction: () => {setPartnerActive(false); notify('Published successfully');}},
        ],
      }] : undefined}
      secondaryActions={[{content: syncing ? 'Syncing...' : 'Sync B2B data from Shopify', icon: RefreshIcon, loading: syncing, onAction: sync}]}
    >
      <div className="pt-root">
        <div className="pt-grid">
          <BlockStack gap="300">
            <div className="pt-tabs">
              <Tabs tabs={[{id: 'tiers', content: 'Tiers'}]} selected={0} onSelect={() => {}} />
            </div>
            {hasB2bCompanies ? null : <NoCompanyBanner />}
            <BlockStack gap="200">
              <TierConfiguration />
              <TierLevels />
            </BlockStack>
          </BlockStack>
          <Summary active={partnerActive} />
        </div>
      </div>
    </Page>
  );
}
