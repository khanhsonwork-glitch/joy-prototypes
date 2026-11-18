// The point itself: name, value, expiry. Changing the value shows at once what every earn rule now gives back,
// because that is the question behind the field ("if I make points worth less, who loses?").
import React from 'react';
import {BlockStack, InlineGrid, Select, Text, TextField, ChoiceList} from '@shopify/polaris';
import {PageFrame} from '../../../ui/page.jsx';
import {NumberField, ScreenState, money, pct} from '../../../ui/kit.jsx';
import {FormCard, Hint, SimpleTable, SummaryCard, EditorLayout} from '../../../ui/parts.jsx';
import {useDraft} from '../../../ui/SaveBar.jsx';
import {useStore} from '../../../state/store.jsx';
import {earnGives, ratePerDollar} from '../../../lib/econ.js';

export function PointSettings() {
  const {db, set} = useStore();
  const source = React.useMemo(() => ({point: db.program.point, expiry: db.program.expiry, rounding: db.program.rounding ?? 'down'}), [db.program]);
  const d = useDraft(source, {
    message: 'Point settings saved',
    onSave: v => set(['program'], {...db.program, ...v}),
    validate: v => ({
      singular: !v.point.singular?.trim() ? 'Enter the name for one point' : null,
      plural: !v.point.plural?.trim() ? 'Enter the name for many points' : null,
      value: !(Number(v.point.value.points) > 0 && Number(v.point.value.money) > 0) ? 'Both sides of the value need a number above 0' : null,
    }),
  });
  const p = d.draft.point;
  const e = d.draft.expiry;
  const setP = patch => d.set('point', {...p, ...patch});
  const setE = patch => d.set('expiry', {...e, ...patch});
  const value = (Number(p.value.money) || 0) / (Number(p.value.points) || 1);
  const show = n => (p.placement === 'before' ? `${p.plural} ${n}` : `${n} ${Number(n) === 1 ? p.singular : p.plural}`);
  const rows = db.earn.filter(x => ['per_money', 'per_item'].includes(x.reward?.kind)).map(x => ({
    id: x.id, name: x.name, gives: earnGives(x, {...db, program: {...db.program, point: p}}),
    before: pct(ratePerDollar(x, db) * (db.program.point.value.money / db.program.point.value.points) * 100),
    after: pct(ratePerDollar(x, db) * value * 100),
  }));
  const expirySentence = e.mode === 'never' ? `${p.plural[0].toUpperCase()}${p.plural.slice(1)} never expire.`
    : e.mode === 'fixed' ? `All ${p.plural} expire on ${e.date || 'Dec 31'} every year. Customers get a reminder ${e.remindDays} days before.`
      : `${p.plural[0].toUpperCase()}${p.plural.slice(1)} expire when a customer has no activity for ${e.months} months. Customers get a reminder ${e.remindDays} days before.`;
  return (
    <PageFrame title="Point settings" backUrl="/programs/points">
      <ScreenState>{({locked}) => (
        <EditorLayout rail={<>
          <SummaryCard title="What customers see" sentence={`${show(500)} = ${money(500 * value)}. ${expirySentence}`}
            facts={[['One ' + p.singular, money(value)], ['100 ' + p.plural, money(100 * value)]]} />
          <Hint>Changing the value changes what every reward is worth in money, but not what it costs in {p.plural}. Customers keep their balance.</Hint>
        </>}>
          <FormCard title="Name" description="Use your own word if it fits your brand: stars, petals, coins.">
            <InlineGrid columns={{xs: 1, sm: 3}} gap="300">
              <TextField label="One" value={p.singular} onChange={v => setP({singular: v})} autoComplete="off" disabled={locked} error={d.errors.singular} />
              <TextField label="Many" value={p.plural} onChange={v => setP({plural: v})} autoComplete="off" disabled={locked} error={d.errors.plural} />
              <Select label="Show the name" value={p.placement} onChange={v => setP({placement: v})} disabled={locked}
                options={[{label: `After the number (500 ${p.plural})`, value: 'after'}, {label: `Before the number (${p.plural} 500)`, value: 'before'}]} />
            </InlineGrid>
          </FormCard>
          <FormCard title="Value" description={`What ${p.plural} are worth when customers spend them. Used for the money maths on every program.`}>
            <InlineGrid columns={{xs: 1, sm: '1fr auto 1fr'}} gap="300" alignItems="end">
              <NumberField label={p.plural[0].toUpperCase() + p.plural.slice(1)} value={p.value.points} onChange={v => setP({value: {...p.value, points: v}})} disabled={locked} error={d.errors.value} />
              <Text as="span" variant="headingMd" tone="subdued">=</Text>
              <NumberField label="Money" prefix="$" value={p.value.money} onChange={v => setP({value: {...p.value, money: v}})} disabled={locked} step={0.01} />
            </InlineGrid>
            {rows.length > 0 && (
              <BlockStack gap="200">
                <Text as="h3" variant="headingXs">What your order rules give back</Text>
                <div className="op-inset">
                  <SimpleTable columns={[{key: 'name', label: 'Way to earn'}, {key: 'gives', label: 'Gives'}, {key: 'before', label: 'Now', numeric: true}, {key: 'after', label: 'With this value', numeric: true}]} rows={rows} />
                </div>
              </BlockStack>
            )}
          </FormCard>
          <FormCard title="Expiry" description="Expiring points bring customers back. A reminder email goes out first.">
            <ChoiceList title="When points expire" titleHidden disabled={locked} selected={[e.mode]} onChange={v => setE({mode: v[0]})}
              choices={[
                {label: 'Never', value: 'never'},
                {label: 'After a period without activity', value: 'inactivity', helpText: 'Any order, earn or redemption resets the clock.', renderChildren: sel => sel && (
                  <NumberField label="Months without activity" value={e.months} onChange={v => setE({months: v})} disabled={locked} suffix="months" />
                )},
                {label: 'On a fixed date every year', value: 'fixed', renderChildren: sel => sel && (
                  <TextField label="Date" type="date" value={e.date ?? '2026-12-31'} onChange={v => setE({date: v})} autoComplete="off" disabled={locked} />
                )},
              ]} />
            {e.mode !== 'never' && <NumberField label="Send a reminder" value={e.remindDays} onChange={v => setE({remindDays: v})} suffix="days before" disabled={locked} helpText="Edit the email in Settings › Notifications › Points expiry." />}
          </FormCard>
          <FormCard title="Rounding" description="Default for new order rules when an order gives a fraction of a point.">
            <Select label="Rounding" labelHidden value={d.draft.rounding} onChange={v => d.set('rounding', v)} disabled={locked}
              options={[{label: 'Round down', value: 'down'}, {label: 'Round to nearest', value: 'nearest'}, {label: 'Round up', value: 'up'}]} />
          </FormCard>
        </EditorLayout>
      )}</ScreenState>
    </PageFrame>
  );
}
