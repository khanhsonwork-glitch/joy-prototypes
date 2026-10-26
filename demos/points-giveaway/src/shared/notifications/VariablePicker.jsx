// The variable picker (spec 6.2): search + four sections (This email, Customer, Store, Links), each tag a row with its label and
// the sample it resolves to. Used by the toolbar button, the floating {} on text blocks, the {} suffix on fields and the
// Variables section of Add block.
import React, {useMemo, useState} from 'react';
import {Button, Popover, Text, TextField, Tooltip} from '@shopify/polaris';
import {SECTIONS, VARIABLES, appliesTo, labelFor} from './variables.js';

const shortSample = (value) => {
  const s = String(value ?? '');
  if (/^https?:\/\//.test(s)) {
    try {
      return new URL(s).pathname.replace(/^\//, '/') || s;
    } catch (e) {
      return s;
    }
  }
  return s;
};

/** Rows grouped by section; tags that do not apply to this email sort last, with the "not applicable" sample. */
export function VariableList({emailId, values, onPick, query = '', flat = false}) {
  const q = query.trim().toLowerCase();
  const groups = useMemo(
    () =>
      SECTIONS.map((name) => {
        const rows = VARIABLES.filter((v) => v.section === name)
          .filter((v) => !q || v.tag.toLowerCase().includes(q) || v.label.toLowerCase().includes(q))
          .map((v) => ({...v, label: labelFor(v, emailId), ok: appliesTo(v, emailId)}))
          .sort((a, b) => Number(b.ok) - Number(a.ok));
        return {name, rows};
      }).filter((g) => g.rows.length),
    [q, emailId],
  );
  if (!groups.length) return <div className="ee-var__empty">No matching variables</div>;
  return (
    <div className="ee-var__list">
      {groups.map((g) => (
        <div key={g.name} className="ee-var__group">
          {flat ? null : (
            <Text as="p" variant="headingXs" tone="subdued">
              {g.name}
            </Text>
          )}
          {g.rows.map((v) => (
            <button
              key={v.tag}
              type="button"
              className={`ee-var__row${v.ok ? '' : ' is-na'}`}
              title={`{{${v.tag}}}`}
              data-tag={v.tag}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onPick(v.tag)}
            >
              <span className="ee-var__label">{v.label}</span>
              <span className="ee-var__sample">{v.ok ? shortSample(values[v.tag]) : 'Not applicable to the current program'}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}

export function VariableBody({emailId, values, onPick, autoFocus = false}) {
  const [query, setQuery] = useState('');
  return (
    <div className="ee-var">
      <div className="ee-var__search">
        <TextField label="Search variables" labelHidden placeholder="Search variables…" value={query} onChange={setQuery} autoComplete="off" autoFocus={autoFocus} clearButton onClearButtonClick={() => setQuery('')} />
      </div>
      <VariableList emailId={emailId} values={values} onPick={onPick} query={query} />
    </div>
  );
}

/** activator = (toggle, active) => node. Picking closes the popover. */
export function VariablePopover({emailId, values, onPick, activator}) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((o) => !o);
  return (
    <Popover active={open} autofocusTarget="none" onClose={() => setOpen(false)} activator={activator(toggle, open)} preferredAlignment="left">
      <VariableBody
        emailId={emailId}
        values={values}
        onPick={(tag) => {
          setOpen(false);
          onPick(tag);
        }}
      />
    </Popover>
  );
}

/** The {} suffix of a TextField: inserts the bare tag at the field's caret. The field needs a stable `id`. */
export function VarSuffix({emailId, values, inputId, value, onChange}) {
  return (
    <VariablePopover
      emailId={emailId}
      values={values}
      onPick={(tag) => {
        const el = document.getElementById(inputId);
        const text = String(value ?? '');
        const start = el && typeof el.selectionStart === 'number' ? el.selectionStart : text.length;
        const end = el && typeof el.selectionEnd === 'number' ? el.selectionEnd : start;
        const insert = `{{${tag}}}`;
        onChange(text.slice(0, start) + insert + text.slice(end));
        window.setTimeout(() => {
          const field = document.getElementById(inputId);
          if (field) {
            field.focus();
            try {
              field.setSelectionRange(start + insert.length, start + insert.length);
            } catch (e) {
              /* number inputs have no selection */
            }
          }
        }, 0);
      }}
      activator={(toggle) => (
        <span onMouseDown={(e) => e.preventDefault()}>
          <Tooltip content="Insert variable">
            <Button size="micro" variant="tertiary" accessibilityLabel="Insert variable" onClick={toggle}>
              {'{}'}
            </Button>
          </Tooltip>
        </span>
      )}
    />
  );
}
