// Property controls used by the Properties panel and the Settings tab (spec 3.2): ColorWell with brand swatches, linked/individual
// padding, range + number, segmented choices, image picker with its "Choose image" modal. All Polaris.
import React, {useEffect, useState} from 'react';
import {
  BlockStack,
  Button,
  ButtonGroup,
  Checkbox,
  ColorPicker,
  DropZone,
  InlineStack,
  Modal,
  Popover,
  RangeSlider,
  Tabs,
  Text,
  TextField,
  hexToRgb,
  hsbToHex,
  rgbToHsb,
} from '@shopify/polaris';
import {ResetIcon} from '@shopify/polaris-icons';
import {IMAGES, PRODUCTS, STOREFRONT_COLORS} from '../../data/index.js';

export const BRAND_COLORS = [STOREFRONT_COLORS.ink, STOREFRONT_COLORS.yellow, STOREFRONT_COLORS.pomelo];
const HEX = /^#[0-9a-f]{6}$/i;

/* ------------------------------------------------------------------ colour */

export function ColorWell({label, value, onChange, ghost = '', help}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value || '');
  useEffect(() => setDraft(value || ''), [value]);
  const shown = value && HEX.test(value) ? value : '';
  const hsb = rgbToHsb(hexToRgb(shown || (HEX.test(ghost) ? ghost : '#ffffff')));
  const commit = (next) => {
    setDraft(next);
    if (next === '' || HEX.test(next)) onChange(next.toLowerCase());
  };
  return (
    <div className="ee-color" data-color-field={label}>
      <Text as="span" variant="bodyMd">
        {label}
      </Text>
      <div className="ee-color__row">
        <Popover
          active={open}
          autofocusTarget="none"
          onClose={() => setOpen(false)}
          activator={
            <button
              type="button"
              className={`ee-color__swatch${shown ? '' : ' is-ghost'}`}
              style={{backgroundColor: shown || (HEX.test(ghost) ? ghost : 'transparent')}}
              aria-label={shown ? `${label}: ${shown}, click to change` : `${label}: not set (inherits theme), click to pick`}
              onClick={() => setOpen(!open)}
            />
          }
        >
          <div className="ee-pop">
            <ColorPicker color={hsb} onChange={(c) => commit(hsbToHex(c))} />
            <Button
              variant="plain"
              tone="critical"
              onClick={() => {
                commit('');
                setOpen(false);
              }}
            >
              Clear color (inherit theme)
            </Button>
          </div>
        </Popover>
        <div className="ee-color__hex">
          <TextField label={`${label} hex`} labelHidden value={draft} onChange={commit} placeholder={HEX.test(ghost) ? ghost : 'Inherit theme'} autoComplete="off" maxLength={7} />
        </div>
        {shown ? <Button size="slim" icon={ResetIcon} accessibilityLabel="Reset to theme" onClick={() => commit('')} /> : null}
      </div>
      <div className="ee-color__brand">
        <Text as="span" variant="bodySm" tone="subdued">
          Brand colors
        </Text>
        {BRAND_COLORS.map((c) => (
          <button key={c} type="button" className="ee-color__chip" style={{background: c}} aria-label={`Brand color ${c}`} onClick={() => commit(c)} />
        ))}
      </div>
      {help ? (
        <Text as="p" variant="bodySm" tone="subdued">
          {help}
        </Text>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ numbers + padding */

export function NumberField({label, value, onChange, min, max, unit = 'px', help, placeholder, ghost}) {
  const has = min !== undefined && max !== undefined;
  const n = value === '' || value === undefined || value === null ? '' : Number(value);
  const set = (v) => onChange(v === '' ? '' : Math.max(has ? min : -Infinity, Math.min(has ? max : Infinity, Number(v))));
  return (
    <div className="ee-num" data-field={label}>
      {has ? (
        <div className="ee-num__range">
          <RangeSlider label={label} value={n === '' ? (ghost ?? min) : n} min={min} max={max} onChange={set} output={false} />
          <div className="ee-num__box">
            <TextField label={`${label} value`} labelHidden type="number" value={String(n)} onChange={(v) => (v === '' ? onChange('') : set(v))} suffix={unit} autoComplete="off" placeholder={placeholder} />
          </div>
        </div>
      ) : (
        <TextField label={label} type="number" value={String(n)} onChange={(v) => (v === '' ? onChange('') : onChange(Number(v)))} suffix={unit} autoComplete="off" placeholder={placeholder} helpText={help} />
      )}
      {has && help ? (
        <Text as="p" variant="bodySm" tone="subdued">
          {help}
        </Text>
      ) : null}
    </div>
  );
}

export function PaddingField({label = 'Padding', value, onChange}) {
  const p = {t: 0, r: 0, b: 0, l: 0, ...(value || {})};
  const differs = p.t !== p.b || p.l !== p.r;
  const [individual, setIndividual] = useState(differs);
  useEffect(() => {
    if (differs) setIndividual(true);
  }, [differs]);
  const set = (patch) => onChange({...p, ...patch});
  const field = (name, key, extra) => (
    <TextField key={key} label={name} type="number" min={0} value={String(p[key])} onChange={(v) => set(extra ? extra(Math.max(0, Number(v) || 0)) : {[key]: Math.max(0, Number(v) || 0)})} suffix="px" autoComplete="off" />
  );
  return (
    <div className="ee-pad" data-field={label}>
      <Text as="span" variant="bodyMd">
        {label}
      </Text>
      {individual ? (
        <div className="ee-pad__grid ee-pad__grid--4">
          {field('Top', 't')}
          {field('Right', 'r')}
          {field('Bottom', 'b')}
          {field('Left', 'l')}
        </div>
      ) : (
        <div className="ee-pad__grid">
          {field('Vertical', 't', (n) => ({t: n, b: n}))}
          {field('Horizontal', 'r', (n) => ({l: n, r: n}))}
        </div>
      )}
      <Checkbox label="Individual sides" checked={individual} disabled={differs} onChange={setIndividual} />
    </div>
  );
}

/* ------------------------------------------------------------------ choices */

export function Segmented({label, value, options, onChange, help}) {
  return (
    <div className="ee-seg" data-field={label}>
      <Text as="span" variant="bodyMd">
        {label}
      </Text>
      <ButtonGroup variant="segmented" fullWidth>
        {options.map((o) => (
          <Button key={o.value} pressed={value === o.value} icon={o.icon} accessibilityLabel={o.icon ? `${label}: ${o.label}` : undefined} onClick={() => onChange(o.value)}>
            {o.icon ? undefined : o.label}
          </Button>
        ))}
      </ButtonGroup>
      {help ? (
        <Text as="p" variant="bodySm" tone="subdued">
          {help}
        </Text>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------ images */

export const IMAGE_LIBRARY = [
  {label: 'Pomelo Park logo', src: IMAGES.logo},
  {label: 'Hero', src: IMAGES.hero},
  {label: 'Club hero', src: IMAGES.club},
  ...PRODUCTS.slice(0, 6).map((p) => ({label: p.title, src: p.image})),
];

export function ChooseImageModal({open, value, onClose, onInsert, resolve}) {
  const [tab, setTab] = useState(0);
  const [url, setUrl] = useState('');
  const [upload, setUpload] = useState('');
  const [lib, setLib] = useState('');
  useEffect(() => {
    if (open) {
      setTab(0);
      setUrl(value || '');
      setUpload('');
      setLib('');
    }
  }, [open, value]);
  const chosen = tab === 0 ? url.trim() : tab === 1 ? upload : lib;
  const preview = resolve ? resolve(chosen) : chosen;
  const onFiles = (_a, accepted) => {
    const file = accepted[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setUpload(String(reader.result));
    reader.readAsDataURL(file);
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Choose image"
      primaryAction={{content: 'Insert', disabled: !chosen, onAction: () => onInsert(chosen)}}
      secondaryActions={[{content: 'Cancel', onAction: onClose}]}
    >
      <Modal.Section>
        <BlockStack gap="300">
          <Tabs
            tabs={[
              {id: 'url', content: 'URL'},
              {id: 'upload', content: 'Upload'},
              {id: 'library', content: 'Library'},
            ]}
            selected={tab}
            onSelect={setTab}
            fitted
          />
          {tab === 0 ? <TextField label="Image URL" value={url} onChange={setUrl} placeholder="https://… or {{merge_tag}}" autoComplete="off" /> : null}
          {tab === 1 ? (
            <DropZone accept="image/*" type="image" onDrop={onFiles} allowMultiple={false}>
              <DropZone.FileUpload actionHint="Drag an image here, or click to browse" />
            </DropZone>
          ) : null}
          {tab === 2 ? (
            <div className="ee-lib">
              {IMAGE_LIBRARY.map((img) => (
                <button key={img.src} type="button" className={`ee-lib__item${lib === img.src ? ' is-selected' : ''}`} onClick={() => setLib(img.src)} aria-label={img.label} aria-pressed={lib === img.src}>
                  <img src={img.src} alt="" />
                  <span>{img.label}</span>
                </button>
              ))}
            </div>
          ) : null}
          {preview ? (
            <div className="ee-imgprev">
              <img src={preview} alt="Selected image preview" />
            </div>
          ) : null}
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}

export function ImageField({label = 'Image URL', value, onChange, resolve, help}) {
  const [open, setOpen] = useState(false);
  const src = value ? (resolve ? resolve(value) : value) : '';
  const isLogo = /^\{\{\s*shop\.logo_url\s*\}\}$/.test(value || '');
  return (
    <div className="ee-imgfield" data-field={label}>
      <Text as="span" variant="bodyMd">
        {label}
      </Text>
      {src ? (
        <div className="ee-imgfield__thumb">
          <img src={src} alt="" />
        </div>
      ) : null}
      <InlineStack gap="200">
        <Button size="slim" onClick={() => setOpen(true)}>
          {value ? 'Change image' : 'Add image'}
        </Button>
        {value ? (
          <Button size="slim" variant="plain" tone="critical" onClick={() => onChange('')}>
            Remove image
          </Button>
        ) : null}
      </InlineStack>
      {isLogo ? (
        <Text as="p" variant="bodySm" tone="subdued">
          Shows your shop logo — change it in Settings → Email
        </Text>
      ) : null}
      {help ? (
        <Text as="p" variant="bodySm" tone="subdued">
          {help}
        </Text>
      ) : null}
      <ChooseImageModal
        open={open}
        value={value}
        resolve={resolve}
        onClose={() => setOpen(false)}
        onInsert={(next) => {
          onChange(next);
          setOpen(false);
        }}
      />
    </div>
  );
}

export function CodeModal({open, value, onClose, onApply}) {
  const [draft, setDraft] = useState(value || '');
  useEffect(() => {
    if (open) setDraft(value || '');
  }, [open, value]);
  return (
    <Modal open={open} onClose={onClose} title="Edit HTML" primaryAction={{content: 'Apply', onAction: () => onApply(draft)}} secondaryActions={[{content: 'Cancel', onAction: onClose}]}>
      <Modal.Section>
        <TextField label="HTML content" labelHidden value={draft} onChange={setDraft} multiline={10} autoComplete="off" monospaced helpText="Paste a fragment (no html/head/body); scripts, on* and iframes are stripped." />
      </Modal.Section>
    </Modal>
  );
}
