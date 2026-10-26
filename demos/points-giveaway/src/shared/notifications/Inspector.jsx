// The Properties tab (spec 3.2 / 3.3): header with the block name, then ungrouped fields, then named groups in the fixed order
// Content, Typography, Layout, Colors, Background, Border, Advanced, Mobile. Border / Advanced / Mobile start folded unless the
// block already has a value there. Display conditions are evaluated against the current preview member.
import React, {useState} from 'react';
import {BlockStack, Button, Checkbox, Collapsible, Divider, Icon, InlineStack, Select, Text, TextField} from '@shopify/polaris';
import {ChevronDownIcon, ChevronUpIcon, CursorIcon, DeleteIcon, PlusCircleIcon, TextAlignCenterIcon, TextAlignLeftIcon, TextAlignRightIcon} from '@shopify/polaris-icons';
import {PRODUCTS, money} from '../../data/index.js';
import {BLOCK_TYPES, SOCIAL_PLATFORMS, defaultProps, nodeLabel} from './blocks.js';
import {CodeModal, ColorWell, ImageField, NumberField, PaddingField, Segmented} from './controls.jsx';
import {VARIABLES, appliesTo, labelFor} from './variables.js';
import {CONDITION_OPERATORS, conditionMatches} from './conditions.js';
import {VarSuffix} from './VariablePicker.jsx';

const GROUP_ORDER = ['Content', 'Typography', 'Layout', 'Colors', 'Background', 'Border', 'Advanced', 'Mobile'];
const FOLDED = ['Border', 'Advanced', 'Mobile'];

const ALIGN = [
  {value: 'left', label: 'Left', icon: TextAlignLeftIcon},
  {value: 'center', label: 'Center', icon: TextAlignCenterIcon},
  {value: 'right', label: 'Right', icon: TextAlignRightIcon},
];
const FONT_FAMILIES = [
  {label: 'Default font', value: ''},
  {label: 'DM Sans', value: "'DM Sans', 'Helvetica Neue', Arial, sans-serif"},
  {label: 'Fraunces', value: "'Fraunces', Georgia, serif"},
  {label: 'Arial', value: 'Arial, Helvetica, sans-serif'},
  {label: 'Georgia', value: 'Georgia, serif'},
  {label: 'Verdana', value: 'Verdana, Geneva, sans-serif'},
  {label: 'Courier New', value: "'Courier New', monospace"},
];
const MOBILE = {group: 'Mobile', key: 'hideOnMobile', type: 'toggle', label: 'Hide on mobile', help: 'Hides the block on phones. A few email apps may still show it.'};
const PAD = {group: 'Layout', key: 'padding', type: 'padding', label: 'Padding'};

