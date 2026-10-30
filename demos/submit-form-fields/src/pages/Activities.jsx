// Customers › Activities › Submit Form Activities (avada/master). Today: one "Content" text per submission.
// New: the answers by field, a side panel with every answer + the tags approval adds, and Export (one column per field).
import React, {useMemo, useState} from 'react';
import {Badge, BlockStack, Button, Card, IndexTable, InlineStack, Page, Popover, ActionList, Tabs, Tag, Text} from '@shopify/polaris';
import {ExportIcon} from '@shopify/polaris-icons';
import {useShell} from '../shell/ShellContext.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {Drawer} from '../kit/Drawer.jsx';
import {EmptyView, ErrorView, LoadingView} from '../kit/StateView.jsx';
import {OVERFLOW_SUBMISSION, SUBMISSIONS} from '../data/form.js';
import {useVersion} from '../state/form.jsx';

const ACTIVITY_TABS = ['All activities', 'Tier Activities', 'Environmental impact', 'Referral Activities', 'Google Reviews', 'Review Activities', 'Submitted receipts', 'Submit Form Activities', 'Launch tier'];
const STATUS = {pending: {label: 'Pending', tone: 'attention'}, approved: {label: 'Approved', tone: 'success'}, disapproved: {label: 'Disapproved', tone: 'critical'}};

function seed(state) {
  if (state === 'empty') return [];
  if (state === 'overflow' || state === 'worst') return [OVERFLOW_SUBMISSION, ...SUBMISSIONS, ...SUBMISSIONS.map((s) => ({...s, id: `${s.id}b`}))];
  return SUBMISSIONS;
}

