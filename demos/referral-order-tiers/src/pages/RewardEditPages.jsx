// Rewards for referees / Rewards for referrers. Same cards as the app today (Reward settings, Condition);
// when order value tiers own a value, the field gives way to the tier list and a link to edit it.
import React, {useEffect, useState} from 'react';
import {
  Banner, BlockStack, Box, Button, Card, Checkbox, ChoiceList, InlineStack, Layout, Page, Select, Text, TextField,
} from '@shopify/polaris';
import {useShell} from '../shell/ShellContext.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {ErrorView, LoadingView} from '../kit/StateView.jsx';
import {useProgram} from '../state/program.jsx';
import {FRIEND_METHODS, REFERRER_METHODS, TIERABLE_REFERRER, VIP_TIERS, money} from '../data/index.js';
import {checkTiers, friendTiered, referrerTiered, sortTiers, unitFor} from '../state/logic.js';
import {PlanBanner, useLeaveGuard} from './shared.jsx';

/** The value of each tier for one side, editable here so a reward-method change can be fixed on the same page. */
function TierValues({form, setForm, side, touched, locked}) {
  const method = side === 'friend' ? form.friendMethod : form.referrerMethod;
  const unit = unitFor(method);
  const errors = checkTiers(form).errors;
  const rows = sortTiers(form.tiers).filter((t) => Number(t.min) > 0);
  return (
    <Box background="bg-surface-secondary" padding="300" borderRadius="200">
      <BlockStack gap="300">
        <Text as="p" fontWeight="semibold">Reward value is set by order value tiers</Text>
        {rows.map((t) => (
          <InlineStack key={t.id} gap="300" blockAlign="center" wrap={false}>
            <div className="rt-vip-name"><Text as="span">{`First order from ${money(t.min)}`}</Text></div>
            <TextField
              label={`Reward for first orders from ${money(t.min)}`}
              labelHidden
              type="number"
              prefix={unit.prefix}
              suffix={unit.suffix}
              value={String(t[side])}
              onChange={(v) => setForm({...form, tiers: form.tiers.map((x) => (x.id === t.id ? {...x, [side]: v} : x))})}
              error={touched ? errors[t.id]?.[side] : undefined}
              disabled={locked}
              autoComplete="off"
            />
          </InlineStack>
        ))}
        <Text as="p" variant="bodySm" tone="subdued">Change amounts and add or remove tiers in <Button url="/demo" variant="plain">Order value tiers</Button>.</Text>
      </BlockStack>
    </Box>
  );
}

const sideErrors = (form, side) => Object.values(checkTiers(form).errors).filter((e) => e[side]).length;

function usePageState(field) {
  const {program: saved, save} = useProgram();
  const {state} = useScenario();
  const [form, setForm] = useState(saved);
  useEffect(() => setForm(saved), [saved]);
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  return {saved, save, form, setForm, dirty, state, field};
}

function valueError(method, value) {
  const v = Number(value);
  if (!(v > 0)) return 'Number needs to be greater than 0';
  if (method === 'percentage' && v > 100) return 'A percentage can be 100 at most';
  if (method === 'point' && !Number.isInteger(v)) return 'Points must be a whole number';
  return undefined;
}

