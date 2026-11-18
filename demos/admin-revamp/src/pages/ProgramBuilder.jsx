// Program builder: the whole loyalty program on one screen, set up the way a merchant thinks about it.
// Pick a tier (strip) → how it earns (points per spend, ways to earn) → what it can redeem → its perks,
// with the tier card and the tier's own settings in the right column. Replaces Reward programs (Earning,
// Redeeming) + Membership › VIP Tiers (Tiers, Design) of the current admin.
import React, {useMemo, useState} from 'react';
import {
  Badge, Banner, BlockStack, Box, Button, Icon, InlineStack, Page, Select, Tabs, Text, TextField, Tooltip,
} from '@shopify/polaris';
import {CheckIcon, InfoIcon} from '@shopify/polaris-icons';
import {useShell} from '../shell/ShellContext.jsx';
import {useNavigate, useRoute} from '../shell/router.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {Drawer} from '../kit/Drawer.jsx';
import {EmptyView, ErrorView, LoadingView} from '../kit/StateView.jsx';
import {IconChip, NewBadge, Row, Section, TierCard, TierStrip} from '../components/parts.jsx';
import {TIER_ART, EMPTY_ART} from '../assets/index.js';
import {
  BASE_RATE, EARN_RULES, PROGRAM, REWARDS, TIERS, money, num, pct, pointsPerDollar, rateLabel, reachLabel,
  rewardsRate, simulateYear, tierById, tierIndex,
} from '../data/program.js';

const PROGRAM_TABS = [
  {id: 'points', content: 'Points & tiers'},
  {id: 'referrals', content: 'Referrals'},
];

function RateChip({tier, onOpen}) {
  const rate = rewardsRate(tier);
  return (
    <Tooltip content={`${tier.name} members earn ${pointsPerDollar(tier)} points per $1, and 100 points buy $1 of reward. So ${pct(rate)} of what they spend comes back.`}>
      <button type="button" className="rv-rate" onClick={onOpen}>
        <span className="rv-rate__label">Rewards rate</span>
        <span className="rv-rate__value">{pct(rate)}</span>
        <span className="rv-rate__sep" aria-hidden="true" />
        <span className="rv-rate__word">{rateLabel(rate)}</span>
      </button>
    </Tooltip>
  );
}

function Simulator({open, onClose}) {
  const [monthly, setMonthly] = useState('60');
  const spend = Math.max(0, Number(monthly) || 0);
  const result = useMemo(() => simulateYear(spend), [spend]);
  return (
    <Drawer open={open} onClose={onClose} title="Try a customer">
      <BlockStack gap="400">
        <Text as="p" tone="subdued">See what one customer gets from your program in a year, before you change anything.</Text>
        <TextField label="They spend every month" type="number" min={0} value={monthly} onChange={setMonthly} prefix="$" autoComplete="off" />
        <div className="rv-sim">
          <div className="rv-sim__row"><span>Spent in 12 months</span><strong>{money(result.spent)}</strong></div>
          <div className="rv-sim__row"><span>Points earned</span><strong>{num(result.points)}</strong></div>
          <div className="rv-sim__row"><span>Comes back as rewards</span><strong>{money(result.back)} · {pct(result.rate)}</strong></div>
        </div>
        <BlockStack gap="200">
          <Text as="h3" variant="headingSm">Their year</Text>
          {result.reached.length ? result.reached.map(step => (
            <InlineStack key={step.tier.id} gap="200" blockAlign="center" wrap={false}>
              <IconChip icon="star" tone={step.tier.look} />
              <Text as="span">Reaches <strong>{step.tier.name}</strong> in month {step.month}</Text>
            </InlineStack>
          )) : <Text as="p" tone="subdued">Stays a Member all year. Silver starts at {money(TIERS[1].reach)} in 12 months.</Text>}
        </BlockStack>
      </BlockStack>
    </Drawer>
  );
}