/* field spec: {key, label, type, group?, options?, min?, max?, help?, ghost?, vars?, visibleWhen?, disabledWhen?, custom?, placeholder?} */
const SCHEMA = {
  text: [
    {key: 'align', label: 'Alignment', type: 'segmented', options: [...ALIGN, {value: 'justify', label: 'Justify'}]},
    {group: 'Typography', key: 'fontSize', label: 'Font size', type: 'number', min: 8, max: 72},
    {group: 'Typography', key: 'fontFamily', label: 'Font family', type: 'select', options: FONT_FAMILIES},
    {group: 'Typography', key: 'lineHeight', label: 'Line height', type: 'text', placeholder: 'e.g. 1.5', help: 'e.g. 1.5 (multiplier) or 24px; empty = the default.'},
    {group: 'Typography', key: 'letterSpacing', label: 'Letter spacing', type: 'number', min: -10, max: 20, help: 'Empty = None.'},
    {group: 'Typography', key: 'textCase', label: 'Text case', type: 'select', options: [{label: 'None', value: 'none'}, {label: 'UPPERCASE', value: 'uppercase'}, {label: 'lowercase', value: 'lowercase'}, {label: 'Capitalize', value: 'capitalize'}]},
    PAD,
    {group: 'Colors', key: 'color', label: 'Default color', type: 'color', ghost: '#333333', help: 'Applies where no inline color is set; empty = the default.'},
    {group: 'Background', key: 'bgColor', label: 'Background color', type: 'color'},
    MOBILE,
  ],
  callout: [
    PAD,
    {group: 'Layout', key: 'inset', label: 'Side inset', type: 'number', min: 0, max: 100},
    {group: 'Layout', key: 'gapTop', label: 'Outer gap above', type: 'number', min: 0, max: 100},
    {group: 'Layout', key: 'gapBottom', label: 'Outer gap below', type: 'number', min: 0, max: 100},
    {group: 'Layout', key: 'radius', label: 'Corner radius', type: 'number', min: 0, max: 48},
    {group: 'Colors', key: 'color', label: 'Text color', type: 'color'},
    {group: 'Border', key: 'borderWidth', label: 'Border width', type: 'number', min: 0, max: 8},
    {group: 'Border', key: 'borderColor', label: 'Border color', type: 'color'},
    {group: 'Background', key: 'bgColor', label: 'Background color', type: 'color', help: 'The card fill; empty = the default tinted surface.'},
    MOBILE,
  ],
  image: [
    {group: 'Content', key: 'src', label: 'Image URL', type: 'image'},
    {group: 'Content', key: 'alt', label: 'Image description (alt)', type: 'text', vars: true, help: 'Shown if the image fails to load; read by screen readers.'},
    {group: 'Content', key: 'link', label: 'Link on click', type: 'text', vars: true, help: 'Empty = the image is not clickable.'},
    {group: 'Layout', key: 'width', label: 'Width', type: 'text', placeholder: '100% or 300px', help: 'e.g. 100% or 300px; empty = full container width.'},
    {group: 'Layout', key: 'align', label: 'Alignment', type: 'segmented', options: ALIGN},
    PAD,
    {group: 'Layout', key: 'radius', label: 'Corner radius', type: 'number', min: 0, max: 48},
    {group: 'Background', key: 'bgColor', label: 'Fallback background', type: 'color'},
    {group: 'Border', key: 'borderWidth', label: 'Border width', type: 'number', min: 0, max: 12, help: 'Empty inherits the default: no border.'},
    {group: 'Border', key: 'borderEdges', label: 'Edges', type: 'custom', custom: 'edges'},
    {group: 'Border', key: 'borderStyle', label: 'Border style', type: 'select', options: [{label: 'Inherit (solid)', value: ''}, ...['solid', 'dashed', 'dotted', 'double'].map(value => ({label: value[0].toUpperCase() + value.slice(1), value}))]},
    {group: 'Border', key: 'borderColor', label: 'Border color', type: 'color', ghost: '#e5e7eb'},
    {group: 'Border', key: 'borderReset', label: 'Reset border', type: 'custom', custom: 'border-reset'},
    MOBILE,
  ],
  button: [
    {group: 'Content', key: 'label', label: 'Button label', type: 'text', vars: true},
    {group: 'Content', key: 'link', label: 'Link (URL or variable)', type: 'text', vars: true, help: 'Supports variables, e.g. {{reward_url}}.'},
    {group: 'Content', key: 'style', label: 'Button style', type: 'segmented', options: [{value: 'solid', label: 'Solid'}, {value: 'outline', label: 'Outline'}]},
    {group: 'Colors', key: 'accent', label: 'Accent color', type: 'color', help: 'Drives the fill (Solid) or border and label (Outline); empty = the default.'},
    {group: 'Colors', key: 'bgColor', label: 'Background color', type: 'color', disabledWhen: (p) => p.style === 'outline', help: 'Overrides the fill (Solid style only); empty = the accent color.'},
    {group: 'Colors', key: 'textColor', label: 'Text color', type: 'color'},
    {group: 'Typography', key: 'fontFamily', label: 'Font family', type: 'select', options: FONT_FAMILIES, help: 'Default font = the email base font.'},
    {group: 'Typography', key: 'fontSize', label: 'Font size', type: 'number', min: 8, max: 72},
    {group: 'Typography', key: 'fontWeight', label: 'Font weight', type: 'select', options: [{label: 'Normal', value: '400'}, {label: 'Medium', value: '500'}, {label: 'Semibold', value: '600'}, {label: 'Bold', value: '700'}, {label: 'Extra-bold', value: '800'}]},
    {group: 'Layout', key: 'width', label: 'Width', type: 'text', placeholder: 'e.g. 100% or 200px', help: 'e.g. 100% or 200px; empty = fits the label.'},
    {group: 'Layout', key: 'align', label: 'Alignment', type: 'segmented', options: ALIGN},
    PAD,
    {group: 'Advanced', key: 'letterSpacing', label: 'Letter spacing', type: 'number', min: -10, max: 20},
    {group: 'Advanced', key: 'textCase', label: 'Text case', type: 'select', options: [{label: 'None', value: 'none'}, {label: 'UPPERCASE', value: 'uppercase'}, {label: 'Capitalize', value: 'capitalize'}]},
    {group: 'Advanced', key: 'innerPadding', label: 'Inner padding', type: 'text', help: 'Space inside the button around the label, e.g. 12px 24px.'},
    {group: 'Advanced', key: 'radius', label: 'Corner radius', type: 'number', min: 0, max: 999},
    MOBILE,
  ],
  divider: [
    {group: 'Border', key: 'color', label: 'Line color', type: 'color'},
    {group: 'Border', key: 'thickness', label: 'Thickness', type: 'number', min: 1, max: 20},
    {group: 'Border', key: 'style', label: 'Line style', type: 'select', options: [{label: 'Solid', value: 'solid'}, {label: 'Dashed', value: 'dashed'}, {label: 'Dotted', value: 'dotted'}]},
    {group: 'Layout', key: 'width', label: 'Width', type: 'text', placeholder: '100% or 80px'},
    {group: 'Layout', key: 'align', label: 'Alignment', type: 'segmented', options: ALIGN},
    {group: 'Layout', key: 'spaceAbove', label: 'Space above', type: 'number', min: 0, max: 80},
    {group: 'Layout', key: 'spaceBelow', label: 'Space below', type: 'number', min: 0, max: 80},
    MOBILE,
  ],
  spacer: [{key: 'height', label: 'Height (px)', type: 'number', min: 0, max: 400}, MOBILE],
  social: [
    {group: 'Content', key: 'links', label: 'Social links', type: 'custom', custom: 'social'},
    {group: 'Content', key: 'iconStyle', label: 'Icon style', type: 'segmented', options: [{value: 'filled', label: 'Filled'}, {value: 'outline', label: 'Outline'}]},
    {group: 'Content', key: 'direction', label: 'Direction', type: 'segmented', options: [{value: 'horizontal', label: 'Horizontal'}, {value: 'vertical', label: 'Vertical'}]},
    {group: 'Layout', key: 'iconSize', label: 'Icon size', type: 'number', min: 12, max: 64},
    {group: 'Layout', key: 'spacing', label: 'Icon spacing', type: 'number', min: 0, max: 40},
    {group: 'Layout', key: 'align', label: 'Alignment', type: 'segmented', options: ALIGN},
    PAD,
    {group: 'Colors', key: 'color', label: 'Icon color', type: 'color'},
    {group: 'Background', key: 'bgColor', label: 'Background color', type: 'color'},
    MOBILE,
  ],
  html: [{group: 'Content', key: 'code', label: 'HTML content', type: 'custom', custom: 'html'}, MOBILE],
  card: [
    PAD,
    {group: 'Layout', key: 'radius', label: 'Corner radius', type: 'number', min: 0, max: 48},
    {group: 'Colors', key: 'textColor', label: 'Text color', type: 'color'},
    {group: 'Colors', key: 'mutedColor', label: 'Label color', type: 'color'},
    {group: 'Background', key: 'bgColor', label: 'Background color', type: 'color'},
    {group: 'Border', key: 'borderWidth', label: 'Border width', type: 'number', min: 0, max: 8},
    {group: 'Border', key: 'borderColor', label: 'Border color', type: 'color'},
    MOBILE,
  ],
  product: [
    {group: 'Content', key: 'handles', label: 'Products (1-6)', type: 'custom', custom: 'products'},
    {group: 'Content', key: 'columns', label: 'Columns', type: 'segmented', options: [{value: 1, label: '1'}, {value: 2, label: '2'}, {value: 3, label: '3'}]},
    {group: 'Content', key: 'showPrice', label: 'Show price', type: 'toggle'},
    {group: 'Content', key: 'ctaLabel', label: 'CTA button label', type: 'text', vars: true, help: 'Empty = "Shop now".'},
    {group: 'Colors', key: 'accent', label: 'Accent color', type: 'color'},
    PAD,
    MOBILE,
  ],
  section: [
    {group: 'Layout', key: 'fullWidth', label: 'Full-width background', type: 'toggle', help: 'Spans the full email width, not just the content area.'},
    PAD,
    {group: 'Layout', key: 'minHeight', label: 'Minimum height', type: 'number', min: 0, max: 800, help: 'Sets a minimum band height — useful for a photo hero. Empty = fits the content.'},
    {group: 'Layout', key: 'radius', label: 'Corner radius', type: 'number', min: 0, max: 48},
    {group: 'Background', key: 'bgImage', label: 'Background image', type: 'image'},
    {group: 'Background', key: 'bgColor', label: 'Background color', type: 'color'},
  ],
  row: [
    {group: 'Layout', key: 'layout', label: 'Column layout', type: 'custom', custom: 'columns'},
    PAD,
    {group: 'Layout', key: 'gap', label: 'Space between columns', type: 'number', min: 0, max: 60, help: 'Empty = columns sit flush.'},
    {group: 'Background', key: 'bgColor', label: 'Background color', type: 'color', help: 'Empty = transparent.'},
  ],
  column: [
    {group: 'Layout', key: 'vAlign', label: 'Vertical alignment', type: 'segmented', options: [{value: 'top', label: 'Top'}, {value: 'middle', label: 'Middle'}, {value: 'bottom', label: 'Bottom'}]},
    PAD,
  ],
};

