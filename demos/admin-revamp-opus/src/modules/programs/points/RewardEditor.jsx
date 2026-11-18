// Reward editor: cost in points on the left next to what it gives, and on the right the maths a merchant actually
// wants — "is this a good deal for the customer, and how far away is it for them?".
import React from 'react';
import {Banner, BlockStack, Button, Checkbox, ChoiceList, InlineGrid, Select, Text, TextField, Thumbnail} from '@shopify/polaris';
import {PageFrame} from '../../../ui/page.jsx';
import {EligibilityField, LimitField, NumberField, PlanBadge, ScheduleField, ScreenState, StatusBadge, eligibilityLabel, money, num, useConfirm} from '../../../ui/kit.jsx';
import {EditorHero, EditorShell, FormCard, MoreSettings, Panel, StorePreview, realId} from '../../../ui/parts.jsx';
import {Missing, useRecordDraft} from '../../../ui/editor.jsx';
import {useStore, newId} from '../../../state/store.jsx';
import {HashLink, useNavigate} from '../../../shell/router.jsx';
import {useShell} from '../../../shell/ShellContext.jsx';
import {PHOTOS} from '../../../assets/index.js';
import {REDEEM_TYPES} from '../../../data/seed/programs.js';
import {REDEEM_META, newReward} from './meta.js';
import {effort, pointValue, pts, rewardGives, rewardValue} from '../../../lib/econ.js';

const typeName = type => REDEEM_TYPES.find(t => t.type === type)?.name ?? 'Reward';
const COUPON = ['amount', 'percent', 'free_shipping', 'free_product', 'bxgy'];

