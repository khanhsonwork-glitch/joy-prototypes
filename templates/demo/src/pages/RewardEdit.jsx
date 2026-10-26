// Create / edit screen: back action, title badge, two-column layout, form validation, save toast,
// destructive modal, activity drawer, and the screen states.
import React, {useEffect, useMemo, useState} from 'react';
import {
  Banner, BlockStack, Box, Card, Checkbox, ChoiceList, Divider, FormLayout, InlineStack, Layout, Modal, Page, Select, Text, TextField,
} from '@shopify/polaris';
import {useNavigate} from '../shell/router.jsx';
import {useShell} from '../shell/ShellContext.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {Drawer} from '../kit/Drawer.jsx';
import {EmptyView, ErrorView, LoadingView} from '../kit/StateView.jsx';
import {useRewards} from '../state/rewards.jsx';
import {REWARD_TYPES, dateLabel, money, num, pointsLabel, typeLabel} from '../data/index.js';
import {StatusBadge} from './RewardsList.jsx';

const BLANK = {name: '', type: 'amount', value: '5', points: '500', status: 'draft', minSpend: '0', showInWidget: true};
const toForm = (r) => ({name: r.name, type: r.type, value: String(r.value), points: String(r.points), status: r.status, minSpend: String(r.minSpend), showInWidget: r.showInWidget ?? true});

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Enter a reward name';
  else if (form.name.length > 120) errors.name = 'Use 120 characters or fewer';
  const points = Number(form.points);
  if (!Number.isInteger(points) || points < 1) errors.points = 'Points must be a whole number of 1 or more';
  if (form.type !== 'shipping') {
    const value = Number(form.value);
    if (!(value > 0)) errors.value = 'Enter a value above 0';
    else if (form.type === 'percent' && value > 100) errors.value = 'A percentage can be 100 at most';
  }
  if (Number(form.minSpend) < 0 || form.minSpend === '') errors.minSpend = 'Enter 0 or more';
  return errors;
}

