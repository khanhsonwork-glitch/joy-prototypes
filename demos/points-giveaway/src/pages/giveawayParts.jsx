// Pieces of the giveaway page shared by the edit view (draft, scheduled) and the given view (active, expired, completed).
import React, {useMemo, useState} from 'react';
import {
  Badge,
  BlockStack,
  Box,
  Button,
  Divider,
  IndexTable,
  InlineStack,
  Modal,
  Pagination,
  Text,
  TextField,
} from '@shopify/polaris';
import {CHEAPEST, num} from '../data/index.js';
import {SEGMENTS, SEGMENT_IDEAS, segmentById} from '../data/segments.js';
import {emailFacts, reminderAt, reminderChoices, useBy} from '../data/giveaways.js';
import {dateTimeTz, weekday} from '../data/time.js';
import {useShell} from '../shell/ShellContext.jsx';
import {EMAIL_DEFS, EmailDocument, defaultDoc, emailWithDefaults, makeCtx, resolveText, sampleValues} from '../shared/notifications';

/** "BFCM 2026 shoppers", "BFCM 2026 shoppers + 1 more", "All members" — plus the points range when it's on. */
export function whoLine(g, deleted = []) {
  let who = 'All members';
  if (g.audience === 'segments') {
    // a segment deleted in Shopify still shows, marked, until the merchant removes it
    const names = g.segmentIds.map((id) => (segmentById(id) ? `${segmentById(id).name}${deleted.includes(id) ? ' (deleted)' : ''}` : null)).filter(Boolean);
    who = names.length === 0 ? 'No segment picked' : names.length === 1 ? names[0] : `${names[0]} + ${names.length - 1} more`;
  }
  return g.range?.on ? `${who} · ${rangeLabel(g.range)}` : who;
}
export const rangeLabel = (r) => (r.max === '' || r.max === null || r.max === undefined ? `${num(Number(r.min) || 0)}+ points` : `${num(Number(r.min) || 0)}–${num(Number(r.max))} points`);

/** "Fri, Dec 4", "Never expire", or "—" while the number of days isn't valid. */
export const useByLabel = (g) => {
  const d = useBy(g);
  if (d) return weekday(d);
  return g.expiry?.mode === 'after' ? '—' : 'Never expire';
};

/** A copyable line of text with a Copy button. */
function CopyLine({text}) {
  const [copied, setCopied] = useState(false);
  return (
    <InlineStack gap="200" blockAlign="center" wrap={false}>
      <code className="pg-code">{text}</code>
      <Button
        size="slim"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(text);
          } catch {
            /* clipboard blocked: the query stays selectable */
          }
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </InlineStack>
  );
}