const isActive = (field, props, defaults) => {
  const v = props[field.key];
  if (v === undefined || v === '' || v === false || v === null) return false;
  return JSON.stringify(v) !== JSON.stringify(defaults[field.key]);
};

/* ------------------------------------------------------------------ custom editors */

function SocialEditor({node, set}) {
  const links = node.props.links || [];
  const update = (i, patch) => set('links', links.map((l, j) => (j === i ? {...l, ...patch} : l)));
  return (
    <BlockStack gap="300">
      {links.length === 0 ? (
        <Text as="p" tone="subdued" variant="bodySm">
          No links yet.
        </Text>
      ) : null}
      {links.map((l, i) => (
        <div className="ee-sociallink" key={`${l.platform}-${i}`}>
          <Select
            label="Platform"
            options={SOCIAL_PLATFORMS.map((p) => ({label: p.label, value: p.id}))}
            value={l.platform}
            onChange={(v) => update(i, {platform: v, name: SOCIAL_PLATFORMS.find((p) => p.id === v)?.label || l.name, url: l.url || SOCIAL_PLATFORMS.find((p) => p.id === v)?.url || ''})}
          />
          {l.platform === 'custom' ? <TextField label="Platform name" value={l.name || ''} placeholder="Platform name (e.g. Pinterest)" onChange={(v) => update(i, {name: v})} autoComplete="off" /> : null}
          <TextField label="URL" value={l.url || ''} placeholder="URL or {{merge_tag}}" onChange={(v) => update(i, {url: v})} autoComplete="off" />
          <InlineStack align="space-between" blockAlign="center">
            <Checkbox label="Show" checked={l.show !== false} onChange={(v) => update(i, {show: v})} />
            <Button size="slim" variant="plain" tone="critical" icon={DeleteIcon} accessibilityLabel="Delete link" onClick={() => set('links', links.filter((_, j) => j !== i))}>
              Delete link
            </Button>
          </InlineStack>
        </div>
      ))}
      <Button icon={PlusCircleIcon} onClick={() => set('links', [...links, {platform: 'custom', name: '', url: '', show: true}])}>
        Add platform
      </Button>
      <Text as="p" variant="bodySm" tone="subdued">
        Manage your social links in Settings → Email
      </Text>
    </BlockStack>
  );
}

