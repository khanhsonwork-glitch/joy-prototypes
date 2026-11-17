// Earning program edit pages, each with the reward-type control the app uses on that page:
// - Place an order (PlaceOrderV2Program.js › RewardSettings): radio list "Reward type".
// - Sign Up (SignUpProgramV2.js): custom dropdown "Rewarding method" (SelectOptions) whose paid options carry a badge.
// - Sign up for newsletter (SignUpProgramV2.js › RewardTypeSelect.js): select "Reward type".
import React, {useState} from 'react';
import {BlockStack, Card, ChoiceList, Icon, InlineGrid, InlineStack, Link, Popover, Select, Text, TextField, Tooltip} from '@shopify/polaris';
import {InfoIcon, SelectIcon} from '@shopify/polaris-icons';
import {useShell} from '../shell/ShellContext.jsx';
import {useNavigate} from '../shell/router.jsx';
import {useShop} from '../kit/scenario.jsx';
import {LabelWithBadge, PlanBadge} from '../components/PlanBadge.jsx';
import {EARN_METHODS} from '../data/programs.js';
import {EditFrame, positive, useEditForm} from './editShared.jsx';

const nameError = (title) => (title.trim() ? undefined : 'Enter a program name');

function ProgramInfo({editor, nameLabel = 'Program name', children}) {
  const {form, set, show} = editor;
  return (
    <Card>
      <BlockStack gap="400">
        <Text as="h2" variant="headingSm">Program information</Text>
        <TextField label={nameLabel} value={form.title} onChange={set('title')} error={show('title')} placeholder="Reward Program" autoComplete="off" />
        {children}
        <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
          <TextField label="Start date" type="date" value={form.start} onChange={set('start')} autoComplete="off" />
          <TextField label="End date" type="date" value={form.end || ''} onChange={set('end')} autoComplete="off" />
        </InlineGrid>
      </BlockStack>
    </Card>
  );
}

// ---------------------------------------------------------------- Place an order

export function PlaceOrderEdit() {
  const shop = useShop();
  const {notYet} = useShell();
  const editor = useEditForm('placeOrder', (f) => ({
    ...(nameError(f.title) ? {title: nameError(f.title)} : {}),
    ...(positive(f.value) ? {value: positive(f.value)} : {}),
    ...(positive(f.every) ? {every: positive(f.every)} : {}),
  }));
  const {form, set, show} = editor;
  const credit = form.typeEarn === 'store_credit';
  const locked = shop.storeCreditLocked;
  return (
    <EditFrame title={form.title || 'Place an order'} backUrl="/earning" backLabel="Reward programs" status="active" editor={editor} what="this program">
      <BlockStack gap="400">
        <ProgramInfo editor={editor}>
          <ChoiceList
            title="Date range"
            choices={[{label: 'Static date', value: 'static'}, {label: 'Dynamic date', value: 'dynamic'}]}
            selected={[form.dateRange]}
            onChange={([v]) => set('dateRange')(v)}
          />
        </ProgramInfo>
        <Card>
          <BlockStack gap="400">
            <BlockStack gap="100">
              <Text as="h2" variant="headingSm">Reward settings</Text>
              <Text as="p" tone="subdued">The program starts when a customer places an order</Text>
            </BlockStack>
            <ChoiceList
              title="Who to reward"
              choices={[
                {label: 'All loyalty members', value: 'all', helpText: form.who === 'all' ? `All customers who joined the loyalty program can earn ${credit ? 'store credit' : 'points'}` : undefined},
                {label: 'VIP Tier only', value: 'vip', disabled: true, helpText: <>{"You haven't setup VIP Tier yet. Click "}<Link onClick={notYet}>here</Link>{' to setup'}</>},
                {label: 'All customers', value: 'guest', helpText: form.who === 'guest' ? `Everyone can earn ${credit ? 'store credit' : 'points'}, including guests` : undefined},
              ]}
              selected={[form.who]}
              onChange={([v]) => set('who')(v)}
            />
            <div data-field="reward-type">
              <LabelWithBadge locked={locked}>Reward type</LabelWithBadge>
              <ChoiceList
                title="Reward type"
                titleHidden
                choices={[
                  {label: 'Loyalty Points', value: 'point'},
                  {label: 'Store credit', value: 'store_credit', disabled: locked},
                ]}
                selected={[form.typeEarn]}
                onChange={([v]) => editor.setForm((f) => ({...f, typeEarn: v}))}
              />
            </div>
            <Select
              label="Rewarding method"
              options={EARN_METHODS[credit ? 'store_credit' : 'point']}
              value={form.earnBy}
              onChange={set('earnBy')}
            />
            <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
              <TextField
                label={credit ? 'Rewarding store credit' : 'Rewarding value'}
                type="number"
                value={form.value}
                onChange={set('value')}
                error={show('value')}
                suffix={credit ? 'USD' : 'points'}
                autoComplete="off"
              />
              {form.earnBy === 'order' ? null : (
                <TextField
                  label="For every"
                  type="number"
                  value={form.every}
                  onChange={set('every')}
                  error={show('every')}
                  prefix={form.earnBy === 'quantity' ? undefined : '$'}
                  suffix={form.earnBy === 'quantity' ? 'items' : 'USD'}
                  autoComplete="off"
                />
              )}
            </InlineGrid>
          </BlockStack>
        </Card>
      </BlockStack>
    </EditFrame>
  );
}

