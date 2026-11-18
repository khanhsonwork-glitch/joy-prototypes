// Earn editor: left = what the customer does and gets (fields read as a sentence), right = the live consequence
// (sentence + money maths + what the widget shows), then who / when / how often. Same layout for all 34 types;
// only the "What the customer does" card changes with the type.
import React from 'react';
import {
  BlockStack, Box, Button, Checkbox, ChoiceList, Icon, InlineGrid, InlineStack, Select, Text, TextField,
} from '@shopify/polaris';
import {PageFrame} from '../../../ui/page.jsx';
import {EligibilityField, LimitField, NumberField, PlanBadge, ScheduleField, ScreenState, StatusBadge, eligibilityLabel, money, num, pct, useConfirm, usePlan} from '../../../ui/kit.jsx';
import {EditorHero, EditorShell, FormCard, Hint, MoreSettings, Panel, StorePreview, realId, useCopy} from '../../../ui/parts.jsx';
import {Missing, RepeatList, useRecordDraft} from '../../../ui/editor.jsx';
import {useStore, newId} from '../../../state/store.jsx';
import {useNavigate} from '../../../shell/router.jsx';
import {useShell} from '../../../shell/ShellContext.jsx';
import {HashLink} from '../../../shell/router.jsx';
import {EARN_TYPES} from '../../../data/seed/programs.js';
import {ICON_CHOICES, earnMeta, iconFor, isClickType, isOrderType, isSocial, newEarn} from './meta.js';
import {earnGives, giveBack, pointValue, pts, ratePerDollar, toMoney} from '../../../lib/econ.js';

const typeName = type => EARN_TYPES.find(t => t.type === type)?.name ?? 'Way to earn';

function RewardFields({d, locked, orderType}) {
  const {db} = useStore();
  const {allows} = usePlan();
  const r = d.draft.reward ?? {};
  const setR = patch => d.set('reward', {...r, ...patch});
  const word = db.program.point.plural;
  const kindOptions = orderType
    ? [{label: `${word[0].toUpperCase()}${word.slice(1)} for every $ spent`, value: 'per_money'}, {label: `Fixed ${word} per order`, value: 'fixed'}, {label: `${word[0].toUpperCase()}${word.slice(1)} per item`, value: 'per_item'}]
    : null;
  const typeOptions = [
    {label: db.program.point.plural.replace(/^./, c => c.toUpperCase()), value: 'points'},
    {label: `Store credit${allows('advanced') ? '' : ' (Advanced plan)'}`, value: 'store_credit', disabled: !allows('advanced')},
    ...(!orderType ? [{label: 'Discount coupon', value: 'discount'}] : []),
  ];
  const unit = r.type === 'store_credit' ? '$' : word;
  return (
    <>
      <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
        <Select label="Reward" options={typeOptions} value={r.type ?? 'points'} disabled={locked}
          onChange={type => setR({type, kind: type === 'discount' ? 'discount' : (r.kind === 'discount' ? 'fixed' : r.kind ?? 'fixed'), discountType: 'amount', points: type === 'discount' ? 5 : r.points})} />
        {orderType && r.type !== 'discount' && <Select label="How it's counted" options={kindOptions} value={r.kind} onChange={kind => setR({kind})} disabled={locked} />}
        {r.type === 'discount' && <Select label="Coupon type" options={[{label: 'Amount off', value: 'amount'}, {label: 'Percentage off', value: 'percent'}]} value={r.discountType ?? 'amount'} onChange={discountType => setR({discountType})} disabled={locked} />}
      </InlineGrid>
      <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
        <NumberField label={r.type === 'discount' ? (r.discountType === 'percent' ? 'Percentage' : 'Amount') : r.type === 'store_credit' ? 'Credit' : `Number of ${word}`}
          value={r.points} onChange={points => setR({points})} disabled={locked}
          prefix={r.type === 'store_credit' || (r.type === 'discount' && r.discountType !== 'percent') ? '$' : undefined}
          suffix={r.type === 'discount' && r.discountType === 'percent' ? '%' : r.type === 'points' || !r.type ? word : undefined}
          error={d.errors.points} />
        {orderType && r.kind === 'per_money' && <NumberField label="For every" prefix="$" value={r.per} onChange={per => setR({per})} disabled={locked} helpText={`Spent, in ${db.shop.currency}`} error={d.errors.per} />}
        {r.type === 'discount' && <TextField label="Code prefix" value={d.draft.prefix ?? db.settings.general.discountPrefix} onChange={v => d.set('prefix', v)} autoComplete="off" disabled={locked} />}
      </InlineGrid>
      {unit === word && r.points > 0 && <Text as="p" variant="bodySm" tone="subdued">{pts(db, r.points)} are worth {money(toMoney(db, r.points))} to the customer at your point value.</Text>}
    </>
  );
}

