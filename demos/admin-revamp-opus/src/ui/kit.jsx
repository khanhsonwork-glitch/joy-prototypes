// Shared building blocks for every revamp screen. Polaris 12 React components dressed in the Polaris 2 look
// (styles/polaris2.css). Rule for module authors: compose screens from Polaris + these pieces; never restyle
// Polaris internals per screen, never hard-code colours (use var(--p-…)).
import React, {useState} from 'react';
import {
  Badge, Banner, BlockStack, Box, Button, Card, Checkbox, ChoiceList, InlineGrid, InlineStack, Modal, Select,
  SkeletonBodyText, SkeletonDisplayText, Text, TextField, Tooltip,
} from '@shopify/polaris';
import {useScenario} from '../kit/scenario.jsx';
import {ErrorView} from '../kit/StateView.jsx';
import {useStore} from '../state/store.jsx';
import {EMPTY_ART} from '../assets/index.js';

export const cx = (...parts) => parts.filter(Boolean).join(' ');
/** Clean pass rule 7: a line under a heading is dropped unless it is six words or fewer (text nodes only). */
export const shortNote = d => (typeof d === 'string' && d.trim().split(/\s+/).length > 6 ? null : d);

/* ---------- Layout ---------- */

/**
 * Polaris 2 section: heading + one-line description OUTSIDE the card, content inside.
 * <Section title="Ways to earn" description="…" action={<Button>Add</Button>}>…</Section>
 */
export function Section({title, description, action, children, flush = false, id}) {
  return (
    <section className="rv-section" id={id} aria-label={typeof title === 'string' ? title : undefined}>
      {(title || action) && (
        <div className="rv-section__head">
          <div className="rv-section__text">
            {title && <Text as="h2" variant="headingSm">{title}</Text>}
            {shortNote(description) && <Text as="p" variant="bodySm" tone="subdued">{description}</Text>}
          </div>
          {action && <div className="rv-section__action">{action}</div>}
        </div>
      )}
      <Card padding={flush ? '0' : '400'}>{children}</Card>
    </section>
  );
}

/** Settings-style two-column block: label + help on the left, card on the right; stacks on phones. */
export function Annotated({title, description, children}) {
  return (
    <InlineGrid columns={{xs: 1, md: '1fr 2fr'}} gap="400">
      <Box paddingBlockStart="200">
        <BlockStack gap="100">
          <Text as="h2" variant="headingSm">{title}</Text>
          {description && <Text as="p" variant="bodySm" tone="subdued">{description}</Text>}
        </BlockStack>
      </Box>
      <Card>{children}</Card>
    </InlineGrid>
  );
}

/** Small uppercase-free label/value line used in summaries. */
export function Fact({label, children}) {
  return (
    <div className="rv-fact">
      <Text as="span" variant="bodySm" tone="subdued">{label}</Text>
      <Text as="span" variant="bodyMd" fontWeight="medium">{children}</Text>
    </div>
  );
}

/** KPI tile: one number, one label, optional change. */
export function Stat({label, value, change, tone, help}) {
  const body = (
    <div className="rv-stat">
      <Text as="span" variant="bodySm" tone="subdued">{label}</Text>
      <span className="rv-stat__value">{value}</span>
      {change != null && <Text as="span" variant="bodySm" tone={tone ?? (String(change).startsWith('-') ? 'critical' : 'success')}>{change}</Text>}
    </div>
  );
  return help ? <Tooltip content={help}>{body}</Tooltip> : body;
}

/* ---------- Status & badges ---------- */

const STATUS = {
  active: {label: 'Active', tone: 'success'},
  inactive: {label: 'Inactive', tone: undefined},
  scheduled: {label: 'Scheduled', tone: 'info'},
  draft: {label: 'Draft', tone: undefined},
  expired: {label: 'Ended', tone: undefined},
  pending: {label: 'Pending', tone: 'attention'},
  approved: {label: 'Approved', tone: 'success'},
  rejected: {label: 'Rejected', tone: 'critical'},
  connected: {label: 'Connected', tone: 'success'},
  live: {label: 'Live', tone: 'success'},
  paused: {label: 'Paused', tone: 'warning'},
};
export function StatusBadge({status, label}) {
  const s = STATUS[status] ?? {label: status};
  return <Badge tone={s.tone}>{label ?? s.label}</Badge>;
}

