// The Settings tab (spec 5): a pinned Performance strip, then accordions (multi-open, default open = Subject): Trigger, Subject,
// Sender, Custom CSS. A section that holds an invalid field is force-opened and shows an alert icon when closed.
import React, {useEffect, useMemo, useState} from 'react';
import {BlockStack, Button, Card, Checkbox, Collapsible, Divider, Icon, InlineStack, Link, OptionList, Popover, Text, TextField} from '@shopify/polaris';
import {AlertCircleIcon, ChevronDownIcon, ChevronUpIcon} from '@shopify/polaris-icons';
import {useShell} from '../../shell/ShellContext.jsx';
import {FROM_ADDRESS, emailDef} from './emailState.js';
import {useEmailHost} from './host.js';
import {ColorWell} from './controls.jsx';
import {VarSuffix} from './VariablePicker.jsx';
import {lintTags} from './variables.js';

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const replyError = (replyTo) => (replyTo && !EMAIL_RE.test(replyTo.trim()) ? 'Invalid email' : '');

function Accordion({id, title, summary, open, onToggle, invalid, children}) {
  return (
    <div className="ee-acc" data-section={id}>
      <button type="button" className="ee-acc__head" aria-expanded={open} onClick={onToggle}>
        <span className="ee-acc__title">
          <span className="ee-acc__titleline">
            <Text as="span" variant="headingSm">
              {title}
            </Text>
            {invalid && !open ? <Icon source={AlertCircleIcon} tone="critical" /> : null}
          </span>
          {!open && summary ? (
            <Text as="span" variant="bodySm" tone="subdued" truncate>
              {summary}
            </Text>
          ) : null}
        </span>
        <Icon source={open ? ChevronUpIcon : ChevronDownIcon} tone="subdued" />
      </button>
      <Collapsible open={open} id={`ee-acc-${id}`} transition={{duration: '150ms', timingFunction: 'ease-in-out'}}>
        <div className="ee-acc__body">{children}</div>
      </Collapsible>
    </div>
  );
}

function Performance() {
  const {stats} = useEmailHost();
  const pct = (n) => (stats && stats.sent ? ` · ${Math.round((n / stats.sent) * 100)}%` : '');
  const tiles = stats ? [['Sent', stats.sent, ''], ['Opened', stats.opened, pct(stats.opened)], ['Clicked', stats.clicked, pct(stats.clicked)]] : [];
  return (
    <div className="ee-perf" data-testid="ee-performance">
      <Text as="h3" variant="headingSm">
        Performance
      </Text>
      {stats && stats.sent ? (
        <div className="ee-perf__grid">
          {tiles.map(([name, n, rate]) => (
            <div key={name} className="ee-perf__tile">
              <Text as="span" variant="headingMd">
                {n.toLocaleString('en-US')}
              </Text>
              <Text as="span" variant="bodySm" tone="subdued">
                {name}
                {rate}
              </Text>
            </div>
          ))}
        </div>
      ) : (
        <Text as="p" variant="bodySm" tone="subdued">
          No sends yet
        </Text>
      )}
    </div>
  );
}