function HtmlEditor({node, set}) {
  const [open, setOpen] = useState(false);
  return (
    <BlockStack gap="200">
      <Button onClick={() => setOpen(true)}>Open code editor</Button>
      <Text as="p" variant="bodySm" tone="subdued">
        Paste a fragment (no html/head/body); scripts, on* and iframes are stripped.
      </Text>
      <CodeModal open={open} value={node.props.code} onClose={() => setOpen(false)} onApply={(code) => {set('code', code); setOpen(false);}} />
    </BlockStack>
  );
}

function ProductsEditor({node, set}) {
  const chosen = node.props.handles || [];
  const toggle = (handle, on) => {
    const next = on ? [...chosen, handle] : chosen.filter((h) => h !== handle);
    if (next.length >= 1 && next.length <= 6) set('handles', next);
  };
  return (
    <BlockStack gap="100">
      {PRODUCTS.map((p) => (
        <Checkbox key={p.handle} label={`${p.title} · ${money(p.price)}`} checked={chosen.includes(p.handle)} disabled={(chosen.includes(p.handle) && chosen.length === 1) || (!chosen.includes(p.handle) && chosen.length >= 6)} onChange={(on) => toggle(p.handle, on)} />
      ))}
    </BlockStack>
  );
}

function ColumnsSummary({node, actions}) {
  const layout = node.props.layout || [100];
  return (
    <BlockStack gap="200">
      <Text as="p" variant="bodyMd">
        {layout.length} column{layout.length === 1 ? '' : 's'}: {layout.map((n) => `${Math.round(n)}%`).join(' / ')}
      </Text>
      <InlineStack>
        <Button size="slim" onClick={() => actions.editLayout(node.id)}>
          Edit layout
        </Button>
      </InlineStack>
    </BlockStack>
  );
}