function Rounding({d, locked}) {
  return (
    <Select label="Rounding" labelHidden value={d.draft.rounding ?? 'down'} disabled={locked}
      options={[{label: 'Round down (4.8 → 4)', value: 'down'}, {label: 'Round to nearest (4.5 → 5)', value: 'nearest'}, {label: 'Round up (4.2 → 5)', value: 'up'}]}
      onChange={v => d.set('rounding', v)} />
  );
}

function TierRates({d, locked}) {
  const {db} = useStore();
  const r = d.draft.reward ?? {};
  if (!db.tierSettings.enabled || !db.tiers.length || r.type === 'discount') return null;
  const base = Number(r.points) || 0;
  const overrides = d.draft.tierOverrides ?? {};
  return (
    <>
      <Checkbox label="Give higher VIP tiers more (base amount × the tier's multiplier)" checked={Boolean(d.draft.tierRates)} onChange={v => d.set('tierRates', v)} disabled={locked} />
      {d.draft.tierRates ? (
        <div className="op-tiers-rate">
          {db.tiers.map(t => (
            <React.Fragment key={t.id}>
              <Text as="span"><span className="op-dot" style={{background: t.color}} />{t.name} <Text as="span" tone="subdued">· {t.multiplier}×</Text></Text>
              <NumberField label={`${t.name} amount`} value={overrides[t.id] ?? +(base * t.multiplier).toFixed(2)} disabled={locked}
                onChange={v => d.set('tierOverrides', {...overrides, [t.id]: v})} suffix={r.type === 'store_credit' ? '$' : db.program.point.plural} />
            </React.Fragment>
          ))}
        </div>
      ) : <Text as="p" variant="bodySm" tone="subdued">Every member earns the same.</Text>}
    </>
  );
}

function OrderRules({d, locked}) {
  const {db} = useStore();
  const x = d.draft;
  const products = x.products ?? {mode: 'all', list: ''};
  return (
    <>
      <BlockStack gap="200">
        <Checkbox label="Don't count tax" checked={Boolean(x.excludeTax)} onChange={v => d.set('excludeTax', v)} disabled={locked} />
        <Checkbox label="Don't count shipping" checked={Boolean(x.excludeShipping)} onChange={v => d.set('excludeShipping', v)} disabled={locked} />
        <Checkbox label="Don't count discounts (points on the price after discounts)" checked={Boolean(x.excludeDiscounts)} onChange={v => d.set('excludeDiscounts', v)} disabled={locked} />
        <Checkbox label="Take points back when an order is cancelled" checked={x.cancelMinus !== false} onChange={v => d.set('cancelMinus', v)} disabled={locked} />
      </BlockStack>
      <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
        <NumberField label="Minimum order value" prefix="$" value={x.minOrder ?? 0} onChange={v => d.set('minOrder', v)} disabled={locked} helpText={Number(x.minOrder) ? `Orders under ${money(x.minOrder)} earn nothing` : 'Every order counts'} />
        <Select label="Products" value={products.mode} disabled={locked}
          options={[{label: 'All products', value: 'all'}, {label: 'Only some products or collections', value: 'include'}, {label: 'All except some', value: 'exclude'}]}
          onChange={mode => d.set('products', {...products, mode})} />
      </InlineGrid>
      {products.mode !== 'all' && (
        <TextField label={products.mode === 'include' ? 'Products or collections that earn' : 'Products or collections that never earn'} value={products.list} disabled={locked}
          onChange={list => d.set('products', {...products, list})} placeholder="Gift cards, Samples" autoComplete="off" helpText="Separate with commas. In the app this opens the Shopify product picker." />
      )}
      {x.type !== 'receipt' && (
        <ChoiceList allowMultiple title="Where the order is placed" disabled={locked}
          choices={[{label: 'Online store', value: 'online'}, {label: 'Point of Sale', value: 'pos', helpText: db.integrations.find(i => i.id === 'pos')?.connected ? undefined : 'Connect Shopify POS in Integrations first'}]}
          selected={x.sources ?? ['online']} onChange={v => d.set('sources', v)} />
      )}
      {x.type === 'receipt' && (
        <Select label="Approval" value={x.approval ?? 'manual'} disabled={locked} onChange={v => d.set('approval', v)}
          options={[{label: 'I approve each receipt', value: 'manual'}, {label: 'Approve automatically', value: 'auto'}]}
          helpText="Receipts waiting for you show up in Customers › To review." />
      )}
    </>
  );
}