function TierSettings({tier, isFirst, locked, onChange}) {
  const [name, setName] = useState(tier.name);
  return (
    <div className="rv-props">
      <div className="rv-prop">
        <TextField label="Tier name" value={name} onChange={value => {setName(value); onChange();}} autoComplete="off" disabled={locked} />
      </div>
      <div className="rv-prop">
        {isFirst
          ? <BlockStack gap="100"><Text as="span" variant="bodyMd">How to reach</Text><Text as="span" tone="subdued">Joins when they sign up</Text></BlockStack>
          : <InlineStack gap="200" wrap={false} blockAlign="end">
            <div className="rv-grow"><Select label="How to reach" options={['Money spent', 'Points earned', 'Number of orders']} value="Money spent" onChange={onChange} disabled={locked} /></div>
            <div className="rv-num"><TextField label="Amount" labelHidden prefix="$" type="number" value={String(tier.reach)} onChange={onChange} autoComplete="off" disabled={locked} /></div>
          </InlineStack>}
      </div>
      {!isFirst && <div className="rv-prop">
        <Select label="Keeps the tier for" options={['12 months', '6 months', 'Forever']} value={`${tier.keep} months`} onChange={onChange} disabled={locked} />
      </div>}
      <div className="rv-prop">
        <TextField label="Customer tag in Shopify" value={tier.tag} onChange={onChange} autoComplete="off" disabled={locked} helpText="Joy adds and removes it when the tier changes." />
      </div>
    </div>
  );
}