/* ------------------------------------------------------------------ one field */

function Field({field, node, set, ctx}) {
  const v = node.props[field.key];
  const disabled = field.disabledWhen ? field.disabledWhen(node.props) : false;
  const id = `ee-prop-${node.id}-${field.key}`;
  const wrapped = (child) => (
    <div className={disabled ? 'ee-field is-disabled' : 'ee-field'} data-prop={field.key}>
      {child}
    </div>
  );
  switch (field.type) {
    case 'text':
      return wrapped(
        <TextField
          id={id}
          label={field.label}
          value={String(v ?? '')}
          onChange={(x) => set(field.key, x)}
          placeholder={field.placeholder}
          helpText={field.help}
          disabled={disabled}
          autoComplete="off"
          suffix={field.vars ? <VarSuffix emailId={ctx.emailId} values={ctx.values} inputId={id} value={String(v ?? '')} onChange={(x) => set(field.key, x)} /> : undefined}
        />,
      );
    case 'number':
      return wrapped(<NumberField label={field.label} value={v} min={field.min} max={field.max} unit={field.unit} help={field.help} onChange={(x) => set(field.key, x)} />);
    case 'select':
      return wrapped(<Select label={field.label} options={field.options} value={String(v ?? '')} onChange={(x) => set(field.key, x)} helpText={field.help} disabled={disabled} />);
    case 'segmented':
      return wrapped(<Segmented label={field.label} value={v} options={field.options} help={field.help} onChange={(x) => set(field.key, x)} />);
    case 'toggle':
      return wrapped(<Checkbox label={field.label} checked={!!v} onChange={(x) => set(field.key, x)} helpText={field.help} />);
    case 'color':
      return wrapped(<ColorWell label={field.label} value={v || ''} ghost={field.ghost || ''} help={field.help} onChange={(x) => set(field.key, x)} />);
    case 'padding':
      return wrapped(<PaddingField label={field.label} value={v} onChange={(x) => set(field.key, x)} />);
    case 'image':
      return wrapped(<ImageField label={field.label} value={v || ''} resolve={ctx.resolve} onChange={(x) => set(field.key, x)} />);
    case 'custom':
      return wrapped(
        <BlockStack gap="200">
          <Text as="span" variant="bodyMd">
            {field.label}
          </Text>
          {field.custom === 'edges' && <InlineStack gap="200">{['top', 'right', 'bottom', 'left'].map(edge => <Checkbox key={edge} label={edge[0].toUpperCase() + edge.slice(1)} checked={(node.props.borderEdges || ['top', 'right', 'bottom', 'left']).includes(edge)} onChange={on => {const edges = node.props.borderEdges || ['top', 'right', 'bottom', 'left']; set('borderEdges', on ? [...edges, edge] : edges.filter(v => v !== edge));}} />)}</InlineStack>}
          {field.custom === 'border-reset' && <Button onClick={() => ctx.actions.setProps(node.id, {borderWidth: '', borderColor: '', borderStyle: '', borderEdges: undefined})}>Reset to inherited border</Button>}
          {field.custom === 'social' ? <SocialEditor node={node} set={set} /> : null}
          {field.custom === 'html' ? <HtmlEditor node={node} set={set} /> : null}
          {field.custom === 'products' ? <ProductsEditor node={node} set={set} /> : null}
          {field.custom === 'columns' ? <ColumnsSummary node={node} actions={ctx.actions} /> : null}
        </BlockStack>,
      );
    default:
      return null;
  }
}

function Group({title, open, onToggle, children}) {
  return (
    <div className="ee-group" data-group={title}>
      <Divider />
      <button type="button" className="ee-group__head" aria-expanded={open} onClick={onToggle}>
        <Text as="span" variant="headingSm">
          {title}
        </Text>
        <Icon source={open ? ChevronUpIcon : ChevronDownIcon} tone="subdued" />
      </button>
      <Collapsible open={open} id={`ee-group-${title}`} transition={{duration: '120ms', timingFunction: 'ease-in-out'}}>
        <div className="ee-group__body">
          <BlockStack gap="300">{children}</BlockStack>
        </div>
      </Collapsible>
    </div>
  );
}

