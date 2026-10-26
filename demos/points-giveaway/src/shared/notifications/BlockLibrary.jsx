// The "Add block" tab (spec 3.1): Structure, Content, Dynamic and a collapsed Variables section. Click adds (auto-selects and scrolls
// into view); drag adds at the drop point.
import React, {useState} from 'react';
import {Icon, Text} from '@shopify/polaris';
import {ChevronDownIcon, ChevronUpIcon, DragHandleIcon} from '@shopify/polaris-icons';
import {BLOCK_TYPES} from './blocks.js';
import {endDrag, startDrag} from './dnd.js';
import {insertTagAtCaret} from './richText.jsx';
import {VariableBody} from './VariablePicker.jsx';

function Tile({type, label, glyph, wide, onAdd}) {
  const meta = BLOCK_TYPES[type];
  const name = label || meta.name;
  return (
    <div
      className={`ee-tile${wide ? ' ee-tile--wide' : ''}`}
      role="button"
      tabIndex={0}
      draggable
      data-tile={type}
      aria-label={`Add ${name}`}
      title={`Drag or click to add ${name}`}
      onClick={() => onAdd(type)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onAdd(type);
        }
      }}
      onDragStart={(e) => startDrag(e, {kind: 'new', type}, name)}
      onDragEnd={endDrag}
    >
      <span className="ee-tile__grab" aria-hidden="true">
        <Icon source={DragHandleIcon} />
      </span>
      <span className="ee-tile__icon">{glyph || <Icon source={meta.icon} tone="subdued" />}</span>
      <span className="ee-tile__label">{name}</span>
    </div>
  );
}

const Glyph = ({cells}) => (
  <span className="ee-glyph" aria-hidden="true">
    {Array.from({length: cells}).map((_, i) => (
      <i key={i} />
    ))}
  </span>
);

function Fold({title, open, onToggle, children}) {
  return (
    <section className="ee-fold">
      <button type="button" className="ee-fold__head" aria-expanded={open} onMouseDown={(e) => e.preventDefault()} onClick={onToggle}>
        <Text as="span" variant="headingXs">
          {title}
        </Text>
        <Icon source={open ? ChevronUpIcon : ChevronDownIcon} tone="subdued" />
      </button>
      {open ? <div className="ee-fold__body">{children}</div> : null}
    </section>
  );
}

/** Insert a tag into whatever text field has the caret; with none, copy it. */
function insertIntoActive(tag) {
  const el = document.activeElement;
  if (el && el.closest && el.closest('.ee-var__search')) return 'none';
  if (el && el.isContentEditable) return insertTagAtCaret(tag) ? 'inserted' : 'none';
  if (el && /^(INPUT|TEXTAREA)$/.test(el.tagName) && !['checkbox', 'radio', 'number', 'color', 'range'].includes(el.type)) {
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? start;
    const text = `{{${tag}}}`;
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, el.value.slice(0, start) + text + el.value.slice(end));
    el.dispatchEvent(new Event('input', {bubbles: true}));
    el.setSelectionRange(start + text.length, start + text.length);
    return 'inserted';
  }
  return 'none';
}

export default function BlockLibrary({onAdd, emailId, values}) {
  const [open, setOpen] = useState({structure: true, content: true, dynamic: true, variables: false});
  const [note, setNote] = useState('');
  const flip = (k) => setOpen({...open, [k]: !open[k]});
  const pick = async (tag) => {
    if (insertIntoActive(tag) === 'inserted') {
      setNote('');
      return;
    }
    try {
      await navigator.clipboard.writeText(`{{${tag}}}`);
      setNote(`Copied {{${tag}}} ✓ — paste into a text field`);
    } catch (e) {
      setNote("Couldn't copy — focus a text field, then click to insert");
    }
    window.setTimeout(() => setNote(''), 1800);
  };
  return (
    <div className="ee-library">
      <Fold title="Structure" open={open.structure} onToggle={() => flip('structure')}>
        <div className="ee-tiles">
          <Tile type="section" glyph={<Glyph cells={1} />} onAdd={onAdd} />
          <Tile type="row" glyph={<Glyph cells={2} />} onAdd={onAdd} />
        </div>
      </Fold>
      <Fold title="Content" open={open.content} onToggle={() => flip('content')}>
        <div className="ee-tiles">
          {['text', 'callout', 'image', 'button', 'divider', 'spacer', 'footer', 'social'].map((t) => (
            <Tile key={t} type={t} onAdd={onAdd} />
          ))}
          <Tile type="html" wide onAdd={onAdd} />
        </div>
      </Fold>
      <Fold title="Dynamic (Joy)" open={open.dynamic} onToggle={() => flip('dynamic')}>
        <div className="ee-tiles">
          <Tile type="card" onAdd={onAdd} />
          <Tile type="product" onAdd={onAdd} />
        </div>
      </Fold>
      <Fold title="Variables" open={open.variables} onToggle={() => flip('variables')}>
        <VariableBody emailId={emailId} values={values} onPick={pick} />
        {note ? (
          <Text as="p" variant="bodySm" tone="subdued">
            {note}
          </Text>
        ) : null}
      </Fold>
    </div>
  );
}
