// Rewards for referrers / Rewards for referees, card for card as the Joy admin draws them today
// (ReferringCustomerReward.js, ReferredFriendReward.js). Tiers live inside each page's Reward settings card:
// the referrer gets "Calculate points" inside "Points based on order value", the friend a checkbox that swaps Reward value for tiers.
import React, {useEffect, useState} from 'react';
import {
  Banner, BlockStack, Button, Card, Checkbox, ChoiceList, Layout, Page, Select, Text, TextField,
} from '@shopify/polaris';
import {useShell} from '../shell/ShellContext.jsx';
import {useRoute} from '../shell/router.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {ErrorView, LoadingView} from '../kit/StateView.jsx';
import {useProgram} from '../state/program.jsx';
import {CALC_AMOUNT, CALC_RATE, FRIEND_METHODS, REFERRER_METHODS, TIERABLE_FRIEND, VIP_TIERS, money, num} from '../data/index.js';
import {
  checkFriend, checkReferrer, examples, friendDiscount, orderFor, outcome, friendLinked, friendTiered, friendTiers, friendValueText, pointsText, referrerTiered,
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

/** "With these settings: …" under the order-amount table, built from the numbers being typed and the friend's code. */
function ReferrerAmountHelp({form, tiers}) {
  const ex = examples(tiers);
  const first = tiers.find((t) => Number(t.min) > 0);
  if (!ex.length) return null;
  const line = (target) => {
    const order = orderFor(form, target);
    const res = outcome(form, order);
    const code = res.discount ? ` with the ${money(res.discount)} referral code` : '';
    return {order, res, code};
  };
  const parts = ex.map((e, i) => {
    const {order, res, code} = line(e.order);
    return `${i === 0 ? 'order' : ' Order'} ${money(order)}${i === 0 ? code : ''} → ${money(res.counted)} counted → ${res.referrer || 'no points yet'}.`;
  });
  // The near-miss: an order just over the lowest amount that the code pulls under it.
  let nearMiss = '';
  if (first) {
    const d = friendDiscount(form, Number(first.min) + 1);
    if (d > 0) {
      const order = Math.round((Number(first.min) + d / 2) * 100) / 100;
      const res = outcome(form, order);
      if (!res.qualifies) nearMiss = ` Order ${money(order)} → ${money(res.counted)} counted → under ${money(first.min)}, so the referral doesn't complete yet.`;
    }
  }
  return (
    <div data-tier-example>
      <Text as="p" tone="subdued">{`With these settings: ${parts.join('')}${nearMiss}`}</Text>
    </div>
  );
}

const rateText = (rate) => `${num(rate)} ${Number(rate) === 1 ? 'point' : 'points'} per $1`;
const ROUNDING = [
  {label: 'Rounding to the nearest', value: 'nearest', helpText: 'Rounds to the nearest whole number. For example, 10.4 becomes 10, and 10.5 becomes 11.'},
  {label: 'Rounding up', value: 'up', helpText: 'Always rounds up to the next whole number. For example, 10.1 becomes 11'},
  {label: 'Rounding down', value: 'down', helpText: 'Always rounds down to the previous whole number. For example, 10.9 becomes 10.'},
];

export function ReferrerRewards() {
  const {notYet} = useShell();
  const {save, form, setForm, dirty, state, setState, touched, setTouched} = usePageState();
  const guard = useLeaveGuard(dirty);
  const locked = state === 'disabled';
  const orderValue = form.referrerMethod === 'point_order_value';
  const byAmount = referrerTiered(form);
  const tiers = referrerTiers(form);
  const check = checkReferrer(form);
  const vipShown = !orderValue;
  const rateErr = orderValue && !byAmount ? valueError('point_order_value', form.referrerRate) : undefined;
  const err = !orderValue && !form.referrerVipRates ? valueError(form.referrerMethod, form.referrerValue) : rateErr;
  const count = byAmount ? check.count : err ? 1 : 0;
  const onSave = useSave({form, save, setTouched, count});
  const unit = unitFor(form.referrerMethod);

  const setTiers = (next) => setForm({...form, referrerTiers: next});
  const raw = form.referrerTiers;
  /** Apply a method/calc change; leaving "by order amount" while the friend reuses its amounts hands them to the friend. */
  const change = (patch) => {
    const next = {...form, ...patch};
    if (friendLinked(form) && !referrerTiered(next)) {
      Object.assign(next, {friendSameAmounts: false, friendTiers: friendTiers(form).map((t) => ({id: newId(), min: String(t.min), value: String(t.value)}))});
    }
    // First time by order amount: the lowest amount = today's friend minimum, its points = today's points, so nothing changes until a second row is added.
    if (referrerTiered(next) && !next.referrerTiers.length) {
      next.referrerTiers = [{id: newId(), min: String(form.friendMinOrder || 50), points: form.referrerMethod === 'point' ? String(form.referrerValue) : '100'}];
    }
    setForm(next);
  };
  const pickCalc = (v) => {
    change({referrerCalc: v});
    // Keep the address in sync so the link a reviewer copies opens the same choice.
    const [path, q = ''] = window.location.hash.replace(/^#/, '').split('?');
    const params = new URLSearchParams(q);
    params.set('calc', v);
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${path}?${params}`);
  };
  // "$50–$100 earns 100 points, over $100 earns 200 points", from the rows being typed.
  const valid = tiers.filter((t) => Number(t.min) > 0 && Number(t.value) > 0);
  const upTo = (next) => money(Math.round((Number(next.min) - 0.01) * 100) / 100);
  const rangeExample = valid.length
    ? valid.map((t, i) => {
      const next = valid[i + 1];
      if (next) return `${money(t.min)}–${upTo(next)} earns ${pointsText(t.value)}`;
      const cents = Math.round(Number(t.min) * 100) % 100 === 1;
      return `${cents ? `over ${upTo(t)}` : `${money(t.min)} and over`} earns ${pointsText(t.value)}`;
    }).join(', ')
    : '$50–$100 earns 100 points, over $100 earns 200 points';
  const rate = Number(form.referrerRate) || 1;

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
                <Select label="Reward method" options={REFERRER_METHODS} value={form.referrerMethod} onChange={(v) => change({referrerMethod: v})} disabled={locked} />
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
                  <div id="calc">
                    <ChoiceList
                      title="Calculate points"
                      disabled={locked}
                      choices={[
                        {label: 'Points for every $1 spent', value: CALC_RATE, helpText: `The bigger the order, the more points. Example: ${rateText(rate)} → a $75 order earns ${num(Math.floor(75 * rate))} points.`},
                        {label: 'Fixed points by order range', value: CALC_AMOUNT, helpText: `Same points for every order in a range. Example: ${rangeExample}.`},
                      ]}
                      selected={[form.referrerCalc]}
                      onChange={([v]) => pickCalc(v)}
                    />
                  </div>
                    {byAmount ? (
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
                            // A linked friend discount gets a value for the new row too, so the referee page never has a blank row.
                            const lastFriend = friendLinked(form) ? Number(friendTiers(form).at(-1)?.value) || 0 : 0;
                            setForm({
                              ...form,
                              referrerTiers: [...raw, {id, min: x.min, points: x.value}],
                              ...(lastFriend ? {friendTierValues: {...form.friendTierValues, [id]: String(form.friendMethod === 'percentage' ? Math.min(lastFriend * 2, 100) : lastFriend * 2)}} : {}),
                            });
                          }}
                          onRemove={(id) => setTiers(raw.filter((t) => t.id !== id))}
                          onResort={() => setTiers(sortTiers(raw))}
                          check={check}
                          show={touched}
                          locked={locked}
                          examples={(
                            <BlockStack gap="200">
                              <ReferrerAmountHelp form={form} tiers={tiers} />
                              {friendLinked(form) ? <Text as="p" tone="subdued">Rewards for referees uses these order amounts too.</Text> : null}
                              {!friendTiered(form) && tiers[0] && Number(form.friendMinOrder) !== Number(tiers[0].min) ? (
                                <Text as="p" tone="caution">{`Friends can use their coupon from ${Number(form.friendMinOrder) > 0 ? money(form.friendMinOrder) : 'any amount'} (Rewards for referees), but the referral completes only from ${money(tiers[0].min)}.`}</Text>
                              ) : null}
                              <Text as="p" variant="bodySm" tone="subdued">Counted amount is the friend's order subtotal after all discounts, including the referral code, before shipping and taxes. Each amount applies up to the next one.</Text>
                            </BlockStack>
                          )}
                        />
                      </div>
                    ) : null}
                  {!byAmount ? (
                    <>
                      <Checkbox label="Apply tier-based reward rates" helpText="Each VIP tier earns its own points per $1." checked={false} onChange={notYet} disabled={locked} />
                      <TextField label="Points per $1 spent" type="number" suffix="points per $1" value={String(form.referrerRate)} onChange={(v) => setForm({...form, referrerRate: v})} error={touched ? rateErr : undefined} disabled={locked} autoComplete="off" />
                      <Checkbox label="Set a maximum points per referral" helpText="Cap the points a referrer can earn from a single referral, regardless of the order value." checked={form.referrerMaxOn} onChange={(v) => setForm({...form, referrerMaxOn: v})} disabled={locked} />
                      {form.referrerMaxOn ? <TextField label="Set a maximum points per referral" labelHidden type="number" suffix="points" value={String(form.referrerMax)} onChange={(v) => setForm({...form, referrerMax: v})} disabled={locked} autoComplete="off" /> : null}
                      <ChoiceList title="Rounding method" choices={ROUNDING} selected={['down']} onChange={notYet} disabled={locked} />
                      <div data-rate-example><Text as="p" tone="subdued">{`Referrer will receive ${num(num100(form))} points for a $100 referee first order (at ${form.referrerRate} points per $1)`}</Text></div>
                    </>
                  ) : null}
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
  const raw = Math.floor(100 * (Number(form.referrerRate) || 0));
  const cap = form.referrerMaxOn ? Number(form.referrerMax) || 0 : 0;
  return cap && raw > cap ? cap : raw;
}

// ---------------------------------------------------------------- Rewards for referees

function FriendTierExamples({tiers, method}) {
  const ex = examples(tiers);
  const first = tiers.find((t) => Number(t.min) > 0);
  if (!ex.length) return null;
  const parts = ex.map((e, i) => `${i === 0 ? 'With these settings: a' : '; a'} ${money(e.order)} first order gets ${friendValueText(method, e.tier.value)}`);
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
                  <div id="tiers">
                    <BlockStack gap="300">
                      <Checkbox
                        label="Set the discount by the friend's order value"
                        helpText="One code for every order amount: checkout takes off the discount for the amount the cart reaches. The lowest amount is the minimum order."
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
                          minLockedHelp={<>Order amounts follow <Button variant="plain" url="/demo/referrer">Rewards for referrers</Button>. Change or add them there.</>}
                          onMin={(id, v) => setForm({...form, friendTiers: form.friendTiers.map((t) => (t.id === id ? {...t, min: v} : t))})}
                          onValue={setValue}
                          onAdd={() => {const x = nextTier(tiers, form.friendMinOrder || 50, form.friendValue); if (form.friendMethod === 'percentage') x.value = String(Math.min(Number(x.value) || 0, 100)); setForm({...form, friendTiers: [...form.friendTiers, {id: newId(), ...x}]});}}
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
                              helpText={tiered ? 'Set by the lowest order amount in Reward settings.' : undefined}
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
                        {label: 'Order discounts', value: 'order', disabled: tiered, helpText: tiered ? 'Off while the discount is set by order amount: another order discount would change which amount the cart reaches.' : undefined},
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