function ActionFields({d, locked}) {
  const {db} = useStore();
  const copy = useCopy();
  const x = d.draft;
  const t = x.type;
  if (isOrderType(t)) return null;
  const card = children => <Panel title="What the customer does" description={earnMeta(t).desc}>{children}</Panel>;
  if (t === 'birthday') return card(<>
    <Select label="Collect the birthday from" value={x.collectFrom ?? 'both'} disabled={locked} onChange={v => d.set('collectFrom', v)}
      options={[{label: 'Loyalty widget and account page', value: 'both'}, {label: 'Loyalty widget only', value: 'widget'}, {label: 'Account page only', value: 'account'}]} />
    <ChoiceList title="How often" disabled={locked} choices={[{label: 'Once a year', value: 'year'}, {label: 'Once in a lifetime', value: 'lifetime'}]}
      selected={[x.once ?? 'year']} onChange={v => d.set('once', v[0])} />
    <Hint>Birthdays added less than 30 days before the date don't get the reward, so nobody can change their birthday to collect twice.</Hint>
  </>);
  if (t === 'review') return card(<>
    <Select label="Review app" value={x.reviewApp ?? 'judgeme'} disabled={locked} onChange={v => d.set('reviewApp', v)}
      options={['Judge.me', 'Yotpo', 'Klaviyo Reviews', 'Air Reviews', 'Fera Product Reviews', 'Review Rocket'].map(n => ({label: n, value: n.toLowerCase().replace(/[^a-z]/g, '')}))} />
    <InlineGrid columns={{xs: 1, sm: 3}} gap="300">
      <NumberField label="Bonus for photo or video" value={x.photoBonus ?? 0} onChange={v => d.set('photoBonus', v)} suffix={db.program.point.plural} disabled={locked} />
      <NumberField label="Minimum characters" value={x.minChars ?? 0} onChange={v => d.set('minChars', v)} disabled={locked} />
      <Select label="Minimum stars" value={String(x.minStars ?? 1)} onChange={v => d.set('minStars', Number(v))} disabled={locked} options={[1, 2, 3, 4, 5].map(n => ({label: `${n} ${n === 1 ? 'star' : 'stars'}`, value: String(n)}))} />
    </InlineGrid>
    <Checkbox label="Only reviews from verified buyers" checked={Boolean(x.verifiedOnly)} onChange={v => d.set('verifiedOnly', v)} disabled={locked} />
    <Select label="Approval" value={x.approval ?? 'auto'} onChange={v => d.set('approval', v)} disabled={locked}
      options={[{label: 'Give points straight away', value: 'auto'}, {label: 'I approve each review first', value: 'manual'}]} helpText="Reviews waiting for you show up in Customers › To review." />
  </>);
  if (t === 'google_review') return card(<>
    <TextField label="Your Google location" value={x.location ?? ''} onChange={v => d.set('location', v)} autoComplete="off" disabled={locked} />
    <Select label="Approval" value={x.approval ?? 'manual'} onChange={v => d.set('approval', v)} disabled={locked}
      options={[{label: 'I check each review first', value: 'manual'}, {label: 'Give points straight away', value: 'auto'}]} />
    <Checkbox label="Instant points (give points when the link is sent, before checking)" checked={Boolean(x.instant)} onChange={v => d.set('instant', v)} disabled={locked} />
  </>);
  if (t === 'visit') return card(<>
    <TextField label="Page address" value={x.pageUrl ?? ''} onChange={v => d.set('pageUrl', v)} autoComplete="off" disabled={locked} error={d.errors.pageUrl} />
    <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
      <NumberField label="Reward every" value={x.visits ?? 1} onChange={v => d.set('visits', v)} suffix="visits" disabled={locked} />
      <Select label="Once per" value={x.limit?.per ?? 'day'} onChange={per => d.set('limit', {...x.limit, on: true, per})} disabled={locked} options={['day', 'week', 'month'].map(v => ({label: v[0].toUpperCase() + v.slice(1), value: v}))} />
    </InlineGrid>
  </>);
  if (t === 'streak') return card(<>
    <InlineGrid columns={{xs: 1, sm: 3}} gap="300">
      <NumberField label="Days in a row" value={x.days ?? 7} onChange={v => d.set('days', v)} disabled={locked} />
      <Select label="Streak unit" value={x.unit ?? 'day'} onChange={v => d.set('unit', v)} disabled={locked} options={[{label: 'Day', value: 'day'}, {label: 'Minute (testing)', value: 'minute'}]} />
      <NumberField label="Extra per day" value={x.bonusPerDay ?? 0} onChange={v => d.set('bonusPerDay', v)} suffix={db.program.point.plural} disabled={locked} />
    </InlineGrid>
    <Select label="If they miss a day" value={x.resetRule ?? 'restart'} onChange={v => d.set('resetRule', v)} disabled={locked} options={[{label: 'Start again from day 1', value: 'restart'}, {label: 'Keep the days already done', value: 'keep'}]} />
    <Checkbox label="Allow the challenge again after it's done" checked={x.allowRepeat !== false} onChange={v => d.set('allowRepeat', v)} disabled={locked} />
  </>);
  if (t === 'survey') return card(<>
    <TextField label="Survey link" value={x.surveyUrl ?? ''} onChange={v => d.set('surveyUrl', v)} autoComplete="off" disabled={locked} error={d.errors.surveyUrl} helpText="Joy gives points when your survey tool tells Shopify Flow it's done." />
    <NumberField label="Number of questions" value={x.questions ?? 5} onChange={v => d.set('questions', v)} disabled={locked} helpText="Shown on the widget so customers know it's short." />
  </>);
  if (t === 'form') return card(<>
    <Text as="h3" variant="headingXs">Form fields</Text>
    <RepeatList items={x.fields ?? []} onChange={v => d.set('fields', v)} disabled={locked} addLabel="Add field" min={1}
      make={i => ({id: newId('f'), label: `Question ${i + 1}`, kind: 'text', required: false})}
      render={(f, patch) => (
        <InlineGrid columns={{xs: 1, sm: '2fr 1fr auto'}} gap="200" alignItems="end">
          <TextField label="Label" value={f.label} onChange={v => patch({label: v})} autoComplete="off" disabled={locked} />
          <Select label="Type" value={f.kind} onChange={v => patch({kind: v})} disabled={locked} options={[{label: 'Short text', value: 'text'}, {label: 'Long text', value: 'long'}, {label: 'Choice', value: 'choice'}, {label: 'Date', value: 'date'}, {label: 'Number', value: 'number'}]} />
          <Checkbox label="Required" checked={f.required} onChange={v => patch({required: v})} disabled={locked} />
        </InlineGrid>
      )} />
    <Checkbox label="Let customers upload a file" checked={Boolean(x.allowUpload)} onChange={v => d.set('allowUpload', v)} disabled={locked} />
    {x.allowUpload && (
      <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
        <Select label="Accepted files" value={x.uploadFormat ?? 'image'} onChange={v => d.set('uploadFormat', v)} disabled={locked} options={[{label: 'Images', value: 'image'}, {label: 'Videos', value: 'video'}, {label: 'Images and videos', value: 'both'}]} />
        <Box paddingBlockStart="600"><Checkbox label="Upload is required" checked={Boolean(x.requireUpload)} onChange={v => d.set('requireUpload', v)} disabled={locked} /></Box>
      </InlineGrid>
    )}
    <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
      <Checkbox label="Only logged-in customers" checked={x.onlyLoggedIn !== false} onChange={v => d.set('onlyLoggedIn', v)} disabled={locked} />
      <NumberField label="Minimum past orders" value={x.minOrders ?? 0} onChange={v => d.set('minOrders', v)} disabled={locked} />
    </InlineGrid>
    <Select label="Approval" value={x.approval ?? 'manual'} onChange={v => d.set('approval', v)} disabled={locked} options={[{label: 'I approve each form', value: 'manual'}, {label: 'Approve automatically', value: 'auto'}]} />
    <Checkbox label="Give part of the reward instantly, the rest after approval" checked={Boolean(x.instant)} onChange={v => d.set('instant', v)} disabled={locked} />
    {x.instant && <NumberField label="Instant points" value={x.instantPoints ?? 20} onChange={v => d.set('instantPoints', v)} disabled={locked} />}
  </>);
  if (t === 'custom' || t === 'mobile_app') return card(<>
    <Select label="Trigger" value={x.trigger ?? 'flow'} onChange={v => d.set('trigger', v)} disabled={locked}
      options={t === 'mobile_app'
        ? [{label: 'Downloads the app', value: 'app_download'}, {label: 'Logs in to the app', value: 'app_login'}, {label: 'Turns on push notifications', value: 'app_push'}]
        : [{label: 'Shopify Flow action', value: 'flow'}, {label: 'Your own code (API)', value: 'api'}, {label: 'Visits a page', value: 'visit_page'}]} />
    <InlineStack gap="200" blockAlign="end" wrap={false}>
      <Box width="100%"><TextField label="Action key" value={x.actionKey ?? ''} readOnly autoComplete="off" helpText="Paste this into the Joy action in Shopify Flow." /></Box>
      <Button onClick={() => copy(x.actionKey ?? '', 'Action key')}>Copy</Button>
    </InlineStack>
    {t === 'mobile_app' && (
      <InlineGrid columns={{xs: 1, sm: 2}} gap="300">
        <TextField label="App Store link" value={x.appStore ?? ''} onChange={v => d.set('appStore', v)} autoComplete="off" disabled={locked} placeholder="https://apps.apple.com/…" />
        <TextField label="Google Play link" value={x.googlePlay ?? ''} onChange={v => d.set('googlePlay', v)} autoComplete="off" disabled={locked} placeholder="https://play.google.com/…" />
      </InlineGrid>
    )}
    {x.trigger === 'visit_page' && <TextField label="Page address" value={x.pageUrl ?? ''} onChange={v => d.set('pageUrl', v)} autoComplete="off" disabled={locked} />}
  </>);
  if (isSocial(t)) {
    const join = /whatsapp|line|telegram/.test(t);
    const verify = /instagram|tiktok/.test(t);
    return card(<>
      <TextField label={t.includes('share') ? 'Link to share' : join ? 'Invite link' : 'Profile or page address'} value={x.url ?? ''} onChange={v => d.set('url', v)} autoComplete="off" disabled={locked}
        placeholder="https://" error={d.errors.url} />
      {t.includes('share') && <TextField label="Share message" value={x.shareMessage ?? ''} onChange={v => d.set('shareMessage', v)} multiline={2} autoComplete="off" disabled={locked} />}
      {join && <ChoiceList title="How customers join" disabled={locked} choices={[{label: 'Invite link', value: 'link'}, {label: 'QR code', value: 'qr'}]} selected={[x.joinMethod ?? 'link']} onChange={v => d.set('joinMethod', v[0])} />}
      {verify && <Hint>Joy checks the follow within 24 hours. Points show as pending until then.</Hint>}
    </>);
  }
  // sign_up, newsletter, sms, anniversary: nothing to set about the action itself (the note sits in the first panel)
  return null;
}