/** Segment ideas: three plain Shopify segments to create in Shopify, with their query. */
export function SegmentIdeasModal({open, onClose, picked = [], deleted = [], onUse}) {
  const {notify} = useShell();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Segment ideas"
      primaryAction={{content: 'Open segments in Shopify', onAction: () => notify('Opens Customers → Segments in your Shopify admin')}}
      secondaryActions={[{content: 'Close', onAction: onClose}]}
    >
      <Modal.Section>
        <BlockStack gap="400">
          <Text as="p" variant="bodyMd" tone="subdued">
            Create a segment in Shopify with one of these queries. It shows up here right after.
          </Text>
          {SEGMENT_IDEAS.map((idea, i) => {
            // the shop may already have this segment: then it's one click to use it
            const have = SEGMENTS.find((s) => s.query === idea.query && !deleted.includes(s.id));
            const added = have && picked.includes(have.id);
            return (
              <BlockStack key={idea.name} gap="200">
                {i ? <Divider /> : null}
                <InlineStack align="space-between" blockAlign="center">
                  <InlineStack gap="200" blockAlign="center">
                    <Text as="h3" variant="headingSm">
                      {idea.name}
                    </Text>
                    {have ? <Badge tone="success">In your segments</Badge> : null}
                  </InlineStack>
                  {have ? (
                    <Button size="slim" disabled={added} onClick={() => onUse(have.id)}>
                      {added ? 'Added' : 'Use'}
                    </Button>
                  ) : null}
                </InlineStack>
                {have ? <code className="pg-code">{idea.query}</code> : <CopyLine text={idea.query} />}
                {idea.needs ? (
                  <Text as="p" variant="bodySm" tone="subdued">
                    {idea.needs}
                  </Text>
                ) : null}
              </BlockStack>
            );
          })}
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

const PAGE = 50;

/**
 * Every member a giveaway reaches, with search and pages. Before it's given: points now and after. After: what each
 * member got and whether they used it. Export follows Joy's Customers export (the file is emailed).
 */
export function MembersModal({open, onClose, members, points, given, usedBy, balanceOf = (m) => m.balance, givenUpTo = Infinity}) {
  const {notify} = useShell();
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const q = query.trim().toLowerCase();
  const list = useMemo(() => (q ? members.filter((m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)) : members), [members, q]);
  const pages = Math.max(1, Math.ceil(list.length / PAGE));
  const shown = list.slice(page * PAGE, page * PAGE + PAGE);
  const headings = given
    ? [{title: 'Customer'}, {title: 'Points given', alignment: 'end'}, {title: 'Used', alignment: 'end'}, {title: 'Balance now', alignment: 'end'}]
    : [{title: 'Customer'}, {title: 'Points now', alignment: 'end'}, {title: 'After giveaway', alignment: 'end'}];
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="large"
      title={`${num(members.length)} member${members.length === 1 ? '' : 's'}`}
      primaryAction={{content: 'Export', onAction: () => notify('Export file will be delivered to your email')}}
      secondaryActions={[{content: 'Close', onAction: onClose}]}
    >
      <Modal.Section>
        <TextField
          label="Search members"
          labelHidden
          placeholder="Search by name or email"
          value={query}
          onChange={(v) => {
            setQuery(v);
            setPage(0);
          }}
          autoComplete="off"
          clearButton
          onClearButtonClick={() => setQuery('')}
        />
      </Modal.Section>
      <IndexTable resourceName={{singular: 'member', plural: 'members'}} itemCount={shown.length} selectable={false} headings={headings} emptyState={<Box padding="400"><Text as="p" tone="subdued">No members found</Text></Box>}>
        {shown.map((m, i) => (
          <IndexTable.Row id={m.id} key={m.id} position={i}>
            <IndexTable.Cell>
              <BlockStack gap="050">
                <Text as="span" variant="bodyMd" fontWeight="semibold">
                  {m.name}
                </Text>
                <Text as="span" variant="bodySm" tone="subdued">
                  {m.email}
                </Text>
              </BlockStack>
            </IndexTable.Cell>
            {given ? (
              <>
                <IndexTable.Cell>
                  <Text as="span" alignment="end" numeric>
                    {members.indexOf(m) < givenUpTo ? num(points) : 'Pending'}
                  </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Text as="span" alignment="end">
                    {members.indexOf(m) < givenUpTo ? (usedBy(m) ? 'Yes' : 'No') : '—'}
                  </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Text as="span" alignment="end" numeric>
                    {num(balanceOf(m))}
                  </Text>
                </IndexTable.Cell>
              </>
            ) : (
              <>
                <IndexTable.Cell>
                  <Text as="span" alignment="end" numeric>
                    {num(balanceOf(m))}
                  </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Text as="span" alignment="end" numeric>
                    {num(balanceOf(m) + points)}
                  </Text>
                </IndexTable.Cell>
              </>
            )}
          </IndexTable.Row>
        ))}
      </IndexTable>
      {pages > 1 ? (
        <Box padding="300">
          <InlineStack align="center">
            <Pagination
              hasPrevious={page > 0}
              hasNext={page < pages - 1}
              onPrevious={() => setPage(page - 1)}
              onNext={() => setPage(page + 1)}
              label={`${num(page * PAGE + 1)}–${num(Math.min(list.length, page * PAGE + PAGE))} of ${num(list.length)}`}
            />
          </InlineStack>
        </Box>
      ) : null}
    </Modal>
  );
}

