// Analytics: "is the program paying for itself?". One dashboard per tab, charts carry the page, KPI tiles are thin
// (number, change, sparkline). Date range scales every widget; Customize hides/shows widgets and is remembered.
import React, {useEffect, useMemo, useState} from 'react';
import {Badge, BlockStack, Button, Card, Checkbox, InlineGrid, InlineStack, Modal, Select, Tabs, Text} from '@shopify/polaris';
import {LockIcon} from '@shopify/polaris-icons';
import {PageFrame} from '../../ui/page.jsx';
import {CPage} from '../../ui/clean.jsx';
import {ScreenState, money, num, pct, usePlan} from '../../ui/kit.jsx';
import {BarList, FormCard, LineChart, ShareBar, SimpleTable, Sparkline} from '../../ui/parts.jsx';
import {useStore} from '../../state/store.jsx';
import {HashLink, useNavigate, useRoute} from '../../shell/router.jsx';
import {useShell} from '../../shell/ShellContext.jsx';
import {toMoney} from '../../lib/econ.js';

const TABS = [['overview', 'Overview'], ['revenue', 'Revenue'], ['members', 'Members'], ['rewards', 'Rewards'], ['referral', 'Referral'], ['emails', 'Emails']];
const short = d => new Date(`${d}T00:00:00`).toLocaleDateString('en-US', {month: 'short', day: 'numeric'});

/** Daily series for the chosen range: 7 and 30 days come from the seed; 90 days repeats the month with a small trend. */
function useSeries(range) {
  const {db} = useStore();
  return useMemo(() => {
    const d = db.stats.daily;
    if (range === 7) return d.slice(-7);
    if (range === 30) return d;
    const out = [];
    for (let k = 2; k >= 0; k -= 1) d.forEach(x => {
      const date = new Date(`${x.date}T00:00:00`); date.setDate(date.getDate() - k * 30);
      out.push({date: date.toISOString().slice(0, 10), sales: Math.round(x.sales * (1 - k * 0.06)), joy: Math.round(x.joy * (1 - k * 0.09))});
    });
    return out;
  }, [db.stats.daily, range]);
}

function Kpi({label, value, change, spark}) {
  const up = String(change).startsWith('+');
  return (
    <div className="op-kpi">
      <Text as="span" variant="bodySm" tone="subdued">{label}</Text>
      <span className="op-kpi__value">{value}</span>
      {change && <Text as="span" variant="bodySm" tone={up ? 'success' : 'critical'}>{change} vs previous</Text>}
      {spark && <Sparkline values={spark} />}
    </div>
  );
}
const KpiCard = ({items}) => <Card padding="0"><div className="op-kpis" style={{'--op-kpi-count': items.length}}>{items.map(k => <Kpi key={k.label} {...k} />)}</div></Card>;

