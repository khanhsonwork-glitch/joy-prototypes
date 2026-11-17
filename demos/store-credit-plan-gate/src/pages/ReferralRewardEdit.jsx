// Rewards for referrers / Rewards for referees (ReferringCustomerReward.js, ReferredFriendReward.js), both built on
// RewardSetting.js: a "Reward settings" card whose "Reward method" select lists the reward types. On a new Free shop
// the store credit methods are disabled and the field gets the plan badge beside its label.
import React from 'react';
import {BlockStack, Card, Checkbox, Select, Text, TextField} from '@shopify/polaris';
import {useShell} from '../shell/ShellContext.jsx';
import {useShop} from '../kit/scenario.jsx';
import {LabelWithBadge} from '../components/PlanBadge.jsx';
import {FRIEND_METHODS, REFERRER_METHODS} from '../data/programs.js';
import {EditFrame, positive, useEditForm} from './editShared.jsx';

const HELP = {
  referrer: {
    store_credit_order_value: "Referrers earn store credit based on a percentage of the referee's first order. This encourages fairness and rewards customers more when they bring in higher-value referrals.",
    store_credit_fixed: 'Referrers earn a fixed amount of store credit for each successful referral, regardless of the order value.',
  },
  friend: {
    store_credit_fixed: 'Referees earn a fixed amount of store credit when they are referred, regardless of the order value.',
  },
};

const SUFFIX = {percentage: '%', fixed_amount: 'USD', store_credit_fixed: 'USD', store_credit_order_value: '%', point: 'points', point_order_value: 'points per $1'};
const DISCOUNT = ['percentage', 'fixed_amount'];

function valueError(method, value) {
  const base = positive(value);
  if (base) return base;
  if (['percentage', 'store_credit_order_value'].includes(method) && Number(value) > 100) return 'A percentage can be 100 at most';
  return undefined;
}

function RewardEditPage({side}) {
  const {notYet} = useShell();
  const shop = useShop();
  const referrer = side === 'referrer';
  const methods = referrer ? REFERRER_METHODS : FRIEND_METHODS;
  const editor = useEditForm(side, (f) => (valueError(f.method, f.value) ? {value: valueError(f.method, f.value)} : {}));
  const {form, set, show} = editor;
  const locked = shop.storeCreditLocked;
  const selectId = `scg-reward-method-${side}`;
  const title = referrer ? 'Rewards for referrers' : 'Rewards for referees';

  return (
    <EditFrame title={title} backUrl="/referral" backLabel="Reward programs" editor={editor} what={title.toLowerCase()}>
      <BlockStack gap="400">
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingSm">Reward settings</Text>
            <div data-field="reward-method">
              <LabelWithBadge htmlFor={selectId} locked={locked}>Reward method</LabelWithBadge>
              <Select
                id={selectId}
                label="Reward method"
                labelHidden
                options={methods.map((m) => ({label: m.label, value: m.value, disabled: locked && Boolean(m.storeCredit)}))}
                value={form.method}
                onChange={set('method')}
                helpText={HELP[side][form.method]}
              />
            </div>
            <Checkbox
              label="Apply tier-based reward rates"
              checked={false}
              disabled={!shop.isPremium}
              onChange={notYet}
            />
            <TextField
              label={form.method === 'point_order_value' ? 'Points per $1 spent' : 'Reward value'}
              type="number"
              value={form.value}
              onChange={set('value')}
              error={show('value')}
              suffix={SUFFIX[form.method]}
              autoComplete="off"
            />
          </BlockStack>
        </Card>
        {referrer ? (
          <Card>
            <BlockStack gap="200">
              <Text as="h2" variant="headingSm">Bonus points when a friend claims</Text>
              <Checkbox
                label="Give the referrer bonus points as soon as a referred friend claims their reward"
                helpText="Granted once per referred friend, before any purchase, on top of the reward above. Turn on the referral limit to cap how many bonuses one customer can earn."
                checked={false}
                onChange={notYet}
              />
            </BlockStack>
          </Card>
        ) : null}
        {DISCOUNT.includes(form.method) ? (
          <Card>
            <Checkbox label="Customize discount code’s prefix" helpText="Customers will receive discounts with this prefix" checked={false} onChange={notYet} />
          </Card>
        ) : null}
      </BlockStack>
    </EditFrame>
  );
}

export const ReferrerRewardEdit = () => <RewardEditPage side="referrer" />;
export const FriendRewardEdit = () => <RewardEditPage side="friend" />;