const SIMPLE_NOTE = {
  anniversary: 'Joy gives this on the date each member joined, every year.',
  sms: 'Points arrive when the customer agrees to SMS marketing in Shopify.',
  newsletter: 'Points arrive when the customer subscribes through any Shopify form or the widget.',
  sign_up: 'Points arrive as soon as the account is created.',
};

function summarize(x, db) {
  const r = x.reward ?? {};
  const gives = earnGives(x, db);
  const tierLine = db.tierSettings.enabled && x.tierRates && r.type !== 'discount' ? db.tiers.filter(t => t.multiplier > 1).slice(-1).map(t => ` (${t.name}: ${+(r.points * t.multiplier).toFixed(1)})`)[0] ?? '' : '';
  let sentence;
  if (isOrderType(x.type) && r.kind === 'per_money') sentence = `Customers get ${gives.replace(' spent', '')} they spend${tierLine}.`;
  else if (isOrderType(x.type)) sentence = `Customers get ${gives} ${r.kind === 'per_item' ? '' : 'for every order'}${tierLine}.`;
  else sentence = `Customers get ${gives} when they ${earnMeta(x.type).desc.replace(/^Customer /, '').replace(/^Once a year, /, '').toLowerCase()}${tierLine}.`;
  const facts = [];
  let nudge;
  if (r.type !== 'discount' && r.type !== 'store_credit') {
    if (r.kind === 'per_money' || r.kind === 'per_item') {
      const gb = giveBack(db, ratePerDollar(x, db));
      facts.push(['Gives back', pct(gb)], ['On a $72 order', pts(db, Math.floor(ratePerDollar(x, db) * 72))]);
      if (gb > 10) nudge = `This gives back ${pct(gb)} of every order. Most shops give back 3–8%, so check your margins.`;
      if (gb && gb < 1) nudge = `This gives back only ${pct(gb)}. Customers may not notice points this small.`;
    } else {
      facts.push(['Worth to the customer', money(toMoney(db, r.points))]);
      if (toMoney(db, r.points) > 15) nudge = `Worth ${money(toMoney(db, r.points))}. That's more than a typical first-order discount; consider a limit.`;
    }
  }
  if (Number(x.minOrder)) facts.push(['Orders under', `${money(x.minOrder)} don't count`]);
  facts.push(['Who', eligibilityLabel(x.eligibility, db)]);
  if (x.limit?.on) facts.push(['Limit', `${x.limit.times}× per ${x.limit.per}`]);
  return {sentence, facts, nudge};
}

