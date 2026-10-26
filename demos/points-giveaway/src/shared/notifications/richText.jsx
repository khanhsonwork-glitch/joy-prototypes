// Inline text editing for Text and Callout blocks (spec 2.2): a contentEditable on the canvas and the rich-text toolbar that takes
// over the toolbar band while one is selected. Formatting uses document.execCommand (fine for a prototype); the toolbar keeps the
// caret by preventing mousedown focus changes and by remembering the last selection inside the editable.
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {Button, ButtonGroup, Popover, Select, TextField, Tooltip} from '@shopify/polaris';
import {
  CodeAddIcon,
  LinkIcon,
  ListBulletedIcon,
  ListNumberedIcon,
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  TextBoldIcon,
  TextColorIcon,
  TextItalicIcon,
  TextQuoteIcon,
  TextUnderlineIcon,
  PaintBrushFlatIcon,
} from '@shopify/polaris-icons';
import {VariablePopover} from './VariablePicker.jsx';

/* ------------------------------------------------------------------ selection memory */

let saved = null;
const hostOf = (node) => (node ? (node.nodeType === 1 ? node : node.parentElement)?.closest?.('.ee-rich.is-editing') : null);

if (typeof document !== 'undefined' && !window.__eeSelectionWatch) {
  window.__eeSelectionWatch = true;
  document.addEventListener('selectionchange', () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    const host = hostOf(range.commonAncestorContainer);
    if (host) saved = {range: range.cloneRange(), host};
  });
}

export function restoreSelection() {
  if (!saved || !document.body.contains(saved.host)) return false;
  saved.host.focus();
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(saved.range);
  return true;
}
export const hasEditingHost = () => !!(saved && document.body.contains(saved.host));

export function exec(command, value = null) {
  if (!restoreSelection()) return false;
  document.execCommand('styleWithCSS', false, true);
  document.execCommand(command, false, value);
  return true;
}

/** Wrap the selection in a span with inline css (weight, case, letter spacing...). */
export function styleSelection(css) {
  if (!restoreSelection()) return false;
  const sel = window.getSelection();
  if (sel.isCollapsed) return false;
  const holder = document.createElement('div');
  holder.appendChild(sel.getRangeAt(0).cloneContents());
  document.execCommand('insertHTML', false, `<span style="${css}">${holder.innerHTML}</span>`);
  return true;
}

export function insertTagAtCaret(tag) {
  if (!restoreSelection()) return false;
  document.execCommand('insertText', false, `{{${tag}}}`);
  return true;
}

/* ------------------------------------------------------------------ the editable */

export function RichEditable({html, onChange, onUndo, onRedo}) {
  const ref = useRef(null);
  const last = useRef(html);

  useLayoutEffect(() => {
    const el = ref.current;
    el.innerHTML = html || '';
    last.current = html || '';
    document.execCommand('defaultParagraphSeparator', false, 'p');
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // the document changed under the editor (undo / redo / template): show the stored text
    if (ref.current && (html || '') !== last.current) {
      ref.current.innerHTML = html || '';
      last.current = html || '';
    }
  }, [html]);

  const emit = () => {
    const el = ref.current;
    let value = el.innerHTML;
    if (!el.textContent.trim() && !/<(img|hr)/.test(value)) value = '';
    last.current = value;
    onChange(value);
  };

  return (
    <div
      ref={ref}
      className="ee-rich is-editing"
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      data-ee-editable="true"
      onInput={emit}
      onPaste={(e) => {
        e.preventDefault();
        document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
      }}
      onKeyDown={(e) => {
        const mod = e.metaKey || e.ctrlKey;
        if (mod && e.key.toLowerCase() === 'z') {
          e.preventDefault();
          if (e.shiftKey) onRedo();
          else onUndo();
        }
        if (e.key === 'Escape') ref.current.blur();
      }}
    />
  );
}

/* ------------------------------------------------------------------ format state (pressed buttons) */