const PLAN_ORDER = ['free', 'essential', 'advanced', 'ultimate'];
const PLAN_LABEL = {free: 'Starter', essential: 'Essential', advanced: 'Advanced', ultimate: 'Ultimate'};
/** True when the sample shop's plan includes `plan`. */
export function usePlan() {
  const {db} = useStore();
  const shopPlan = db.shop?.plan ?? 'advanced';
  return {
    plan: shopPlan,
    allows: plan => PLAN_ORDER.indexOf(shopPlan) >= PLAN_ORDER.indexOf(plan ?? 'free'),
    label: plan => PLAN_LABEL[plan] ?? plan,
  };
}
export function PlanBadge({plan}) {
  if (!plan || plan === 'free') return null;
  return <Badge tone="magic">{PLAN_LABEL[plan] ?? plan}</Badge>;
}

/** On/off switch (Polaris has none). Near-black when on, per Polaris 2. */
export function Switch({checked, onChange, label, disabled, labelHidden = true}) {
  return (
    <label className={cx('rv-switch', disabled && 'is-disabled')}>
      <input type="checkbox" role="switch" checked={Boolean(checked)} disabled={disabled}
        onChange={event => onChange?.(event.target.checked)} aria-label={labelHidden ? label : undefined} />
      <span className="rv-switch__track" aria-hidden="true"><span className="rv-switch__thumb" /></span>
      {!labelHidden && <span className="rv-switch__label">{label}</span>}
    </label>
  );
}

/* ---------- Screen states ---------- */

/**
 * Wraps a screen body with the reviewer's scenario: loading skeleton, error banner with retry, or the screen.
 * The screen receives {locked, overflow} so it can disable inputs and use long sample text.
 */
export function ScreenState({children, rows = 6}) {
  const {state, setState} = useScenario();
  if (state === 'loading') {
    return (
      <BlockStack gap="400">
        {[0, 1].map(i => (
          <Card key={i}><div aria-busy="true" aria-label="Loading"><BlockStack gap="300"><SkeletonDisplayText size="small" /><SkeletonBodyText lines={rows} /></BlockStack></div></Card>
        ))}
      </BlockStack>
    );
  }
  if (state === 'error') {
    return (
      <ErrorView title="We couldn't load this page" onRetry={() => setState('default')}>
        Joy didn't get a reply from the server. Nothing you saved is lost. Try again in a moment.
      </ErrorView>
    );
  }
  const locked = state === 'disabled';
  return (
    <BlockStack gap="400">
      {locked && (
        <Banner tone="warning" title="Your plan doesn't include this">
          <p>You can look around, but editing needs the Advanced plan. Upgrade in Settings › Plan.</p>
        </Banner>
      )}
      {typeof children === 'function' ? children({locked, overflow: state === 'overflow' || state === 'worst'}) : children}
    </BlockStack>
  );
}

/** Empty state with the 3D art made for the revamp (members, rewards, referral). */
export function EmptyCard({art = 'rewards', heading, children, action, secondaryAction}) {
  return (
    <Card>
      <div className="rv-empty">
        {EMPTY_ART[art] && <img src={EMPTY_ART[art]} alt="" className="rv-empty__art" />}
        <BlockStack gap="200" inlineAlign="center">
          <Text as="h2" variant="headingMd" alignment="center">{heading}</Text>
          {children && <Text as="p" tone="subdued" alignment="center">{children}</Text>}
        </BlockStack>
        {(action || secondaryAction) && (
          <InlineStack gap="200" align="center">
            {secondaryAction && <Button onClick={secondaryAction.onAction} url={secondaryAction.url}>{secondaryAction.content}</Button>}
            {action && <Button variant="primary" onClick={action.onAction} url={action.url}>{action.content}</Button>}
          </InlineStack>
        )}
      </div>
    </Card>
  );
}

/* ---------- Confirm ---------- */

/** const [confirm, modal] = useConfirm(); confirm({title, body, action: 'Delete', onConfirm}) */
export function useConfirm() {
  const [ask, setAsk] = useState(null);
  const modal = (
    <Modal open={Boolean(ask)} onClose={() => setAsk(null)} title={ask?.title ?? ''}
      primaryAction={ask ? {content: ask.action ?? 'Confirm', destructive: ask.destructive !== false, onAction: () => {ask.onConfirm?.(); setAsk(null);}} : undefined}
      secondaryActions={[{content: 'Cancel', onAction: () => setAsk(null)}]}>
      <Modal.Section><Text as="p">{ask?.body}</Text></Modal.Section>
    </Modal>
  );
  return [setAsk, modal];
}

/* ---------- Common program fields (same everywhere a program is configured) ---------- */