function GivesFields({d, locked}) {
  const {db} = useStore();
  const x = d.draft;
  const word = db.program.point.plural;
  const cost = <NumberField label="Costs" value={x.cost} onChange={v => d.set('cost', v)} suffix={word} disabled={locked || (x.type === 'amount' && x.flexible)} error={d.errors.cost} />;
  switch (x.type) {
    case 'amount': return <>
      <ChoiceList title="How it's priced" disabled={locked} selected={[x.flexible ? 'flex' : 'fixed']} onChange={v => d.set('flexible', v[0] === 'flex')}
        choices={[{label: 'Fixed: one price, one discount', value: 'fixed'}, {label: 'Flexible: customer chooses how many points to spend', value: 'flex', helpText: 'Good for big balances. Customers slide to the amount they want.'}]} />
      {x.flexible ? (
        <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
          <NumberField label="Every" value={x.flexPoints} onChange={v => d.set('flexPoints', v)} suffix={word} disabled={locked} />
          <NumberField label="Gives" value={x.flexValue} onChange={v => d.set('flexValue', v)} prefix="$" disabled={locked} />
          <NumberField label="Minimum to spend" value={x.flexMin} onChange={v => d.set('flexMin', v)} suffix={word} disabled={locked} />
          <NumberField label="Maximum to spend" value={x.flexMax} onChange={v => d.set('flexMax', v)} suffix={word} disabled={locked} />
        </InlineGrid>
      ) : (
        <InlineGrid columns={{xs: 1, sm: 2}} gap="300">{cost}<NumberField label="Discount" prefix="$" value={x.value} onChange={v => d.set('value', v)} disabled={locked} error={d.errors.value} /></InlineGrid>
      )}
    </>;
    case 'percent': return <InlineGrid columns={{xs: 1, sm: 3}} gap="300">{cost}
      <NumberField label="Discount" suffix="%" value={x.value} onChange={v => d.set('value', v)} disabled={locked} error={d.errors.value} />
      <NumberField label="Maximum discount" prefix="$" value={x.maxDiscount ?? ''} onChange={v => d.set('maxDiscount', v)} disabled={locked} helpText="Empty = no cap" /></InlineGrid>;
    case 'free_shipping': return <>
      <InlineGrid columns={{xs: 1, sm: 2}} gap="300">{cost}<NumberField label="Covers shipping up to" prefix="$" value={x.maxShipping ?? ''} onChange={v => d.set('maxShipping', v)} disabled={locked} helpText="Empty = any shipping rate" /></InlineGrid>
      <Select label="Countries" value={x.countries ?? 'all'} onChange={v => d.set('countries', v)} disabled={locked} options={[{label: 'All countries you ship to', value: 'all'}, {label: 'Only some countries', value: 'list'}]} />
      {x.countries === 'list' && <TextField label="Country list" value={x.countryList ?? ''} onChange={v => d.set('countryList', v)} placeholder="United States, Canada" autoComplete="off" disabled={locked} />}
    </>;
    case 'free_product': return <>
      <InlineGrid columns={{xs: 1, sm: '1fr 1fr'}} gap="300" alignItems="start">
        <TextField label="Product" value={x.product ?? ''} onChange={v => d.set('product', v)} autoComplete="off" disabled={locked} error={d.errors.product}
          prefix={<img className="op-fieldthumb" src={PHOTOS[x.photo] ?? PHOTOS.giftBox} alt="" />} helpText="In the app this opens the Shopify product picker." />
        <TextField label="Variant" value={x.variant ?? ''} onChange={v => d.set('variant', v)} autoComplete="off" disabled={locked} placeholder="Any variant" />
      </InlineGrid>
      <InlineGrid columns={{xs: 1, sm: 3}} gap="300">{cost}
        <NumberField label="Quantity" value={x.quantity ?? 1} onChange={v => d.set('quantity', v)} disabled={locked} min={1} />
        <Select label="If several items qualify" value={x.applyTo ?? 'lowest'} onChange={v => d.set('applyTo', v)} disabled={locked} options={[{label: 'Lowest priced is free', value: 'lowest'}, {label: 'Highest priced is free', value: 'highest'}]} />
      </InlineGrid>
      <Text as="p" variant="bodySm" tone="subdued">Whether the gift is added to the cart for the customer is set in <HashLink url="/settings/general" className="op-link">Settings › General › Customer behavior</HashLink>.</Text>
    </>;
    case 'bxgy': return <>
      {cost}
      <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
        <NumberField label="Customer buys" value={x.buy} onChange={v => d.set('buy', v)} suffix="items" disabled={locked} />
        <TextField label="From" value={x.collection ?? ''} onChange={v => d.set('collection', v)} autoComplete="off" disabled={locked} helpText="Collection or products" />
        <NumberField label="Customer gets" value={x.get} onChange={v => d.set('get', v)} suffix="items" disabled={locked} />
        <TextField label="From" value={x.getCollection ?? ''} onChange={v => d.set('getCollection', v)} autoComplete="off" disabled={locked} />
      </InlineGrid>
      <InlineGrid columns={{xs: 1, sm: 3}} gap="300">
        <Select label="At" value={x.getDiscount ?? 'free'} onChange={v => d.set('getDiscount', v)} disabled={locked} options={[{label: 'Free', value: 'free'}, {label: 'Percentage off', value: 'percent'}, {label: 'Amount off', value: 'amount'}]} />
        {x.getDiscount !== 'free' && <NumberField label="Value" value={x.getValue} onChange={v => d.set('getValue', v)} suffix={x.getDiscount === 'percent' ? '%' : undefined} prefix={x.getDiscount === 'amount' ? '$' : undefined} disabled={locked} />}
        <NumberField label="Max uses per order" value={x.maxPerOrder ?? 1} onChange={v => d.set('maxPerOrder', v)} disabled={locked} />
      </InlineGrid>
    </>;
    case 'store_credit': return <>
      <InlineGrid columns={{xs: 1, sm: 2}} gap="300">{cost}<NumberField label="Store credit" prefix="$" value={x.value} onChange={v => d.set('value', v)} disabled={locked} error={d.errors.value} /></InlineGrid>
      <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
        <Select label="Credit expires" value={x.creditExpiry ?? 'never'} onChange={v => d.set('creditExpiry', v)} disabled={locked} options={[{label: 'Never', value: 'never'}, {label: 'After a number of days', value: 'days'}]} />
        {x.creditExpiry === 'days' && <NumberField label="Days" value={x.creditDays ?? 365} onChange={v => d.set('creditDays', v)} disabled={locked} />}
      </InlineGrid>
      <Banner tone="info">Store credit is given in your store's main currency ({db.shop.currency}) only.</Banner>
    </>;
    case 'impact': return <>
      <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
        <Select label="Impact" value={x.impactType ?? 'trees'} onChange={v => d.set('impactType', v)} disabled={locked || x.redemptions > 0} options={[{label: 'Plant trees', value: 'trees'}, {label: 'Remove plastic bottles', value: 'bottles'}]} helpText={x.redemptions > 0 ? "Can't change after the first redemption" : undefined} />
        <NumberField label={x.impactType === 'bottles' ? 'Bottles per redemption' : 'Trees per redemption'} value={x.value} onChange={v => d.set('value', v)} disabled={locked} />
      </InlineGrid>
      {cost}
      <Banner tone={db.integrations.find(i => i.id === 'treeplanting')?.connected ? 'success' : 'warning'}
        action={{content: 'Open Integrations', url: '/integrations/treeplanting'}}>
        {db.integrations.find(i => i.id === 'treeplanting')?.connected ? 'Your tree planting partner is connected. Trees are planted within 7 days.' : 'Connect a tree planting partner before you turn this on. The partner plants the trees and bills you per tree.'}
      </Banner>
    </>;
    case 'gift_card': return <>
      <InlineGrid columns={{xs: 1, sm: 2}} gap="300">{cost}<NumberField label="Gift card value" prefix="$" value={x.value} onChange={v => d.set('value', v)} disabled={locked} error={d.errors.value} /></InlineGrid>
      <Banner tone="info">Joy needs permission to create gift cards in Shopify. You'll be asked once when you turn this on.</Banner>
    </>;
    default: return cost;
  }
}