export function ProgramBuilder() {
  const {notify} = useShell();
  const navigate = useNavigate();
  const {query} = useRoute();
  const {state, setState} = useScenario();
  const [selected, setSelected] = useState(query.get('tier') || 'gold');
  const [simOpen, setSimOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const locked = state === 'disabled';
  const tier = tierById(selected);
  const isFirst = tierIndex(tier.id) === 0;
  const markDirty = () => setDirty(true);
  const open = what => notify(`${what} opens in a side panel in the next step of this prototype`);

  const header = {
    title: 'Loyalty program',
    titleMetadata: PROGRAM.status === 'live' ? <Badge tone="success">Live</Badge> : <Badge>Paused</Badge>,
    primaryAction: {content: 'Save', disabled: !dirty || locked, onAction: () => {setDirty(false); notify('Program saved');}},
    secondaryActions: [{content: 'Pause program', disabled: locked, onAction: () => notify('Program paused. Customers stop earning until you resume.')}],
  };

  if (state === 'loading') return <Page {...header}><LoadingView rows={10} /></Page>;
  if (state === 'error') {
    return (
      <Page {...header}>
        <ErrorView title="Couldn't load your program" onRetry={() => setState('default')}>
          Joy couldn't reach your program settings just now. Nothing was changed, and customers keep earning. Try again in a moment.
        </ErrorView>
      </Page>
    );
  }
  if (state === 'empty') {
    return (
      <Page {...header}>
        <div className="rv-card rv-empty">
          <img src={EMPTY_ART.rewards} alt="" className="rv-empty__art" />
          <BlockStack gap="200" inlineAlign="center">
            <Text as="h2" variant="headingLg" alignment="center">Start with one decision: how generous is your program?</Text>
            <Text as="p" tone="subdued" alignment="center">Pick how much of each order comes back as rewards. Joy fills in tiers, ways to earn and rewards for you, and you can change everything later.</Text>
          </BlockStack>
          <div className="rv-presets" role="radiogroup" aria-label="Rewards rate">
            {[{rate: '3%', word: 'Light', note: 'Low margin products'}, {rate: '5%', word: 'Balanced', note: 'Most shops start here'}, {rate: '8%', word: 'Generous', note: 'Repeat-buy products'}].map((p, i) => (
              <button key={p.rate} type="button" role="radio" aria-checked={i === 1} className={i === 1 ? 'rv-preset is-selected' : 'rv-preset'} onClick={() => setState('default')}>
                <span className="rv-preset__rate">{p.rate}</span><span className="rv-preset__word">{p.word}</span><span className="rv-row__hint">{p.note}</span>
              </button>
            ))}
          </div>
          <Button variant="primary" onClick={() => setState('default')}>Create my program</Button>
        </div>
      </Page>
    );
  }

  const earnRate = pointsPerDollar(tier);
  const higher = TIERS.slice(1);

  return (
    <Page {...header}>
      <div className="rv-wrap">
        {locked && <Banner tone="warning" title="Editing is locked on your plan">Your program keeps running. Upgrade to Advanced to change tiers and rates.</Banner>}
        <div className="rv-topline">
          <div className="rv-tabs"><Tabs tabs={PROGRAM_TABS} selected={0} onSelect={index => index === 1 && navigate('/referrals')} /></div>
          <RateChip tier={tier} onOpen={() => setSimOpen(true)} />
        </div>

        <TierStrip tiers={TIERS} selected={tier.id} onSelect={id => {setSelected(id); navigate(`/program?tier=${id}`, {replace: true});}}
          onAdd={() => notify('New tier added after VIP')} onOverview={() => navigate('/program/overview')} disabled={locked} />

        <div className="rv-cols">
          <div className="rv-main">
            <Section title="Points per spend" id="sec-rate" action={{content: 'Rate', onAction: () => open('Product rate'), disabled: locked}}>
              <div className="rv-ratebox">
                <IconChip icon="order" />
                <div className="rv-grow">
                  <Text as="p" variant="bodyMd" fontWeight="medium">All products <span className="rv-pill">base rate</span></Text>
                  <Text as="p" tone="subdued">{isFirst ? 'Every order earns this' : `${tier.multiplier}× the Member rate`}</Text>
                </div>
                {isFirst
                  ? <InlineStack gap="150" blockAlign="center" wrap={false}>
                    <div className="rv-num"><TextField label="Points" labelHidden type="number" value={String(BASE_RATE.points)} onChange={markDirty} suffix="points" autoComplete="off" disabled={locked} /></div>
                    <Text as="span" tone="subdued">per</Text>
                    <div className="rv-num rv-num--sm"><TextField label="Spend" labelHidden type="number" value={String(BASE_RATE.per)} onChange={markDirty} prefix="$" autoComplete="off" disabled={locked} /></div>
                  </InlineStack>
                  : <div className="rv-num"><Select label="Multiplier" labelHidden options={['1.25×', '1.5×', '2×', '3×'].map(v => ({label: v, value: v}))} value={`${tier.multiplier}×`} onChange={markDirty} disabled={locked} /></div>}
              </div>
              <Row label="Points per $1 for this tier" value={<strong>{earnRate} points</strong>} onClick={() => setSimOpen(true)} />
              <Row label="Excluded products" value="None" onClick={() => open('Excluded products')} />
              <Row label="Shipping and taxes" value="Not counted" onClick={() => open('Shipping and taxes')} />
            </Section>

            <Section title="Ways to earn" id="sec-earn" action={{content: 'Way to earn', onAction: () => open('Ways to earn'), disabled: locked}}>
              {EARN_RULES.map(rule => (
                <Row key={rule.id} icon={rule.icon} label={rule.name}
                  value={rule.scales && !isFirst ? `${rule.reward} · ${tier.multiplier}×` : rule.reward}
                  onClick={() => open(rule.name)} />
              ))}
            </Section>

            <Section title="Rewards to redeem" id="sec-redeem" action={{content: 'Reward', onAction: () => open('New reward'), disabled: locked}}>
              {REWARDS.map(reward => {
                const min = tierById(reward.minTier);
                const isLocked = tierIndex(min.id) > tierIndex(tier.id);
                return (
                  <Row key={reward.id} icon={reward.icon} locked={isLocked}
                    label={reward.name}
                    badge={reward.isNew ? <NewBadge /> : isLocked ? <Badge>{`From ${min.name}`}</Badge> : null}
                    hint={reward.detail}
                    value={`${num(reward.cost)} points`} onClick={() => open(reward.name)} />
                );
              })}
            </Section>

            <Section title={`${tier.name} perks`} id="sec-perks" action={isFirst ? null : {content: 'Perk', onAction: () => open('New perk'), disabled: locked}}>
              {isFirst
                ? <div className="rv-note"><Icon source={InfoIcon} tone="subdued" /><Text as="p" tone="subdued">Perks start at {higher[0].name}. Members still earn points and redeem rewards.</Text></div>
                : tier.perks.map(perk => <Row key={perk.id} icon={perk.icon} label={perk.label} value={perk.value} onClick={() => open(perk.label)} />)}
            </Section>
          </div>

          <aside className="rv-side" aria-label={`${tier.name} tier settings`}>
            <TierCard tier={tier} images={TIER_ART} />
            <InlineStack gap="150" blockAlign="center" wrap={false}>
              <span className="rv-flat"><Icon source={CheckIcon} tone="success" /></span>
              <Text as="span" tone="subdued">Shows in the widget, the Loyalty page and Apple / Google Wallet</Text>
            </InlineStack>
            <TierSettings key={tier.id} tier={tier} isFirst={isFirst} locked={locked} onChange={markDirty} />
            <Box paddingBlockStart="200">
              <BlockStack gap="200">
                <Text as="h3" variant="headingSm">{num(tier.members)} {tier.name} members</Text>
                <Text as="p" tone="subdued">{reachLabel(tier)}. {isFirst ? '' : `Earns ${money(1)} back for every ${money(100 / rewardsRate(tier))} spent.`}</Text>
                <InlineStack gap="200"><Button onClick={() => navigate(`/customers?tier=${tier.id}`)}>View members</Button><Button onClick={() => setSimOpen(true)}>Try a customer</Button></InlineStack>
              </BlockStack>
            </Box>
          </aside>
        </div>
      </div>
      <Simulator open={simOpen} onClose={() => setSimOpen(false)} />
    </Page>
  );
}