export function RewardEdit({id}) {
  const navigate = useNavigate();
  const {notify} = useShell();
  const {state, setState} = useScenario();
  const {find, save, remove} = useRewards();
  const isNew = id === 'new';
  const reward = isNew ? null : find(id);
  const locked = state === 'disabled';

  const initial = useMemo(() => (reward ? toForm(reward) : BLANK), [reward]);
  const [form, setForm] = useState(initial);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [focusError, setFocusError] = useState(0);
  useEffect(() => setForm(initial), [initial]);
  // After a failed save, move focus to the first field that shows an error (it renders its error first).
  useEffect(() => {
    if (focusError) document.querySelector('[aria-invalid="true"]')?.focus();
  }, [focusError]);

  const errors = validate(form);
  const errorCount = Object.keys(errors).length;
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);
  const set = (key) => (value) => setForm((f) => ({...f, [key]: value}));
  const show = (key) => (touched ? errors[key] : undefined);

  const onSave = () => {
    setTouched(true);
    if (errorCount) {
      notify(`${errorCount} ${errorCount === 1 ? 'field needs' : 'fields need'} attention`, {error: true});
      setFocusError((n) => n + 1);
      return;
    }
    setSaving(true);
    window.setTimeout(() => {
      const savedId = save({...(reward || {}), ...form, value: Number(form.value), points: Number(form.points), minSpend: Number(form.minSpend)});
      setSaving(false);
      setTouched(false);
      notify(isNew ? 'Reward created' : 'Reward saved');
      if (isNew) navigate(`/demo/${savedId}`, {replace: true});
    }, 600);
  };

  const title = isNew ? 'Create reward' : reward?.name ?? 'Reward';
  const page = {
    backAction: {content: 'Rewards', url: '/demo'},
    title,
    titleMetadata: reward ? <StatusBadge status={reward.status} /> : undefined,
    primaryAction: {content: 'Save', onAction: onSave, loading: saving, disabled: locked || state === 'loading' || state === 'error' || (!dirty && !isNew)},
    secondaryActions: isNew ? [] : [
      {content: 'View activity', onAction: () => setActivityOpen(true), disabled: state === 'loading' || state === 'error'},
      {content: 'Delete', destructive: true, onAction: () => setConfirmDelete(true), disabled: locked || state === 'loading' || state === 'error'},
    ],
  };

  if (state === 'loading') return <Page {...page}><LoadingView rows={10} /></Page>;
  if (state === 'error') {
    return (
      <Page {...page}>
        <ErrorView title="Couldn't load this reward" onRetry={() => setState('default')}>
          Your changes were not lost: nothing was saved yet. Try again in a moment.
        </ErrorView>
      </Page>
    );
  }
  if (!isNew && !reward) {
    return (
      <Page backAction={{content: 'Rewards', url: '/demo'}} title="Reward not found">
        <Card>
          <EmptyView heading="This reward no longer exists" action={{content: 'Back to rewards', url: '/demo'}}>
            It may have been deleted. Every other reward is still on the list.
          </EmptyView>
        </Card>
      </Page>
    );
  }

  const valueField = form.type === 'shipping' ? null : (
    <TextField
      label={form.type === 'percent' ? 'Discount percentage' : form.type === 'product' ? 'Product value' : 'Discount amount'}
      type="number"
      value={form.value}
      onChange={set('value')}
      prefix={form.type === 'percent' ? undefined : '$'}
      suffix={form.type === 'percent' ? '%' : undefined}
      error={show('value')}
      disabled={locked}
      autoComplete="off"
    />
  );

  return (
    <Page {...page}>
      <Layout>
        {locked ? (
          <Layout.Section>
            <Banner tone="warning" title="Editing rewards needs the Advanced plan" action={{content: 'Upgrade plan', onAction: () => notify('Prototype: Advanced plan selected. No billing changes were made.')}}>
              <p>Fields are read-only on your current plan.</p>
            </Banner>
          </Layout.Section>
        ) : null}
        {touched && errorCount ? (
          <Layout.Section>
            <Banner tone="critical" title={`${errorCount} ${errorCount === 1 ? 'field needs' : 'fields need'} attention before you save`} />
          </Layout.Section>
        ) : null}
        <Layout.Section>
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Details</Text>
                <FormLayout>
                  <TextField
                      label="Reward name"
                      helpText="Members see this name in the loyalty widget."
                      value={form.name}
                      onChange={set('name')}
                      maxLength={120}
                      showCharacterCount
                      requiredIndicator
                      error={show('name')}
                      disabled={locked}
                      autoComplete="off"
                    />
                  <FormLayout.Group>
                    <Select label="Reward type" options={REWARD_TYPES} value={form.type} onChange={set('type')} disabled={locked} />
                    {valueField}
                  </FormLayout.Group>
                  <TextField
                    label="Points cost"
                    type="number"
                    value={form.points}
                    onChange={set('points')}
                    suffix="points"
                    error={show('points')}
                    disabled={locked}
                    autoComplete="off"
                  />
                </FormLayout>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">Eligibility</Text>
                <ChoiceList
                  title="Minimum order"
                  choices={[{label: 'No minimum', value: 'none'}, {label: 'Minimum order amount', value: 'min'}]}
                  selected={[Number(form.minSpend) > 0 || form.minSpend === '' ? 'min' : 'none']}
                  onChange={([choice]) => set('minSpend')(choice === 'min' ? '25' : '0')}
                  disabled={locked}
                />
                {Number(form.minSpend) > 0 || form.minSpend === '' ? (
                  <TextField label="Minimum order amount" type="number" prefix="$" value={form.minSpend} onChange={set('minSpend')} error={show('minSpend')} disabled={locked} autoComplete="off" />
                ) : null}
                <Checkbox label="Show in the loyalty widget" helpText="Off: members can only get it from a campaign." checked={form.showInWidget} onChange={set('showInWidget')} disabled={locked} />
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">Status</Text>
                <Select label="Status" labelHidden options={[{label: 'Active', value: 'active'}, {label: 'Draft', value: 'draft'}]} value={form.status} onChange={set('status')} disabled={locked} />
                <Text as="p" variant="bodySm" tone="subdued">Drafts stay hidden from members.</Text>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">Summary</Text>
                <ul className="kit-summary">
                  <li className="kit-wrap">{form.name.trim() || 'No name yet'}</li>
                  <li>{typeLabel(form.type)}{form.type === 'shipping' ? '' : form.type === 'percent' ? ` · ${form.value || 0}%` : ` · ${money(form.value || 0)}`}</li>
                  <li>Costs {pointsLabel(Number(form.points) || 0)}</li>
                  <li>{Number(form.minSpend) > 0 ? `Orders from ${money(form.minSpend)}` : 'Any order amount'}</li>
                </ul>
                {reward ? (
                  <>
                    <Divider />
                    <InlineStack align="space-between" gap="200">
                      <Text as="span" tone="subdued">Redemptions</Text>
                      <Text as="span" numeric>{num(reward.redemptions)}</Text>
                    </InlineStack>
                    <InlineStack align="space-between" gap="200">
                      <Text as="span" tone="subdued">Last updated</Text>
                      <Text as="span">{dateLabel(reward.updated)}</Text>
                    </InlineStack>
                  </>
                ) : null}
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>

      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={`Delete ${reward?.name ?? 'reward'}?`}
        primaryAction={{
          content: 'Delete reward',
          destructive: true,
          onAction: () => {
            remove(reward.id);
            setConfirmDelete(false);
            notify('Reward deleted');
            navigate('/demo');
          },
        }}
        secondaryActions={[{content: 'Cancel', onAction: () => setConfirmDelete(false)}]}
      >
        <Modal.Section>
          <Text as="p">Members can no longer redeem it. Codes already issued keep working until they expire. This can't be undone.</Text>
        </Modal.Section>
      </Modal>

      <Drawer open={activityOpen} onClose={() => setActivityOpen(false)} title="Activity">
        {reward?.activity?.length ? (
          <ol className="kit-activity">
            {reward.activity.map((a) => (
              <li key={a.id}>
                <Text as="p" fontWeight="semibold">{a.who}</Text>
                <Text as="p">{a.what}</Text>
                <Text as="p" variant="bodySm" tone="subdued">{a.when}</Text>
              </li>
            ))}
          </ol>
        ) : (
          <Box paddingBlock="800">
            <EmptyView heading="No activity yet">Redemptions and staff changes show up here.</EmptyView>
          </Box>
        )}
      </Drawer>
    </Page>
  );
}