function useFormatState(active) {
  const [state, setState] = useState({});
  useEffect(() => {
    if (!active) return undefined;
    const read = () => {
      if (!hasEditingHost()) return;
      try {
        const sel = window.getSelection();
        const el = sel && sel.anchorNode ? (sel.anchorNode.nodeType === 1 ? sel.anchorNode : sel.anchorNode.parentElement) : null;
        const size = el && hostOf(el) ? Math.round(parseFloat(window.getComputedStyle(el).fontSize)) : '';
        setState({
          bold: document.queryCommandState('bold'),
          italic: document.queryCommandState('italic'),
          underline: document.queryCommandState('underline'),
          strike: document.queryCommandState('strikeThrough'),
          ul: document.queryCommandState('insertUnorderedList'),
          ol: document.queryCommandState('insertOrderedList'),
          left: document.queryCommandState('justifyLeft'),
          center: document.queryCommandState('justifyCenter'),
          right: document.queryCommandState('justifyRight'),
          full: document.queryCommandState('justifyFull'),
          block: String(document.queryCommandValue('formatBlock') || '').toLowerCase(),
          size,
        });
      } catch (e) {
        /* queryCommandState throws when nothing is focused: keep the last state */
      }
    };
    document.addEventListener('selectionchange', read);
    read();
    return () => document.removeEventListener('selectionchange', read);
  }, [active]);
  return state;
}

/* ------------------------------------------------------------------ toolbar */

const FONTS = {
  safe: ['Arial', 'Helvetica', 'Georgia', 'Times New Roman', 'Verdana', 'Tahoma', 'Courier New'],
  web: ['Inter', 'Nunito', 'Poppins', 'Cormorant Garamond', 'Nunito Sans', 'Playfair Display', 'EB Garamond', 'Montserrat', 'Space Grotesk', 'Space Mono'],
};
const FONT_OPTIONS = [
  {label: 'Default font', value: ''},
  {title: 'Email-safe', options: FONTS.safe.map((f) => ({label: f, value: f}))},
  {title: 'Web fonts — may fall back in some clients', options: FONTS.web.map((f) => ({label: f, value: f}))},
];
const BLOCK_OPTIONS = [
  {label: 'Body', value: 'p'},
  {label: 'Heading 1', value: 'h1'},
  {label: 'Heading 2', value: 'h2'},
  {label: 'Heading 3', value: 'h3'},
];
const SWATCHES = ['#3b1f2b', '#fae13f', '#f19ea6', '#fbcac3', '#5b7a4a', '#b5303f', '#ffffff', '#000000', '#6b4a58'];
const EMOJI = ['😊', '👍', '🎉', '💛', '🌿', '✨', '🙌', '🍊', '💌', '🎁'];

const Tip = ({label, children}) => <Tooltip content={label}>{children}</Tooltip>;

function ColorPop({label, icon, command, clearLabel}) {
  const [open, setOpen] = useState(false);
  const [hex, setHex] = useState('');
  const apply = (value) => {
    exec(command, value);
    setOpen(false);
  };
  return (
    <Popover
      active={open}
      autofocusTarget="none"
      onClose={() => setOpen(false)}
      activator={
        <Tip label={label}>
          <Button size="slim" icon={icon} accessibilityLabel={label} onClick={() => setOpen(!open)} />
        </Tip>
      }
    >
      <div className="ee-pop ee-pop--swatches">
        <div className="ee-swatchrow">
          {SWATCHES.map((c) => (
            <button key={c} type="button" className="ee-swatch" style={{background: c}} aria-label={`${label} ${c}`} onClick={() => apply(c)} />
          ))}
        </div>
        <TextField
          label="Hex"
          labelHidden
          placeholder="#RRGGBB"
          value={hex}
          onChange={setHex}
          autoComplete="off"
          connectedRight={
            <Button size="slim" disabled={!/^#[0-9a-f]{6}$/i.test(hex)} onClick={() => apply(hex)}>
              Apply
            </Button>
          }
        />
        <Button variant="plain" tone="critical" onClick={() => apply(command === 'foreColor' ? '#3b1f2b' : 'transparent')}>
          {clearLabel}
        </Button>
      </div>
    </Popover>
  );
}

function LinkPop() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  return (
    <Popover
      active={open}
      autofocusTarget="none"
      onClose={() => setOpen(false)}
      activator={
        <Tip label="Link">
          <Button size="slim" icon={LinkIcon} accessibilityLabel="Link" onClick={() => setOpen(!open)} />
        </Tip>
      }
    >
      <div className="ee-pop">
        <TextField
          label="Link URL"
          value={url}
          onChange={setUrl}
          autoComplete="off"
          placeholder="https://example.com or {{merge_tag}}"
          helpText="Supports merge-tags, e.g. {{reward_url}}"
        />
        <div className="ee-pop__actions">
          <Button
            variant="primary"
            size="slim"
            disabled={!url.trim()}
            onClick={() => {
              exec('createLink', url.trim());
              setOpen(false);
            }}
          >
            Apply
          </Button>
          <Button
            size="slim"
            onClick={() => {
              exec('unlink');
              setOpen(false);
            }}
          >
            Remove
          </Button>
          <Button size="slim" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </div>
    </Popover>
  );
}