/** Read-only look at a sent email (the given view): the same renderer as the editor, the sample member. */
export function EmailPreviewModal({open, onClose, g, emailId}) {
  const stored = emailWithDefaults(g.emails?.[emailId]);
  const doc = stored.doc || defaultDoc(emailId);
  // a sent email keeps what it said: the name and use-by date at send time
  const facts = emailFacts(g, emailId);
  const values = sampleValues({emailId, giveaway: {name: facts.name, points: g.points, expiresOn: facts.useBy, given: true}, customer: null});
  const ctx = makeCtx({values, resolve: (t) => resolveText(t, values, emailId), emailId, customCss: stored.cssOn ? stored.css : ''});
  const def = EMAIL_DEFS.find((e) => e.id === emailId);
  return (
    <Modal open={open} onClose={onClose} size="large" title={def.name} secondaryActions={[{content: 'Close', onAction: onClose}]}>
      <Modal.Section>
        <BlockStack gap="200">
          <Text as="p" variant="bodyMd">
            <b>{ctx.resolve(doc.subject)}</b>
          </Text>
          <div className="pg-email-frame" onClickCapture={(e) => e.target.closest('a') && e.preventDefault()}>
            <EmailDocument doc={doc} ctx={ctx} />
          </div>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

/**
 * The two notification rows, Joy's Notifications list shape: name + On/Off badge, subject in grey, one button.
 * `mode` 'edit' (draft/scheduled), 'given' (after the points went out).
 */
export function EmailRows({g, onEdit, onPreview, stats, reminderLocked, reminderControl, reminderNote, giftNote, reminderLimit = null}) {
  // the reminder exists only when the points expire
  const defs = EMAIL_DEFS.filter((d) => d.id !== 'reminder' || g.expiry?.mode === 'after');
  return (
    <div className="pg-rows">
      {defs.map((def) => {
        const stored = emailWithDefaults(g.emails?.[def.id]);
        const needsExpiry = def.id === 'reminder' && !useBy(g);
        const tooSoon = def.id === 'reminder' && !needsExpiry && reminderChoices(g).length === 0;
        const blocked = needsExpiry || tooSoon;
        const on = stored.enabled && !blocked;
        const s = stats?.[def.id];
        const sending = def.id === 'gift' && g.status === 'giving';
        const wasSent = !!(s && s.sent) && !sending;
        // on, but a trial shop has no emails left for it
        const note = def.id === 'reminder' ? reminderNote : giftNote;
        const noRoom = on && !!note;
        const sendLine = (() => {
          if (needsExpiry) return 'Only when points expire';
          if (tooSoon) return 'Points expire too soon for a reminder';
          if (!on) return null;
          if (note) return note;
          if (def.id === 'gift') return g.givenAt ? `${sending ? 'Sending since' : 'Sent'} ${dateTimeTz(g.givenAt)}` : 'Sends when the points are added';
          const t = g.reminderSentAt || reminderAt(g);
          const limit = reminderLimit !== null && !g.reminderSentAt ? ` · trial: up to ${num(reminderLimit)} members` : '';
          return t ? `${g.reminderSentAt ? 'Sent' : 'Sends'} ${weekday(t)} to members with points left${limit}` : null;
        })();
        let action = null;
        if (blocked) action = null;
        // Joy's Notifications list: a plain link-style action on each row
        else if (def.id === 'gift' && g.givenAt) action = <Button variant="plain" onClick={() => onPreview('gift')}>Preview</Button>;
        else if (def.id === 'reminder' && reminderLocked) action = <Button variant="plain" onClick={() => onPreview('reminder')}>Preview</Button>;
        else action = <Button variant="plain" onClick={() => onEdit(def.id)}>Edit</Button>;
        return (
          <div key={def.id} className="pg-row" data-email={def.id}>
            <BlockStack gap="100">
              <InlineStack gap="200" blockAlign="center">
                <Text as="h3" variant="headingSm">
                  {def.name}
                </Text>
                <Badge tone={sending ? 'info' : noRoom ? 'attention' : on ? 'success' : undefined}>{sending ? 'Sending' : wasSent ? 'Sent' : noRoom ? (def.id === 'gift' && g.givenAt ? 'Not sent' : "Won't send") : on ? 'On' : 'Off'}</Badge>
              </InlineStack>
              {sendLine ? (
                <Text as="p" variant="bodySm" tone="subdued">
                  {sendLine}
                </Text>
              ) : null}
              {s && s.sent ? (
                <Text as="p" variant="bodySm">
                  {`${num(s.sent)} sent · ${Math.round((s.opened / s.sent) * 100)}% opened · ${Math.round((s.clicked / s.sent) * 100)}% clicked`}
                </Text>
              ) : null}
              {def.id === 'reminder' && on && reminderControl ? reminderControl : null}
            </BlockStack>
            {action}
          </div>
        );
      })}
    </div>
  );
}

/** The fact line about rewards: a balance fact, not a promise anyone will redeem. */
export function affordLine(list, points, balanceOf = (m) => m.balance) {
  const n = list.filter((m) => balanceOf(m) + points >= CHEAPEST.points).length;
  return `${num(n)} will have ${num(CHEAPEST.points)}+ points (enough for ${CHEAPEST.name})`;
}
