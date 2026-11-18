// All tiers side by side: the one-glance review of the whole program (Essent's "overview" idea, built for Joy).
// Every cell comes from the same data and formulas as the builder, so the two screens can never disagree.
import React from 'react';
import {Badge, BlockStack, Icon, InlineStack, Page, Text} from '@shopify/polaris';
import {LockIcon, StarFilledIcon} from '@shopify/polaris-icons';
import {useNavigate} from '../shell/router.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {ErrorView, LoadingView} from '../kit/StateView.jsx';
import {IconChip} from '../components/parts.jsx';
import {
  EARN_RULES, REWARDS, TIERS, money, num, pct, pointsPerDollar, reachLabel, rewardsRate, tierIndex,
} from '../data/program.js';

const cx = (...parts) => parts.filter(Boolean).join(' ');

function Group({label, span}) {
  return <tr className="rv-ov__group"><th colSpan={span} scope="colgroup">{label}</th></tr>;
}

export function ProgramOverview() {
  const navigate = useNavigate();
  const {state, setState} = useScenario();
  const header = {title: 'All tiers side by side', backAction: {content: 'Loyalty program', url: '/program'}};
  if (state === 'loading') return <Page {...header}><LoadingView rows={12} /></Page>;
  if (state === 'error') return <Page {...header}><ErrorView title="Couldn't load your program" onRetry={() => setState('default')}>Nothing was changed. Try again in a moment.</ErrorView></Page>;
  const span = TIERS.length + 1;
  const open = id => navigate(`/program?tier=${id}`);
  const differs = (values, index) => index > 0 && values[index] !== values[0];

  const scaled = rule => TIERS.map(t => (rule.scales && t.multiplier !== 1 ? `${rule.reward} · ${t.multiplier}×` : rule.reward));
  return (
    <Page {...header}>
      <div className="rv-wrap">
        <Text as="p" tone="subdued">Check the whole program in one look before you save. Values that change by tier are dark; the same value in every tier is grey.</Text>
        <div className="rv-card rv-ov-scroll">
          <table className="rv-ov">
            <thead>
              <tr>
                <th scope="col" className="rv-ov__item">Item</th>
                {TIERS.map(t => (
                  <th key={t.id} scope="col">
                    <button type="button" className="rv-ov__tier" onClick={() => open(t.id)}>
                      <span className={cx('rv-tier__swatch', `rv-look--${t.look}`)} aria-hidden="true"><Icon source={StarFilledIcon} /></span>
                      <span><span className="rv-ov__tname">{t.name}</span><span className="rv-ov__tmeta">{num(t.members)} members</span></span>
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <Group label="Tier" span={span} />
              <tr><th scope="row">How to reach</th>{TIERS.map(t => <td key={t.id}>{reachLabel(t)}</td>)}</tr>
              <tr><th scope="row">Rewards rate</th>{TIERS.map((t, i) => <td key={t.id} className={cx(i > 0 && 'is-diff')}>{pct(rewardsRate(t))}</td>)}</tr>
              <Group label="Ways to earn" span={span} />
              <tr>
                <th scope="row"><InlineStack gap="200" blockAlign="center" wrap={false}><IconChip icon="order" /><span>Place an order</span></InlineStack></th>
                {TIERS.map((t, i) => <td key={t.id} className={cx(i > 0 && 'is-diff')}>{pointsPerDollar(t)} points per $1</td>)}
              </tr>
              {EARN_RULES.map(rule => {
                const values = scaled(rule);
                return (
                  <tr key={rule.id}>
                    <th scope="row"><InlineStack gap="200" blockAlign="center" wrap={false}><IconChip icon={rule.icon} /><span>{rule.name}</span></InlineStack></th>
                    {values.map((v, i) => <td key={TIERS[i].id} className={cx(differs(values, i) && 'is-diff')}>{v}</td>)}
                  </tr>
                );
              })}
              <Group label="Rewards to redeem" span={span} />
              {REWARDS.map(reward => (
                <tr key={reward.id}>
                  <th scope="row"><InlineStack gap="200" blockAlign="center" wrap={false}><IconChip icon={reward.icon} /><span>{reward.name}</span></InlineStack></th>
                  {TIERS.map(t => (tierIndex(reward.minTier) > tierIndex(t.id)
                    ? <td key={t.id} className="is-off"><InlineStack gap="100" blockAlign="center" wrap={false}><Icon source={LockIcon} tone="subdued" /><span>Not available</span></InlineStack></td>
                    : <td key={t.id}>−{num(reward.cost)} points</td>))}
                </tr>
              ))}
              <Group label="Perks" span={span} />
              {['Welcome gift', 'Free shipping', 'Early access to drops'].map(label => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  {TIERS.map(t => {
                    const perk = t.perks.find(p => p.label === label);
                    return perk ? <td key={t.id} className="is-diff">{perk.value}</td> : <td key={t.id} className="is-off">—</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <BlockStack gap="100">
          <Text as="p" tone="subdued">Rewards rate = points per $1 × {money(1)} for every 100 points. Badge <Badge>From Silver</Badge> rewards are hidden from lower tiers in the widget.</Text>
        </BlockStack>
      </div>
    </Page>
  );
}
