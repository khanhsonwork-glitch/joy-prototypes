// Opus build: shared parts on top of ui/kit.jsx. Every list, picker, editor and chart in the revamp is made from
// these, so a merchant meets the same pattern on every screen (one way to add, one way to edit, one way to switch).
import React, {useCallback, useMemo, useRef, useState} from 'react';
import {
  Badge, BlockStack, Box, Button, Card, Icon, IndexFilters, InlineGrid, InlineStack, Modal, Text, TextField,
  useSetIndexFiltersMode,
} from '@shopify/polaris';
import {AlertCircleIcon, InfoIcon, LockIcon, SearchIcon} from '@shopify/polaris-icons';
import {useScenario} from '../kit/scenario.jsx';
import {useShell} from '../shell/ShellContext.jsx';
import {useNavigate} from '../shell/router.jsx';
import {shortNote, PlanBadge, Switch, cx, usePlan} from './kit.jsx';

/* ---------- Scenario-aware data ---------- */

const LONG = ' — the limited winter edition for our most loyal skincare fans in every region we ship to';
/**
 * The list a screen should show for the reviewer's state: empty → [], overflow → first name very long,
 * worst → long names and 40 rows. Copies keep the original id after "~" so a click opens the real record.
 */
export function useScenarioList(items, field = 'name') {
  const {state} = useScenario();
  return useMemo(() => {
    if (state === 'empty') return [];
    if (state !== 'overflow' && state !== 'worst') return items;
    const long = items.map((it, i) => (i === 0 ? {...it, [field]: `${it[field]}${LONG}`} : it));
    if (state === 'overflow' || !items.length) return long;
    const out = [...long];
    for (let n = 1; out.length < 40; n += 1) items.forEach(it => out.length < 40 && out.push({...it, id: `${it.id}~${n}`, [field]: `${it[field]} (copy ${n})`}));
    return out;
  }, [items, state, field]);
}
export const realId = id => String(id ?? '').split('~')[0];

/* ---------- Small pieces ---------- */

/** Icon in a soft rounded square; the program "avatar" used in every list. */
export function IconTile({icon, size = 'md', tone}) {
  return <span className={cx('op-tile', `op-tile--${size}`, tone && `op-tile--${tone}`)} aria-hidden="true"><Icon source={icon} /></span>;
}

/** On/off switch that saves at once and confirms with a toast. Click never opens the row. */
export function RowSwitch({on, onChange, label, disabled, message}) {
  const {notify} = useShell();
  return (
    <span className="op-rowswitch" onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
      <Switch checked={on} disabled={disabled} label={label}
        onChange={next => {onChange(next); notify(message ? message(next) : `${label} turned ${next ? 'on' : 'off'}`);}} />
    </span>
  );
}

/** "Nhắc, không cấm": a quiet note next to an input that says the consequence, never blocks. */
export function Hint({tone = 'info', children}) {
  return (
    <div className={cx('op-hint', `op-hint--${tone}`)}>
      <span className="op-hint__icon"><Icon source={tone === 'warning' ? AlertCircleIcon : InfoIcon} /></span>
      <Text as="p" variant="bodySm">{children}</Text>
    </div>
  );
}

/** Plain labelled value pairs in a rail card. */
export function Pairs({rows}) {
  return (
    <dl className="op-pairs">
      {rows.filter(Boolean).map(([k, v]) => (
        <div key={k} className="op-pairs__row"><dt>{k}</dt><dd>{v}</dd></div>
      ))}
    </dl>
  );
}

/** Row of KPI tiles inside one card; wraps to 2 per row on phones. */
export function KpiRow({items}) {
  return (
    <Card padding="0">
      <div className="op-kpis" style={{'--op-kpi-count': items.length}}>
        {items.map(k => (
          <div key={k.label} className="op-kpi">
            <Text as="span" variant="bodySm" tone="subdued">{k.label}</Text>
            <span className="op-kpi__value">{k.value}</span>
            {k.note && <Text as="span" variant="bodySm" tone={k.tone}>{k.note}</Text>}
            {k.spark && <Sparkline values={k.spark} />}
          </div>
        ))}
      </div>
    </Card>
  );
}