export function RefereeRewards() {
  const {notify, notYet} = useShell();
  const {setState} = useScenario();
  const {save, form, setForm, dirty, state} = usePageState();
  const [touched, setTouched] = useState(false);
  const [combo, setCombo] = useState({product: true, order: true, shipping: true});
  const guard = useLeaveGuard(dirty);
  const locked = state === 'disabled';
  const tiered = friendTiered(form);
  const storeCreditWithTiers = form.tiersOn && form.friendMethod === 'store_credit_fixed';
  const err = !tiered ? valueError(form.friendMethod, form.friendValue) : sideErrors(form, 'friend') ? 'tiers' : undefined;
  const firstTier = sortTiers(form.tiers).find((t) => Number(t.min) > 0);
  const unit = unitFor(form.friendMethod);

  const onSave = () => {
    setTouched(true);
    if (err) return notify(err === 'tiers' ? 'Some tier values need attention' : '1 field needs attention', {error: true});
    save(form);
    setTouched(false);
    return notify('Saved program successfully');
  };
  const page = {
    backAction: {content: 'Referral program', url: '/demo'},
    title: 'Rewards for referees',
    primaryAction: {content: 'Save', onAction: onSave, disabled: locked || !dirty || state === 'loading' || state === 'error'},
  };
  if (state === 'loading') return <Page {...page}><LoadingView rows={8} /></Page>;
  if (state === 'error') return <Page {...page}><ErrorView title="Couldn't load rewards for referees" onRetry={() => setState('default')}>Nothing was changed.</ErrorView></Page>;

  return (
    <Page {...page}>
      <Layout>
        {locked ? <Layout.Section><PlanBanner onViewPlans={notYet} /></Layout.Section> : null}
        <Layout.Section>
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="400">
                <Text as="span" variant="headingMd">Reward settings</Text>
                <Select label="Reward method" options={FRIEND_METHODS} value={form.friendMethod} onChange={(v) => setForm({...form, friendMethod: v})} disabled={locked} />
                {storeCreditWithTiers ? (
                  <Banner tone="info">
                    <p>Store credit can't change by tier: friends get it when they claim, before there is a cart. Every friend gets the value below.</p>
                  </Banner>
                ) : null}
                {tiered ? (
                  <TierValues form={form} setForm={setForm} side="friend" touched={touched} locked={locked} />
                ) : (
                  <TextField
                    label="Reward value"
                    type="number"
                    prefix={unit.prefix}
                    suffix={unit.suffix}
                    value={String(form.friendValue)}
                    onChange={(v) => setForm({...form, friendValue: v})}
                    error={touched ? err : undefined}
                    disabled={locked}
                    autoComplete="off"
                  />
                )}
              </BlockStack>
            </Card>
            {form.friendMethod !== 'store_credit_fixed' ? (
              <Card>
                <BlockStack gap="400">
                  <Text as="span" variant="headingMd">Condition</Text>
                  {form.tiersOn && firstTier ? (
                    <BlockStack gap="100">
                      <Text as="p" fontWeight="semibold">Minimum order requirement</Text>
                      <Text as="p" tone="subdued">{`Set by your first tier: orders from ${money(firstTier.min)}.`}</Text>
                    </BlockStack>
                  ) : (
                    <>
                      <ChoiceList
                        title="Minimum order requirement"
                        choices={[{label: 'No minimum requirements', value: 'none'}, {label: 'Minimum purchase amount ($)', value: 'min'}]}
                        selected={[Number(form.friendMinOrder) > 0 || form.friendMinOrder === '' ? 'min' : 'none']}
                        onChange={([c]) => setForm({...form, friendMinOrder: c === 'min' ? '50' : 0})}
                        disabled={locked}
                      />
                      {Number(form.friendMinOrder) > 0 || form.friendMinOrder === '' ? (
                        <TextField label="Minimum purchase amount" labelHidden type="number" prefix="$" value={String(form.friendMinOrder)} onChange={(v) => setForm({...form, friendMinOrder: v})} disabled={locked} autoComplete="off" />
                      ) : null}
                    </>
                  )}
                  <BlockStack gap="100">
                    <Text as="p" fontWeight="semibold">Discount combinations</Text>
                    <Checkbox label="Product discounts" checked={combo.product} onChange={(v) => setCombo({...combo, product: v})} disabled={locked} />
                    <Checkbox
                      label="Order discounts"
                      checked={combo.order && !tiered}
                      onChange={(v) => setCombo({...combo, order: v})}
                      disabled={locked || tiered}
                      helpText={tiered ? "Off while the friend's discount is set by tier: another order discount would change which tier the cart reaches." : undefined}
                    />
                    <Checkbox label="Shipping discounts" checked={combo.shipping} onChange={(v) => setCombo({...combo, shipping: v})} disabled={locked} />
                  </BlockStack>
                </BlockStack>
              </Card>
            ) : null}
          </BlockStack>
        </Layout.Section>
      </Layout>
      {guard}
    </Page>
  );
}