function Proof({name}) {
  // A drawn receipt thumbnail (no grey placeholder box).
  return (
    <span className="sa-proof" title={name}>
      <svg viewBox="0 0 28 36" width="28" height="36" aria-hidden="true">
        <path d="M3 1h22v32l-3.6-2-3.7 2-3.7-2-3.6 2-3.7-2L3 33z" fill="var(--p-color-bg-surface)" stroke="var(--p-color-border)" />
        <path d="M7 8h14M7 12h10M7 16h12M7 22h8" stroke="var(--p-color-icon-secondary)" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function StatusMenu({row, onChange}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover
      active={open}
      activator={<Button size="slim" disclosure onClick={(e) => {e?.stopPropagation?.(); setOpen((v) => !v);}}><Text as="span" tone={STATUS[row.status].tone === 'attention' ? 'caution' : STATUS[row.status].tone}>{STATUS[row.status].label}</Text></Button>}
      onClose={() => setOpen(false)}
    >
      <ActionList items={[{content: 'Approved', onAction: () => {onChange('approved'); setOpen(false);}}, {content: 'Disapproved', onAction: () => {onChange('disapproved'); setOpen(false);}}]} />
    </Popover>
  );
}

function toCsv(rows) {
  const labels = [];
  rows.forEach((r) => r.answers.forEach(([l]) => !labels.includes(l) && labels.push(l)));
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const head = ['Submitted at', 'Program', 'Customer name', 'Email', 'Status', ...labels, 'Tags'];
  const body = rows.map((r) => [r.at, r.program, r.name, r.email, STATUS[r.status].label, ...labels.map((l) => r.answers.find(([x]) => x === l)?.[1] ?? ''), r.tags.join(', ')]);
  return [head, ...body].map((line) => line.map(esc).join(',')).join('\n');
}

export function Activities() {
  const {state} = useScenario();
  const [version] = useVersion();
  const {notify, notYet} = useShell();
  const [rows, setRows] = useState(() => seed(state));
  const [filter, setFilter] = useState(0);
  const [open, setOpen] = useState(null);
  React.useEffect(() => setRows(seed(state)), [state]);

  const filters = ['all', 'pending', 'approved', 'disapproved'];
  const shown = useMemo(() => (filter === 0 ? rows : rows.filter((r) => r.status === filters[filter])), [rows, filter]);
  const setStatus = (id, status) => {
    setRows((list) => list.map((r) => (r.id === id ? {...r, status} : r)));
    const r = rows.find((x) => x.id === id);
    notify(status === 'approved' && version === 'new' ? `Approved. ${r.name} gets 200 points and tags: ${r.tags.join(', ')}` : `Marked ${STATUS[status].label.toLowerCase()}`);
  };
  const current = rows.find((r) => r.id === open);

  const exportCsv = () => {
    const blob = new Blob([toCsv(shown)], {type: 'text/csv'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'submitted-forms.csv';
    a.click();
    notify(`Exported ${shown.length} submissions`);
  };

  let table;
  if (state === 'loading') table = <LoadingView rows={6} />;
  else if (state === 'error') table = <ErrorView title="We couldn’t load submissions" onRetry={() => notify('Trying again…')}>Nothing was changed. Try again in a moment.</ErrorView>;
  else if (!shown.length) table = <EmptyView heading="No submissions yet">Forms customers send from your Submit form programs show up here for review.</EmptyView>;
  else {
    table = (
      <IndexTable
        resourceName={{singular: 'submission', plural: 'submissions'}}
        itemCount={shown.length}
        selectable={false}
        headings={[{title: 'Submitted at'}, {title: 'Program'}, {title: 'Customer name'}, {title: 'Email'}, {title: version === 'new' ? 'Answers' : 'Content'}, {title: 'Image'}, {title: 'Status', alignment: 'center'}]}
      >
        {shown.map((r, i) => (
          <IndexTable.Row id={r.id} key={r.id} position={i} onClick={version === 'new' ? () => setOpen(r.id) : undefined}>
            <IndexTable.Cell><Text as="span" variant="bodySm">{r.at}</Text></IndexTable.Cell>
            <IndexTable.Cell><span className="sa-clip">{r.program}</span></IndexTable.Cell>
            <IndexTable.Cell><span className="sa-clip">{r.name}</span></IndexTable.Cell>
            <IndexTable.Cell><span className="sa-clip">{r.email}</span></IndexTable.Cell>
            <IndexTable.Cell>
              {version === 'new' ? (
                <div className="sa-answers">
                  {r.answers.filter(([l]) => l !== 'Order screenshot').slice(0, 3).map(([l, v]) => (
                    <div key={l} className="sa-answer"><span>{l}</span><strong>{v}</strong></div>
                  ))}
                  <Button variant="plain" onClick={(e) => {e?.stopPropagation?.(); setOpen(r.id);}}>{`View all ${r.answers.length} answers`}</Button>
                </div>
              ) : (
                <span className="sa-clip sa-clip--wide">{r.today}</span>
              )}
            </IndexTable.Cell>
            <IndexTable.Cell><Proof name={r.answers.find(([l]) => l === 'Order screenshot')?.[1]} /></IndexTable.Cell>
            <IndexTable.Cell><InlineStack align="center"><StatusMenu row={r} onChange={(s) => setStatus(r.id, s)} /></InlineStack></IndexTable.Cell>
          </IndexTable.Row>
        ))}
      </IndexTable>
    );
  }

  return (
    <Page fullWidth backAction={{content: 'Customers', url: '/demo'}} title="Activities">
      <BlockStack gap="300">
        <div className="sa-types">
          <Tabs
            tabs={ACTIVITY_TABS.map((t) => ({id: t, content: t}))}
            selected={7}
            onSelect={(i) => (i === 7 ? null : notYet())}
          />
        </div>
        <Card padding="0">
          <div className="sa-head">
            <Text as="h2" variant="headingSm">Submit Form Activities</Text>
            {version === 'new' ? <Button icon={ExportIcon} onClick={exportCsv} disabled={!shown.length || state === 'loading' || state === 'error'}>Export</Button> : null}
          </div>
          <Tabs tabs={['All', 'Pending', 'Approved', 'Disapproved'].map((t) => ({id: t, content: t}))} selected={filter} onSelect={setFilter} />
          {table}
        </Card>
      </BlockStack>

      <Drawer
        open={Boolean(current)}
        onClose={() => setOpen(null)}
        title={current ? `${current.name} · ${current.at}` : ''}
        primaryAction={current && current.status === 'pending' ? {content: 'Approve', onAction: () => {setStatus(current.id, 'approved'); setOpen(null);}} : undefined}
      >
        {current ? (
          <BlockStack gap="400">
            <InlineStack gap="200" blockAlign="center"><Badge tone={STATUS[current.status].tone}>{STATUS[current.status].label}</Badge><Text as="span" tone="subdued">{current.program}</Text></InlineStack>
            <dl className="sa-dl">
              {current.answers.map(([l, v]) => (
                <div key={l}><dt>{l}</dt><dd>{l === 'Order screenshot' ? <span className="sa-file"><Proof name={v} /> {v}</span> : v}</dd></div>
              ))}
            </dl>
            <BlockStack gap="200">
              <Text as="h3" variant="headingSm">{current.status === 'approved' ? 'Tags added to this customer' : current.status === 'disapproved' ? 'No tags added' : 'Tags added when you approve'}</Text>
              {current.status !== 'disapproved' ? <InlineStack gap="200">{current.tags.map((t) => <Tag key={t}>{t}</Tag>)}</InlineStack> : null}
            </BlockStack>
            {current.status === 'pending' ? (
              <Button tone="critical" onClick={() => {setStatus(current.id, 'disapproved'); setOpen(null);}}>Disapprove</Button>
            ) : null}
          </BlockStack>
        ) : null}
      </Drawer>
    </Page>
  );
}
