// #/points-giveaway/new and #/points-giveaway/:id while it's a Draft or Scheduled: one page, Joy's sibling-page shape
// (Member exclusive deal): name, Member eligibility, Reward settings, Points expiry, Active dates, Notifications, and a
// summary on the side. Everything can change until the points are given.
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Autocomplete,
  Badge,
  Banner,
  BlockStack,
  Box,
  Button,
  Card,
  Checkbox,
  ChoiceList,
  ContextualSaveBar,
  InlineStack,
  Layout,
  Modal,
  Page,
  Select,
  Text,
  TextField,
} from '@shopify/polaris';
import {XIcon} from '@shopify/polaris-icons';
import {num} from '../data/index.js';
import {SEGMENTS, matchMembers} from '../data/segments.js';
import {duplicateOf, reminderAt, reminderChoices, reminderDays, useBy} from '../data/giveaways.js';
import {NOW, at, dateTimeTz, isoDay, weekday} from '../data/time.js';
import {useNavigate, useRoute} from '../shell/router.jsx';
import {useShell} from '../shell/ShellContext.jsx';
import {useStore} from '../state/store.jsx';
import {StatusBadge, Fact} from '../components/bits.jsx';
import {EmailEditor} from '../shared/notifications';
import {EmailRows, MembersModal, SegmentIdeasModal, affordLine, useByLabel, whoLine} from './giveawayParts.jsx';

const clone = (v) => JSON.parse(JSON.stringify(v), (k, val) => (k === 'at' && typeof val === 'string' ? new Date(val) : val));

function blank() {
  const tomorrow = at(NOW.getUTCFullYear(), NOW.getUTCMonth() + 1, NOW.getUTCDate() + 1, 9, 0);
  return {
    id: null,
    name: '',
    status: 'draft',
    audience: 'segments',
    segmentIds: [],
    range: {on: false, min: '', max: ''},
    points: '100',
    expiry: {mode: 'after', days: '3'},
    start: {mode: 'now', at: tomorrow},
    emails: {gift: {enabled: true}, reminder: {enabled: true, daysBefore: 1}},
  };
}

/** The fields the merchant edits (status, results and seed data stay out of the form). */
const formOf = (g) => ({
  id: g.id,
  name: g.name,
  status: g.status,
  audience: g.audience,
  segmentIds: [...g.segmentIds],
  range: {...g.range},
  points: String(g.points),
  expiry: {mode: g.expiry.mode, days: String(g.expiry.days)},
  start: {mode: g.start.mode, at: g.start.at || at(NOW.getUTCFullYear(), NOW.getUTCMonth() + 1, NOW.getUTCDate() + 1, 9, 0)},
  emails: clone(g.emails),
});

const asNumber = (v) => (String(v).trim() === '' ? NaN : Number(v));

/** Reward value: a whole number of points, more than 0. */
const pointsProblem = (v) => {
  const n = asNumber(v);
  if (!(n > 0)) return 'Number needs to be greater than 0';
  return Number.isInteger(n) ? undefined : 'Use a whole number';
};

function validate(f, {members, now = NOW}) {
  const e = {};
  if (!f.name.trim()) e.name = 'Giveaway name is required';
  if (f.audience === 'segments' && f.segmentIds.length === 0) e.segments = 'Pick at least one segment';
  if (f.range.on) {
    const min = asNumber(f.range.min);
    const max = f.range.max === '' ? Infinity : asNumber(f.range.max);
    if (!Number.isInteger(min) || min < 0) e.range = 'Enter the lowest balance';
    else if (f.range.max !== '' && (!Number.isInteger(max) || max < min)) e.range = 'The second number must be bigger than the first';
  }
  if (pointsProblem(f.points)) e.points = pointsProblem(f.points);
  if (f.expiry.mode === 'after') {
    const d = asNumber(f.expiry.days);
    if (!Number.isInteger(d) || d <= 0) e.days = 'Number needs to be greater than 0';
    else if (d > 365) e.days = 'Use 365 days or fewer';
  }
  // "now" is the shop's clock, which moves on with what's been done today
  if (f.start.mode === 'schedule' && !(f.start.at > now)) e.start = 'Pick a time after now';
  if (!e.segments && !e.range && members === 0) e.members = 'No members match';
  return e;
}

