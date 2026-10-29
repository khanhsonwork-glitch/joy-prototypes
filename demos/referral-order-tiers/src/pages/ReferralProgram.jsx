// Reward programs → Referral program. The existing page (program card, rewards card) plus the new
// "Order value tiers" card: one table, one row per tier, a friend column and a referrer column.
import React, {useEffect, useMemo, useState} from 'react';
import {
  Badge, Banner, BlockStack, Box, Button, Card, Checkbox, Divider, InlineStack, Layout, Link, Page, Text, TextField,
} from '@shopify/polaris';
import {DeleteIcon, PlusIcon} from '@shopify/polaris-icons';
import {useShell} from '../shell/ShellContext.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {EmptyView, ErrorView, LoadingView} from '../kit/StateView.jsx';
import {useProgram} from '../state/program.jsx';
import {
  MAX_TIERS, REFERRER_METHODS, TIERABLE_FRIEND, TIERABLE_REFERRER, methodLabel, money, money2,
} from '../data/index.js';
import {
  canAddTier, checkTiers, friendSummary, friendTiered, outcome, referrerSummary, referrerTiered, sortTiers, unitFor,
} from '../state/logic.js';
import {PlanBanner, SyncBanner, useLeaveGuard} from './shared.jsx';

let nextId = 100;
// Phones stack each tier into a block, so every field needs its own label there.
function useNarrow() {
  const query = '(max-width: 640px)';
  const [narrow, setNarrow] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setNarrow(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return narrow;
}
const newId = () => `n${nextId++}`;

function TierRow({index, tier, program, errors, warnings, show, onChange, onRemove, locked}) {
  const narrow = useNarrow();
  const hide = index > 0 && !narrow;
  const fT = friendTiered(program);
  const rT = referrerTiered(program);
  const fUnit = unitFor(program.friendMethod);
  const rUnit = unitFor(program.referrerMethod);
  const e = errors || {};
  return (
    <div className="rt-row" data-tier-row={index + 1}>
      <div className="rt-cell rt-cell--name">
        <Text as="span" variant="bodySm" tone="subdued">Tier {index + 1}</Text>
      </div>
      <div className="rt-cell">
        <TextField
          label="Order subtotal from"
          labelHidden={hide}
          type="number"
          prefix="$"
          value={String(tier.min)}
          onChange={(v) => onChange({...tier, min: v})}
          error={show ? e.min : undefined}
          disabled={locked}
          autoComplete="off"
        />
      </div>
      <div className="rt-cell">
        {fT ? (
          <TextField
            label="Friend gets"
            labelHidden={hide}
            type="number"
            prefix={fUnit.prefix}
            suffix={fUnit.suffix === '%' ? '% off' : 'off'}
            value={String(tier.friend)}
            onChange={(v) => onChange({...tier, friend: v})}
            error={show ? e.friend : undefined}
            disabled={locked}
            autoComplete="off"
          />
        ) : (
          <BlockStack gap="100">
            {!hide ? <Text as="span" variant="bodyMd">Friend gets</Text> : null}
            <div className="rt-static"><Text as="span" tone="subdued">{friendSummary({...program, tiersOn: false, friendMinOrder: 0})}</Text></div>
          </BlockStack>
        )}
      </div>
      <div className="rt-cell">
        {rT ? (
          <TextField
            label="Referrer gets"
            labelHidden={hide}
            type="number"
            prefix={rUnit.prefix}
            suffix={rUnit.suffix === '%' ? '% off coupon' : rUnit.suffix || (program.referrerMethod === 'amount' ? 'off coupon' : 'store credit')}
            value={String(tier.referrer)}
            onChange={(v) => onChange({...tier, referrer: v})}
            error={show ? e.referrer : undefined}
            disabled={locked}
            autoComplete="off"
          />
        ) : (
          <BlockStack gap="100">
            {!hide ? <Text as="span" variant="bodyMd">Referrer gets</Text> : null}
            <div className="rt-static"><Text as="span" tone="subdued">{referrerSummary({...program, tiersOn: false})}</Text></div>
          </BlockStack>
        )}
      </div>
      <div className="rt-cell rt-cell--action">
        <Button icon={DeleteIcon} variant="tertiary" accessibilityLabel={`Remove tier ${index + 1}`} onClick={onRemove} disabled={locked} />
      </div>
      {warnings?.length ? (
        <div className="rt-warn" role="note">
          {warnings.map((w) => <Text key={w} as="p" variant="bodySm" tone="caution">{w}</Text>)}
        </div>
      ) : null}
    </div>
  );
}

function TryOrder({program}) {
  const [value, setValue] = useState('60');
  const subtotal = Number(value) || 0;
  const res = outcome(program, subtotal);
  const presets = [45, 60, 100, 150];
  return (
    <Box background="bg-surface-secondary" padding="400" borderRadius="200">
      <BlockStack gap="300">
        <InlineStack gap="300" blockAlign="end" wrap>
          <div className="rt-try">
            <TextField label="Try a friend's first order" type="number" prefix="$" value={value} onChange={setValue} autoComplete="off" />
          </div>
          <InlineStack gap="200" wrap>
            {presets.map((p) => (
              <Button key={p} size="slim" pressed={subtotal === p} onClick={() => setValue(String(p))}>{money(p)}</Button>
            ))}
          </InlineStack>
        </InlineStack>
        <Text as="p" variant="bodySm" tone="subdued">Subtotal before the referral discount. Assumes every item gets the code; anti-fraud checks aren't applied here.</Text>
        <div aria-live="polite" data-try-result>
          {res.qualifies ? (
            <Text as="p">
              A {money2(subtotal)} first order → friend gets <b>{res.friend || 'no discount'}</b>, referrer gets <b>{res.referrer || 'nothing'}</b>
              {res.tier ? <Text as="span" tone="subdued">{` (tier ${sortTiers(program.tiers).indexOf(res.tier) + 1})`}</Text> : null}.
            </Text>
          ) : (
            <Text as="p">
              A {money2(subtotal)} first order is below {money(res.min)}: <b>no tier reward</b>, and the referral stays pending until the friend places an order from {money(res.min)}.
            </Text>
          )}
        </div>
      </BlockStack>
    </Box>
  );
}

function TiersCard({program, setProgram, show, check, locked}) {
  const fCan = TIERABLE_FRIEND.includes(program.friendMethod);
  const rCan = TIERABLE_REFERRER.includes(program.referrerMethod) && !program.referrerVipRates;
  const sorted = program.tiers;
  const setTier = (t) => setProgram({...program, tiers: program.tiers.map((x) => (x.id === t.id ? t : x))});
  const removeTier = (id) => setProgram({...program, tiers: program.tiers.filter((x) => x.id !== id)});
  const addTier = () => {
    const last = sortTiers(program.tiers).at(-1);
    const min = last ? Math.round((Number(last.min) || 0) * 2) || 100 : Number(program.friendMinOrder) || 50;
    const friend = last ? (Number(last.friend) || 0) * 2 || '' : program.friendValue;
    const referrer = last ? (Number(last.referrer) || 0) * 2 || '' : program.referrerValue;
    setProgram({...program, tiers: [...program.tiers, {id: newId(), min: String(min), friend: String(friend), referrer: String(referrer)}]});
  };
  const resort = () => setProgram({...program, tiers: sortTiers(program.tiers)});

  const turnOn = (on) => {
    if (!on) return setProgram({...program, tiersOn: false});
    // First time on: tier 1 starts from today's reward and minimum order, so nothing changes until the merchant adds tier 2.
    // A side whose method can't be tiered starts blank: a rate or a cap is never copied in as a tier value.
    const tiers = program.tiers.length ? program.tiers : [{id: newId(), min: String(program.friendMinOrder || 50), friend: fCan ? String(program.friendValue) : '', referrer: rCan ? String(program.referrerValue) : ''}];
    return setProgram({...program, tiersOn: true, tierFriend: fCan, tierReferrer: rCan, tiers});
  };

  return (
    <Card>
      <BlockStack gap="400">
        <BlockStack gap="100">
          <Text as="h2" variant="headingMd">Order value tiers</Text>
          <Text as="p" tone="subdued">Give bigger rewards when the referred friend's first order is bigger.</Text>
        </BlockStack>
        <Checkbox
          label="Reward by the friend's first order value"
          helpText="The first tier is also the minimum: a first order below it doesn't complete the referral."
          checked={program.tiersOn}
          onChange={turnOn}
          disabled={locked}
        />
        {!program.tiersOn && program.tiers.length ? (
          <Text as="p" variant="bodySm" tone="subdued">Your tiers are kept for next time. Codes already sent keep the friend's reward they were sent with.</Text>
        ) : null}
        {program.tiersOn ? (
          <>
            <BlockStack gap="200">
              <Text as="p" fontWeight="semibold">Set by tier</Text>
              <InlineStack gap="600" wrap>
                <Checkbox
                  label="Friend's discount"
                  checked={program.tierFriend && fCan}
                  disabled={!fCan || locked}
                  onChange={(v) => setProgram({...program, tierFriend: v})}
                  helpText={fCan ? undefined : 'Store credit is given when the friend claims, before there is a cart.'}
                />
                <Checkbox
                  label="Referrer's reward"
                  checked={program.tierReferrer && rCan}
                  disabled={!rCan || locked}
                  onChange={(v) => setProgram({...program, tierReferrer: v})}
                  helpText={
                    program.referrerVipRates
                      ? <span>Off while VIP tier rates are on in <Link url="/demo/referrer">Rewards for referrers</Link>.</span>
                      : rCan
                        ? undefined
                        : `${methodLabel(REFERRER_METHODS, program.referrerMethod)} already grows with the order.`
                  }
                />
              </InlineStack>
              {show && check.general ? <Text as="p" tone="critical">{check.general}</Text> : null}
              {!friendTiered(program) && !referrerTiered(program) ? <Text as="p" variant="bodySm" tone="subdued">No reward is set by tier. Tier 1 still sets the minimum first order.</Text> : null}
            </BlockStack>
            <Divider />
            {sorted.length ? (
              <div className="rt-table" role="group" aria-label="Order value tiers">
                {sorted.map((t, i) => (
                  <div key={t.id} onBlur={resort}>
                    <TierRow
                      index={i}
                      tier={t}
                      program={program}
                      errors={check.errors[t.id]}
                      warnings={check.warnings[t.id]}
                      show={show}
                      onChange={setTier}
                      onRemove={() => removeTier(t.id)}
                      locked={locked}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <EmptyView heading="No tiers yet" action={{content: 'Add tier', onAction: addTier, disabled: locked}}>
                Add a tier to set what each side gets from an order amount.
              </EmptyView>
            )}
            {sorted.length ? (
              <InlineStack gap="300" blockAlign="center">
                <Button icon={PlusIcon} onClick={addTier} disabled={!canAddTier(program) || locked}>Add tier</Button>
                <Text as="span" variant="bodySm" tone="subdued">{canAddTier(program) ? `Up to ${MAX_TIERS} tiers` : `You've reached ${MAX_TIERS} tiers`}</Text>
              </InlineStack>
            ) : null}
            <Text as="p" variant="bodySm" tone="subdued">
              Order subtotal is counted after other discounts and before the referral discount, without shipping and taxes. A tier applies from its amount up to the next tier. Codes already sent keep the friend's reward they were sent with. Referrers get the tiers saved when the referral completes.
            </Text>
            {sorted.length ? <TryOrder program={program} /> : null}
          </>
        ) : null}
      </BlockStack>
    </Card>
  );
}

function RewardRow({title, summary, redeemed, url, locked}) {
  return (
    <InlineStack align="space-between" blockAlign="center" gap="300" wrap={false}>
      <BlockStack gap="100">
        <Text variant="bodyMd" as="span" fontWeight="semibold">{title}</Text>
        <Text as="p" tone="subdued" breakWord>{summary}</Text>
        <span><Badge>{`${redeemed} redeemed`}</Badge></span>
      </BlockStack>
      <Button url={url} disabled={locked}>Edit</Button>
    </InlineStack>
  );
}

export function ReferralProgram() {
  const {notify, notYet} = useShell();
  const {state, setState} = useScenario();
  const {program: saved, save} = useProgram();
  const [program, setProgram] = useState(saved);
  const [touched, setTouched] = useState(state === 'worst');
  const [saving, setSaving] = useState(false);
  const [synced, setSynced] = useState(false);
  useEffect(() => {setProgram(saved); setTouched(state === 'worst');}, [saved, state]);
  const locked = state === 'disabled';
  const check = useMemo(() => checkTiers(program), [program]);
  const dirty = JSON.stringify(program) !== JSON.stringify(saved);
  const guard = useLeaveGuard(dirty);

  useEffect(() => {
    if (touched && check.count) document.querySelector('.rt-table [aria-invalid="true"]')?.focus();
  }, [touched]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSave = () => {
    setTouched(true);
    if (check.count) {
      notify(`${check.count} ${check.count === 1 ? 'field needs' : 'fields need'} attention`, {error: true});
      window.setTimeout(() => document.querySelector('.rt-table [aria-invalid="true"]')?.focus(), 0);
      return;
    }
    setSaving(true);
    window.setTimeout(() => {
      save({...program, tiers: sortTiers(program.tiers)});
      setSaving(false);
      setTouched(false);
      notify('Saved program successfully');
    }, 500);
  };

  const page = {
    backAction: {content: 'Reward programs', onAction: notYet},
    title: 'Referral program',
    titleMetadata: <Badge tone="success">Active</Badge>,
    primaryAction: {content: 'Save', onAction: onSave, loading: saving, disabled: locked || !dirty || state === 'loading' || state === 'error'},
    secondaryActions: [
      {content: 'Discard', onAction: () => {setProgram(saved); setTouched(false);}, disabled: !dirty},
      {content: 'Preview on storefront', url: '/demo/storefront'},
    ],
  };

  if (state === 'loading') return <Page {...page}><LoadingView rows={12} /></Page>;
  if (state === 'error') {
    return (
      <Page {...page}>
        <ErrorView title="Couldn't load your referral program" onRetry={() => setState('default')}>
          Nothing was changed. Your referral program keeps running while this page reloads.
        </ErrorView>
      </Page>
    );
  }

  return (
    <Page {...page}>
      <Layout>
        {state === 'worst' && !synced && !check.count ? <Layout.Section><SyncBanner onRetry={() => {setSynced(true); onSave();}} /></Layout.Section> : null}
        {locked ? <Layout.Section><PlanBanner onViewPlans={notYet} /></Layout.Section> : null}
        {touched && check.count ? (
          <Layout.Section>
            <Banner tone="critical" title={`${check.count} ${check.count === 1 ? 'field needs' : 'fields need'} attention before you save`} />
          </Layout.Section>
        ) : null}
        <Layout.Section>
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="300">
                <Text as="p" tone="subdued">
                  Referral rewards follow your order status setting. <Link onClick={notYet}>Change it in Settings</Link>
                </Text>
                <RewardRow title="Rewards for referrers" summary={referrerSummary(program)} redeemed={128} url="/demo/referrer" locked={false} />
                <Divider />
                <RewardRow title="Rewards for referees" summary={friendSummary(program)} redeemed={341} url="/demo/referee" locked={false} />
              </BlockStack>
            </Card>
            <div id="tiers">
              <TiersCard program={program} setProgram={setProgram} show={touched} check={check} locked={locked} />
            </div>
          </BlockStack>
        </Layout.Section>
      </Layout>
      {guard}
    </Page>
  );
}

