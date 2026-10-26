// #/points-giveaway/:id once the points are given (giving, active, expired, completed). What happened, who got what, the
// two emails, and the few things that can still change: the name (fixes the history line), the reminder until it's sent,
// and the use-by date (later only, while points can still be used).
import React, {useEffect, useMemo, useState} from 'react';
import {Banner, BlockStack, Box, Button, Card, IndexTable, InlineGrid, InlineStack, Layout, Modal, Page, ProgressBar, Select, Text, TextField} from '@shopify/polaris';
import {money, num, pctLabel} from '../data/index.js';
import {duplicateOf, recipientsOf, reminderChoices, reminderDays, reminderSent, resultsOf, useBy} from '../data/giveaways.js';
import {bfcmLeft, hash01} from '../data/members.js';
import {NOW, addDays, at, dateTimeTz, isoDay, weekday} from '../data/time.js';
import {useNavigate, useRoute} from '../shell/router.jsx';
import {useShell} from '../shell/ShellContext.jsx';
import {useStore} from '../state/store.jsx';
import {Fact, Metric, StatusBadge} from '../components/bits.jsx';
import {EmailEditor} from '../shared/notifications';
import {PEOPLE} from '../data/people.js';
import {EmailPreviewModal, EmailRows, MembersModal, useByLabel, whoLine} from './giveawayParts.jsx';