/** Joy's segment picker (useFilterSegment): search the shop's Shopify segments, picked ones as cards with an X. */
function SegmentPicker({value, onChange, error, deleted}) {
  const [search, setSearch] = useState('');
  const options = useMemo(
    () => SEGMENTS.filter((s) => !deleted.includes(s.id) && s.name.toLowerCase().includes(search.toLowerCase())).map((s) => ({value: s.id, label: s.name})),
    [search, deleted]
  );
  return (
    <BlockStack gap="200">
      <Autocomplete
        allowMultiple
        options={options}
        selected={value}
        onSelect={(v) => {
          onChange(v);
          setSearch('');
        }}
        listTitle="Segments"
        textField={<Autocomplete.TextField onChange={setSearch} value={search} placeholder="Search segments" autoComplete="off" label="Search segments" labelHidden error={error} />}
      />
      {value.map((id) => {
        const s = SEGMENTS.find((x) => x.id === id);
        if (!s) return null;
        return (
          <Card key={id}>
            <InlineStack align="space-between" blockAlign="center" wrap={false}>
              <InlineStack gap="200" blockAlign="center">
                <Text as="p" variant="bodyMd" tone={deleted.includes(id) ? 'subdued' : undefined}>
                  {s.name}
                </Text>
                {deleted.includes(id) ? <Badge tone="critical">Deleted in Shopify</Badge> : null}
              </InlineStack>
              <Button variant="plain" tone="success" icon={XIcon} accessibilityLabel={`Remove ${s.name}`} onClick={() => onChange(value.filter((x) => x !== id))} />
            </InlineStack>
          </Card>
        );
      })}
    </BlockStack>
  );
}