export function ReferrerRewards() {
  const {notify, notYet} = useShell();
  const {setState} = useScenario();
  const {save, form, setForm, dirty, state} = usePageState();
  const [touched, setTouched] = useState(false);
  const guard = useLeaveGuard(dirty);
  const locked = state === 'disabled';
  const tiered = referrerTiered(form);
  const orderValueMethod = ['point_order_value', 'store_credit_order_value'].includes(form.referrerMethod);
  const vipBlocked = form.tiersOn && form.tierReferrer && TIERABLE_REFERRER.includes(form.referrerMethod);
  const firstTier = sortTiers(form.tiers).find((t) => Number(t.min) > 0);
  const err = !tiered && !form.referrerVipRates ? valueError(form.referrerMethod, form.referrerValue) : tiered && sideErrors(form, 'referrer') ? 'tiers' : undefined;
  const unit = unitFor(form.referrerMethod);

  const onSave = () => {
    setTouched(true);
    if (err) return notify(err === 'tiers' ? 'Some tier values need attention' : '1 field needs attention', {error: true});
    save(form);
    setTouched(false);
    return notify('Saved program successfully');
  };
  const page = {
    backAction: {content: 'Referral program', url: '/demo'},
    title: 'Rewards for referrers',
    primaryAction: {content: 'Save', onAction: onSave, disabled: locked || !dirty || state === 'loading' || state === 'error'},
  };
  if (state === 'loading') return <Page {...page}><LoadingView rows={8} /></Page>;
  if (state === 'error') return <Page {...page}><ErrorView title="Couldn't load rewards for referrers" onRetry={() => setState('default')}>Nothing was changed.</ErrorView></Page>;

  return (
    <Page {...page}>
      <Layout>
        {locked ? <Layout.Section><PlanBanner onViewPlans={notYet} /></Layout.Section> : null}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="span" variant="headingMd">Reward settings</Text>
              <Select label="Reward method" options={REFERRER_METHODS} value={form.referrerMethod} onChange={(v) => setForm({...form, referrerMethod: v, referrerValue: v === 'point_order_value' ? '2' : v === 'store_credit_order_value' ? '10' : ['point_order_value', 'store_credit_order_value'].includes(form.referrerMethod) ? '100' : form.referrerValue})} disabled={locked} />
              {form.tiersOn && orderValueMethod && firstTier ? (
                <Banner tone="info">
                  <p>{`This method already grows with the order, so it isn't set by tier. Referrers earn it only for first orders from ${money(firstTier.min)}, your first tier.`}</p>
                </Banner>
              ) : null}
              <Checkbox
                label="Apply tier-based reward rates"
                checked={form.referrerVipRates}
                onChange={(v) => setForm({...form, referrerVipRates: v})}
                disabled={locked || vipBlocked}
                helpText={vipBlocked ? <span>Order value tiers set this reward. To use VIP tier rates instead, untick "Referrer's reward" in <Button variant="plain" url="/demo">Order value tiers</Button>.</span> : undefined}
              />
              {form.referrerMethod === 'point_order_value' && !form.referrerVipRates ? (
                <BlockStack gap="200">
                  <Checkbox label="Set a maximum points per referral" helpText="Cap the points a referrer can earn from a single referral, regardless of the order value." checked={form.referrerMaxOn} onChange={(v) => setForm({...form, referrerMaxOn: v})} disabled={locked} />
                  {form.referrerMaxOn ? <TextField label="Set a maximum points per referral" labelHidden type="number" suffix="points" value={String(form.referrerMax)} onChange={(v) => setForm({...form, referrerMax: v})} disabled={locked} autoComplete="off" /> : null}
                </BlockStack>
              ) : null}
              {form.referrerVipRates ? (
                <BlockStack gap="300">
                  {VIP_TIERS.map((t, i) => (
                    <InlineStack key={t.id} gap="300" blockAlign="center" wrap={false}>
                      <div className="rt-vip-name"><Text as="span">{`Applies to ${t.name.toLowerCase()} only`}</Text></div>
                      <TextField label={t.name} labelHidden type="number" prefix={unit.prefix} suffix={unit.suffix} value={String((i + 1) * 100)} onChange={notYet} disabled={locked} autoComplete="off" />
                    </InlineStack>
                  ))}
                </BlockStack>
              ) : tiered ? (
                <TierValues form={form} setForm={setForm} side="referrer" touched={touched} locked={locked} />
              ) : (
                <TextField
                  label={orderValueMethod ? (form.referrerMethod === 'point_order_value' ? 'Points per $1 spent' : 'Store credit rate') : 'Reward value'}
                  type="number"
                  prefix={orderValueMethod ? undefined : unit.prefix}
                  suffix={form.referrerMethod === 'point_order_value' ? 'points per $1' : orderValueMethod ? '%' : unit.suffix}
                  value={String(form.referrerValue)}
                  onChange={(v) => setForm({...form, referrerValue: v})}
                  error={touched ? err : undefined}
                  disabled={locked}
                  autoComplete="off"
                />
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
      {guard}
    </Page>
  );
}