function CouponRules({d, locked}) {
  const {db} = useStore();
  const x = d.draft;
  if (!COUPON.includes(x.type)) return null;
  return (
    <>
      <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
        <NumberField label="Minimum order value" prefix="$" value={x.minOrder ?? 0} onChange={v => d.set('minOrder', v)} disabled={locked} helpText={Number(x.minOrder) ? undefined : 'No minimum'} />
        <NumberField label="Code expires after" suffix="days" value={x.expiresDays ?? ''} onChange={v => d.set('expiresDays', v)} disabled={locked} helpText="Empty = never" />
      </InlineGrid>
      {['amount', 'percent'].includes(x.type) && <>
        <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
          <Select label="Applies to" value={x.appliesTo ?? 'order'} onChange={v => d.set('appliesTo', v)} disabled={locked} options={[{label: 'Entire order', value: 'order'}, {label: 'Specific collections', value: 'collections'}, {label: 'Specific products', value: 'products'}]} />
          <Select label="Purchase type" value={x.purchaseType ?? 'one_time'} onChange={v => d.set('purchaseType', v)} disabled={locked} options={[{label: 'One-time purchases', value: 'one_time'}, {label: 'Subscriptions', value: 'subscription'}, {label: 'Both', value: 'both'}]} />
        </InlineGrid>
        {x.appliesTo !== 'order' && <TextField label={x.appliesTo === 'products' ? 'Products' : 'Collections'} value={x.appliesList ?? ''} onChange={v => d.set('appliesList', v)} autoComplete="off" disabled={locked} placeholder="Serums, Cleansers" />}
      </>}
      <ChoiceList allowMultiple title="Can be combined with" disabled={locked}
        choices={[{label: 'Product discounts', value: 'product'}, {label: 'Order discounts', value: 'order'}, {label: 'Shipping discounts', value: 'shipping'}]}
        selected={x.combines ?? []} onChange={v => d.set('combines', v)} />
      <Checkbox label={`Give the ${db.program.point.plural} back if the code isn't used before it expires`} checked={x.refundPoints !== false} onChange={v => d.set('refundPoints', v)} disabled={locked} />
      <TextField label="Code prefix" value={x.prefix ?? db.settings.general.discountPrefix} onChange={v => d.set('prefix', v)} autoComplete="off" disabled={locked} helpText={`Codes look like ${(x.prefix ?? db.settings.general.discountPrefix)}8F2K4Q`} />
    </>
  );
}