function hhmm(d) {
  return `${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
}
function joinDateTime(day, time) {
  const [y, m, d] = day.split('-').map(Number);
  const [h, mi] = time.split(':').map(Number);
  if (!y || !m || !d || Number.isNaN(h) || Number.isNaN(mi)) return null;
  return at(y, m, d, h, mi);
}

export default function GiveawayEditor({existing}) {
  const navigate = useNavigate();
  const route = useRoute();
  const {notify} = useShell();
  const {upsert, patch, remove, trial, deleted, ledger, emailsLeft, clock} = useStore();
  const initial = useMemo(() => (existing ? formOf(existing) : blank()), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [base, setBase] = useState(initial);
  const [f, setF] = useState(initial);
  const [errors, setErrors] = useState({});
  const [modal, setModal] = useState(null); // 'members' | 'ideas' | 'review' | 'delete' | 'leave'
  const [emailOpen, setEmailOpen] = useState(() => {
    const q = route.query.get('email');
    return q === 'gift' || q === 'reminder' ? q : null;
  });
  const leaveTo = useRef(null);
  const dirty = JSON.stringify(f) !== JSON.stringify(base);
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  const set = (patch) => {
    setF((prev) => ({...prev, ...patch}));
    setErrors((prev) => {
      const next = {...prev};
      Object.keys(patch).forEach((k) => delete next[{segmentIds: 'segments', expiry: 'days', start: 'start', points: 'points', name: 'name', range: 'range'}[k] || k]);
      delete next.members;
      return next;
    });
  };

  const g = useMemo(
    () => ({...f, points: Number(f.points) || 0, expiry: {...f.expiry, days: Number(f.expiry.days) || 0}, givenAt: null}),
    [f]
  );
  const members = useMemo(() => matchMembers(g, deleted, ledger.balance), [g, deleted, ledger]);
  // something is picked but nobody matches: said on the spot, not only when giving
  const noneToday = members.length === 0 && (f.audience === 'all' || f.segmentIds.length > 0);
  // a reversed range is flagged as it's typed, not only on save
  // the reward value is checked as it's typed; the Summary only counts a valid amount
  const pointsEach = pointsProblem(f.points) ? 0 : Number(f.points);
  const pointsError = errors.points || (String(f.points).trim() !== '' ? pointsProblem(f.points) : undefined);
  const rangeError = errors.range || (f.range.on && f.range.max !== '' && Number(f.range.max) < Number(f.range.min) ? 'The second number must be bigger than the first' : null);
  const emailable = members.filter((m) => !m.noEmail).length;
  const giftOn = !!f.emails.gift?.enabled;
  // Trial: one allowance for the shop. Gift emails go first; reminders get what's left, and that much is set aside for
  // them when the points are given, so two giveaways can't both count on the same emails.
  const giftSends = !giftOn ? 0 : trial ? Math.min(emailable, emailsLeft) : emailable;
  const trialShort = trial && giftOn && emailable > emailsLeft ? emailable - emailsLeft : 0;
  const reminderRoom = trial ? Math.max(0, emailsLeft - giftSends) : Infinity;
  const end = useBy(g);
  const reminderOk = reminderChoices(g);
  const reminderTime = reminderAt(g);

  // A dirty page asks before leaving (Joy's leave-page modal); the save bar handles Save / Discard.
  useEffect(() => {
    const before = (event) => {
      if (!dirtyRef.current || emailOpen) return;
      event.preventDefault();
      leaveTo.current = event.detail.proceed;
      setModal('leave');
    };
    window.addEventListener('prototype:before-navigate', before);
    return () => window.removeEventListener('prototype:before-navigate', before);
  }, [emailOpen]);

  const record = (form, status, extra = {}) => ({
    ...(existing || {}),
    ...form,
    id: form.id || `g-u${Date.now().toString(36)}`,
    status,
    points: Number(form.points),
    expiry: {mode: form.expiry.mode, days: Number(form.expiry.days) || 0},
    start: {mode: form.start.mode, at: form.start.mode === 'schedule' ? form.start.at : null},
    createdAt: existing?.createdAt || NOW,
    updatedAt: new Date(),
    segmentDeleted: false,
    ...extra,
  });

  const persist = (form, status, extra) => {
    const rec = record(form, status, extra);
    upsert(rec);
    dirtyRef.current = false;
    const next = {...form, id: rec.id, status};
    setBase(next);
    setF(next);
    return rec;
  };

  const save = () => {
    // A draft only needs a name; a scheduled giveaway must be complete.
    const errs = validate(f, {members: members.length, now: clock});
    if (f.status === 'scheduled' && f.start.mode === 'now') errs.start = 'A scheduled giveaway needs a start time. To give points now, use Give points.';
    // a draft may be unfinished, but what's filled in must make sense
    const blocking = f.status === 'scheduled' ? errs : Object.fromEntries(Object.entries(errs).filter(([k]) => ['name', 'points', 'days', 'range'].includes(k)));
    if (Object.keys(blocking).length) {
      setErrors(blocking);
      notify('Fix the highlighted fields', {error: true});
      return;
    }
    const rec = persist(f, f.status);
    notify(f.status === 'scheduled' ? 'Giveaway saved' : 'Draft saved');
    if (!existing) navigate(`/points-giveaway/${rec.id}`, {replace: true});
  };

  const openReview = () => {
    const errs = validate(f, {members: members.length, now: clock});
    if (Object.keys(errs).length) {
      setErrors(errs);
      notify('Fix the highlighted fields', {error: true});
      return;
    }
    setModal('review');
  };

  const confirm = () => {
    setModal(null);
    if (f.start.mode === 'schedule') {
      const rec = persist(f, 'scheduled');
      notify('Giveaway scheduled');
      if (!existing) navigate(`/points-giveaway/${rec.id}`, {replace: true});
      return;
    }
    const reminderOn = !!(f.emails.reminder?.enabled && end && reminderOk.length);
    const reminderCap = trial ? (reminderOn ? Math.min(reminderRoom, emailable) : 0) : null;
    const rec = record(f, 'giving', {
      // stamped on the shop's clock, after anything already done today (store orders included)
      givenAt: new Date(clock.getTime() + 60000),
      sentName: f.name,
      recipientIds: members.map((m) => m.id),
      progress: 0,
      emailCap: trial ? giftSends : null,
      reminderCap,
      trialSends: trial ? giftSends + reminderCap : 0,
      start: {mode: 'now', at: null},
    });
    upsert(rec);
    dirtyRef.current = false;
    setBase(f);
    navigate(`/points-giveaway/${rec.id}`, {replace: !existing});
  };

  // The email editor saves into this giveaway. A giveaway that was never saved is saved as a draft first.
  // Saved here = saved: an existing giveaway stores only the email (its other unsaved changes stay in the save bar).
  const saveEmail = (emailId, changes) => {
    const emails = {...f.emails, [emailId]: {...f.emails[emailId], ...changes}};
    if (existing) {
      patch(existing.id, {emails, updatedAt: new Date()});
      setBase((b) => ({...b, emails}));
      setF((prev) => ({...prev, emails}));
      return;
    }
    // never saved yet: the email waits in the form; the page's save bar saves it with the rest
    setF((prev) => ({...prev, emails}));
  };

  const title = existing ? f.name || existing.name : 'Create giveaway';
  const scheduled = f.status === 'scheduled';
  // Scheduled + still scheduled: the save bar saves; switching to "Give points now" turns the button into Give points.
  const primary = scheduled && f.start.mode === 'schedule' ? undefined : {content: f.start.mode === 'schedule' ? 'Schedule' : 'Give points', onAction: openReview};
  const secondary = [];
  if (scheduled) {
    secondary.push({content: 'Unschedule', onAction: () => {
      patch(existing.id, {status: 'draft', updatedAt: new Date()});
      setBase((prev) => ({...prev, status: 'draft'}));
      setF((prev) => ({...prev, status: 'draft'}));
      notify('Moved back to drafts');
    }});
  }
  if (existing) secondary.push({content: 'Duplicate', disabled: dirty, helpText: dirty ? 'Save or discard your changes first' : undefined, onAction: () => {
    const rec = duplicateOf(existing, `g-u${Date.now().toString(36)}`, NOW);
    upsert(rec);
    navigate(`/points-giveaway/${rec.id}`);
    notify('Giveaway duplicated');
  }});
  if (existing && !scheduled) secondary.push({content: 'Delete', destructive: true, onAction: () => setModal('delete')});

  const hostFor = () => ({
    giveaway: {name: f.name || 'Untitled giveaway', points: Number(f.points) || 0, expiresOn: end, given: false},
    members: members.slice(0, 200).map((m) => ({...m, balance: ledger.balance(m)})),
    stats: null,
    leftFor: null,
  });

  if (emailOpen) {
    return (
      <EmailEditor
        emailId={emailOpen}
        email={f.emails[emailOpen]}
        host={hostFor()}
        onBack={() => setEmailOpen(null)}
        onSave={(patch) => saveEmail(emailOpen, patch)}
        onToggle={(enabled) => saveEmail(emailOpen, {enabled})}
      />
    );
  }

  const reminderPlanned = f.emails.reminder?.enabled && end && reminderOk.length;
  const reminderSends = reminderPlanned && reminderRoom > 0;
  // on a trial the gift gets no emails only when the shop has none left; an "on" gift is listed even before members are picked
  const giftSendsAny = giftOn && (!trial || emailsLeft > 0);
  const emailsFact =
    [giftSendsAny ? 'Points received' : null, reminderSends ? `Reminder on ${weekday(reminderTime)}` : null].filter(Boolean).join(' · ') ||
    (trial && (giftOn || reminderPlanned) ? 'None (no trial emails left)' : '');
  const trialNote = !trial
    ? null
    : trialShort
      ? `Trial: ${num(emailsLeft)} emails left, so ${num(members.length - giftSends)} of ${num(members.length)} members won't get the email.${reminderPlanned ? ' None left for reminders.' : ''}`
      : reminderPlanned && reminderRoom < emailable
        ? reminderRoom === 0
          ? "Trial: no emails left. Members won't get a reminder."
          : `Trial: ${num(emailsLeft)} emails left. Reminders go to up to ${num(reminderRoom)} members.`
        : null;
  const startDay = f.start.at ? isoDay(f.start.at) : '';
  const startTime = f.start.at ? hhmm(f.start.at) : '09:00';

  return (
    <Page
      title={title}
      titleMetadata={existing ? <StatusBadge status={f.status} /> : null}
      backAction={{content: 'Points Giveaway', url: '/points-giveaway'}}
      primaryAction={primary}
      secondaryActions={secondary}
    >
      {dirty ? <ContextualSaveBar message="Unsaved changes" saveAction={{onAction: save}} discardAction={{onAction: () => {
        setF(base);
        setErrors({});
      }}} /> : null}
      <BlockStack gap="400">
        {existing?.segmentDeleted ? (
          <Banner tone="warning" title="A segment was deleted in Shopify">
            <p>{`${existing.segmentIds.filter((id) => deleted.includes(id)).map((id) => `“${SEGMENTS.find((x) => x.id === id)?.name}”`).join(', ')} no longer exists, so this giveaway moved back to drafts.`}</p>
          </Banner>
        ) : null}
        <Layout>
          <Layout.Section>
            <BlockStack gap="400">
              <Card>
                <TextField
                  label="Giveaway name"
                  value={f.name}
                  onChange={(name) => set({name})}
                  autoComplete="off"
                  maxLength={60}
                  showCharacterCount
                  placeholder="BFCM thank-you"
                  helpText="Members see this in their points history."
                  error={errors.name}
                />
              </Card>

              <Card>
                <BlockStack gap="300">
                  <ChoiceList
                    title="Member eligibility"
                    choices={[
                      {label: 'All members', value: 'all'},
                      {
                        label: 'Specific customer segments',
                        value: 'segments',
                        helpText: 'Members in any of these Shopify segments',
                        renderChildren: (selected) =>
                          selected ? (
                            <Box paddingBlockStart="200">
                              <BlockStack gap="200">
                                <SegmentPicker value={f.segmentIds} onChange={(segmentIds) => set({segmentIds})} error={errors.segments} deleted={deleted} />
                                <InlineStack>
                                  <Button variant="plain" onClick={() => setModal('ideas')}>
                                    Segment ideas
                                  </Button>
                                </InlineStack>
                              </BlockStack>
                            </Box>
                          ) : null,
                      },
                    ]}
                    selected={[f.audience]}
                    onChange={([audience]) => set({audience})}
                  />
                  <Checkbox
                    label="Only members with a points balance between"
                    checked={f.range.on}
                    onChange={(on) => set({range: {...f.range, on, min: f.range.min || '250', max: f.range.max === undefined ? '' : f.range.max}})}
                  />
                  {f.range.on ? (
                    <Box paddingInlineStart="600">
                      <BlockStack gap="100">
                        <InlineStack gap="200" blockAlign="center" wrap={false}>
                          <Box width="140px">
                            <TextField label="Lowest balance" labelHidden type="number" min={0} value={f.range.min} onChange={(min) => set({range: {...f.range, min}})} suffix="points" autoComplete="off" />
                          </Box>
                          <Text as="span" variant="bodyMd">
                            and
                          </Text>
                          <Box width="140px">
                            <TextField label="Highest balance" labelHidden type="number" min={0} value={f.range.max} onChange={(max) => set({range: {...f.range, max}})} suffix="points" placeholder="Any" autoComplete="off" />
                          </Box>
                        </InlineStack>
                        {rangeError ? (
                          <Text as="p" variant="bodySm" tone="critical">
                            {rangeError}
                          </Text>
                        ) : null}
                      </BlockStack>
                    </Box>
                  ) : null}
                  <Box borderBlockStartWidth="025" borderColor="border" paddingBlockStart="300">
                    <InlineStack align="space-between" blockAlign="center">
                      <BlockStack gap="050">
                        <Text as="p" variant="headingSm" tone={errors.members || noneToday ? 'critical' : undefined}>
                          {`${num(members.length)} member${members.length === 1 ? '' : 's'}`}
                        </Text>
                        <Text as="p" variant="bodySm" tone={errors.members || noneToday ? 'critical' : 'subdued'}>
                          {errors.members
                            ? 'No members match. Pick another segment or change the points range.'
                            : noneToday
                              ? `No members match today.${f.start.mode === 'schedule' ? ' Counted again when the points are given.' : ''}`
                              : f.start.mode === 'schedule'
                              ? 'Counted today. Counted again when the points are given.'
                              : 'Loyalty members only. Each member gets points once.'}
                        </Text>
                      </BlockStack>
                      <InlineStack gap="200">
                        <Button onClick={() => notify('Export file will be delivered to your email')} disabled={!members.length}>
                          Export
                        </Button>
                        <Button onClick={() => setModal('members')} disabled={!members.length}>
                          View all
                        </Button>
                      </InlineStack>
                    </InlineStack>
                  </Box>
                </BlockStack>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <Text as="h2" variant="headingMd">
                    Reward settings
                  </Text>
                  <Select label="Reward method" options={[{label: 'Points', value: 'points'}]} value="points" onChange={() => {}} />
                  <TextField
                    label="Reward value"
                    type="number"
                    min={1}
                    value={f.points}
                    onChange={(points) => set({points})}
                    suffix="points"
                    autoComplete="off"
                    error={pointsError}
                  />
                </BlockStack>
              </Card>

              <Card>
                <ChoiceList
                  title="Points expiry"
                  choices={[
                    {label: 'Never expire', value: 'never'},
                    {
                      label: 'Expire after a duration',
                      value: 'after',
                      renderChildren: (selected) =>
                        selected ? (
                          <Box paddingBlockStart="200" maxWidth="220px">
                            <TextField
                              label="Expire after"
                              labelHidden
                              type="number"
                              min={1}
                              value={f.expiry.days}
                              onChange={(days) => set({expiry: {...f.expiry, days}})}
                              suffix="days"
                              autoComplete="off"
                              error={errors.days}
                            />
                          </Box>
                        ) : null,
                    },
                  ]}
                  selected={[f.expiry.mode]}
                  onChange={([mode]) => set({expiry: {...f.expiry, mode}})}
                />
                {f.expiry.mode === 'after' && end && Number(f.expiry.days) > 0 && Number.isInteger(Number(f.expiry.days)) ? (
                  <Box paddingBlockStart="200">
                    <Text as="p" variant="bodySm" tone="subdued">
                      {`Use by ${weekday(end)}. Points not used by the end of that day expire.`}
                    </Text>
                  </Box>
                ) : null}
              </Card>

              <Card>
                <ChoiceList
                  title="Active dates"
                  choices={[
                    {label: 'Give points now', value: 'now'},
                    {
                      label: 'Schedule',
                      value: 'schedule',
                      renderChildren: (selected) =>
                        selected ? (
                          <Box paddingBlockStart="200">
                            <InlineStack gap="200" wrap={false}>
                              <Box width="170px">
                                <TextField label="Start date" type="date" value={startDay} onChange={(v) => set({start: {...f.start, at: joinDateTime(v, startTime) || f.start.at}})} autoComplete="off" />
                              </Box>
                              <Box width="130px">
                                <TextField label="Start time" type="time" value={startTime} onChange={(v) => set({start: {...f.start, at: joinDateTime(startDay, v) || f.start.at}})} autoComplete="off" />
                              </Box>
                            </InlineStack>
                            <Box paddingBlockStart="100">
                              <Text as="p" variant="bodySm" tone={errors.start ? 'critical' : 'subdued'}>
                                {errors.start || 'Eastern Time (store time zone)'}
                              </Text>
                            </Box>
                          </Box>
                        ) : null,
                    },
                  ]}
                  selected={[f.start.mode]}
                  onChange={([mode]) => set({start: {...f.start, mode}})}
                />
                {errors.start && f.start.mode === 'now' ? (
                  <Box paddingBlockStart="200">
                    <Text as="p" variant="bodySm" tone="critical">
                      {errors.start}
                    </Text>
                  </Box>
                ) : null}
              </Card>

              <Card padding="0">
                <Box padding="400" paddingBlockEnd="200">
                  <Text as="h2" variant="headingMd">
                    Notifications
                  </Text>
                </Box>
                <EmailRows
                  g={g}
                  onEdit={setEmailOpen}
                  onPreview={setEmailOpen}
                  reminderNote={trial && reminderRoom <= 0 ? 'No trial emails left for reminders' : null}
                  giftNote={trial && giftOn && emailsLeft === 0 ? 'No trial emails left' : null}
                  reminderControl={
                    reminderOk.length ? (
                      <Box maxWidth="260px" paddingBlockStart="100">
                        <Select
                          label="Send"
                          labelInline
                          options={reminderOk.map((n) => ({label: `${n} day${n === 1 ? '' : 's'} before points expire`, value: String(n)}))}
                          value={String(reminderDays(g))}
                          onChange={(v) => set({emails: {...f.emails, reminder: {...f.emails.reminder, daysBefore: Number(v)}}})}
                        />
                      </Box>
                    ) : null
                  }
                />
              </Card>
            </BlockStack>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Summary
                </Text>
                <Fact label="Members">{num(members.length)}</Fact>
                <Fact label="Who">{whoLine(g, deleted)}</Fact>
                <Fact label="Points each">{num(pointsEach)}</Fact>
                <Fact label="Total points">{num(members.length * pointsEach)}</Fact>
                <Fact label="Starts">{f.start.mode === 'schedule' && f.start.at ? dateTimeTz(f.start.at) : 'When you give them'}</Fact>
                <Fact label="Use by">{useByLabel(g)}</Fact>
                <Fact label="Emails">
                  {emailsFact || 'Off'}
                </Fact>
                {members.length ? (
                  <Text as="p" variant="bodySm" tone="subdued">
                    {affordLine(members, pointsEach, ledger.balance)}
                  </Text>
                ) : null}
                {trialNote ? (
                  <Banner tone="warning">
                    <p>{trialNote}</p>
                  </Banner>
                ) : null}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>

      <MembersModal open={modal === 'members'} onClose={() => setModal(null)} members={members} points={pointsEach} balanceOf={ledger.balance} />
      <SegmentIdeasModal
        open={modal === 'ideas'}
        onClose={() => setModal(null)}
        picked={f.audience === 'segments' ? f.segmentIds : []}
        deleted={deleted}
        onUse={(id) => {
          set({audience: 'segments', segmentIds: [...new Set([...(f.audience === 'segments' ? f.segmentIds : []), id])]});
          notify('Segment added');
        }}
      />
      <Modal
        open={modal === 'review'}
        onClose={() => setModal(null)}
        title={f.start.mode === 'schedule' ? 'Schedule this giveaway?' : `Give ${num(Number(f.points))} points to ${num(members.length)} member${members.length === 1 ? '' : 's'}?`}
        primaryAction={{content: f.start.mode === 'schedule' ? 'Schedule' : trialNote ? 'Give anyway' : 'Give points', onAction: confirm}}
        secondaryActions={[trialNote && f.start.mode !== 'schedule' ? {content: 'Choose plan', onAction: () => notify('Opens Joy plans')} : null, {content: 'Cancel', onAction: () => setModal(null)}].filter(Boolean)}
      >
        <Modal.Section>
          <BlockStack gap="300">
            <BlockStack gap="200">
              <Fact label="Who">{whoLine(g, deleted)}</Fact>
              <Fact label="Members">{num(members.length)}</Fact>
              <Fact label="Points">{`${num(Number(f.points))} each · ${num(members.length * Number(f.points))} total`}</Fact>
              <Fact label="Starts">{f.start.mode === 'schedule' ? dateTimeTz(f.start.at) : 'Now'}</Fact>
              <Fact label="Use by">{useByLabel(g)}</Fact>
              <Fact label="Emails">
                {emailsFact || 'Off'}
              </Fact>
            </BlockStack>
            {trialNote ? (
              <Banner tone="warning">
                <p>{trialNote}</p>
              </Banner>
            ) : null}
            <Text as="p" variant="bodyMd">
              {f.start.mode === 'schedule' ? 'Members are counted again when the points are given. You can change or unschedule it until then.' : "This can't be undone."}
            </Text>
          </BlockStack>
        </Modal.Section>
      </Modal>
      <Modal
        open={modal === 'delete'}
        onClose={() => setModal(null)}
        title={`Delete ${f.name || 'this giveaway'}?`}
        primaryAction={{
          content: 'Delete',
          destructive: true,
          onAction: () => {
            setModal(null);
            dirtyRef.current = false;
            setBase(f);
            remove(existing.id);
            notify('Giveaway deleted');
            navigate('/points-giveaway');
          },
        }}
        secondaryActions={[{content: 'Cancel', onAction: () => setModal(null)}]}
      >
        <Modal.Section>
          <Text as="p">This can't be undone.</Text>
        </Modal.Section>
      </Modal>
      <Modal
        open={modal === 'leave'}
        onClose={() => setModal(null)}
        title="Leave page with unsaved changes?"
        primaryAction={{
          content: 'Leave page',
          destructive: true,
          onAction: () => {
            setModal(null);
            dirtyRef.current = false;
            setBase(f);
            const go = leaveTo.current;
            leaveTo.current = null;
            if (go) go();
          },
        }}
        secondaryActions={[{content: 'Stay', onAction: () => setModal(null)}]}
      >
        <Modal.Section>
          <Text as="p">Leaving this page will delete all unsaved changes.</Text>
        </Modal.Section>
      </Modal>
    </Page>
  );
}