function widgets(db, s, scale) {
  const l = db.stats.last30;
  const joy = s.reduce((a, x) => a + x.joy, 0);
  const sales = s.reduce((a, x) => a + x.sales, 0);
  const labels = s.map(x => short(x.date));
  const sc = n => Math.round(n * scale);
  const earnTop = [...db.earn].sort((a, b) => b.completions - a.completions).slice(0, 6);
  const redTop = [...db.redeem].sort((a, b) => b.redemptions - a.redemptions).slice(0, 6);
  const rewardCost = toMoney(db, sc(l.pointsRedeemed));
  const notif = db.notifications;
  const sent = notif.reduce((a, n) => a + n.sent, 0);
  const opened = notif.reduce((a, n) => a + n.sent * (n.opened / 100), 0);
  const ref = db.referral.stats;
  return [
    {id: 'ov-money', tab: 'overview', title: 'Money', full: true, render: () => <KpiCard items={[
      {label: 'Revenue by Joy', value: money(joy), change: '+12.4%', spark: s.map(x => x.joy)},
      {label: 'Share of sales', value: pct((joy / sales) * 100), change: '+2.1%'},
      {label: 'Return on rewards', value: `${(joy / (rewardCost || 1)).toFixed(1)}×`, change: '+0.6×'},
      {label: 'Referred revenue', value: money(sc(l.referredRevenue)), change: '+8.0%'},
    ]} />},
    {id: 'ov-people', tab: 'overview', title: 'People', full: true, render: () => <KpiCard items={[
      {label: 'Active members', value: num(l.members), change: `+${pct((l.newMembers / l.members) * 100)}`},
      {label: 'Buy again, members vs others', value: `${pct(l.repeatMember)} / ${pct(l.repeatGuest)}`},
      {label: 'Redemption rate', value: pct(l.redemptionRate), change: '-1.2%'},
      {label: 'Order value lift', value: `+${pct((l.aovMember / l.aovGuest - 1) * 100)}`},
    ]} />},
    {id: 'ov-trend', tab: 'overview', title: 'Revenue by Joy', render: () => <LineChart label="Revenue by Joy and all sales" labels={labels} series={[{name: 'Revenue by Joy', values: s.map(x => x.joy), tone: 'a', area: true}, {name: 'All sales', values: s.map(x => x.sales), tone: 'b'}]} format={v => `$${num(v)}`} />},
    {id: 'ov-points', tab: 'overview', title: 'Points earned and redeemed', render: () => <BarList format={num} rows={[{label: 'Earned', value: sc(l.pointsEarned)}, {label: 'Redeemed', value: sc(l.pointsRedeemed), color: 'var(--joy-chart-grey)'}, {label: 'Expired', value: sc(l.pointsEarned * 0.04), color: 'var(--p-color-bg-fill-tertiary)'}]} />},
    {id: 'ov-funnel', tab: 'overview', title: 'Referral funnel', render: () => <Funnel steps={[['Links shared', sc(ref.referred * 3.4)], ['Friends visited', sc(ref.referred * 1.8)], ['Signed up', sc(ref.referred)], ['Ordered', sc(ref.orders)]]} />},
    {id: 'ov-growth', tab: 'overview', title: 'Members over time', render: () => <LineChart label="Members" labels={labels} series={[{name: 'Members', values: s.map((x, i) => l.members - (s.length - i) * Math.round(l.newMembers / 30)), tone: 'a', area: true}]} format={num} height={180} zero={false} />},
    {id: 'rv-kpi', tab: 'revenue', title: 'Revenue', full: true, render: () => <KpiCard items={[{label: 'Revenue by Joy', value: money(joy), change: '+12.4%', spark: s.map(x => x.joy)}, {label: 'All sales', value: money(sales), change: '+4.0%', spark: s.map(x => x.sales)}, {label: 'Orders with points', value: num(sc(db.earn[0]?.completions ?? 0))}, {label: 'Value per member', value: money(joy / l.members)}]} />},
    {id: 'rv-trend', tab: 'revenue', title: 'Revenue by Joy', render: () => <LineChart label="Revenue by Joy" labels={labels} series={[{name: 'Revenue by Joy', values: s.map(x => x.joy), tone: 'a', area: true}]} format={v => `$${num(v)}`} />},
    {id: 'rv-lift', tab: 'revenue', title: 'Members vs others', render: () => <BarList rows={[{label: 'Avg order, members', value: l.aovMember}, {label: 'Avg order, others', value: l.aovGuest, color: 'var(--joy-chart-grey)'}]} format={money} />},
    {id: 'rv-table', tab: 'revenue', title: 'Daily sales with Joy', render: () => <div className="op-inset"><SimpleTable rows={[...s].reverse().slice(0, 7).map(x => ({...x, id: x.date}))} columns={[{key: 'date', label: 'Day', render: x => short(x.date)}, {key: 'joy', label: 'By Joy', numeric: true, render: x => money(x.joy)}, {key: 'sales', label: 'All sales', numeric: true, render: x => money(x.sales)}, {key: 'share', label: 'Share', numeric: true, render: x => pct((x.joy / x.sales) * 100)}]} /></div>},
    {id: 'mb-kpi', tab: 'members', title: 'Members', full: true, render: () => <KpiCard items={[{label: 'Members', value: num(l.members)}, {label: 'New members', value: num(sc(l.newMembers)), change: '+6.3%'}, {label: 'Took part', value: pct(62.4), change: '+1.8%'}, {label: 'Wallet pass', value: num(db.onsite.wallet.passes)}]} />},
    {id: 'mb-tiers', tab: 'members', title: 'Members per tier', render: () => <BlockStack gap="300"><ShareBar parts={db.tiers.map(t => ({label: t.name, value: t.members, color: t.color}))} /><HashLink url="/vip/tiers" className="op-link">Open VIP tiers</HashLink></BlockStack>},
    {id: 'mb-new', tab: 'members', title: 'New members per day', render: () => <LineChart label="New members per day" labels={labels} series={[{name: 'New members', values: s.map(x => Math.round(x.joy / 40)), tone: 'a'}]} format={num} height={180} />},
    {id: 'rw-points', tab: 'rewards', title: 'Points earned and redeemed', render: () => <BarList format={num} rows={[{label: 'Earned', value: sc(l.pointsEarned)}, {label: 'Redeemed', value: sc(l.pointsRedeemed), color: 'var(--joy-chart-grey)'}, {label: 'Adjusted', value: sc(4200), color: 'var(--p-color-bg-fill-tertiary)'}]} />},
    {id: 'rw-cost', tab: 'rewards', title: 'What rewards cost you', render: () => <BlockStack gap="200"><span className="op-kpi__value">{money(rewardCost)}</span><Text as="p" variant="bodySm" tone="subdued">Value of points redeemed in this period, at {db.program.point.value.points} points = {money(db.program.point.value.money)}. Joy brought in {money(joy)}, so every $1 of rewards returned {money(joy / (rewardCost || 1))}.</Text></BlockStack>},
    {id: 'rw-earn', tab: 'rewards', title: 'Top ways to earn', render: () => <BarList format={num} rows={earnTop.map(e => ({label: e.name, value: sc(e.completions)}))} />},
    {id: 'rw-redeem', tab: 'rewards', title: 'Top rewards', render: () => <BarList format={num} rows={redTop.map(r => ({label: r.name, value: sc(r.redemptions)}))} />},
    {id: 'rf-kpi', tab: 'referral', title: 'Referral', full: true, render: () => <KpiCard items={[{label: 'Friends referred', value: num(sc(ref.referred))}, {label: 'Their orders', value: num(sc(ref.orders))}, {label: 'Revenue', value: money(sc(ref.revenue))}, {label: 'Friends who ordered', value: pct(ref.conversion)}]} />},
    {id: 'rf-funnel', tab: 'referral', title: 'Conversion', render: () => <Funnel steps={[['Links shared', sc(ref.referred * 3.4)], ['Friends visited', sc(ref.referred * 1.8)], ['Signed up', sc(ref.referred)], ['Ordered', sc(ref.orders)]]} />},
    {id: 'rf-top', tab: 'referral', title: 'Top referrers', render: () => <div className="op-inset"><SimpleTable rows={[['Ava Nguyen', 6, 412], ['Dev Patel', 2, 180], ['Gia Tran', 2, 96]].map(([name, f, r]) => ({id: name, name, f, r}))} columns={[{key: 'name', label: 'Customer'}, {key: 'f', label: 'Friends', numeric: true}, {key: 'r', label: 'Revenue', numeric: true, render: x => money(x.r)}]} /></div>},
    {id: 'em-kpi', tab: 'emails', title: 'Emails', full: true, render: () => <KpiCard items={[{label: 'Sent', value: num(sc(sent))}, {label: 'Opened', value: num(sc(opened))}, {label: 'Open rate', value: pct((opened / sent) * 100)}, {label: 'Click rate', value: pct(9.8)}]} />},
    {id: 'em-table', tab: 'emails', title: 'By email', full: true, render: () => <div className="op-inset"><SimpleTable rows={notif} columns={[
      {key: 'event', label: 'Email', render: n => <HashLink url={`/settings/notifications/${n.id}`} className="op-link">{n.event}</HashLink>},
      {key: 'on', label: 'Status', render: n => <Badge tone={n.on ? 'success' : undefined}>{n.on ? 'On' : 'Off'}</Badge>},
      {key: 'sent', label: 'Sent', numeric: true, render: n => (n.sent ? num(sc(n.sent)) : '—')},
      {key: 'opened', label: 'Open rate', numeric: true, render: n => (n.sent ? pct(n.opened) : '—')},
      {key: 'clicked', label: 'Click rate', numeric: true, render: n => (n.sent ? pct(n.opened / 5) : '—')},
    ]} /></div>},
  ];
}

