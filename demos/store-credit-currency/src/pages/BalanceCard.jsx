// Right-column card of the customer page: tabs Points | Store credit (real: pages/Customer/Details/Point.js)
// and the Adjust store credit modal (real: useAdjustStoreCreditModal.js). New here: rules A1–A2 and B3–B8,
// all read from currencyView() so the tab, the modal and its warning always agree.
import React, {useState} from 'react';
import {
  BlockStack,
  Box,
  Button,
  FormLayout,
  Icon,
  InlineGrid,
  InlineStack,
  LegacyCard,
  LegacyStack,
  Modal,
  Select,
  Tabs,
  Text,
  TextField,
} from '@shopify/polaris';
import {AlertTriangleIcon} from '@shopify/polaris-icons';
import {currencyView, money} from '../data/currency.js';
import {useShell} from '../shell/ShellContext.jsx';
import {ExpirationDatePopover} from './ExpirationDatePopover.jsx';

const num = (n) => Math.round(n || 0).toLocaleString('en-US');
const pointsLabel = (n) => `${num(n)} ${Math.round(n) === 1 ? 'point' : 'points'}`;

function Stat({label, value, tone}) {
  return (
    <BlockStack gap="100">
      <Text as="span" tone="subdued">
        {label}:
      </Text>
      <Text as="span" fontWeight="bold" tone={tone}>
        {value}
      </Text>
    </BlockStack>
  );
}

function PointsTab({points}) {
  const {notYet} = useShell();
  return (
    <>
      <div className="Avada-CustomerPoint_OverlayContent">
        <Text variant="headingXl" as="p">
          {pointsLabel(points.point)}
        </Text>
      </div>
      <Box paddingBlockStart="200">
        <Button variant="plain" size="micro" onClick={notYet}>
          See monetary value
        </Button>
      </Box>
      <Box paddingBlockStart="200" paddingBlockEnd="400">
        <InlineGrid columns={{xs: 1, sm: 2}} gap="400">
          <BlockStack gap="200">
            <Stat label="Points earned" value={num(points.totalEarned)} />
            <Stat label="Points expired" value={num(points.totalExpired)} />
            <Stat label="Admin adjustments" value={num(points.totalAdminAdjustments)} />
          </BlockStack>
          <BlockStack gap="200">
            <Stat label="Points redeemed" value={num(points.totalRedeemed)} />
            <Stat label="Refunded point" value={num(points.totalRefunded)} />
          </BlockStack>
        </InlineGrid>
      </Box>
      <FormLayout>
        <LegacyStack alignment="center" distribution="leading">
          <Button onClick={notYet} variant="secondary">
            Adjust points
          </Button>
          <Button onClick={notYet}>Redeem</Button>
        </LegacyStack>
      </FormLayout>
    </>
  );
}

function StoreCreditTab({view, onAdjust}) {
  return (
    <>
      {view.rows.map((account, index) => {
        const code = account.currencyCode;
        const stats = view.stats[code] || {totalAdded: 0, totalDeducted: 0};
        const note = view.noteFor(code);
        return (
          <Box key={code} paddingBlockStart={index === 0 ? '0' : '400'} paddingBlockEnd="400" data-wallet={code}>
            <div className="Avada-CustomerPoint_OverlayContent">
              <Text variant="headingXl" as="p">
                {money(account.amount, code)}
              </Text>
            </div>
            {note ? (
              <div data-testid="order-currency-note">
                <Text as="p" variant="bodySm" tone="subdued">
                  {note}
                </Text>
              </div>
            ) : null}
            <Box paddingBlockStart="200">
              <InlineGrid columns={{xs: 1, sm: 2}} gap="400">
                <BlockStack gap="200">
                  <Stat label="Store credit added" value={`+${money(stats.totalAdded, code)}`} tone="success" />
                </BlockStack>
                <BlockStack gap="200">
                  <Stat label="Store credit deducted" value={`-${money(stats.totalDeducted, code)}`} tone="critical" />
                </BlockStack>
              </InlineGrid>
            </Box>
          </Box>
        );
      })}
      <FormLayout>
        <LegacyStack alignment="center" distribution="leading">
          <Button onClick={onAdjust} variant="secondary">
            Adjust store credit
          </Button>
        </LegacyStack>
      </FormLayout>
    </>
  );
}

const PRESETS = [
  {label: '1 year from now', type: 'year', value: 1},
  {label: '3 years from now', type: 'year', value: 3},
  {label: '5 years from now', type: 'year', value: 5},
];

