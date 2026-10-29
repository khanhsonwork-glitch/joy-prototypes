// Rewards for referrers / Rewards for referees, card for card as the Joy admin draws them today
// (ReferringCustomerReward.js, ReferredFriendReward.js). Tiers live inside each page's Reward settings card:
// the referrer gets a new Reward method, the friend (release 2) a checkbox that swaps Reward value for tiers.
import React, {useEffect, useMemo, useState} from 'react';
import {
  Banner, BlockStack, Button, Card, Checkbox, ChoiceList, Layout, Page, Select, Text, TextField,
} from '@shopify/polaris';
import {useShell} from '../shell/ShellContext.jsx';
import {useRoute} from '../shell/router.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {ErrorView, LoadingView} from '../kit/StateView.jsx';
import {useProgram} from '../state/program.jsx';
import {FRIEND_METHODS, TIERABLE_FRIEND, TIERS_METHOD, VIP_TIERS, money, referrerMethods} from '../data/index.js';
import {
  checkFriend, checkReferrer, examples, friendLinked, friendTiered, friendTiers, friendValueText, pointsText, referrerTiered,
  referrerTiers, sortTiers, unitFor,
} from '../state/logic.js';
import {PlanBanner, useLeaveGuard} from './shared.jsx';
import {TierTable, nextTier} from './TierTable.jsx';

let nextId = 100;
const newId = () => `n${nextId++}`;

function usePageState() {
  const {program: saved, save} = useProgram();
  const {state, setState} = useScenario();
  const [form, setForm] = useState(saved);
  const [touched, setTouched] = useState(state === 'worst');
  useEffect(() => {setForm(saved); setTouched(state === 'worst');}, [saved, state]);
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  return {saved, save, form, setForm, dirty, state, setState, touched, setTouched};
}

function valueError(method, value) {
  const v = Number(value);
  if (!(v > 0)) return 'Number needs to be greater than 0';
  if (method === 'percentage' && v > 100) return 'A percentage can be 100 at most';
  if (method === 'point' && !Number.isInteger(v)) return 'Points must be a whole number';
  return undefined;
}

const fieldsNeed = (k) => `${k} ${k === 1 ? 'field needs' : 'fields need'} attention before you save`;

/** Save: block on errors, otherwise write the program. */
function useSave({form, save, setTouched, count}) {
  const {notify} = useShell();
  return () => {
    setTouched(true);
    if (count) {
      notify(`${count} ${count === 1 ? 'field needs' : 'fields need'} attention`, {error: true});
      window.setTimeout(() => document.querySelector('.Polaris-Page [aria-invalid="true"]')?.focus(), 0);
      return;
    }
    save(form);
    setTouched(false);
    notify('Saved program successfully');
  };
}

// ---------------------------------------------------------------- Rewards for referrers

function ReferrerTierExamples({tiers}) {
  const ex = examples(tiers);
  const first = tiers.find((t) => Number(t.min) > 0);
  if (!ex.length) return null;
  const parts = ex.map((e, i) => `${i === 0 ? '' : ', and '}${pointsText(e.tier.value)} for a ${money(e.order)} ${i === 0 ? 'referee first order' : 'one'} (tier ${e.index + 1})`);
  return (
    <BlockStack gap="100">
      <div data-tier-example><Text as="p" tone="subdued">{`Referrer will receive ${parts.join('')}.`}</Text></div>
      {first ? <Text as="p" tone="subdued">{`An order below ${money(first.min)} earns nothing: the referral stays pending until one of the friend's orders reaches ${money(first.min)}.`}</Text> : null}
    </BlockStack>
  );
}