export function EarnEditor({id, query}) {
  const {db, upsert, remove} = useStore();
  const navigate = useNavigate();
  const {notify} = useShell();
  const [confirm, confirmModal] = useConfirm();
  const isNew = id === 'new';
  const type = query.get('type') || 'sign_up';
  const fresh = React.useMemo(() => newEarn(type, typeName(type)), [type]);
  const record = isNew ? fresh : db.earn.find(e => e.id === realId(id));
  const d = useRecordDraft({
    record: record ?? fresh, isNew, backUrl: '/programs/points', prefix: 'e',
    save: item => upsert('earn', item), urlFor: nid => `/programs/points/earn/${nid}`,
    validate: x => ({
      name: !String(x.name ?? '').trim() ? 'Give this a name customers will understand' : null,
      points: !(Number(x.reward?.points) > 0) ? 'Enter an amount above 0' : null,
      per: x.reward?.kind === 'per_money' && !(Number(x.reward?.per) > 0) ? 'Enter how much customers spend, above $0' : null,
      url: isSocial(x.type) && x.url && !/^https:\/\//.test(x.url) ? 'Use a full address that starts with https://' : null,
    }),
  });
  if (!record && !isNew) return <Missing title="Way to earn" backUrl="/programs/points" what="way to earn" />;
  const x = d.draft;
  const on = x.status === 'active' || x.status === 'scheduled';
  const meta = earnMeta(x.type);
  const {sentence, facts, nudge} = summarize(x, db);
  const others = db.earn.filter(e => e.id !== x.id && e.status === 'active').slice(0, 2);
  const planType = EARN_TYPES.find(t => t.type === x.type)?.plan;
  const scheduled = x.schedule?.start && x.schedule.start > '2026-11-18' ? x.schedule.start : null;
  const hasTiers = db.tierSettings.enabled && db.tiers.length && x.reward?.type !== 'discount' && (isOrderType(x.type) || x.type === 'birthday');
  return (
    <PageFrame title={isNew ? `New: ${typeName(x.type)}` : x.name || typeName(x.type)} backUrl="/programs/points"
      badge={isNew ? undefined : <StatusBadge status={x.status === 'scheduled' ? 'scheduled' : on ? 'active' : 'inactive'} />}>
      <ScreenState>{({locked}) => (
        <EditorShell
          hero={<EditorHero icon={iconFor(x)} sentence={sentence} facts={facts} nudge={nudge}
            status={{on, disabled: locked, label: 'Turn on', note: on ? (scheduled ? `Starts ${scheduled}` : 'Customers can earn') : 'Off',
              onChange: v => d.set('status', v ? (scheduled ? 'scheduled' : 'active') : 'inactive')}} />}
          side={<StorePreview heading={`${pts(db, 1240)}`} sub="North Bloom Rewards · Ava" brand={db.settings.brand.primary}
            lines={[
              {icon: iconFor(x), text: x.linkTitle || x.name || typeName(x.type), value: `+${earnGives(x, db).replace(' spent', '')}`, active: true},
              ...others.map(o => ({icon: iconFor(o), text: o.name, value: `+${earnGives(o, db).replace(' spent', '')}`})),
            ]} />}
          more={<MoreSettings sections={[
            {title: 'How it looks in the widget', children: <>
              <TextField label="Description (optional)" value={x.description ?? ''} onChange={v => d.set('description', v)} multiline={2} autoComplete="off" disabled={locked}
                helpText="One line under the name, e.g. “Only for orders over $30”." />
              {isClickType(x.type) && <TextField label="Button text on the widget" value={x.linkTitle ?? ''} onChange={v => d.set('linkTitle', v)} autoComplete="off" disabled={locked} placeholder={x.name} />}
              <BlockStack gap="100">
                <Text as="span" variant="bodyMd">Icon</Text>
                <div className="op-icons" role="group" aria-label="Icon">
                  {[{id: null, icon: meta.icon}, ...ICON_CHOICES].map(c => (
                    <button key={c.id ?? 'default'} type="button" aria-pressed={(x.icon ?? null) === c.id} aria-label={c.id ?? 'Default icon'} disabled={locked}
                      onClick={() => d.set('icon', c.id)}><Icon source={c.icon} /></button>
                  ))}
                </div>
              </BlockStack>
            </>},
            isOrderType(x.type) && {title: 'Which orders count', description: 'Joy gives points when the order is paid. Refunds take the points back.', children: <OrderRules d={d} locked={locked} />},
            isOrderType(x.type) && x.reward?.kind === 'per_money' && {title: 'Rounding', description: 'When an order gives a fraction of a point.', children: <Rounding d={d} locked={locked} />},
            hasTiers && {title: 'VIP tiers', children: <TierRates d={d} locked={locked} />},
            x.type === 'newsletter' && {title: 'People who already subscribed', children: <Checkbox label="Also reward people who subscribed before this program started" checked={Boolean(x.syncExisting)} onChange={v => d.set('syncExisting', v)} disabled={locked} />},
            {title: 'When it runs', children: <ScheduleField value={x.schedule} onChange={v => d.set('schedule', v)} disabled={locked} />},
            {title: 'How often', children: <LimitField value={x.limit} onChange={v => d.set('limit', v)} disabled={locked} />},
            {title: 'Email', children: <>
              <Text as="p" variant="bodySm" tone="subdued">When this gives {db.program.point.plural}, customers get the “{db.notifications.find(n => n.id === meta.email)?.event ?? 'Earn points'}” email.</Text>
              <HashLink url={`/settings/notifications/${meta.email}`} className="op-link">Edit that email</HashLink>
            </>},
          ]} />}
          danger={isNew ? null : <>
            <Button onClick={() => {const copyId = newId('e'); upsert('earn', {...x, id: copyId, name: `${x.name} (copy)`, status: 'inactive', completions: 0}); notify('Duplicated as a draft (off)'); navigate(`/programs/points/earn/${copyId}`);}} disabled={locked}>Duplicate</Button>
            <Button tone="critical" variant="secondary" disabled={locked} onClick={() => confirm({
              title: `Delete “${x.name}”?`, action: 'Delete',
              body: `Customers can't earn ${db.program.point.plural} this way any more. Points they already earned stay. ${num(x.completions)} customers used it in the last 30 days.`,
              onConfirm: () => {remove('earn', x.id); notify('Way to earn deleted'); navigate('/programs/points');},
            })}>Delete</Button>
          </>}>
          <Panel title="What customers do and get" description={SIMPLE_NOTE[x.type] ?? meta.desc} action={<PlanBadge plan={planType} />}>
            <TextField label="Name" value={x.name ?? ''} onChange={v => d.set('name', v)} autoComplete="off" disabled={locked} error={d.errors.name}
              helpText="Customers see this name in the widget." maxLength={80} showCharacterCount />
            <RewardFields d={d} locked={locked} orderType={isOrderType(x.type)} />
            <EligibilityField label="Who can get this" value={x.eligibility} onChange={v => d.set('eligibility', v)} disabled={locked} />
          </Panel>
          <ActionFields d={d} locked={locked} />
        </EditorShell>
      )}</ScreenState>
      {confirmModal}
    </PageFrame>
  );
}
