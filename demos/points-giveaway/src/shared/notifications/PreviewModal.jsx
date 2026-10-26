// "Preview & test" (spec 7) and the read-only HTML modal. The prototype does not send: the test button only says
// "Test email sent to <address>".
import React, {useEffect, useMemo, useState} from 'react';
import {Avatar, Badge, Banner, BlockStack, Box, Button, ButtonGroup, Card, Icon, InlineStack, Modal, Tabs, Text, TextField, Tooltip} from '@shopify/polaris';
import {ChevronDownIcon, ChevronUpIcon, DesktopIcon, MobileIcon} from '@shopify/polaris-icons';
import {FROM_ADDRESS} from './emailState.js';
import {EmailDocument, docSizeBytes, docToHtml, makeCtx} from './render.jsx';
import usePreviewBase from './usePreviewBase.js';
import {EMAIL_RE} from './SettingsTab.jsx';
import {appliesTo, docStrings, initials, labelFor, tagsIn, variableByTag} from './variables.js';
import {useEmailHost} from './host.js';
import {STORE} from '../../data/index.js';

function PvHeader({base, doc, senderName, compact}) {
  return (
    <div className={`ee-pvhead${compact ? ' is-compact' : ''}`}>
      <span className="ee-inbox__avatar">{initials(senderName)}</span>
      <div className="ee-pvhead__lines">
        <div>
          <b>{senderName}</b>
          {compact ? null : <span className="ee-pvhead__addr">{`\u00a0\u00a0<${FROM_ADDRESS}>`}</span>}
        </div>
        <div className="ee-pvhead__subject">
          <b>{base.resolve(doc.subject) || '(No subject)'}</b>
          {!compact && doc.preheader ? <span>{`\u00a0\u00a0-\u00a0\u00a0${base.resolve(doc.preheader)}`}</span> : null}
        </div>
      </div>
    </div>
  );
}