export default function GiveawayDetail({g}) {
  const navigate = useNavigate();
  const route = useRoute();
  const {notify} = useShell();
  const {upsert, patch, ledger, trial, emailsLeft} = useStore();
  const [modal, setModal] = useState(null); // 'members' | 'rename' | 'extend' | 'preview-gift' | 'preview-reminder'
  // What can still change once points are given: nothing while giving; the reminder only until it's sent.
  const reminderEditable = g.status === 'active' && !reminderSent(g) && !!g.emails?.reminder;
  const [emailOpen, setEmailOpen] = useState(() => (route.query.get('email') === 'reminder' && reminderEditable ? 'reminder' : null));
  const [name, setName] = useState(g.name);
  const end = useBy(g);
  const [newEnd, setNewEnd] = useState(() => (end ? isoDay(addDays(end, 2)) : ''));

  const recipients = useMemo(() => recipientsOf(g), [g]);
  const usage = useMemo(() => ledger.usage(g.id), [ledger, g.id]);
  const r = useMemo(() => resultsOf(g, usage), [g, usage]);
  const giving = g.status === 'giving';
  // the store's "← Admin" comes back here
  useEffect(() => {
    try {
      sessionStorage.setItem('pg:lastGiveaway', g.id);
    } catch {
      // no storage: "← Admin" falls back to the Dec 1 giveaway
    }
  }, [g.id]);
  const sent = reminderSent(g);
  // after the points are given, only lead times that are still ahead can be picked
  const reminderOk = reminderChoices(g).filter((n) => addDays(end, -n) > at(NOW.getUTCFullYear(), NOW.getUTCMonth() + 1, NOW.getUTCDate()) || (addDays(end, -n).getTime() === at(NOW.getUTCFullYear(), NOW.getUTCMonth() + 1, NOW.getUTCDate()).getTime() && NOW.getUTCHours() < 9));
  const usedBy = (m) => usage.used.has(m.id) || (g.seed?.usedBy ? g.seed.usedBy(m) : g.seed ? hash01(m.id, `${g.id}-used`) < g.seed.usedRate : false);
  // While giving, emails go out as the points are added: count only the members reached so far.
  const stats = {
    gift: g.emails?.gift?.enabled ? {sent: r.emailed, opened: r.opened, clicked: r.clicked} : null,
    reminder: sent ? {sent: r.reminded, opened: r.reminderOpened, clicked: r.reminderClicked} : null,
  };

  const secondary = [
    g.status === 'giving' ? null : {content: 'Rename', onAction: () => setModal('rename')},
    {
      content: 'Duplicate',
      onAction: () => {
        const id = `g-u${Date.now().toString(36)}`;
        upsert(duplicateOf(g, id, NOW));
        notify('Giveaway duplicated');
        navigate(`/points-giveaway/${id}`);
      },
    },
  ].filter(Boolean);
  if (g.status === 'active' && end) secondary.push({content: 'Extend use-by date', onAction: () => setModal('extend')});

  // points of this giveaway the member still holds: replayed for the customers followed in the store
  const leftFor = (m) => {
    const followed = Object.values(PEOPLE).find((x) => x.memberId === m.id);
    if (followed) return ledger.person(followed.key).state.left[g.id] || 0;
    if (g.id === 'g-bfcm') return bfcmLeft(m);
    return usedBy(m) ? 0 : g.points;
  };

  if (emailOpen && reminderEditable) {
    return (
      <EmailEditor
        emailId={emailOpen}
        email={g.emails?.[emailOpen]}
        host={{
          giveaway: {name: g.name, points: g.points, expiresOn: end, given: true},
          // the reminder only goes to members with points of this giveaway left, so only they can be previewed
          members: recipients.filter((m) => leftFor(m) > 0).slice(0, 200).map((m) => ({...m, balance: ledger.balance(m)})),
          stats: stats[emailOpen],
          leftFor,
        }}
        onBack={() => setEmailOpen(null)}
        onSave={(p) => patch(g.id, {emails: {...g.emails, [emailOpen]: {...g.emails[emailOpen], ...p}}})}
        onToggle={(enabled) => {
          const changes = {emails: {...g.emails, [emailOpen]: {...g.emails[emailOpen], enabled}}};
          // trial: turning the reminder on sets its emails aside from what the shop has left; off gives them back
          if (emailOpen === 'reminder' && trial && g.emailCap != null) {
            if (enabled && !g.reminderCap) {
              const cap = Math.min(emailsLeft, recipients.filter((m) => !m.noEmail).length);
              Object.assign(changes, {reminderCap: cap, trialSends: (g.trialSends || 0) + cap});
              if (cap === 0) {
                patch(g.id, changes);
                notify("No trial emails left: this reminder won't send", {error: true});
                return false;
              }
            } else if (!enabled && g.reminderCap) {
              Object.assign(changes, {reminderCap: 0, trialSends: (g.trialSends || 0) - g.reminderCap});
            }
          }
          patch(g.id, changes);
          return true;
        }}
      />
    );
  }

  const extendTo = (() => {
    const [y, m, d] = newEnd.split('-').map(Number);
    return y ? at(y, m, d) : null;
  })();
  const extendError = extendTo && end && extendTo <= end ? 'Pick a day after the current use-by date' : null;

  return (
    <Page
      title={g.name}
      titleMetadata={<StatusBadge status={g.status} />}
      backAction={{content: 'Points Giveaway', url: '/points-giveaway'}}
      secondaryActions={secondary}
    >
      <BlockStack gap="400">
        {giving ? (
          <Banner tone="info" title={`Giving points: ${num(g.progress || 0)} of ${num(recipients.length)} members`}>
            <BlockStack gap="200">
              <ProgressBar progress={Math.round(((g.progress || 0) / Math.max(1, recipients.length)) * 100)} size="small" />
              <p>You can leave this page. Emails go out as the points are added.</p>
            </BlockStack>
          </Banner>
        ) : null}

        <Card>
          <InlineGrid columns={{xs: 2, md: 4}} gap="400">
            <Metric label="Members who got points" value={num(giving ? g.progress || 0 : r.members)} />
            <Metric label="Used their points" value={pctLabel(r.used, r.members)} sub={`${num(r.used)} member${r.used === 1 ? '' : 's'}`} />
            <Metric
              label="Orders that used these points"
              value={num(r.orders)}
              sub={usage.shared ? `${num(usage.shared)} also counted in another giveaway` : null}
            />
            <Metric label="Sales from those orders" value={money(r.sales)} />
          </InlineGrid>
        </Card>

        <Layout>
          <Layout.Section>
            <BlockStack gap="400">
              <Card padding="0">
                <Box padding="400" paddingBlockEnd="200">
                  <Text as="h2" variant="headingMd">
                    Notifications
                  </Text>
                </Box>
                <EmailRows
                  g={g}
                  stats={stats}
                  reminderLocked={!reminderEditable}
                  reminderNote={g.reminderCap === 0 && !sent ? 'No trial emails left for reminders' : null}
                  giftNote={g.emailCap === 0 ? 'No trial emails left' : null}
                  reminderLimit={g.reminderCap > 0 && g.reminderCap < recipients.filter((m) => !m.noEmail).length ? g.reminderCap : null}
                  onEdit={setEmailOpen}
                  onPreview={(id) => setModal(`preview-${id}`)}
                  reminderControl={
                    reminderEditable && reminderOk.length ? (
                      <Box maxWidth="260px" paddingBlockStart="100">
                        <Select
                          label="Send"
                          labelInline
                          options={reminderOk.map((n) => ({label: `${n} day${n === 1 ? '' : 's'} before points expire`, value: String(n)}))}
                          value={String(reminderDays(g))}
                          onChange={(v) => {
                            patch(g.id, {emails: {...g.emails, reminder: {...g.emails.reminder, daysBefore: Number(v)}}});
                            notify('Reminder updated');
                          }}
                        />
                      </Box>
                    ) : null
                  }
                />
              </Card>

              <Card padding="0">
                <Box padding="400" paddingBlockEnd="0">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="h2" variant="headingMd">
                      Recipients
                    </Text>
                    <InlineStack gap="200">
                      <Button onClick={() => notify('Export file will be delivered to your email')}>Export</Button>
                      <Button onClick={() => setModal('members')}>View all</Button>
                    </InlineStack>
                  </InlineStack>
                </Box>
                <Box paddingBlockStart="300">
                  <IndexTable
                    resourceName={{singular: 'member', plural: 'members'}}
                    itemCount={Math.min(5, recipients.length)}
                    selectable={false}
                    headings={[{title: 'Customer'}, {title: 'Points given', alignment: 'end'}, {title: 'Used', alignment: 'end'}, {title: 'Balance now', alignment: 'end'}]}
                  >
                    {recipients.slice(0, 5).map((m, i) => {
                      const done = !giving || i < (g.progress || 0);
                      return (
                        <IndexTable.Row id={m.id} key={m.id} position={i}>
                          <IndexTable.Cell>{m.name}</IndexTable.Cell>
                          <IndexTable.Cell>
                            <Text as="span" alignment="end" numeric>
                              {done ? num(g.points) : 'Pending'}
                            </Text>
                          </IndexTable.Cell>
                          <IndexTable.Cell>
                            <Text as="span" alignment="end">
                              {done ? (usedBy(m) ? 'Yes' : 'No') : '—'}
                            </Text>
                          </IndexTable.Cell>
                          <IndexTable.Cell>
                            <Text as="span" alignment="end" numeric>
                              {num(ledger.balance(m))}
                            </Text>
                          </IndexTable.Cell>
                        </IndexTable.Row>
                      );
                    })}
                  </IndexTable>
                </Box>
              </Card>
            </BlockStack>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingMd">
                  Details
                </Text>
                <Fact label="Who">{whoLine(g)}</Fact>
                <Fact label="Points each">{num(g.points)}</Fact>
                <Fact label="Total points">{num(recipients.length * g.points)}</Fact>
                <Fact label="Given">{dateTimeTz(g.givenAt)}</Fact>
                <Fact label="Use by">{end ? `${useByLabel(g)}${g.status === 'expired' ? ' (expired)' : ''}` : 'Never expire'}</Fact>
                {!giving && g.emailCap != null && g.emails?.gift?.enabled && r.emailed < recipients.filter((m) => !m.noEmail).length ? (
                  <Text as="p" variant="bodySm" tone="subdued">
                    {`Trial: ${num(recipients.length - r.emailed)} of ${num(recipients.length)} members got points without the email.`}
                  </Text>
                ) : null}
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>

      <MembersModal open={modal === 'members'} onClose={() => setModal(null)} members={recipients} points={g.points} given usedBy={usedBy} balanceOf={ledger.balance} givenUpTo={giving ? g.progress || 0 : Infinity} />
      <EmailPreviewModal open={modal === 'preview-gift'} onClose={() => setModal(null)} g={g} emailId="gift" />
      <EmailPreviewModal open={modal === 'preview-reminder'} onClose={() => setModal(null)} g={g} emailId="reminder" />
      <Modal
        open={modal === 'rename'}
        onClose={() => setModal(null)}
        title="Rename giveaway"
        primaryAction={{
          content: 'Save',
          disabled: !name.trim(),
          onAction: () => {
            // emails already sent keep the name they went out with
            patch(g.id, {name: name.trim(), sentName: g.sentName || g.name, ...(sent ? {reminderName: g.reminderName || g.name} : {})});
            setModal(null);
            notify('Giveaway renamed');
          },
        }}
        secondaryActions={[{content: 'Cancel', onAction: () => setModal(null)}]}
      >
        <Modal.Section>
          <TextField label="Giveaway name" value={name} onChange={setName} autoComplete="off" maxLength={60} showCharacterCount helpText="Members see the new name in their points history." />
        </Modal.Section>
      </Modal>
      <Modal
        open={modal === 'extend'}
        onClose={() => setModal(null)}
        title="Extend use-by date"
        primaryAction={{
          content: 'Extend',
          disabled: !extendTo || !!extendError,
          onAction: () => {
            const days = Math.round((extendTo - at(g.givenAt.getUTCFullYear(), g.givenAt.getUTCMonth() + 1, g.givenAt.getUTCDate())) / 86400000);
            // the gift email already went out with the old date: keep that for it
            patch(g.id, {expiry: {...g.expiry, days}, sentUseBy: g.sentUseBy || end, ...(sent ? {reminderUseBy: g.reminderUseBy || end} : {})});
            setModal(null);
            notify(`Use-by date moved to ${weekday(extendTo)}`);
          },
        }}
        secondaryActions={[{content: 'Cancel', onAction: () => setModal(null)}]}
      >
        <Modal.Section>
          <BlockStack gap="300">
            <Box maxWidth="220px">
              <TextField label="New use-by date" type="date" value={newEnd} onChange={setNewEnd} autoComplete="off" error={extendError} />
            </Box>
            <Text as="p" variant="bodyMd" tone="subdued">
              {`Now ${end ? weekday(end) : ''}. ${sent ? 'The reminder was already sent.' : 'The reminder moves with it.'}`}
            </Text>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Page>
  );
}

