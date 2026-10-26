// "Start from a template" (spec 4): a large modal with the voices on the left (live thumbnails) and a live preview of the highlighted
// one on the right. "Use this template" asks "Replace current content?" and then loads it into the editor (the save bar rises).
import React, {useEffect, useMemo, useState} from 'react';
import {Badge, Banner, BlockStack, Button, ButtonGroup, EmptyState, Icon, InlineStack, Modal, Text, TextField} from '@shopify/polaris';
import {DesktopIcon, MobileIcon, SearchIcon} from '@shopify/polaris-icons';
import {EmailDocument, makeCtx} from './render.jsx';
import {DEFAULT_VOICE, VOICES, buildDoc} from './templates.js';

function Thumb({doc, base}) {
  const ctx = useMemo(() => makeCtx({...base, device: 'desktop'}), [base]);
  return (
    <div className="ee-thumb" aria-hidden="true">
      <div className="ee-thumb__inner">
        <EmailDocument doc={doc} ctx={ctx} />
      </div>
    </div>
  );
}

export default function TemplateGallery({open, onClose, emailId, base, onApply}) {
  const [selected, setSelected] = useState(DEFAULT_VOICE);
  const [query, setQuery] = useState('');
  const [device, setDevice] = useState('desktop');
  const [confirm, setConfirm] = useState(false);
  const [docs, setDocs] = useState(null);

  useEffect(() => {
    if (open) {
      setSelected(DEFAULT_VOICE);
      setQuery('');
      setDevice('desktop');
      setConfirm(false);
      setDocs(Object.fromEntries(VOICES.map((v) => [v.id, buildDoc(emailId, v.id)])));
    }
  }, [open, emailId]);

  const q = query.trim().toLowerCase();
  const shown = VOICES.filter((v) => !q || v.label.toLowerCase().includes(q) || v.blurb.toLowerCase().includes(q));
  const voice = VOICES.find((v) => v.id === selected) || VOICES[0];
  const previewCtx = useMemo(() => makeCtx({...base, device}), [base, device]);

  const onKey = (e) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key) || !shown.length) return;
    e.preventDefault();
    const i = Math.max(0, shown.findIndex((v) => v.id === selected));
    const next = e.key === 'Home' ? 0 : e.key === 'End' ? shown.length - 1 : Math.min(shown.length - 1, Math.max(0, i + (e.key === 'ArrowDown' ? 1 : -1)));
    setSelected(shown[next].id);
  };

  return (
    <>
      <Modal
        open={open && !confirm}
        onClose={onClose}
        size="large"
        title="Browse templates"
        primaryAction={{content: 'Use this template', onAction: () => setConfirm(true)}}
        secondaryActions={[{content: 'Close', onAction: onClose}]}
      >
        <Modal.Section>
          <div className="ee-gallery">
            <div className="ee-gallery__left">
              <TextField
                label="Search templates"
                labelHidden
                prefix={<Icon source={SearchIcon} />}
                placeholder="Search by name or voice"
                value={query}
                onChange={setQuery}
                autoComplete="off"
                clearButton
                onClearButtonClick={() => setQuery('')}
              />
              <div className="ee-gallery__list" role="listbox" aria-label="Email templates" onKeyDown={onKey}>
                {shown.length === 0 ? (
                  <EmptyState heading="No templates match your search" image="">
                    <p>Try a different name or voice — or clear the search to see all templates.</p>
                  </EmptyState>
                ) : null}
                {shown.map((v) => (
                  <div key={v.id} className="ee-gallery__group">
                    <BlockStack gap="050">
                      <Text as="h3" variant="headingSm">
                        {v.label}
                      </Text>
                      <Text as="p" variant="bodySm" tone="subdued">
                        {v.blurb}
                      </Text>
                    </BlockStack>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected === v.id}
                      tabIndex={selected === v.id ? 0 : -1}
                      className={`ee-gallery__card${selected === v.id ? ' is-selected' : ''}`}
                      data-voice={v.id}
                      onClick={() => setSelected(v.id)}
                      onDoubleClick={() => setConfirm(true)}
                    >
                      {v.id === DEFAULT_VOICE ? (
                        <span className="ee-gallery__badge">
                          <Badge tone="success">Default</Badge>
                        </span>
                      ) : null}
                      {docs ? <Thumb doc={docs[v.id]} base={base} /> : null}
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <div className="ee-gallery__right">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="span" variant="bodySm" tone="subdued">
                  {voice.label}
                  {voice.id === DEFAULT_VOICE ? ' · Default' : ''}
                </Text>
                <ButtonGroup variant="segmented">
                  <Button size="slim" icon={DesktopIcon} pressed={device === 'desktop'} onClick={() => setDevice('desktop')}>
                    Desktop
                  </Button>
                  <Button size="slim" icon={MobileIcon} pressed={device === 'mobile'} onClick={() => setDevice('mobile')}>
                    Mobile
                  </Button>
                </ButtonGroup>
              </InlineStack>
              <div className="ee-gallery__preview" data-testid="ee-gallery-preview">
                <div className={`ee-gallery__frame ee-gallery__frame--${device}`}>{docs ? <EmailDocument doc={docs[voice.id]} ctx={previewCtx} /> : null}</div>
              </div>
            </div>
          </div>
        </Modal.Section>
      </Modal>
      <Modal
        open={open && confirm}
        onClose={() => setConfirm(false)}
        title="Replace current content?"
        primaryAction={{content: 'Replace and use template', onAction: () => onApply(voice.id)}}
        secondaryActions={[{content: 'Cancel', onAction: () => setConfirm(false)}]}
      >
        <Modal.Section>
          <Banner tone="warning">
            <p>This replaces everything currently in the editor with the selected template. You can keep editing afterwards, and nothing is saved until you click Save.</p>
          </Banner>
        </Modal.Section>
      </Modal>
    </>
  );
}