function Frame({device, doc, base, customCss, senderName}) {
  // links in a preview don't leave the admin
  const openPortal = (e) => {
    if (e.target.closest('a')) e.preventDefault();
  };
  const ctx = useMemo(() => makeCtx({...base, device, customCss}), [base, device, customCss]);
  if (device === 'mobile') {
    return (
      <div className="ee-phone" data-testid="ee-phone" onClickCapture={openPortal}>
        <div className="ee-phone__screen">
          <div className="ee-phone__status">
            <span>9:41</span>
            <i className="ee-phone__island" />
            <span>●●●</span>
          </div>
          <PvHeader base={base} doc={doc} senderName={senderName} compact />
          <div className="ee-phone__mail" style={{background: doc.pageBg}}>
            <EmailDocument doc={doc} ctx={ctx} />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="ee-pv" data-testid="ee-pv-desktop" onClickCapture={openPortal}>
      <PvHeader base={base} doc={doc} senderName={senderName} />
      <EmailDocument doc={doc} ctx={ctx} />
    </div>
  );
}

function PreviewTab({doc, base, customCss, senderName}) {
  const [device, setDevice] = useState(() => window.innerWidth < 600 ? 'mobile' : 'desktop');
  const ctx = useMemo(() => makeCtx({...base, device: 'desktop', customCss}), [base, customCss]);
  const bytes = useMemo(() => docSizeBytes(doc, ctx), [doc, ctx]);
  const kb = Math.max(1, Math.round(bytes / 1024));
  const tone = bytes <= 90000 ? 'success' : bytes <= 102000 ? 'warning' : 'critical';
  return (
    <BlockStack gap="300">
      <InlineStack align="center" blockAlign="center" gap="300">
        <ButtonGroup variant="segmented">
          <Button icon={DesktopIcon} pressed={device === 'desktop'} onClick={() => setDevice('desktop')}>
            Desktop
          </Button>
          <Button icon={MobileIcon} pressed={device === 'mobile'} onClick={() => setDevice('mobile')}>
            Mobile
          </Button>
        </ButtonGroup>
        <Tooltip content="Estimated size of the email HTML. Gmail clips messages over 102 KB — stay under 90 KB to be safe.">
          <Badge tone={tone}>{`≈${kb} KB`}</Badge>
        </Tooltip>
      </InlineStack>
      {tone !== 'success' ? (
        <Banner tone={tone === 'warning' ? 'warning' : 'critical'}>
          <p>{tone === 'warning' ? `≈${kb} KB — Gmail may clip content over 90 KB.` : `≈${kb} KB — Gmail will almost certainly clip content over 102 KB — consider shortening the email.`}</p>
        </Banner>
      ) : null}
      <div className="ee-pvwrap">
        <Frame device={device} doc={doc} base={base} customCss={customCss} senderName={senderName} />
      </div>
    </BlockStack>
  );
}

function InboxTab({doc, emailId, seed, onSend, senderName}) {
  const [recipient, setRecipient] = useState(seed ? {type: 'customer', customer: seed} : {type: 'email', value: STORE.email});
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [showData, setShowData] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const customer = recipient && recipient.type === 'customer' ? recipient.customer : null;
  const base = usePreviewBase(emailId, customer);
  const {members} = useEmailHost();
  const q = query.trim().toLowerCase();
  const matches = members.filter((m) => !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)).slice(0, 6);
  const typedEmail = EMAIL_RE.test(query.trim()) && !members.some((m) => m.email.toLowerCase() === q);
  const emailMode = recipient && recipient.type === 'email';
  const address = emailMode ? recipient.value : customer ? customer.email : '';

  const send = () => {
    if (!EMAIL_RE.test(address.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    onSend(address.trim());
  };

  const used = useMemo(() => {
    const tags = new Set();
    docStrings(doc).forEach((s) => tagsIn(s).forEach((t) => tags.add(t)));
    return [...tags].map(variableByTag).filter((v) => v && appliesTo(v, emailId));
  }, [doc, emailId]);

  return (
    <div className="ee-inbox-test">
      <Card>
        <BlockStack gap="300">
          {emailMode ? (
            <>
              <TextField
                label="Send a test to"
                type="email"
                value={recipient.value}
                onChange={(v) => {
                  setRecipient({type: 'email', value: v});
                  setError('');
                }}
                placeholder={STORE.email}
                autoComplete="off"
                error={error || undefined}
                helpText="Uses the preview customer details."
              />
              <InlineStack>
                <Button variant="plain" onClick={() => {setRecipient(null); setQuery('');}}>
                  Pick a customer
                </Button>
              </InlineStack>
            </>
          ) : (
            <>
              <TextField
                label="Send a test to"
                value={customer ? customer.name : query}
                onChange={(v) => {
                  setRecipient(null);
                  setQuery(v);
                  setError('');
                }}
                placeholder="Search customers by name or email"
                autoComplete="off"
                error={error || undefined}
                clearButton={!!customer || !!query}
                onClearButtonClick={() => {
                  setRecipient(null);
                  setQuery('');
                }}
              />
              {!customer ? (
                <div className="ee-previewas__list" role="listbox" aria-label="Customers">
                  {matches.length === 0 && !typedEmail ? <div className="ee-var__empty">No customers found</div> : null}
                  {matches.map((m) => (
                    <button key={m.id} type="button" role="option" className="ee-previewas__row" onClick={() => {setRecipient({type: 'customer', customer: m}); setError('');}}>
                      <Avatar size="xs" initials={initials(m.name)} name={m.name} />
                      <span className="ee-previewas__who">
                        <span>{m.name}</span>
                        <span>{m.email}</span>
                      </span>
                    </button>
                  ))}
                  {typedEmail ? (
                    <button type="button" role="option" className="ee-previewas__row" onClick={() => {setRecipient({type: 'email', value: query.trim()}); setError('');}}>
                      <span className="ee-previewas__who">
                        <span>{`Send to «${query.trim()}»`}</span>
                        <span>Uses the preview customer details.</span>
                      </span>
                    </button>
                  ) : null}
                </div>
              ) : null}
            </>
          )}
          <InlineStack>
            <Button variant="primary" onClick={send}>
              Send test email
            </Button>
          </InlineStack>
        </BlockStack>
      </Card>
      <Card>
        <BlockStack gap="300">
          {customer ? (
            <>
              <InlineStack gap="300" blockAlign="center" wrap={false}>
                <Avatar size="md" initials={initials(customer.name)} name={customer.name} />
                <BlockStack gap="050">
                  <Text as="span" variant="bodyMd" fontWeight="semibold">
                    {customer.name}
                  </Text>
                  <Text as="span" variant="bodySm" tone="subdued">
                    {customer.email}
                  </Text>
                </BlockStack>
                <Badge tone="info">{`${customer.balance.toLocaleString('en-US')} points`}</Badge>
              </InlineStack>
              <InlineStack>
                <Button variant="tertiary" onClick={() => setShowDetails(!showDetails)}>
                  {showDetails ? 'Hide details' : 'Show details'}
                </Button>
              </InlineStack>
              {showDetails ? (
                <BlockStack gap="100">
                  {[['Points now', customer.balance.toLocaleString('en-US')], ['VIP tier', customer.tier || 'Bronze'], ['Send language', 'English']].map(([k, v]) => (
                    <InlineStack key={k} align="space-between">
                      <Text as="span" variant="bodySm" tone="subdued">{k}</Text>
                      <Text as="span" variant="bodySm">{v}</Text>
                    </InlineStack>
                  ))}
                </BlockStack>
              ) : null}
            </>
          ) : null}
          <button type="button" className="ee-disclosure" aria-expanded={showData} onClick={() => setShowData(!showData)}>
            <Text as="span" variant="bodyMd" fontWeight="medium">Data in this test</Text>
            <Icon source={showData ? ChevronUpIcon : ChevronDownIcon} tone="subdued" />
          </button>
          {showData ? (
            <BlockStack gap="300">
              <Text as="p" variant="bodySm" tone="subdued">These are the values your test email will use.</Text>
              <BlockStack gap="100">
                <Text as="h4" variant="headingXs">This email</Text>
                <Text as="p" variant="bodySm" tone="subdued">Preview values. Customer values are computed when the email sends.</Text>
                <InlineStack align="space-between" gap="200" wrap={false}><Text as="span" variant="bodySm" tone="subdued">Subject line</Text><Text as="span" variant="bodySm">{base.resolve(doc.subject)}</Text></InlineStack>
                <InlineStack align="space-between" gap="200" wrap={false}><Text as="span" variant="bodySm" tone="subdued">Preheader</Text><Text as="span" variant="bodySm">{base.resolve(doc.preheader)}</Text></InlineStack>
                {used.filter((v) => v.section === 'This email').map((v) => (
                  <InlineStack key={v.tag} align="space-between" gap="200" wrap={false}><Text as="span" variant="bodySm" tone="subdued">{labelFor(v, emailId)}</Text><Text as="span" variant="bodySm">{base.values[v.tag]}</Text></InlineStack>
                ))}
              </BlockStack>
              <BlockStack gap="100">
                <Text as="h4" variant="headingXs">Recipient</Text>
                <Text as="p" variant="bodySm" tone="subdued">{customer ? `Using ${customer.name}'s real data` : 'Pick a customer above to use their real data.'}</Text>
              </BlockStack>
              <BlockStack gap="100">
                <Text as="h4" variant="headingXs">Store</Text>
                <Text as="p" variant="bodySm" tone="subdued">From your store settings.</Text>
                <InlineStack align="space-between" gap="200" wrap={false}><Text as="span" variant="bodySm" tone="subdued">From</Text><Text as="span" variant="bodySm">{`${senderName} <${FROM_ADDRESS}>`}</Text></InlineStack>
              </BlockStack>
              <Text as="p" variant="bodySm" tone="subdued">Points and balances are read again when the email actually sends.</Text>
            </BlockStack>
          ) : null}
        </BlockStack>
      </Card>
    </div>
  );
}

export default function PreviewTestModal({open, onClose, doc, base, customer, emailId, customCss, senderName, onSend}) {
  const [tab, setTab] = useState(0);
  useEffect(() => {
    if (open) setTab(0);
  }, [open]);
  if (!open) return null;
  return (
    <Modal
      open
      onClose={onClose}
      size="large"
      title="Preview & test"
      primaryAction={tab === 0 ? {content: 'Done', onAction: onClose} : undefined}
      secondaryActions={tab === 1 ? [{content: 'Done', onAction: onClose}] : undefined}
    >
      <Modal.Section>
        <BlockStack gap="400">
          <Tabs
            tabs={[
              {id: 'preview', content: 'Preview'},
              {id: 'inbox', content: 'Inbox testing'},
            ]}
            selected={tab}
            onSelect={setTab}
          />
          {tab === 0 ? <PreviewTab doc={doc} base={base} customCss={customCss} senderName={senderName} /> : null}
          {tab === 1 ? <InboxTab doc={doc} emailId={emailId} seed={customer} senderName={senderName} onSend={onSend} /> : null}
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

export function HtmlModal({open, onClose, doc, base, customCss}) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (open) setCopied(false);
  }, [open]);
  const html = useMemo(() => (open ? docToHtml(doc, makeCtx({...base, device: 'desktop', customCss})) : ''), [open, doc, base, customCss]);
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="large"
      title="Email HTML"
      primaryAction={{
        content: copied ? 'Copied' : 'Copy',
        onAction: async () => {
          try {
            await navigator.clipboard.writeText(html);
          } catch (e) {
            /* clipboard blocked: the text is selectable below */
          }
          setCopied(true);
        },
      }}
      secondaryActions={[{content: 'Done', onAction: onClose}]}
    >
      <Modal.Section>
        <BlockStack gap="300">
          <Banner tone="info">
            <p>Read-only — the rendered HTML for this email. Copy it to use elsewhere.</p>
          </Banner>
          <Box>
            <textarea className="ee-code" readOnly value={html} aria-label="Email HTML" spellCheck={false} />
          </Box>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

