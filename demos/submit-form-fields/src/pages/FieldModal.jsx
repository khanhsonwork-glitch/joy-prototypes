// Add / edit one form field. Type, label, placeholder, required; options with a customer tag each for choice fields;
// accepted format for the upload field. Validation shows under the field and Save focuses the first error.
import React, {useEffect, useMemo, useState} from 'react';
import {BlockStack, Banner, Box, Button, Checkbox, ChoiceList, InlineStack, List, Modal, Select, Text, TextField} from '@shopify/polaris';
import {DeleteIcon, PlusIcon} from '@shopify/polaris-icons';
import {FIELD_TYPES, MAX_OPTIONS, isChoice, newId} from '../data/form.js';

const blank = (type) => ({
  id: newId(),
  type,
  label: '',
  placeholder: '',
  required: false,
  ...(isChoice(type) ? {options: [{id: newId('o'), label: '', tag: ''}, {id: newId('o'), label: '', tag: ''}]} : {}),
  ...(type === 'upload' ? {format: 'image'} : {}),
  ...(type === 'email' ? {prefill: true} : {}),
});

const RESTRICTIONS = {
  image: ['Format: JPEG, JPG, PNG', 'Max 10MB per file', 'Max 5 files per submission'],
  video: ['Format: MP4, MOV', 'Max 50MB per file', 'Max 1 video per submission'],
  both: ['Images: JPEG, JPG, PNG, max 10MB each', 'Video: MP4, MOV, max 50MB', 'Max 5 files per submission'],
};

