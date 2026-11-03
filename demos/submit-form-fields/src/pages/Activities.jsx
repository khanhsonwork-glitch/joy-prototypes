// Customers › Activities › Submit Form Activities (avada/master). The Content column of master shows one text per
// submission with the full text on hover and a copy button. Phases 1 and 2 keep that cell: the first answer as
// "Label: value", every answer on hover, and a copy button for all of them. A submission made before the feature
// keeps its single Content text. Search is by email, as on master.
import React, {useMemo, useState} from 'react';
import {BlockStack, Button, Card, Icon, IndexTable, InlineStack, Modal, Page, Popover, ActionList, Tabs, Text, TextField, Tooltip, useIndexResourceState} from '@shopify/polaris';
import {ClipboardIcon, SearchIcon} from '@shopify/polaris-icons';
import {useShell} from '../shell/ShellContext.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {EmptyView, ErrorView, LoadingView} from '../kit/StateView.jsx';
import {overflowSubmission, submissionsFor} from '../data/form.js';
import {useForm, useVersion} from '../state/form.jsx';

const ACTIVITY_TABS = ['All activities', 'Tier Activities', 'Environmental impact', 'Referral Activities', 'Google Reviews', 'Review Activities', 'Submitted receipts', 'Submit Form Activities', 'Launch tier'];
const STATUS = {pending: {label: 'Pending', tone: 'attention'}, approved: {label: 'Approved', tone: 'success'}, disapproved: {label: 'Disapproved', tone: 'critical'}};

function seed(state, version) {
  if (state === 'empty') return [];
  const rows = submissionsFor(version);
  if (state === 'overflow' || state === 'worst') return [overflowSubmission(version), ...rows, ...rows.map((s) => ({...s, id: `${s.id}b`}))];
  return rows;
}

// "Label: value", one per line. Files are not here: the file sits in the Image column.
const answerLines = (row) => row.answers.map(([label, value]) => `${label}: ${value}`);

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const box = Object.assign(document.createElement('textarea'), {value: text});
    document.body.appendChild(box);
    box.select();
    const done = document.execCommand('copy');
    box.remove();
    return done;
  }
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
      {/* The popover renders in a portal, but React still bubbles its clicks to the table row and would select the row. */}
      <div onClick={(e) => e.stopPropagation()}>
        <ActionList items={[{content: 'Approved', onAction: () => {onChange('approved'); setOpen(false);}}, {content: 'Disapproved', onAction: () => {onChange('disapproved'); setOpen(false);}}]} />
      </div>
    </Popover>
  );
}

/** The Content cell: first answer, every answer on hover, copy button, and a note when Joy could not add the tags. */
function AnswersCell({row, onCopy}) {
  const lines = answerLines(row);
  return (
    <div className="sa-cell">
      <Tooltip width="wide" activatorWrapper="div" content={<div className="sa-tip">{lines.map((line) => <div key={line}>{line}</div>)}</div>}>
        <div className="sa-content">
          <span className="sa-clip sa-clip--wide">{lines[0]}</span>
          <Button icon={ClipboardIcon} variant="plain" accessibilityLabel={`Copy all answers of ${row.name}`} onClick={(e) => {e?.stopPropagation?.(); onCopy(row);}} />
        </div>
      </Tooltip>
      {row.tagIssue === 'failed' ? <Text as="p" variant="bodySm" tone="critical">Tags not added</Text> : null}
      {row.tagIssue === 'cap' ? <Text as="p" variant="bodySm" tone="caution">Some tags not added: this customer already has 250 tags in Shopify</Text> : null}
    </div>
  );
}