/* ---------- Lists ---------- */

/**
 * IndexFilters with tabs (+counts), search and sort, wired for local state.
 * tabs: [{id, label, count}]; sortOptions: Polaris sort options.
 */
export function ListFilters({tabs = [], selected = 0, onSelect, query, onQuery, placeholder = 'Search', sortOptions, sort, onSort, filters = [], applied = [], onClearAll}) {
  const {mode, setMode} = useSetIndexFiltersMode();
  return (
    <IndexFilters
      tabs={tabs.map((t, index) => ({content: t.label, index, id: t.id, isLocked: true, onAction: () => {}, badge: t.count != null ? String(t.count) : undefined}))}
      selected={selected} onSelect={onSelect} canCreateNewView={false}
      queryValue={query} queryPlaceholder={placeholder} onQueryChange={onQuery} onQueryClear={() => onQuery('')}
      sortOptions={sortOptions} sortSelected={sort ? [sort] : undefined} onSort={v => onSort?.(v[0])}
      filters={filters} appliedFilters={applied} onClearAll={onClearAll ?? (() => onQuery(''))} hideFilters={!filters.length}
      cancelAction={{onAction: () => onQuery(''), disabled: false, loading: false}}
      mode={mode} setMode={setMode} />
  );
}

/** Sort helper for "field dir" values. */
export function sortBy(items, sort, getters = {}) {
  if (!sort) return items;
  const [field, dir] = sort.split(' ');
  const get = getters[field] ?? (x => x[field]);
  return [...items].sort((a, b) => {
    const x = get(a); const y = get(b);
    const c = typeof x === 'number' || typeof y === 'number' ? (Number(x) || 0) - (Number(y) || 0) : String(x ?? '').localeCompare(String(y ?? ''));
    return dir === 'desc' ? -c : c;
  });
}
export const matches = (q, ...fields) => !q || fields.some(f => String(f ?? '').toLowerCase().includes(q.toLowerCase()));

/** A clickable list row: tile · title + subtitle · meta · trailing control. */
export function Row({icon, thumb, title, subtitle, meta, trailing, onClick, url, tone}) {
  const navigate = useNavigate();
  const open = onClick ?? (url ? () => navigate(url) : undefined);
  return (
    <div className={cx('op-row', open && 'is-link', tone && `op-row--${tone}`)} role={open ? 'link' : undefined} tabIndex={open ? 0 : undefined}
      onClick={open} onKeyDown={open ? e => {if (e.key === 'Enter') open();} : undefined}>
      {thumb ? <img className="op-row__thumb" src={thumb} alt="" /> : icon ? <IconTile icon={icon} /> : null}
      <div className="op-row__main">
        <span className="op-row__title">{title}</span>
        {subtitle && <span className="op-row__sub">{subtitle}</span>}
      </div>
      {meta && <div className="op-row__meta">{meta}</div>}
      {trailing && <div className="op-row__trail" onClick={e => e.stopPropagation()}>{trailing}</div>}
    </div>
  );
}