/** field: the field being edited, or {type} for a new one. locked: customers already answered it (type can't change). */
export function FieldModal({open, field, locked, hasUpload, otherLabels = [], onClose, onSave}) {
  const [f, setF] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open || !field) return;
    setF(field.id ? JSON.parse(JSON.stringify(field)) : blank(field.type));
    setErrors({});
  }, [open, field]);

  const typeOptions = useMemo(
    () => FIELD_TYPES.map((t) => ({
      label: t.label,
      value: t.value,
      disabled: t.value === 'upload' && hasUpload && field?.type !== 'upload',
    })),
    [hasUpload, field],
  );

  if (!f || !field) return null;
  const set = (patch) => {
    setF((cur) => ({...cur, ...patch}));
    if (Object.keys(errors).length) setErrors({});
  };
  const setOption = (id, patch) => set({options: f.options.map((o) => (o.id === id ? {...o, ...patch} : o))});

  const changeType = (type) => {
    const next = {...blank(type), id: f.id, label: f.label, required: f.required};
    if (isChoice(type) && isChoice(f.type)) next.options = f.options;
    setF(next);
  };

  const validate = () => {
    const e = {};
    if (!f.label.trim()) e.label = 'Enter a label customers will see.';
    else if (otherLabels.includes(f.label.trim().toLowerCase())) e.label = 'Another field already uses this label. Each field needs its own label.';
    if (isChoice(f.type)) {
      const filled = f.options.filter((o) => o.label.trim());
      if (filled.length < 2) e.options = 'Add at least two options.';
      const seen = new Set();
      for (const o of filled) {
        const k = o.label.trim().toLowerCase();
        if (seen.has(k)) e.options = `“${o.label.trim()}” is listed twice. Each option needs its own name.`;
        seen.add(k);
      }
      for (const o of f.options) if (o.tag.includes(',')) e[`tag-${o.id}`] = 'Tags can’t contain commas. Use one tag per option.';
    }
    return e;
  };

  const submit = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      const first = Object.keys(e)[0];
      const id = first === 'label' ? 'field-label' : first === 'options' ? 'field-options' : `field-${first}`;
      setTimeout(() => document.getElementById(id)?.focus(), 0);
      return;
    }
    const clean = isChoice(f.type) ? {...f, options: f.options.filter((o) => o.label.trim()).map((o) => ({...o, label: o.label.trim(), tag: o.tag.trim()}))} : f;
    onSave({...clean, label: f.label.trim()});
  };

  const isNew = !field.id;
  const typeHelp = locked
    ? 'Customers have already answered this field, so its type is fixed. Add a new field to ask in another way.'
    : FIELD_TYPES.find((t) => t.value === f.type)?.help;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isNew ? 'Add field' : 'Edit field'}
      primaryAction={{content: isNew ? 'Add field' : 'Done', onAction: submit}}
      secondaryActions={[{content: 'Cancel', onAction: onClose}]}
    >
      <Modal.Section>
        <BlockStack gap="400">
          <Select label="Field type" options={typeOptions} value={f.type} onChange={changeType} disabled={locked} helpText={typeHelp} />
          <TextField
            id="field-label"
            label="Label"
            value={f.label}
            onChange={(v) => set({label: v})}
            autoComplete="off"
            maxLength={120}
            error={errors.label}
            helpText="Customers see this above the field."
          />
          {['short', 'paragraph', 'number', 'email', 'link'].includes(f.type) ? (
            <TextField label="Placeholder" value={f.placeholder || ''} onChange={(v) => set({placeholder: v})} autoComplete="off" maxLength={120} helpText="Light example text inside the empty field." />
          ) : null}
          {f.type === 'number' ? (
            <TextField label="Show before the number" value={f.prefix || ''} onChange={(v) => set({prefix: v.slice(0, 3)})} autoComplete="off" placeholder="$" helpText="Optional, like a currency sign. Customers can type decimals." />
          ) : null}
          {f.type === 'email' ? (
            <Checkbox label="Fill in the email of a logged-in customer" checked={Boolean(f.prefill)} onChange={(v) => set({prefill: v})} helpText="Customers can still change it." />
          ) : null}

          {isChoice(f.type) ? (
            <BlockStack gap="200">
              <InlineStack align="space-between" blockAlign="end">
                <Text as="span" variant="bodyMd">Options</Text>
                <Text as="span" variant="bodySm" tone="subdued">Customer tag</Text>
              </InlineStack>
              <div id="field-options" tabIndex={-1} className="sf-options">
                {f.options.map((o, i) => (
                  <div key={o.id} className="sf-option">
                    <TextField
                      label={`Option ${i + 1}`}
                      labelHidden
                      placeholder={`Option ${i + 1}`}
                      value={o.label}
                      onChange={(v) => setOption(o.id, o.tag === o.label ? {label: v, tag: v} : {label: v})}
                      autoComplete="off"
                      maxLength={60}
                    />
                    <TextField
                      id={`field-tag-${o.id}`}
                      label={`Tag for option ${i + 1}`}
                      labelHidden
                      placeholder="No tag"
                      value={o.tag}
                      onChange={(v) => setOption(o.id, {tag: v})}
                      autoComplete="off"
                      maxLength={40}
                      error={errors[`tag-${o.id}`]}
                    />
                    <Button
                      icon={DeleteIcon}
                      variant="tertiary"
                      accessibilityLabel={`Remove option ${i + 1}`}
                      disabled={f.options.length <= 2}
                      onClick={() => set({options: f.options.filter((x) => x.id !== o.id)})}
                    />
                  </div>
                ))}
              </div>
              {errors.options ? <Text as="p" tone="critical">{errors.options}</Text> : null}
              <InlineStack align="space-between" blockAlign="center">
                <Button icon={PlusIcon} variant="plain" disabled={f.options.length >= MAX_OPTIONS} onClick={() => set({options: [...f.options, {id: newId('o'), label: '', tag: ''}]})}>
                  Add option
                </Button>
                <Text as="span" variant="bodySm" tone="subdued">{`${f.options.length} of ${MAX_OPTIONS}`}</Text>
              </InlineStack>
              <Text as="p" variant="bodySm" tone="subdued">
                {f.type === 'multi'
                  ? 'When you approve a submission, the customer gets the tag of every option they picked. Leave a tag empty to skip it.'
                  : 'When you approve a submission, the customer gets the tag of the option they picked. Leave a tag empty to skip it.'}
              </Text>
            </BlockStack>
          ) : null}

          {f.type === 'upload' ? (
            <BlockStack gap="300">
              <ChoiceList
                title="Accepted format"
                choices={[{label: 'Image only', value: 'image'}, {label: 'Video only', value: 'video'}, {label: 'Both', value: 'both'}]}
                selected={[f.format]}
                onChange={([v]) => set({format: v})}
              />
              <Banner tone="info" title="Restrictions:">
                <List>{RESTRICTIONS[f.format].map((r) => <List.Item key={r}>{r}</List.Item>)}</List>
              </Banner>
            </BlockStack>
          ) : null}

          <Box paddingBlockStart="100">
            <Checkbox
              label="Required"
              checked={f.required}
              onChange={(v) => set({required: v})}
              helpText={f.required ? 'Customers can’t submit until they fill this in.' : 'Customers can leave this empty.'}
            />
          </Box>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