function Funnel({steps}) {
  const top = steps[0][1] || 1;
  return (
    <div className="op-funnel">
      {steps.map(([label, v], i) => (
        <div key={label} className="op-funnel__step">
          <div className="op-funnel__bar" style={{height: `${Math.max(8, (v / top) * 120)}px`}} />
          <b>{num(v)}</b><span>{label}</span>
          {i > 0 && <small>{pct((v / (steps[i - 1][1] || 1)) * 100)} of previous</small>}
        </div>
      ))}
    </div>
  );
}

export function Analytics() {
  const {db, set, merge} = useStore();
  const {query} = useRoute();
  const navigate = useNavigate();
  const {notify} = useShell();
  const {allows} = usePlan();
  const [range, setRange] = useState(30);
  const [custom, setCustom] = useState(false);
  const tabId = query.get('tab') ?? 'overview';
  const tab = Math.max(0, TABS.findIndex(([id]) => id === tabId));
  const s = useSeries(range);
  const hidden = db.analyticsLayout?.hidden ?? [];
  const all = widgets(db, s, range / 30);
  const mine = all.filter(w => w.tab === TABS[tab][0]);
  const [draftHidden, setDraftHidden] = useState(hidden);
  useEffect(() => {
    const v = db.home.visited ?? [];
    if (!v.includes('analytics')) merge(['home'], {visited: [...v, 'analytics']});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <PageFrame title="Analytics" width="wide"
      secondaryActions={[{content: 'Customize', onAction: () => {setDraftHidden(hidden); setCustom(true);}}]}
      moreActions={[{content: 'Export', onAction: () => notify(`We'll email the ${TABS[tab][1]} report to ${db.shop.email}`)}, {content: allows('ultimate') ? 'Create metric' : 'Create metric (Ultimate)', onAction: () => notify(allows('ultimate') ? 'Opens the metric builder' : 'Custom metrics need the Ultimate plan. See Settings › Plan and billing.')}]}>
      <ScreenState>
        <CPage>
          <InlineStack align="space-between" blockAlign="center" gap="300">
            <div className="pt-switch" role="tablist" aria-label="Analytics pages">
              {TABS.map(([id, content], i) => <button key={id} type="button" role="tab" aria-selected={tab === i} className={tab === i ? 'is-on' : undefined} onClick={() => navigate(`/analytics?tab=${id}`, {replace: true})}>{content}</button>)}
            </div>
            <div style={{minWidth: 160}}><Select label="Date range" labelHidden value={String(range)} onChange={v => setRange(Number(v))} options={[{label: 'Last 7 days', value: '7'}, {label: 'Last 30 days', value: '30'}, {label: 'Last 90 days', value: '90'}]} /></div>
          </InlineStack>
          <div className="op-dash">
            {mine.filter(w => !hidden.includes(w.id)).map(w => (
              w.full ? <div key={w.id} className="op-dash__full">{w.render()}</div>
                : <FormCard key={w.id} title={w.title}>{w.render()}</FormCard>
            ))}
            {!mine.some(w => !hidden.includes(w.id)) && <Card><BlockStack gap="200" inlineAlign="start"><Text as="p" tone="subdued">Every widget on this tab is hidden.</Text><Button onClick={() => {setDraftHidden(hidden); setCustom(true);}}>Customize</Button></BlockStack></Card>}
          </div>
          <p className="pt-note">Compared with the {range} days before. Data updated 14:00 today.</p>
        </CPage>
      </ScreenState>
      <Modal open={custom} onClose={() => setCustom(false)} title={`Customize ${TABS[tab][1]}`}
        primaryAction={{content: 'Save', onAction: () => {set(['analyticsLayout'], {hidden: draftHidden}); setCustom(false); notify('Dashboard saved');}}}
        secondaryActions={[{content: 'Reset to default', onAction: () => setDraftHidden([])}, {content: 'Cancel', onAction: () => setCustom(false)}]}>
        <Modal.Section>
          <BlockStack gap="200">
            <Text as="p" tone="subdued">Choose the widgets on this tab.</Text>
            {mine.map(w => <Checkbox key={w.id} label={w.title} checked={!draftHidden.includes(w.id)} onChange={v => setDraftHidden(v ? draftHidden.filter(x => x !== w.id) : [...draftHidden, w.id])} />)}
          </BlockStack>
        </Modal.Section>
      </Modal>
    </PageFrame>
  );
}

function LockGlyph() {
  return <svg width="16" height="16" viewBox="0 0 20 20" aria-hidden="true"><path fill="currentColor" d="M10 2a4 4 0 0 0-4 4v2H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-1V6a4 4 0 0 0-4-4Zm-2 6V6a2 2 0 1 1 4 0v2H8Z" /></svg>;
}

export function resolve(segments) {
  if (segments[0] !== 'analytics') return null;
  return <Analytics />;
}