/**
 * @param customer  live customer object (accounts change after Confirm)
 * @param onAdjusted ({code, signed}) → parent updates accounts, stats and activity
 */
export function BalanceCard({customer, shopCurrency, modalOpen, onOpenModal, onCloseModal, onAdjusted}) {
  const {notify} = useShell();
  const [tab, setTab] = useState(1); // the review link opens on Store credit
  // Empty until the admin picks one, like the real Point.js, so the default keeps following the data.
  const [picked, setPicked] = useState('');
  const [form, setForm] = useState({adjustmentType: 'credit', amount: '0', expiresAt: ''});
  const [saving, setSaving] = useState(false);
  const view = currencyView(customer, shopCurrency, picked);
  const code = view.selected;
  const set = (key, value) => setForm((f) => ({...f, [key]: value}));

  const confirm = () => {
    const parsed = parseFloat(form.amount) || 0;
    if (parsed <= 0) {
      notify('Amount must be greater than 0', {error: true});
      return;
    }
    if (form.adjustmentType === 'debit' && parsed > view.balance) {
      notify('Insufficient store credit balance', {error: true});
      return;
    }
    setSaving(true);
    window.setTimeout(() => {
      setSaving(false);
      onAdjusted({code, signed: form.adjustmentType === 'debit' ? -parsed : parsed, type: form.adjustmentType, amount: parsed});
      notify('Store credit adjusted successfully');
      onCloseModal();
    }, 600);
  };

  const tabs = [
    {id: 'point-balance-tab', content: 'Points'},
    {id: 'store-credit-balance-tab', content: 'Store credit'},
  ];

  return (
    <div className="Avada-CustomerPoint_Container">
      <LegacyCard>
        <Tabs tabs={tabs} selected={tab} onSelect={setTab} />
        <LegacyCard.Section>
          {tab === 0 ? <PointsTab points={customer.points} /> : <StoreCreditTab view={view} onAdjust={onOpenModal} />}
        </LegacyCard.Section>
      </LegacyCard>

      <Modal
        sectioned
        open={modalOpen}
        onClose={() => !saving && onCloseModal()}
        title="Adjust store credit"
        primaryAction={{content: 'Confirm', loading: saving, onAction: confirm}}
        secondaryActions={[{content: 'Cancel', disabled: saving, onAction: onCloseModal}]}
      >
        <FormLayout>
          <Box background="bg-surface-secondary" padding="300" borderRadius="200">
            <InlineStack align="space-between">
              <Text as="span" fontWeight="semibold">
                Current balance
              </Text>
              <span data-testid="current-balance">
                <Text as="span" fontWeight="semibold">
                  {money(view.balance, code)}
                </Text>
              </span>
            </InlineStack>
          </Box>

          <InlineGrid columns={3} gap="300">
            <Select
              label="Adjustment"
              options={[
                {label: 'Credit', value: 'credit'},
                {label: 'Debit', value: 'debit'},
              ]}
              value={form.adjustmentType}
              onChange={(val) => set('adjustmentType', val)}
            />
            {view.options.length > 1 ? (
              <Select label="Currency" options={view.options.map((c) => ({label: c, value: c}))} value={code} onChange={setPicked} />
            ) : (
              <TextField label="Currency" value={code} disabled autoComplete="off" />
            )}
            <TextField
              label="Amount"
              type="number"
              value={form.amount}
              onChange={(val) => set('amount', val)}
              suffix={code}
              autoComplete="off"
              min="0"
            />
          </InlineGrid>

          {view.warning ? (
            <div className="sc-warning" role="status" data-testid="currency-warning">
              <span className="sc-warning__icon">
                <Icon source={AlertTriangleIcon} tone="caution" />
              </span>
              <Text as="p" tone="caution">
                {view.warning}
              </Text>
            </div>
          ) : null}

          {form.adjustmentType === 'credit' ? (
            <BlockStack gap="200">
              <ExpirationDatePopover
                label="Expiration"
                noExpirationLabel="No expiration"
                presets={PRESETS}
                value={form.expiresAt}
                onChange={(val) => set('expiresAt', val)}
              />
              <Text as="span" variant="bodySm" tone="subdued">
                Store credit expiration laws can vary by country
              </Text>
            </BlockStack>
          ) : null}
        </FormLayout>
      </Modal>
    </div>
  );
}