// ---------------------------------------------------------------- Sign Up / Sign up for newsletter

/**
 * SelectOptions: a field-looking button that opens a list of choices. Paid choices show the plan badge in their
 * label; picking one opens Plans instead of selecting it (SignUpProgramV2 onSelected → openPricingModal).
 */
function SelectOptions({label, options, value, onPick}) {
  const [open, setOpen] = useState(false);
  const id = 'scg-select-options';
  const current = options.find((o) => o.value === value);
  const activator = (
    <button type="button" id={id} className="scg-select-options" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
      <span>{current?.text}</span>
      <Icon source={SelectIcon} tone="subdued" />
    </button>
  );
  return (
    <div data-field="rewarding-method">
      <label htmlFor={id} className="scg-label scg-label--block">{label}</label>
      <Popover active={open} activator={activator} onClose={() => setOpen(false)} fullWidth autofocusTarget="first-node">
        <div className="scg-select-options__list">
          <ChoiceList
            title={label}
            titleHidden
            choices={options.map((o) => ({
              value: o.value,
              label: <span className="scg-label-row">{o.text}{o.locked ? <PlanBadge decorative /> : null}</span>,
            }))}
            selected={[value]}
            onChange={([v]) => {setOpen(false); onPick(v);}}
          />
        </div>
      </Popover>
    </div>
  );
}

export function SignUpEdit({variant}) {
  const shop = useShop();
  const navigate = useNavigate();
  const newsletter = variant === 'newsletter';
  const key = newsletter ? 'newsletter' : 'signUp';
  const editor = useEditForm(key, (f) => ({
    ...(nameError(f.title) ? {title: nameError(f.title)} : {}),
    ...(positive(f.value) ? {value: positive(f.value)} : {}),
  }));
  const {form, set, show} = editor;
  const locked = shop.storeCreditLocked;
  const credit = form.typeEarn === 'store_credit';
  const discount = ['discount_percentage', 'discount_amount'].includes(form.typeEarn);
  const selectId = 'scg-reward-type';

  // Sign Up: Point, Store credit (withStoreCreditOption puts it right after Point), then the discounts that already
  // need a paid plan (proBadge when !isPremium).
  const signUpOptions = [
    {value: 'point', text: 'Point'},
    {value: 'store_credit', text: 'Store credit', locked},
    {value: 'discount_percentage', text: 'Discount percentage', locked: !shop.isPremium},
    {value: 'discount_amount', text: 'Discount amount', locked: !shop.isPremium},
    {value: 'discount_bxgy', text: 'Discount buy x get y', locked: !shop.isPremium},
  ];

  return (
    <EditFrame
      title={form.title || (newsletter ? 'Sign up for newsletter' : 'Sign Up')}
      backUrl="/earning"
      backLabel="Reward programs"
      status={newsletter ? 'inactive' : 'active'}
      editor={editor}
      what="this program"
    >
      <BlockStack gap="400">
        <ProgramInfo editor={editor} nameLabel="Rule name" />
        <Card>
          <BlockStack gap="400">
            <InlineStack gap="100" blockAlign="center">
              <Text as="h2" variant="headingSm">Setup rule</Text>
              <Tooltip content={newsletter ? 'Configure how customers earn when they sign up for your newsletter' : 'Configure how customers earn points when they create an account'}>
                <span className="scg-info" tabIndex={0} role="img" aria-label="About setup rule"><Icon source={InfoIcon} tone="subdued" /></span>
              </Tooltip>
            </InlineStack>
            {newsletter ? (
              <div data-field="reward-type">
                <LabelWithBadge htmlFor={selectId} locked={locked}>Reward type</LabelWithBadge>
                <Select
                  id={selectId}
                  label="Reward type"
                  labelHidden
                  options={[
                    {label: 'Point', value: 'point'},
                    {label: 'Store credit', value: 'store_credit', disabled: locked},
                  ]}
                  value={form.typeEarn}
                  onChange={(v) => editor.setForm((f) => ({...f, typeEarn: v}))}
                />
              </div>
            ) : (
              <SelectOptions
                label="Rewarding method"
                options={signUpOptions}
                value={form.typeEarn}
                onPick={(v) => {
                  const option = signUpOptions.find((o) => o.value === v);
                  if (option.locked) navigate('/plans');
                  else editor.setForm((f) => ({...f, typeEarn: v}));
                }}
              />
            )}
            {form.typeEarn === 'discount_bxgy' ? null : (
              <TextField
                label={credit ? 'Credit amount' : discount ? 'Customers earn discount' : 'Rewarding value'}
                type="number"
                value={form.value}
                onChange={set('value')}
                error={show('value')}
                suffix={credit ? 'USD' : form.typeEarn === 'discount_percentage' ? '%' : form.typeEarn === 'discount_amount' ? '$' : 'points'}
                autoComplete="off"
              />
            )}
          </BlockStack>
        </Card>
      </BlockStack>
    </EditFrame>
  );
}