export function ReferrerRewards() {
  const {notYet} = useShell();
  const {query} = useRoute();
  const methods = useMemo(() => referrerMethods(query.get('label') === 'b' ? 'b' : 'a'), [query]);
  const {save, form, setForm, dirty, state, setState, touched, setTouched} = usePageState();
  const guard = useLeaveGuard(dirty);
  const locked = state === 'disabled';
  const tiered = referrerTiered(form);
  const tiers = referrerTiers(form);
  const check = checkReferrer(form);
  const vipShown = !tiered && form.referrerMethod !== 'point_order_value';
  const err = !tiered && !form.referrerVipRates ? valueError(form.referrerMethod, form.referrerValue) : undefined;
  const count = tiered ? check.count : err ? 1 : 0;
  const onSave = useSave({form, save, setTouched, count});
  const unit = unitFor(form.referrerMethod);
  const orderValue = form.referrerMethod === 'point_order_value';

  const setTiers = (next) => setForm({...form, referrerTiers: next});
  const raw = form.referrerTiers;
  const pickMethod = (v) => {
    // Leaving tiers while the friend's discount reuses these amounts: the friend keeps them as its own list.
    if (v !== TIERS_METHOD && friendLinked(form)) {
      return setForm({...form, referrerMethod: v, friendSameAmounts: false, friendTiers: friendTiers(form).map((t) => ({id: newId(), min: String(t.min), value: String(t.value)}))});
    }
    if (v !== TIERS_METHOD || raw.length) return setForm({...form, referrerMethod: v});
    // First time on tiers: tier 1 = today's minimum order and today's points, so nothing changes until tier 2 is added.
    const points = form.referrerMethod === 'point' ? String(form.referrerValue) : '100';
    return setForm({...form, referrerMethod: v, referrerTiers: [{id: newId(), min: String(form.friendMinOrder || 50), points}]});
  };

  const page = {
    backAction: {content: 'Reward programs', url: '/demo?type=referral'},
    title: 'Rewards for referrers',
    primaryAction: {content: 'Save', onAction: onSave, disabled: locked || !dirty || state === 'loading' || state === 'error'},
  };
  if (state === 'loading') return <Page {...page}><LoadingView rows={8} /></Page>;
  if (state === 'error') return <Page {...page}><ErrorView title="Couldn't load rewards for referrers" onRetry={() => setState('default')}>Nothing was changed.</ErrorView></Page>;

  return (
    <Page {...page}>
      <Layout>
        {locked ? <Layout.Section><PlanBanner onViewPlans={notYet} /></Layout.Section> : null}
        {touched && count ? <Layout.Section><Banner tone="critical" title={fieldsNeed(count)} /></Layout.Section> : null}
        <Layout.Section>
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="400">
                <Text as="span" variant="headingMd">Reward settings</Text>
                <Select
                  label="Reward method"
                  options={methods}
                  value={form.referrerMethod}
                  onChange={pickMethod}
                  disabled={locked}
                  helpText={tiered ? "Referrers earn points by the referred friend's first order value. Tier 1 is the minimum order." : undefined}
                />
                {tiered ? (
                  <div id="tiers">
                    <TierTable
                      tiers={tiers}
                      valueLabel="Referrer gets"
                      unit={{suffix: 'points'}}
                      onMin={(id, v) => setTiers(raw.map((t) => (t.id === id ? {...t, min: v} : t)))}
                      onValue={(id, v) => setTiers(raw.map((t) => (t.id === id ? {...t, points: v} : t)))}
                      onAdd={() => {
                        const x = nextTier(tiers, form.friendMinOrder || 50, 100);
                        const id = newId();
                        // A linked friend discount gets a value for the new tier too, so the referee page never has a blank row.
                        const lastFriend = friendLinked(form) ? Number(friendTiers(form).at(-1)?.value) || 0 : 0;
                        setForm({
                          ...form,
                          referrerTiers: [...raw, {id, min: x.min, points: x.value}],
                          ...(lastFriend ? {friendTierValues: {...form.friendTierValues, [id]: String(lastFriend * 2)}} : {}),
                        });
                      }}
                      onRemove={(id) => setTiers(raw.filter((t) => t.id !== id))}
                      onResort={() => setTiers(sortTiers(raw))}
                      check={check}
                      show={touched}
                      locked={locked}
                      examples={(
                        <BlockStack gap="200">
                          <ReferrerTierExamples tiers={tiers} />
                          {friendLinked(form) ? <Text as="p" tone="subdued">Rewards for referees uses these order amounts too.</Text> : null}
                          {!friendTiered(form) && tiers[0] && Number(form.friendMinOrder) !== Number(tiers[0].min) ? (
                            <Text as="p" tone="caution">{`Friends can use their coupon from ${Number(form.friendMinOrder) > 0 ? money(form.friendMinOrder) : 'any amount'} (Rewards for referees), but the referral completes only from ${money(tiers[0].min)}.`}</Text>
                          ) : null}
                          <Text as="p" variant="bodySm" tone="subdued">Order value is the friend's subtotal after other discounts and before the referral discount, without shipping and taxes. A tier applies from its amount up to the next tier.</Text>
                        </BlockStack>
                      )}
                    />
                  </div>
                ) : null}
                {vipShown ? (
                  <Checkbox
                    label="Apply tier-based reward rates"
                    checked={form.referrerVipRates}
                    onChange={(v) => setForm({...form, referrerVipRates: v})}
                    disabled={locked}
                  />
                ) : null}
                {vipShown && form.referrerVipRates ? (
                  <BlockStack gap="300">
                    {VIP_TIERS.map((t, i) => (
                      <BlockStack key={t.id} gap="100">
                        <Text as="h3" variant="headingSm">{t.name}</Text>
                        <TextField label={`Applies to ${t.name.toLowerCase()} only`} type="number" prefix={unit.prefix} suffix={unit.suffix} value={String((i + 1) * 100)} onChange={notYet} disabled={locked} autoComplete="off" />
                      </BlockStack>
                    ))}
                  </BlockStack>
                ) : null}
                {vipShown && !form.referrerVipRates ? (
                  <TextField
                    label="Reward value"
                    type="number"
                    prefix={form.referrerMethod === 'store_credit_order_value' ? undefined : unit.prefix}
                    suffix={form.referrerMethod === 'store_credit_order_value' ? '%' : unit.suffix}
                    value={String(form.referrerValue)}
                    onChange={(v) => setForm({...form, referrerValue: v})}
                    error={touched ? err : undefined}
                    disabled={locked}
                    autoComplete="off"
                  />
                ) : null}
              </BlockStack>
            </Card>
            {['amount', 'percentage'].includes(form.referrerMethod) ? (
              <Card>
                <Checkbox label="Customize discount code's prefix" checked={false} onChange={notYet} disabled={locked} />
              </Card>
            ) : null}
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingSm">Bonus points when a friend claims</Text>
                <Checkbox
                  label="Give the referrer bonus points as soon as a referred friend claims their reward"
                  helpText="Granted once per referred friend, before any purchase, on top of the reward above. Turn on the referral limit to cap how many bonuses one customer can earn."
                  checked={false}
                  onChange={notYet}
                  disabled={locked}
                />
              </BlockStack>
            </Card>
            {orderValue ? (
              <Card>
                <BlockStack gap="400">
                  <Text as="span" variant="headingMd">Points based on order value settings</Text>
                  <Checkbox label="Apply tier-based reward rates" checked={false} onChange={notYet} disabled={locked} />
                  <TextField label="Points per $1 spent" type="number" suffix="points per $1" value={String(form.referrerValue)} onChange={(v) => setForm({...form, referrerValue: v})} error={touched ? err : undefined} disabled={locked} autoComplete="off" />
                  <Checkbox label="Set a maximum points per referral" helpText="Cap the points a referrer can earn from a single referral, regardless of the order value." checked={form.referrerMaxOn} onChange={(v) => setForm({...form, referrerMaxOn: v})} disabled={locked} />
                  <Text as="p" tone="subdued">{`Referrer will receive ${num100(form)} points for a $100 referee first order (at ${form.referrerValue} points per $1)`}</Text>
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

function num100(form) {
  const raw = Math.floor(100 * (Number(form.referrerValue) || 0));
  const cap = form.referrerMaxOn ? Number(form.referrerMax) || 0 : 0;
  return cap && raw > cap ? cap : raw;
}

// ---------------------------------------------------------------- Rewards for referees

function FriendTierExamples({tiers, method}) {
  const ex = examples(tiers);
  const first = tiers.find((t) => Number(t.min) > 0);
  if (!ex.length) return null;
  const parts = ex.map((e, i) => `${i === 0 ? 'A' : '; a'} ${money(e.order)} first order gets ${friendValueText(method, e.tier.value)} (tier ${e.index + 1})`);
  return (
    <BlockStack gap="100">
      <div data-tier-example><Text as="p" tone="subdued">{`${parts.join('')}.`}</Text></div>
      {first ? <Text as="p" tone="subdued">{`Below ${money(first.min)} the code doesn't apply at checkout.`}</Text> : null}
    </BlockStack>
  );
}

export function RefereeRewards() {
  const {notYet} = useShell();
  const {save, form, setForm, dirty, state, setState, touched, setTouched} = usePageState();
  const guard = useLeaveGuard(dirty);
  const locked = state === 'disabled';
  const canTier = TIERABLE_FRIEND.includes(form.friendMethod);
  const tiered = friendTiered(form);
  const linked = friendLinked(form);
  const tiers = friendTiers(form);
  const check = checkFriend(form);
  const err = !tiered ? valueError(form.friendMethod, form.friendValue) : undefined;
  const count = tiered ? check.count : err ? 1 : 0;
  const onSave = useSave({form, save, setTouched, count});
  const unit = unitFor(form.friendMethod);
  const tierUnit = form.friendMethod === 'percentage' ? {suffix: '% off'} : {prefix: '$', suffix: 'off'};
  const first = tiered ? tiers.find((t) => Number(t.min) > 0) : null;
  const [combo, setCombo] = useState(['order', 'product', 'shipping']);
  const [channel, setChannel] = useState('online');
  const [expiry, setExpiry] = useState('never');

  const turnOn = (on) => {
    if (!on) return setForm({...form, friendTiersOn: false});
    // First time on: tier 1 = today's discount from today's minimum order.
    const seededLinked = referrerTiered(form) && !Object.keys(form.friendTierValues).length
      ? Object.fromEntries(sortTiers(form.referrerTiers).map((t, i) => [t.id, i === 0 ? String(form.friendValue) : '']))
      : form.friendTierValues;
    const own = form.friendTiers.length ? form.friendTiers : [{id: newId(), min: String(form.friendMinOrder || 50), value: String(form.friendValue)}];
    return setForm({...form, friendTiersOn: true, friendTierValues: seededLinked, friendTiers: own});
  };
  const setLink = (on) => {
    if (on) return setForm({...form, friendSameAmounts: true});
    // Unlinking copies the shared amounts into the friend's own list, so nothing on screen jumps.
    return setForm({...form, friendSameAmounts: false, friendTiers: tiers.map((t) => ({id: newId(), min: String(t.min), value: String(t.value)}))});
  };
  const setValue = (id, v) => (linked
    ? setForm({...form, friendTierValues: {...form.friendTierValues, [id]: v}})
    : setForm({...form, friendTiers: form.friendTiers.map((t) => (t.id === id ? {...t, value: v} : t))}));

  const page = {
    backAction: {content: 'Reward programs', url: '/demo?type=referral'},
    title: 'Rewards for referees',
    primaryAction: {content: 'Save', onAction: onSave, disabled: locked || !dirty || state === 'loading' || state === 'error'},
  };
  if (state === 'loading') return <Page {...page}><LoadingView rows={8} /></Page>;
  if (state === 'error') return <Page {...page}><ErrorView title="Couldn't load rewards for referees" onRetry={() => setState('default')}>Nothing was changed.</ErrorView></Page>;

  return (
    <Page {...page}>
      <Layout>
        {locked ? <Layout.Section><PlanBanner onViewPlans={notYet} /></Layout.Section> : null}
        {touched && count ? <Layout.Section><Banner tone="critical" title={fieldsNeed(count)} /></Layout.Section> : null}
        <Layout.Section>
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="400">
                <Text as="span" variant="headingMd">Reward settings</Text>
                <Select label="Reward method" options={FRIEND_METHODS} value={form.friendMethod} onChange={(v) => setForm({...form, friendMethod: v})} disabled={locked} />
                {canTier ? (
                  <div className="rt-release" id="tiers">
                    <span className="rt-release__tag">Prototype · release 2</span>
                    <BlockStack gap="300">
                      <Checkbox
                        label="Set the discount by the friend's order value"
                        helpText="One code for every tier: checkout takes off the discount of the tier the cart reaches. Tier 1 is the minimum order."
                        checked={form.friendTiersOn}
                        onChange={turnOn}
                        disabled={locked}
                      />
                      {tiered && referrerTiered(form) ? (
                        <Checkbox
                          label="Use the same order amounts as Rewards for referrers"
                          checked={form.friendSameAmounts}
                          onChange={setLink}
                          disabled={locked}
                        />
                      ) : null}
                      {tiered ? (
                        <TierTable
                          tiers={tiers}
                          valueLabel="Friend gets"
                          unit={tierUnit}
                          minLocked={linked}
                          minLockedHelp={<>Order amounts follow <Button variant="plain" url="/demo/referrer">Rewards for referrers</Button>. Change or add tiers there.</>}
                          onMin={(id, v) => setForm({...form, friendTiers: form.friendTiers.map((t) => (t.id === id ? {...t, min: v} : t))})}
                          onValue={setValue}
                          onAdd={() => {const x = nextTier(tiers, form.friendMinOrder || 50, form.friendValue); setForm({...form, friendTiers: [...form.friendTiers, {id: newId(), ...x}]});}}
                          onRemove={(id) => setForm({...form, friendTiers: form.friendTiers.filter((t) => t.id !== id)})}
                          onResort={() => (linked ? null : setForm({...form, friendTiers: sortTiers(form.friendTiers)}))}
                          check={check}
                          show={touched}
                          locked={locked}
                          examples={<FriendTierExamples tiers={tiers} method={form.friendMethod} />}
                        />
                      ) : null}
                    </BlockStack>
                  </div>
                ) : null}
                {!tiered ? (
                  <TextField
                    label="Reward value"
                    type="number"
                    prefix={unit.prefix}
                    suffix={unit.suffix}
                    value={String(form.friendValue)}
                    onChange={(v) => setForm({...form, friendValue: v})}
                    error={touched ? err : undefined}
                    helpText={form.friendMethod === 'store_credit_fixed' ? `Referee will receive ${money(form.friendValue)} store credit for each successful referral` : undefined}
                    disabled={locked}
                    autoComplete="off"
                  />
                ) : null}
              </BlockStack>
            </Card>
            {form.friendMethod !== 'store_credit_fixed' ? (
              <>
                <Card>
                  <Checkbox label="Customize discount code's prefix" checked={false} onChange={notYet} disabled={locked} />
                </Card>
                <Card>
                  <BlockStack gap="300">
                    <Text as="span" variant="headingMd">Reward conditions</Text>
                    <Select label="Discount applies to" options={[{label: 'All orders', value: 'all'}, {label: 'Specific collections', value: 'collections'}]} value="all" onChange={notYet} disabled={locked} />
                    <Select
                      label="Purchase type"
                      options={[{label: 'One-time purchase', value: 'otp'}, {label: 'Subscription', value: 'sub'}, {label: 'Both', value: 'both'}]}
                      value="otp"
                      onChange={notYet}
                      helpText="The discount applies to one-time purchase orders"
                      disabled={locked}
                    />
                    <ChoiceList
                      title="Order value requirement"
                      disabled={locked}
                      choices={[
                        {label: 'No minimum requirements', value: 'none', disabled: tiered},
                        {
                          label: 'Minimum purchase amount',
                          value: 'min',
                          renderChildren: (on) => on && (
                            <TextField
                              label="Minimum purchase amount"
                              labelHidden
                              type="number"
                              suffix="$"
                              value={String(tiered && first ? first.min : form.friendMinOrder)}
                              onChange={(v) => setForm({...form, friendMinOrder: v})}
                              disabled={locked || tiered}
                              helpText={tiered ? 'Set by tier 1 in Reward settings.' : undefined}
                              autoComplete="off"
                            />
                          ),
                        },
                        {label: 'Minimum quantity of items', value: 'qty', disabled: tiered},
                      ]}
                      selected={[tiered || Number(form.friendMinOrder) > 0 || form.friendMinOrder === '' ? 'min' : 'none']}
                      onChange={([c]) => setForm({...form, friendMinOrder: c === 'min' ? '50' : 0})}
                    />
                    <ChoiceList
                      allowMultiple
                      title="Combinations"
                      choices={[
                        {label: 'Order discounts', value: 'order', disabled: tiered, helpText: tiered ? 'Off while the discount is set by tier: another order discount would change which tier the cart reaches.' : undefined},
                        {label: 'Product discounts', value: 'product'},
                        {label: 'Shipping discounts', value: 'shipping'},
                      ]}
                      selected={tiered ? combo.filter((c) => c !== 'order') : combo}
                      onChange={setCombo}
                      disabled={locked}
                    />
                    <ChoiceList
                      title="Apply discount to sale channel"
                      choices={[
                        {label: 'Online store only', value: 'online'},
                        {label: 'Online store & Point of Sale', value: 'both'},
                        {label: 'Point of Sale only', value: 'pos'},
                      ]}
                      selected={[channel]}
                      onChange={([c]) => setChannel(c)}
                      disabled={locked}
                    />
                  </BlockStack>
                </Card>
                <Card>
                  <BlockStack gap="300">
                    <Text as="span" variant="headingMd">Coupon validity</Text>
                    <ChoiceList
                      title="Coupon validity"
                      titleHidden
                      choices={[
                        {label: 'Never expire', value: 'never'},
                        {label: 'Expire after a set duration', value: 'duration'},
                        {label: 'Set a specific date and time', value: 'date'},
                      ]}
                      selected={[expiry]}
                      onChange={([c]) => setExpiry(c)}
                      disabled={locked}
                    />
                  </BlockStack>
                </Card>
              </>
            ) : null}
          </BlockStack>
        </Layout.Section>
      </Layout>
      {guard}
    </Page>
  );
}