function EmojiPop() {
  const [open, setOpen] = useState(false);
  return (
    <Popover
      active={open}
      autofocusTarget="none"
      onClose={() => setOpen(false)}
      activator={
        <Tip label="Emoji">
          <Button size="slim" accessibilityLabel="Emoji" onClick={() => setOpen(!open)}>
            😊
          </Button>
        </Tip>
      }
    >
      <div className="ee-pop ee-emoji">
        {EMOJI.map((e) => (
          <button
            key={e}
            type="button"
            className="ee-emoji__btn"
            onClick={() => {
              restoreSelection();
              document.execCommand('insertText', false, e);
              setOpen(false);
            }}
          >
            {e}
          </button>
        ))}
      </div>
    </Popover>
  );
}

function MorePop() {
  const [open, setOpen] = useState(false);
  const [lineHeight, setLineHeight] = useState('');
  const [spacing, setSpacing] = useState('');
  const [weight, setWeight] = useState('400');
  const [upper, setUpper] = useState(false);
  return (
    <Popover
      active={open}
      autofocusTarget="none"
      onClose={() => setOpen(false)}
      activator={
        <Button size="slim" disclosure onClick={() => setOpen(!open)}>
          More
        </Button>
      }
    >
      <div className="ee-pop ee-pop--more">
        <Select
          label="Weight"
          options={[
            {label: 'Normal', value: '400'},
            {label: 'Medium', value: '500'},
            {label: 'Semibold', value: '600'},
            {label: 'Bold', value: '700'},
            {label: 'Extra-bold', value: '800'},
          ]}
          value={weight}
          onChange={(v) => {
            setWeight(v);
            styleSelection(`font-weight:${v}`);
          }}
        />
        <ButtonGroup variant="segmented" fullWidth>
          <Button
            pressed={!upper}
            onClick={() => {
              setUpper(false);
              styleSelection('text-transform:none');
            }}
          >
            Normal
          </Button>
          <Button
            pressed={upper}
            onClick={() => {
              setUpper(true);
              styleSelection('text-transform:uppercase');
            }}
          >
            UPPERCASE
          </Button>
        </ButtonGroup>
        <TextField
          label="Letter spacing"
          value={spacing}
          placeholder="px"
          autoComplete="off"
          onChange={(v) => {
            setSpacing(v);
            if (v !== '' && !Number.isNaN(Number(v))) styleSelection(`letter-spacing:${v}px`);
          }}
        />
        <TextField label="Line height" value={lineHeight} placeholder="1.5 or 37px" autoComplete="off" onChange={setLineHeight} helpText="Applies to the whole block (set it in Properties)." />
      </div>
    </Popover>
  );
}

/**
 * The rich-text toolbar (spec 2.2). `emailId`/`values` feed the variable picker.
 * It replaces the toolbar band's centre and right content while a Text or Callout is selected.
 */