export function Activities() {
  const {state} = useScenario();
  const [version] = useVersion();
  const {savedFormTags} = useForm();
  const {notify, notYet} = useShell();
  const [rows, setRows] = useState(() => seed(state, version));
  const [filter, setFilter] = useState(0);
  const [query, setQuery] = useState('');
  const [file, setFile] = useState(null); // the submission whose file is open
  React.useEffect(() => setRows(seed(state, version)), [state, version]);

  const filters = ['all', 'pending', 'approved', 'disapproved'];
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => filter === 0 || r.status === filters[filter]).filter((r) => !q || r.email.toLowerCase().includes(q));
  }, [rows, filter, query]);
  const {selectedResources, allResourcesSelected, handleSelectionChange, clearSelection} = useIndexResourceState(shown);

  // Tags Joy adds on approval: the form's saved tags, plus the tag of the option the customer picked (phase 2).
  const tagsFor = (r) => [...savedFormTags, ...(r.optionTags || [])];
  const setStatus = (ids, status) => {
    const list = Array.isArray(ids) ? ids : [ids];
    setRows((all) => all.map((r) => (list.includes(r.id) ? {...r, status} : r)));
    const one = rows.find((x) => x.id === list[0]);
    if (list.length > 1) notify(`${list.length} submissions marked ${STATUS[status].label.toLowerCase()}`);
    else if (status === 'approved' && version !== 'today') notify(`Approved. ${one.name} gets 200 points${tagsFor(one).length ? ` and tags: ${tagsFor(one).join(', ')}` : ''}`);
    else notify(`Marked ${STATUS[status].label.toLowerCase()}`);
  };
  const copyAnswers = async (row) => {
    if (await copyText(answerLines(row).join('\n'))) notify('Copied');
    else notify('Couldn’t copy. Select the text and copy it.', {error: true});
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
        selectedItemsCount={allResourcesSelected ? 'All' : selectedResources.length}
        onSelectionChange={handleSelectionChange}
        promotedBulkActions={[
          {content: 'Approved', onAction: () => {setStatus(selectedResources, 'approved'); clearSelection();}},
          {content: 'Disapproved', onAction: () => {setStatus(selectedResources, 'disapproved'); clearSelection();}},
        ]}
        headings={[{title: 'Submitted at'}, {title: 'Program'}, {title: 'Customer name'}, {title: 'Email'}, {title: 'Content'}, {title: 'Image'}, {title: 'Status', alignment: 'center'}]}
      >
        {shown.map((r, i) => (
          <IndexTable.Row id={r.id} key={r.id} position={i} selected={selectedResources.includes(r.id)}>
            <IndexTable.Cell><Text as="span" variant="bodySm">{r.at}</Text></IndexTable.Cell>
            <IndexTable.Cell><span className="sa-clip">{r.program}</span></IndexTable.Cell>
            <IndexTable.Cell><span className="sa-clip">{r.name}</span></IndexTable.Cell>
            <IndexTable.Cell><span className="sa-clip">{r.email}</span></IndexTable.Cell>
            <IndexTable.Cell>
              {r.answers ? <AnswersCell row={r} onCopy={copyAnswers} /> : <span className="sa-clip sa-clip--wide">{r.content}</span>}
            </IndexTable.Cell>
            <IndexTable.Cell>
              {version === 'today' ? (
                <Proof name={r.file} />
              ) : (
                <button type="button" className="sa-proofbtn" aria-label={`Open ${r.file}`} onClick={(e) => {e.stopPropagation(); setFile(r);}}><Proof name={r.file} /></button>
              )}
            </IndexTable.Cell>
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
          </div>
          <Tabs tabs={['All', 'Pending', 'Approved', 'Disapproved'].map((t) => ({id: t, content: t}))} selected={filter} onSelect={setFilter} />
          <div className="sa-search"><TextField label="Search submissions" labelHidden prefix={<Icon source={SearchIcon} />} placeholder="Search by email" value={query} onChange={setQuery} clearButton onClearButtonClick={() => setQuery('')} autoComplete="off" /></div>
          {table}
        </Card>
      </BlockStack>

      <Modal open={Boolean(file)} onClose={() => setFile(null)} title={file ? file.file : ''} secondaryActions={[{content: 'Close', onAction: () => setFile(null)}]}>
        <Modal.Section><div className="sa-filebig">{file ? (
          <div className="sa-order" aria-label="Uploaded order screenshot">
            <strong>Order details</strong>
            {file.answers ? (
              <>
                <span>{`Order # ${file.answers.find(([l]) => l === 'Order ID')?.[1]}`}</span>
                <span>Sold by Pomelo Park</span>
                <span>Placed on Oct 28, 2026</span>
                <span className="sa-order__total">{`Item(s) subtotal: ${file.answers.find(([l]) => l === 'Order total before tax')?.[1]}`}</span>
              </>
            ) : <span>{file.content}</span>}
          </div>
        ) : null}</div></Modal.Section>
      </Modal>
    </Page>
  );
}