function TierCosts({d, locked}) {
  const {db} = useStore();
  const x = d.draft;
  if (!db.tierSettings.enabled || !['amount', 'percent', 'free_shipping', 'free_product'].includes(x.type) || x.flexible) return null;
  const costs = x.tierCosts ?? {};
  return (
    <>
      <Checkbox label="Cheaper for higher VIP tiers (leave a tier empty to keep the same price)" checked={Boolean(x.tierPricing)} onChange={v => d.set('tierPricing', v)} disabled={locked} />
      {x.tierPricing ? (
        <div className="op-tiers-rate">
          {db.tiers.map(t => (
            <React.Fragment key={t.id}>
              <Text as="span"><span className="op-dot" style={{background: t.color}} />{t.name}</Text>
              <NumberField label={`${t.name} price`} value={costs[t.id] ?? ''} onChange={v => d.set('tierCosts', {...costs, [t.id]: v})} suffix={db.program.point.plural} disabled={locked} helpText={costs[t.id] ? undefined : `${num(x.cost)}`} />
            </React.Fragment>
          ))}
        </div>
      ) : <Text as="p" variant="bodySm" tone="subdued">Everyone pays {pts(db, x.cost)}.</Text>}
    </>
  );
}

export function RewardEditor({id, query}) {
  const {db, upsert, remove} = useStore();
  const navigate = useNavigate();
  const {notify} = useShell();
  const [confirm, confirmModal] = useConfirm();
  const isNew = id === 'new';
  const type = query.get('type') || 'amount';
  const fresh = React.useMemo(() => newReward(type, typeName(type)), [type]);
  const record = isNew ? fresh : db.redeem.find(r => r.id === realId(id));
  const d = useRecordDraft({
    record: record ?? fresh, isNew, backUrl: '/programs/points', prefix: 'r',
    save: item => upsert('redeem', item), urlFor: nid => `/programs/points/rewards/${nid}`,
    validate: x => ({
      name: !String(x.name ?? '').trim() ? 'Give the reward a name customers will understand' : null,
      cost: !x.flexible && !(Number(x.cost) > 0) ? `Enter a price above 0 ${db.program.point.plural}` : null,
      value: ['amount', 'percent', 'store_credit', 'gift_card'].includes(x.type) && !x.flexible && !(Number(x.value) > 0) ? 'Enter a value above 0' : x.type === 'percent' && Number(x.value) > 100 ? 'A percentage can be 100 at most' : null,
      product: x.type === 'free_product' && !String(x.product ?? '').trim() ? 'Choose the free product' : null,
    }),
  });
  if (!record && !isNew) return <Missing title="Reward" backUrl="/programs/points" what="reward" />;
  const x = d.draft;
  const on = x.status === 'active';
  const val = x.flexible ? (Number(x.flexValue) || 0) / (Number(x.flexPoints) || 1) * 100 : rewardValue(x) / (Number(x.cost) || 1) * 100;
  const pv = pointValue(db) * 100;
  const sentence = x.flexible
    ? `Customers choose how many ${db.program.point.plural} to spend: every ${pts(db, x.flexPoints)} takes ${money(x.flexValue)} off, from ${num(x.flexMin)} to ${num(x.flexMax)}.`
    : `${pts(db, x.cost)} → ${rewardGives(x, db)}${Number(x.minOrder) ? ` on orders over ${money(x.minOrder)}` : ''}.${val ? ` That's ${money(val)} back for every ${pts(db, 100)}.` : ''}`;
  const nudge = val > pv * 1.6 ? `This gives ${money(val)} per ${pts(db, 100)}, more than your point value of ${money(pv)}. Generous, so check your margins.`
    : val && val < pv * 0.5 && x.type !== 'impact' ? `Customers get ${money(val)} per ${pts(db, 100)}, less than your point value of ${money(pv)}. It may feel like a bad deal.` : null;
  const planType = REDEEM_TYPES.find(t => t.type === x.type)?.plan;
  return (
    <PageFrame title={isNew ? `New: ${typeName(x.type)}` : x.name || typeName(x.type)} backUrl="/programs/points"
      badge={isNew ? undefined : <StatusBadge status={on ? 'active' : 'inactive'} />}>
      <ScreenState>{({locked}) => (
        <EditorShell
          hero={<EditorHero icon={REDEEM_META[x.type]?.icon} thumb={x.photo ? PHOTOS[x.photo] : undefined} sentence={sentence} nudge={nudge}
            facts={[
              x.flexible ? null : ['Customers spend first', effort(db, x.cost).split(' · ')[0]],
              x.flexible ? null : ['That is', effort(db, x.cost).split(' · ')[1] ?? '—'],
              ['Who', eligibilityLabel(x.eligibility, db)],
              ['Redeemed', num(x.redemptions)],
            ].filter(Boolean)}
            status={{on, disabled: locked, label: 'Turn on', note: on ? 'Customers can redeem' : 'Off', onChange: v => d.set('status', v ? 'active' : 'inactive')}} />}
          side={<StorePreview heading={rewardGives(x, db)} sub={`North Bloom Rewards · ${x.flexible ? 'Choose your points' : pts(db, x.cost)}`} brand={db.settings.brand.primary}
            lines={[{icon: REDEEM_META[x.type]?.icon, text: x.name || typeName(x.type), value: x.flexible ? 'Flexible' : pts(db, x.cost), active: true}]}
            footer={<><span className="op-store__btn">Redeem</span><span className="op-store__muted">Ava has {pts(db, 1240)}, enough for {x.cost ? Math.floor(1240 / (x.cost || 1)) : 0}.</span></>} />}
          more={<MoreSettings sections={[
            {title: 'Description', children: <TextField label="Description (optional)" labelHidden value={x.description ?? ''} onChange={v => d.set('description', v)} multiline={2} autoComplete="off" disabled={locked} placeholder="One line under the name" />},
            COUPON.includes(x.type) && {title: 'Coupon rules', description: 'Joy turns each redemption into a Shopify discount code.', children: <CouponRules d={d} locked={locked} />},
            db.tierSettings.enabled && ['amount', 'percent', 'free_shipping', 'free_product'].includes(x.type) && !x.flexible && {title: 'VIP tiers', children: <TierCosts d={d} locked={locked} />},
            {title: "When it's available", children: <ScheduleField value={x.schedule} onChange={v => d.set('schedule', v)} disabled={locked} />},
            {title: 'Limit', children: <LimitField value={x.limit} onChange={v => d.set('limit', v)} disabled={locked} label="Limit how often one customer can redeem this" />},
          ]} />}
          danger={isNew ? null : <>
            <Button disabled={locked} onClick={() => {const nid = newId('r'); upsert('redeem', {...x, id: nid, name: `${x.name} (copy)`, status: 'inactive', redemptions: 0}); notify('Duplicated as a draft (off)'); navigate(`/programs/points/rewards/${nid}`);}}>Duplicate</Button>
            <Button tone="critical" variant="secondary" disabled={locked} onClick={() => confirm({
              title: `Delete “${x.name}”?`, action: 'Delete',
              body: `Customers can't buy this any more. Codes already given still work until they expire. ${num(x.redemptions)} redeemed so far.`,
              onConfirm: () => {remove('redeem', x.id); notify('Reward deleted'); navigate('/programs/points');},
            })}>Delete</Button>
          </>}>
          <Panel title="Price and value" description={REDEEM_META[x.type]?.desc} action={<PlanBadge plan={planType} />}>
            <TextField label="Name" value={x.name ?? ''} onChange={v => d.set('name', v)} autoComplete="off" disabled={locked} error={d.errors.name} helpText="Customers see this on the widget and in the code email." maxLength={80} showCharacterCount />
            <GivesFields d={d} locked={locked} />
            <EligibilityField label="Who can get this" value={x.eligibility} onChange={v => d.set('eligibility', v)} disabled={locked} />
          </Panel>
        </EditorShell>
      )}</ScreenState>
      {confirmModal}
    </PageFrame>
  );
}