export function RichToolbar({emailId, values}) {
  const f = useFormatState(true);
  const [size, setSize] = useState('');
  useEffect(() => setSize(f.size ? String(f.size) : ''), [f.size]);

  const applySize = (v) => {
    setSize(v);
    const n = Number(v);
    if (!n || n < 8 || n > 72) return;
    if (!restoreSelection()) return;
    document.execCommand('styleWithCSS', false, false);
    document.execCommand('fontSize', false, '7');
    const host = saved && saved.host;
    if (host) host.querySelectorAll('font[size="7"]').forEach((node) => {
      const span = document.createElement('span');
      span.style.fontSize = `${n}px`;
      span.innerHTML = node.innerHTML;
      node.replaceWith(span);
    });
    host?.dispatchEvent(new Event('input', {bubbles: true}));
  };

  return (
    <div
      className="ee-rich-toolbar"
      role="toolbar"
      aria-label="Text formatting"
      onMouseDown={(e) => {
        // keep the caret in the text: only fields and native selects may take focus
        if (!e.target.closest('input, textarea, select')) e.preventDefault();
      }}
    >
      <div className="ee-rt__select">
        <Select
          label="Text style"
          labelHidden
          options={BLOCK_OPTIONS}
          value={BLOCK_OPTIONS.some((o) => o.value === f.block) ? f.block : 'p'}
          onChange={(v) => exec('formatBlock', v)}
        />
      </div>
      <ButtonGroup variant="segmented">
        <Tip label="Bold"><Button size="slim" icon={TextBoldIcon} pressed={!!f.bold} accessibilityLabel="Bold" onClick={() => exec('bold')} /></Tip>
        <Tip label="Italic"><Button size="slim" icon={TextItalicIcon} pressed={!!f.italic} accessibilityLabel="Italic" onClick={() => exec('italic')} /></Tip>
        <Tip label="Underline"><Button size="slim" icon={TextUnderlineIcon} pressed={!!f.underline} accessibilityLabel="Underline" onClick={() => exec('underline')} /></Tip>
        <Tip label="Strikethrough"><Button size="slim" pressed={!!f.strike} accessibilityLabel="Strikethrough" onClick={() => exec('strikeThrough')}><s>S</s></Button></Tip>
      </ButtonGroup>
      <ButtonGroup variant="segmented">
        <Tip label="Bullet list"><Button size="slim" icon={ListBulletedIcon} pressed={!!f.ul} accessibilityLabel="Bullet list" onClick={() => exec('insertUnorderedList')} /></Tip>
        <Tip label="Numbered list"><Button size="slim" icon={ListNumberedIcon} pressed={!!f.ol} accessibilityLabel="Numbered list" onClick={() => exec('insertOrderedList')} /></Tip>
        <Tip label="Quote"><Button size="slim" icon={TextQuoteIcon} pressed={f.block === 'blockquote'} accessibilityLabel="Quote" onClick={() => exec('formatBlock', f.block === 'blockquote' ? 'p' : 'blockquote')} /></Tip>
      </ButtonGroup>
      <ButtonGroup variant="segmented">
        <Tip label="Align left"><Button size="slim" icon={TextAlignLeftIcon} pressed={!!f.left} accessibilityLabel="Align left" onClick={() => exec('justifyLeft')} /></Tip>
        <Tip label="Align center"><Button size="slim" icon={TextAlignCenterIcon} pressed={!!f.center} accessibilityLabel="Align center" onClick={() => exec('justifyCenter')} /></Tip>
        <Tip label="Align right"><Button size="slim" icon={TextAlignRightIcon} pressed={!!f.right} accessibilityLabel="Align right" onClick={() => exec('justifyRight')} /></Tip>
        <Tip label="Justify"><Button size="slim" pressed={!!f.full} accessibilityLabel="Justify" onClick={() => exec('justifyFull')}>≡</Button></Tip>
      </ButtonGroup>
      <LinkPop />
      <VariablePopover
        emailId={emailId}
        values={values}
        onPick={(tag) => insertTagAtCaret(tag)}
        activator={(toggle) => (
          <Tip label="Insert variable">
            <Button size="slim" icon={CodeAddIcon} accessibilityLabel="Insert variable" onClick={toggle} />
          </Tip>
        )}
      />
      <EmojiPop />
      <ColorPop label="Text color" icon={TextColorIcon} command="foreColor" clearLabel="Clear color" />
      <ColorPop label="Highlight" icon={PaintBrushFlatIcon} command="hiliteColor" clearLabel="Clear highlight" />
      <div className="ee-rt__select ee-rt__select--font">
        <Select label="Font" labelHidden options={FONT_OPTIONS} value="" onChange={(v) => (v ? exec('fontName', v) : exec('removeFormat'))} />
      </div>
      <div className="ee-rt__size">
        <TextField label="Size" labelHidden placeholder="Size" value={size} onChange={applySize} autoComplete="off" type="number" min={8} max={72} />
      </div>
      <Button size="slim" accessibilityLabel="Clear formatting" onClick={() => exec('removeFormat')}>
        Clear formatting
      </Button>
      <MorePop />
    </div>
  );
}