export default function SettingsTab({ed, emailId, enabled, values, resolve, focusReq}) {
  const {notify, notYet} = useShell();
  const def = emailDef(emailId);
  const {doc, meta} = ed;
  const [open, setOpen] = useState({subject: true});
  const toggle = (k) => setOpen((o) => ({...o, [k]: !o[k]}));
  const err = replyError(meta.replyTo);
  const lint = useMemo(() => lintTags([doc.subject, doc.preheader], emailId), [doc.subject, doc.preheader, emailId]);

  useEffect(() => {
    if (err) setOpen((o) => (o.sender ? o : {...o, sender: true}));
  }, [err]);

  // a click on the inbox header (canvas) jumps here: open the owning section and focus the field
  useEffect(() => {
    if (!focusReq || !focusReq.field) return undefined;
    const section = focusReq.field === 'reply' ? 'sender' : 'subject';
    setOpen((o) => ({...o, [section]: true}));
    const id = {subject: 'ee-subject', preheader: 'ee-preheader', reply: 'ee-reply'}[focusReq.field];
    const timer = window.setTimeout(() => {
      const el = document.getElementById(id);
      if (!el) return;
      el.focus();
      const wrap = el.closest('.Polaris-Labelled--hidden, .Polaris-TextField')?.parentElement || el;
      wrap.classList.remove('fs-flash');
      window.requestAnimationFrame(() => wrap.classList.add('fs-flash'));
    }, 220);
    return () => window.clearTimeout(timer);
  }, [focusReq]);

  const setDoc = (patch, key) => ed.edit((d) => ({...d, ...patch}), key);

  return (
    <div className="ee-settings">
      <Card>
        <BlockStack gap="400">
          <Performance />
          <Divider />
          <Accordion id="trigger" title="Trigger" summary={def.trigger} open={!!open.trigger} onToggle={() => toggle('trigger')}>
            <Text as="p" variant="bodyMd" tone="subdued">
              {def.trigger}
            </Text>
          </Accordion>
          <Divider />
          <Accordion id="subject" title="Subject" summary={resolve(doc.subject) || 'No subject yet'} open={!!open.subject} onToggle={() => toggle('subject')}>
            <BlockStack gap="300">
              <div data-ee-subject-field>
                <TextField
                  id="ee-subject"
                  label="Subject line"
                  value={doc.subject}
                  onChange={(v) => setDoc({subject: v}, 'subject')}
                  autoComplete="off"
                  suffix={<VarSuffix emailId={emailId} values={values} inputId="ee-subject" value={doc.subject} onChange={(v) => setDoc({subject: v}, 'subject')} />}
                />
              </div>
              <TextField
                id="ee-preheader"
                label="Preheader"
                value={doc.preheader}
                onChange={(v) => setDoc({preheader: v}, 'preheader')}
                autoComplete="off"
                helpText="Preview text shown after the subject in the inbox."
                suffix={<VarSuffix emailId={emailId} values={values} inputId="ee-preheader" value={doc.preheader} onChange={(v) => setDoc({preheader: v}, 'preheader')} />}
              />
              {lint.map((f) => (
                <Text key={`${f.kind}-${f.tag}`} as="p" variant="bodySm" tone="caution">
                  {f.message}
                </Text>
              ))}
              <Link removeUnderline onClick={() => notYet()}>
                <Text as="span" variant="bodySm" tone="subdued">
                  Set your shop address &amp; social links in Email settings
                </Text>
              </Link>
              <ColorWell label="Page background" value={doc.pageBg || ''} ghost="#ffffff" onChange={(v) => setDoc({pageBg: v}, 'pageBg')} help="A hex color filling the page behind your content; empty = the email client default." />
            </BlockStack>
          </Accordion>
          <Divider />
          <Accordion id="sender" title="Sender" summary={FROM_ADDRESS} open={!!open.sender} onToggle={() => toggle('sender')} invalid={!!err}>
            <BlockStack gap="300">
              <TextField id="ee-sender-name" label="Sender name" value={meta.senderName} onChange={(v) => ed.setMeta({senderName: v})} autoComplete="off" />
              <InlineStack align="space-between" blockAlign="center" wrap={false} gap="200">
                <BlockStack gap="050">
                  <Text as="span" variant="bodyMd">
                    From
                  </Text>
                  <Text as="span" variant="bodySm" tone="subdued" truncate>
                    {FROM_ADDRESS}
                  </Text>
                </BlockStack>
                <Link onClick={() => notYet()}>Change</Link>
              </InlineStack>
              <div data-ee-reply-field>
                <TextField id="ee-reply" label="Reply-to" type="email" value={meta.replyTo} onChange={(v) => ed.setMeta({replyTo: v})} placeholder={FROM_ADDRESS} autoComplete="off" error={err || undefined} />
              </div>
            </BlockStack>
          </Accordion>
          <Divider />
          <Accordion id="css" title="Custom CSS" summary={meta.cssOn ? 'On' : 'Off'} open={!!open.css} onToggle={() => toggle('css')}>
            <BlockStack gap="300">
              <Checkbox label="Use custom CSS" checked={!!meta.cssOn} onChange={(v) => ed.setMeta({cssOn: v})} helpText="Add your own CSS rules to override this email's styling." />
              <Collapsible open={!!meta.cssOn} id="ee-css-body">
                <TextField label="Custom CSS" labelHidden value={meta.css} onChange={(v) => ed.setMeta({css: v})} multiline={6} autoComplete="off" monospaced placeholder="h1 { color: #b5303f; }" />
              </Collapsible>
            </BlockStack>
          </Accordion>
        </BlockStack>
      </Card>
    </div>
  );
}