export default function Inspector({node, actions, emailId, values, resolve}) {
  const [openMap, setOpenMap] = useState({});
  if (!node) {
    return (
      <div className="ee-inspector ee-inspector--empty">
        <Icon source={CursorIcon} tone="subdued" />
        <Text as="p" variant="headingSm">
          Select a block
        </Text>
        <Text as="p" variant="bodySm" tone="subdued">
          Click a block on the canvas to edit it.
        </Text>
      </div>
    );
  }
  const fields = (SCHEMA[node.type] || []).filter((f) => !f.visibleWhen || f.visibleWhen(node.props));
  const defaults = defaultProps(node.type);
  const ungrouped = fields.filter((f) => !f.group);
  const groups = GROUP_ORDER.map((name) => ({name, fields: fields.filter((f) => f.group === name)})).filter((g) => g.fields.length);
  const set = (key, value, coalesce) => actions.setProps(node.id, {[key]: value}, coalesce || `prop:${node.id}:${key}`);
  const ctx = {emailId, values, resolve, actions};
  const Icn = BLOCK_TYPES[node.type]?.icon;

  return (
    <div className="ee-inspector" data-block={node.type}>
      <div className="ee-inspector__head">
        {Icn ? <Icon source={Icn} tone="subdued" /> : null}
        <Text as="h3" variant="headingSm">
          {nodeLabel(node)}
        </Text>
      </div>
      <BlockStack gap="300">
        <ConditionEditor key={node.id} node={node} set={set} emailId={emailId} values={values} />
        {ungrouped.map((f) => (
          <Field key={f.key} field={f} node={node} set={set} ctx={ctx} />
        ))}
        {groups.map((g) => {
          const key = `${node.id}:${g.name}`;
          const active = g.fields.some((f) => isActive(f, node.props, defaults));
          const open = openMap[key] ?? (FOLDED.includes(g.name) ? active : true);
          return (
            <Group key={g.name} title={g.name} open={open} onToggle={() => setOpenMap({...openMap, [key]: !open})}>
              {g.fields.map((f) => (
                <Field key={f.key} field={f} node={node} set={set} ctx={ctx} />
              ))}
            </Group>
          );
        })}
      </BlockStack>
    </div>
  );
}

function ConditionEditor({node, set, emailId, values}) {
  const [open, setOpen] = useState(false);
  const condition = node.props.condition || {match: 'all', rules: []};
  const rules = condition.rules || [];
  const update = patch => set('condition', {...condition, ...patch});
  const change = (index, patch) => update({rules: rules.map((rule, i) => i === index ? {...rule, ...patch} : rule)});
  const matched = conditionMatches(condition, values);
  return <Group title="Display condition" open={open} onToggle={() => setOpen(!open)}>
    <Text as="p" tone="subdued">{rules.length ? `${rules.length} ${rules.length === 1 ? 'rule' : 'rules'} · ${matched ? 'Shown' : 'Hidden'} for this preview member` : 'Always shown'}</Text>
    {rules.length > 0 && <Select label="Match" options={[{label: 'Match all', value: 'all'}, {label: 'Match any', value: 'any'}]} value={condition.match} onChange={match => update({match})} />}
    {rules.map((rule, index) => <BlockStack gap="200" key={index}>
      <Select label="Variable" options={[{label: 'Choose a variable', value: ''}, ...VARIABLES.filter(v => appliesTo(v, emailId)).map(v => ({label: labelFor(v, emailId), value: v.tag}))]} value={rule.variable} onChange={variable => change(index, {variable})} />
      <Select label="Condition" options={CONDITION_OPERATORS} value={rule.operator} onChange={operator => change(index, {operator})} />
      {!['empty', 'not-empty'].includes(rule.operator) && <TextField label="Value" autoComplete="off" value={rule.value || ''} onChange={value => change(index, {value})} />}
      <Button variant="plain" tone="critical" onClick={() => update({rules: rules.filter((_, i) => i !== index)})}>Remove rule</Button>
    </BlockStack>)}
    <Button onClick={() => update({rules: [...rules, {variable: '', operator: 'is', value: ''}]})}>{rules.length ? 'Add rule' : 'Add condition'}</Button>
    {rules.length > 0 && <Select label="Preview visibility" value={node.props.conditionPreview || 'auto'} onChange={v => set('conditionPreview', v)} options={[{label: 'Use current member data', value: 'auto'}, {label: 'Preview: shown', value: 'shown'}, {label: 'Preview: hidden', value: 'hidden'}]} helpText="Only changes the editing canvas. Preview & test always evaluates the rules." />}
  </Group>;
}
