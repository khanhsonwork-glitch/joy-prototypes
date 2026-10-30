// The form as a customer sees it in the widget, driven by the same fields the Rule tab edits (one source).
// Choice options are pills with the tick on the right; the whole pill is clickable.
import React, {useState} from 'react';
import {BlockStack, Card, InlineStack, Text} from '@shopify/polaris';
import {ViewIcon} from '@shopify/polaris-icons';
import {Icon} from '@shopify/polaris';
import {TODAY} from '../data/form.js';

function Pills({field}) {
  const [picked, setPicked] = useState([]);
  const toggle = (id) =>
    setPicked((cur) => (field.type === 'single' ? [id] : cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  return (
    <div className="sfp-pills" role={field.type === 'single' ? 'radiogroup' : 'group'} aria-label={field.label}>
      {field.options.map((o) => {
        const on = picked.includes(o.id);
        return (
          <button key={o.id} type="button" className={`sfp-pill${on ? ' is-on' : ''}`} role={field.type === 'single' ? 'radio' : 'checkbox'} aria-checked={on} onClick={() => toggle(o.id)}>
            <span>{o.label}</span>
            <span className="sfp-pill__tick" aria-hidden="true">{on ? '✓' : ''}</span>
          </button>
        );
      })}
    </div>
  );
}

function Upload({label, format}) {
  return (
    <div className="sfp-upload">
      <span className="sfp-upload__icon" aria-hidden="true">⤒</span>
      <span>{label}</span>
      <small>{format === 'video' ? 'MP4, MOV up to 50MB' : format === 'both' ? 'Images or one video' : 'JPEG, PNG up to 10MB'}</small>
    </div>
  );
}

function Field({field}) {
  const label = (
    <span className="sfp-label">
      {field.label || 'Untitled field'}
      {field.required ? <span className="sfp-req" aria-label="required"> *</span> : null}
    </span>
  );
  let control;
  if (field.type === 'single' || field.type === 'multi') control = <Pills field={field} />;
  else if (field.type === 'upload') control = <Upload label="Tap to upload" format={field.format} />;
  else if (field.type === 'paragraph') control = <textarea className="sfp-input" rows={3} placeholder={field.placeholder} aria-label={field.label} />;
  else if (field.type === 'date') control = <input className="sfp-input" type="date" aria-label={field.label} />;
  else
    control = (
      <div className="sfp-inputwrap">
        {field.prefix ? <span className="sfp-prefix">{field.prefix}</span> : null}
        <input
          className="sfp-input"
          type={field.type === 'number' ? 'text' : field.type === 'email' ? 'email' : 'text'}
          inputMode={field.type === 'number' ? 'decimal' : undefined}
          placeholder={field.placeholder}
          defaultValue={field.type === 'email' && field.prefill ? 'ava@example.com' : undefined}
          aria-label={field.label}
        />
      </div>
    );
  return (
    <label className="sfp-field" onClick={(e) => field.type === 'single' || field.type === 'multi' ? e.preventDefault() : null}>
      {label}
      {control}
    </label>
  );
}

/** version 'today': one text box + upload. 'new': the field list. */
export function FormPreview({version, fields}) {
  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack gap="200" blockAlign="center">
          <span style={{display: 'inline-flex'}}><Icon source={ViewIcon} tone="subdued" /></span>
          <Text as="h2" variant="headingSm">Preview</Text>
        </InlineStack>
        <div className="sfp">
          <div className="sfp-head">
            <strong>Bought elsewhere? Get points</strong>
            <span>Earn 200 points</span>
          </div>
          <form className="sfp-form" onSubmit={(e) => e.preventDefault()}>
            {version === 'today' ? (
              <>
                <label className="sfp-field">
                  <span className="sfp-label">{TODAY.inputLabel}</span>
                  <input className="sfp-input" placeholder={TODAY.inputPlaceholder} aria-label={TODAY.inputLabel} />
                </label>
                <Upload label={TODAY.uploadLabel} format="image" />
              </>
            ) : fields.length ? (
              fields.map((f) => <Field key={f.id} field={f} />)
            ) : (
              <p className="sfp-empty">Add a field to see the form.</p>
            )}
            <button type="submit" className="sfp-submit" disabled={version !== 'today' && !fields.length}>Submit</button>
          </form>
        </div>
      </BlockStack>
    </Card>
  );
}