/** Simple responsive table: a real table from 768 px, stacked label/value cards below. */
export function SimpleTable({columns, rows, empty = 'Nothing here yet.', onRow}) {
  if (!rows.length) return <Box padding="400"><Text as="p" tone="subdued">{empty}</Text></Box>;
  return (
    <div className="op-table">
      <table>
        <thead><tr>{columns.map(c => <th key={c.key} className={c.numeric ? 'is-num' : undefined} scope="col">{c.label}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id ?? i} className={onRow ? 'is-link' : undefined} onClick={onRow ? () => onRow(r) : undefined}
              tabIndex={onRow ? 0 : undefined} onKeyDown={onRow ? e => {if (e.key === 'Enter') onRow(r);} : undefined}>
              {columns.map(c => <td key={c.key} data-label={c.label} className={c.numeric ? 'is-num' : undefined}>{c.render ? c.render(r) : r[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Create: one picker for every "Add …" ---------- */

/**
 * Modal to pick what to create. options: [{id, name, desc, icon, group, plan, taken}]; groups: [{id, label}].
 * Plan-locked options say which plan unlocks them; one-instance types already added say so.
 */
export function TypePicker({open, onClose, title, groups, options, onPick, intro}) {
  const [q, setQ] = useState('');
  const {allows, label} = usePlan();
  const {notify} = useShell();
  const shown = options.filter(o => matches(q, o.name, o.desc, o.keywords));
  const close = () => {setQ(''); onClose();};
  return (
    <Modal open={open} onClose={close} title={title} size="large">
      <Modal.Section>
        <BlockStack gap="400">
          {intro && <Text as="p" tone="subdued">{intro}</Text>}
          <TextField label="Search" labelHidden placeholder="Search by name or what customers do" value={q} onChange={setQ}
            prefix={<Icon source={SearchIcon} />} autoComplete="off" clearButton onClearButtonClick={() => setQ('')} autoFocus />
          {!shown.length && <Text as="p" tone="subdued">Nothing matches “{q}”. Try another word.</Text>}
          {(groups ?? [{id: null, label: null}]).map(g => {
            const list = shown.filter(o => g.id == null || o.group === g.id);
            if (!list.length) return null;
            return (
              <BlockStack key={g.id ?? 'all'} gap="200">
                {g.label && <Text as="h3" variant="headingSm">{g.label} <Text as="span" tone="subdued">{list.length}</Text></Text>}
                <div className="op-picker">
                  {list.map(o => {
                    const locked = o.plan && !allows(o.plan);
                    const off = locked || o.taken;
                    return (
                      <button key={o.id} type="button" className={cx('op-picker__item', off && 'is-off')} aria-disabled={off || undefined}
                        onClick={() => {
                          if (o.taken) {notify(`${o.name} is already set up. Open it from the list to edit it.`); return;}
                          if (locked) {notify(`${o.name} needs the ${label(o.plan)} plan. Upgrade in Settings › Plan and billing.`); return;}
                          setQ(''); onPick(o.id);
                        }}>
                        {o.thumb ? <img className="op-picker__thumb" src={o.thumb} alt="" /> : <IconTile icon={o.icon} />}
                        <span className="op-picker__text">
                          <span className="op-picker__name">{o.name}</span>
                          {o.desc && <span className="op-picker__desc">{o.desc}</span>}
                        </span>
                        <span className="op-picker__badge">
                          {o.taken ? <Badge>Already added</Badge> : locked ? <Badge icon={LockIcon}>{`Upgrade to ${label(o.plan)}`}</Badge> : <PlanBadge plan={o.plan} />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </BlockStack>
            );
          })}
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

/* ---------- Editors ---------- */

/** Two columns on desktop (what the customer does/gets | rail), stacked on phones; danger zone at the bottom. */
export function EditorLayout({children, rail, danger}) {
  return (
    <BlockStack gap="500">
      <InlineGrid columns={{xs: 1, md: '2fr 1fr'}} gap="400" alignItems="start">
        <BlockStack gap="400">{children}</BlockStack>
        <BlockStack gap="400">{rail}</BlockStack>
      </InlineGrid>
      {danger && <div className="op-danger">{danger}</div>}
    </BlockStack>
  );
}

/** Card with a heading inside (form groups inside editors). */
export function FormCard({title, description, children, action}) {
  return (
    <Card>
      <BlockStack gap="400">
        {(title || action) && (
          <InlineStack align="space-between" blockAlign="start" gap="200" wrap={false}>
            <BlockStack gap="100">
              {title && <Text as="h2" variant="headingMd">{title}</Text>}
              {shortNote(description) && <Text as="p" variant="bodySm" tone="subdued">{description}</Text>}
            </BlockStack>
            {action}
          </InlineStack>
        )}
        {children}
      </BlockStack>
    </Card>
  );
}

/**
 * The live consequence card at the top of every rail: one sentence in plain words, then the money maths.
 * sentence: string; facts: [[label, value]]; tone 'warning' adds a nudge line.
 */
export function SummaryCard({title = 'Summary', sentence, facts, nudge, children}) {
  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h2" variant="headingSm">{title}</Text>
        <p className="op-sentence" aria-live="polite">{sentence}</p>
        {facts && <Pairs rows={facts} />}
        {nudge && <Hint tone="warning">{nudge}</Hint>}
        {children}
      </BlockStack>
    </Card>
  );
}

/** Status card for the rail: one switch, what on/off means. */
export function StatusCard({on, onChange, scheduled, disabled, what = 'program'}) {
  return (
    <Card>
      <BlockStack gap="200">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h2" variant="headingSm">Status</Text>
          <Switch checked={on} onChange={onChange} label={`Turn ${what} on`} disabled={disabled} />
        </InlineStack>
        <Text as="p" variant="bodySm" tone="subdued">
          {on ? (scheduled ? `Turns on by itself on ${scheduled}.` : `Customers can see and use this ${what} now.`) : `Off. Customers don't see this ${what}.`}
        </Text>
      </BlockStack>
    </Card>
  );
}

/* ---------- Charts (inline SVG, no library) ---------- */

export function Sparkline({values, height = 28}) {
  if (!values?.length) return null;
  const max = Math.max(...values); const min = Math.min(...values);
  const w = 100; const span = max - min || 1;
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${(i / (values.length - 1)) * w},${height - 2 - ((v - min) / span) * (height - 4)}`).join(' ');
  return <svg className="op-spark" viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" aria-hidden="true"><path d={d} /></svg>;
}

/**
 * Line/area chart with axes, hover + keyboard tooltip (← → keys). series: [{name, values, tone: 'a'|'b'}]
 */
export function LineChart({labels, series, format = v => v, height = 220, label = 'Chart', zero = true}) {
  const [active, setActive] = useState(null);
  const ref = useRef(null);
  const wrap = useRef(null);
  // Draw at the real pixel width so axis text and line weight stay 1:1 at any card width.
  const [W, setW] = useState(640);
  React.useLayoutEffect(() => {
    const el = wrap.current; if (!el) return undefined;
    const measure = () => setW(Math.max(280, Math.round(el.getBoundingClientRect().width)));
    measure();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(measure) : null;
    ro?.observe(el);
    return () => ro?.disconnect();
  }, []);
  const H = height; const pad = {l: 52, r: 12, t: 12, b: 26};
  const all = series.flatMap(s => s.values);
  const max = Math.max(...all, 1) * 1.1;
  const min = zero ? 0 : Math.min(...all) * 0.97;
  const x = i => pad.l + (i / Math.max(1, labels.length - 1)) * (W - pad.l - pad.r);
  const y = v => pad.t + (1 - (v - min) / (max - min || 1)) * (H - pad.t - pad.b);
  const ticks = [0, 0.5, 1].map(f => min + (max - min) * f);
  const onMove = e => {
    const box = ref.current.getBoundingClientRect();
    const rel = ((e.clientX - box.left) / box.width) * W;
    setActive(Math.max(0, Math.min(labels.length - 1, Math.round(((rel - pad.l) / (W - pad.l - pad.r)) * (labels.length - 1)))));
  };
  const onKey = e => {
    if (e.key === 'ArrowRight') setActive(a => Math.min(labels.length - 1, (a ?? -1) + 1));
    if (e.key === 'ArrowLeft') setActive(a => Math.max(0, (a ?? labels.length) - 1));
    if (e.key === 'Escape') setActive(null);
  };
  // About one date label per 72 px, and never one that would touch the last label.
  const every = Math.ceil(labels.length / Math.max(2, Math.min(6, Math.floor((W - pad.l - pad.r) / 72))));
  const showLabel = i => i === labels.length - 1 || (i % every === 0 && labels.length - 1 - i >= every * 0.7);
  return (
    <div className="op-chart" ref={wrap}>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={label} tabIndex={0}
        onMouseMove={onMove} onMouseLeave={() => setActive(null)} onKeyDown={onKey} onFocus={() => setActive(a => a ?? labels.length - 1)} onBlur={() => setActive(null)}>
        {ticks.map(t => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className="op-chart__grid" />
            <text x={pad.l - 6} y={y(t) + 4} className="op-chart__axis" textAnchor="end">{format(Math.round(t))}</text>
          </g>
        ))}
        {labels.map((l, i) => showLabel(i) && (
          <text key={l + i} x={x(i)} y={H - 6} className="op-chart__axis" textAnchor={i === 0 ? 'start' : i === labels.length - 1 ? 'end' : 'middle'}>{l}</text>
        ))}
        {series.map(s => {
          const d = s.values.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join(' ');
          return (
            <g key={s.name} className={`op-chart__s op-chart__s--${s.tone ?? 'a'}`}>
              {s.area && <path d={`${d} L${x(s.values.length - 1)},${y(min)} L${x(0)},${y(min)} Z`} className="op-chart__area" />}
              <path d={d} className="op-chart__line" />
            </g>
          );
        })}
        {active != null && (
          <g>
            <line x1={x(active)} x2={x(active)} y1={pad.t} y2={H - pad.b} className="op-chart__cursor" />
            {series.map(s => <circle key={s.name} cx={x(active)} cy={y(s.values[active])} r="4" className={`op-chart__dot op-chart__dot--${s.tone ?? 'a'}`} />)}
          </g>
        )}
      </svg>
      {active != null && (
        <div className="op-chart__tip" style={{left: `${(x(active) / W) * 100}%`}} role="status">
          <strong>{labels[active]}</strong>
          {series.map(s => <span key={s.name}><i className={`op-chart__key op-chart__key--${s.tone ?? 'a'}`} />{s.name}: {format(s.values[active])}</span>)}
        </div>
      )}
      <div className="op-chart__legend">
        {series.map(s => <span key={s.name}><i className={`op-chart__key op-chart__key--${s.tone ?? 'a'}`} />{s.name}</span>)}
      </div>
    </div>
  );
}

/** Horizontal bars with labels and values (rankings, funnels). */
export function BarList({rows, format = v => v, max}) {
  const top = max ?? Math.max(...rows.map(r => r.value), 1);
  return (
    <div className="op-bars">
      {rows.map(r => (
        <div key={r.label} className="op-bars__row">
          <span className="op-bars__label">{r.label}</span>
          <span className="op-bars__track"><span className="op-bars__fill" style={{width: `${Math.max(2, (r.value / top) * 100)}%`, background: r.color}} /></span>
          <span className="op-bars__value">{format(r.value)}{r.note ? <small> {r.note}</small> : null}</span>
        </div>
      ))}
    </div>
  );
}

/** Stacked share bar (members per tier, etc.). */
export function ShareBar({parts}) {
  const total = parts.reduce((s, p) => s + (p.value || 0), 0) || 1;
  return (
    <div className="op-share">
      <div className="op-share__bar" role="img" aria-label={parts.map(p => `${p.label} ${Math.round((p.value / total) * 100)}%`).join(', ')}>
        {parts.map(p => <span key={p.label} style={{width: `${(p.value / total) * 100}%`, background: p.color}} title={`${p.label}: ${p.value}`} />)}
      </div>
      <div className="op-share__legend">
        {parts.map(p => <span key={p.label}><i style={{background: p.color}} />{p.label} <b>{p.value.toLocaleString('en-US')}</b></span>)}
      </div>
    </div>
  );
}

/* ---------- Copy helper ---------- */
export function useCopy() {
  const {notify} = useShell();
  return useCallback((text, what = 'Link') => {
    try {navigator.clipboard?.writeText(text);} catch {/* clipboard blocked */}
    notify(`${what} copied`);
  }, [notify]);
}

/** Section heading outside, children as-is (use when the body brings its own Card / EmptyCard). */
export function Block({title, description, action, children, id}) {
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
      {children}
    </section>
  );
}

/**
 * Mini storefront in the merchant's own brand (North Bloom sample): what customers see in the loyalty widget.
 * lines: [{icon, text, value, active}]
 */
export function StorePreview({title = 'Customers see', heading, sub, lines = [], footer, brand}) {
  return (
    <Card>
      <BlockStack gap="300">
        <Text as="h2" variant="headingSm">{title}</Text>
        <div className="op-store" style={brand ? {'--brand-primary': brand} : undefined} aria-label="Preview of your store">
          <div className="op-store__head"><small>{sub}</small><strong>{heading}</strong></div>
          <div className="op-store__body">
            {lines.map((l, i) => (
              <div key={i} className={cx('op-store__line', l.active && 'is-active')}>
                {l.icon && <Icon source={l.icon} />}<span className="op-store__text">{l.text}</span>{l.value && <b>{l.value}</b>}
              </div>
            ))}
            {footer}
          </div>
        </div>
      </BlockStack>
    </Card>
  );
}

/**
 * Pills that switch between the pages of one module (the approved sub-menu), e.g. Customers · To review · Activity.
 * items: [{label, url, count, active}]
 */
export function ModuleNav({items, label = 'Pages in this section'}) {
  return (
    <nav className="pt-switch" aria-label={label}>
      {items.filter(Boolean).map(it => (
        <a key={it.url} href={`#${it.url}`} className={it.active ? 'is-on' : undefined} aria-current={it.active ? 'page' : undefined}>
          {it.label}{it.count ? <span className="pt-switch__count">{it.count}</span> : null}
        </a>
      ))}
    </nav>
  );
}

/* ---------- Editor shell (gu pass 18/11): one focal sentence, the few decisions, a preview, the rest folded ---------- */

/**
 * Top of every editor: the consequence in one big sentence, a few facts, the on/off switch. It is the first thing the
 * eye lands on, so the merchant sees what the settings below add up to before reading any field.
 * status: {on, onChange, label, disabled, note}
 */
// Clean pass rule 4: performance numbers (how many redeemed, sent, opened…) live in Analytics, not on top of an editor.
const STAT_FACT = /^(redeemed|reached|completed|members|used|subscribers|monthly revenue|trials|cancelled|sent|open rate|click rate|friends|revenue)/i;

export function EditorHero({icon, thumb, sentence, facts: allFacts = [], nudge, status}) {
  const facts = allFacts.filter(([k]) => !STAT_FACT.test(String(k)));
  return (
    <div className="op-focus">
      {thumb ? <img className="op-focus__thumb" src={thumb} alt="" /> : icon ? <IconTile icon={icon} size="lg" /> : null}
      <div className="op-focus__text">
        <p className="op-focus__sentence" aria-live="polite">{sentence}</p>
        {facts.length > 0 && (
          <div className="op-focus__facts">
            {facts.map(([k, v]) => <span key={k}>{k} <b>{v}</b></span>)}
          </div>
        )}
        {nudge && <div className="op-focus__nudge"><Icon source={AlertCircleIcon} />{nudge}</div>}
      </div>
      {status && (
        <div className="op-focus__status">
          <Switch checked={status.on} onChange={status.onChange} label={status.label ?? 'On'} disabled={status.disabled} />
          <span className="op-focus__state">{status.note ?? (status.on ? 'On' : 'Off')}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Everything a merchant rarely changes, folded under one row that names what is inside, so the fields stay
 * findable without being laid out at once. sections: [{title, children}] (falsy entries are skipped).
 */
export function MoreSettings({title = 'More settings', sections, defaultOpen = false}) {
  const [open, setOpen] = useState(defaultOpen);
  const list = sections.filter(Boolean);
  if (!list.length) return null;
  return (
    <div className={cx('op-more', open && 'is-open')}>
      <button type="button" className="op-more__head" aria-expanded={open} onClick={() => setOpen(o => !o)}>
        <span className="op-more__text">
          <span className="op-more__title">{title}</span>
          <span className="op-more__list">{list.map(s => s.title).join(' · ')}</span>
        </span>
        <span className="op-more__chev" aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div className="op-more__body">
          {list.map(s => (
            <section key={s.title} className="op-more__section" aria-label={s.title}>
              <Text as="h3" variant="headingSm">{s.title}</Text>
              {s.description && <Text as="p" variant="bodySm" tone="subdued">{s.description}</Text>}
              <BlockStack gap="300">{s.children}</BlockStack>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

/** Editor page body: hero on top, main column + 320 px preview column, folded settings, quiet delete at the end. */
export function EditorShell({hero, side, more, danger, children}) {
  return (
    <div className="op-ed">
      {hero}
      <div className="op-ed__cols">
        <div className="op-ed__main">
          {children}
          {more}
        </div>
        {side && <div className="op-ed__side">{side}</div>}
      </div>
      {danger && <div className="op-danger">{danger}</div>}
    </div>
  );
}

/** A plain card with one heading, for the main column of an editor. */
export function Panel({title, description, action, children}) {
  return (
    <div className="op-panel">
      {(title || action) && (
        <div className="op-panel__head">
          <div>
            {title && <Text as="h2" variant="headingMd">{title}</Text>}
            {shortNote(description) && <Text as="p" variant="bodySm" tone="subdued">{description}</Text>}
          </div>
          {action}
        </div>
      )}
      <BlockStack gap="400">{children}</BlockStack>
    </div>
  );
}

/**
 * Calm list row (gu pass): icon or photo, name, one value on the right, chevron. A second line only when it says
 * something the merchant acts on. Off items stay in place, greyed, with an "Off" tag.
 */
export function ListRow({icon, iconTone, thumb, title, off, tag, value, valueSub, sub, url, onClick, trailing}) {
  const navigate = useNavigate();
  const open = onClick ?? (url ? () => navigate(url) : undefined);
  return (
    <div className={cx('op-lrow', open && 'is-link', off && 'is-off')} role={open ? 'link' : undefined} tabIndex={open ? 0 : undefined}
      onClick={open} onKeyDown={open ? e => {if (e.key === 'Enter') open();} : undefined}>
      {thumb ? <img className="op-lrow__thumb" src={thumb} alt="" /> : icon ? <span className={cx('op-lrow__icon', iconTone && `op-lrow__icon--${iconTone}`)} aria-hidden="true"><Icon source={icon} /></span> : null}
      <span className="op-lrow__main">
        <span className="op-lrow__title">{title}{off && <span className="op-lrow__tag">Off</span>}{tag && <span className="op-lrow__tag">{tag}</span>}</span>
        {sub && <span className="op-lrow__sub">{sub}</span>}
      </span>
      {value != null && <span className="op-lrow__value"><span>{value}</span>{valueSub && <span className="op-lrow__vsub">{valueSub}</span>}</span>}
      {trailing ? <span className="op-lrow__trail" onClick={e => e.stopPropagation()}>{trailing}</span> : open ? <span className="op-lrow__chev" aria-hidden="true">›</span> : null}
    </div>
  );
}

/** White card holding ListRows, with optional small group labels. */
export function ListCard({children}) {
  return <div className="op-lcard">{children}</div>;
}