/** Who a program applies to. value = {mode: 'all'|'members'|'tiers'|'segment', tiers: [], segment: ''} */
export function EligibilityField({value = {mode: 'all'}, onChange, disabled, label = 'Who can get this'}) {
  const {db} = useStore();
  const tiers = db.tiers ?? [];
  const segments = db.segments ?? [];
  const set = patch => onChange({...value, ...patch});
  return (
    <BlockStack gap="200">
      <Select label={label} disabled={disabled} value={value.mode}
        options={[
          {label: 'All customers', value: 'all'},
          {label: 'Loyalty members only', value: 'members'},
          ...(tiers.length ? [{label: 'Specific VIP tiers', value: 'tiers'}] : []),
          {label: 'A customer segment', value: 'segment'},
        ]}
        onChange={mode => set({mode})} />
      {value.mode === 'tiers' && (
        <ChoiceList allowMultiple title="Tiers" titleHidden disabled={disabled}
          choices={tiers.map(t => ({label: t.name, value: t.id}))}
          selected={value.tiers ?? []} onChange={sel => set({tiers: sel})} />
      )}
      {value.mode === 'segment' && (
        <Select label="Segment" labelHidden disabled={disabled} value={value.segment ?? ''}
          options={[{label: 'Choose a segment', value: ''}, ...segments.map(s => ({label: `${s.name} · ${s.size.toLocaleString('en-US')} customers`, value: s.id}))]}
          onChange={segment => set({segment})} />
      )}
    </BlockStack>
  );
}

export function eligibilityLabel(value, db) {
  if (!value || value.mode === 'all') return 'All customers';
  if (value.mode === 'members') return 'Members';
  if (value.mode === 'tiers') {
    const names = (value.tiers ?? []).map(id => db.tiers?.find(t => t.id === id)?.name).filter(Boolean);
    return names.length ? names.join(', ') : 'No tier picked';
  }
  return db.segments?.find(s => s.id === value.segment)?.name ?? 'Segment';
}

/** Optional start/end dates. value = {start: '', end: ''} */
export function ScheduleField({value = {}, onChange, disabled}) {
  const [on, setOn] = useState(Boolean(value.start || value.end));
  return (
    <BlockStack gap="200">
      <Checkbox label="Run only between two dates" checked={on} disabled={disabled}
        onChange={checked => {setOn(checked); if (!checked) onChange({start: '', end: ''});}} />
      {on && (
        <InlineGrid columns={2} gap="200">
          <TextField label="Starts" type="date" value={value.start ?? ''} onChange={start => onChange({...value, start})} autoComplete="off" disabled={disabled} />
          <TextField label="Ends" type="date" value={value.end ?? ''} onChange={end => onChange({...value, end})} autoComplete="off" disabled={disabled}
            error={value.start && value.end && value.end < value.start ? 'Ends before it starts' : undefined} />
        </InlineGrid>
      )}
    </BlockStack>
  );
}

/** Optional cap. value = {on: false, times: 1, per: 'day'|'week'|'month'|'year'|'lifetime'} */
export function LimitField({value = {on: false, times: 1, per: 'lifetime'}, onChange, disabled, label = 'Limit how often a customer can get this'}) {
  return (
    <BlockStack gap="200">
      <Checkbox label={label} checked={Boolean(value.on)} disabled={disabled} onChange={on => onChange({...value, on})} />
      {value.on && (
        <InlineGrid columns={2} gap="200">
          <TextField label="Times" type="number" min={1} value={String(value.times ?? 1)} onChange={t => onChange({...value, times: Number(t)})} autoComplete="off" disabled={disabled} />
          <Select label="Per" disabled={disabled} value={value.per ?? 'lifetime'}
            options={[['day', 'Day'], ['week', 'Week'], ['month', 'Month'], ['year', 'Year'], ['lifetime', 'Lifetime']].map(([v, l]) => ({value: v, label: l}))}
            onChange={per => onChange({...value, per})} />
        </InlineGrid>
      )}
    </BlockStack>
  );
}

/** Number field with a unit suffix ("points", "%", "$" prefix). */
export function NumberField({label, value, onChange, suffix, prefix, min = 0, step, disabled, helpText, error}) {
  return (
    <TextField label={label} type="number" min={min} step={step} value={value == null ? '' : String(value)}
      onChange={v => onChange(v === '' ? '' : Number(v))} suffix={suffix} prefix={prefix}
      autoComplete="off" disabled={disabled} helpText={helpText} error={error} />
  );
}

/* ---------- Formatting ---------- */
export const num = n => (n == null || n === '' ? '—' : Math.round(Number(n)).toLocaleString('en-US'));
export const money = (n, currency = '$') => (n == null ? '—' : `${currency}${Number(n).toLocaleString('en-US', {minimumFractionDigits: Number(n) % 1 ? 2 : 0, maximumFractionDigits: 2})}`);
export const pct = n => (n == null ? '—' : `${Number(n).toFixed(1)}%`);
export const points = n => `${num(n)} ${Number(n) === 1 ? 'point' : 'points'}`;
export const dateLabel = iso => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'}) : '—');
