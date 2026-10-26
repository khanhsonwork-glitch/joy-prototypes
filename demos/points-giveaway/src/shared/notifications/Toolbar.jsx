// The toolbar band (spec 2.2). Left: Undo / Redo, "?" shortcuts, Start from a template. Centre: Desktop | Mobile. Right: Preview as,
// HTML, Preview & test. While a Text or Callout is selected the rich-text toolbar takes over the band. Narrow (< 900 px):
// everything but the Desktop / Mobile toggle loses its text, and the two panes become drawers opened from here.
import React, {useMemo, useState} from 'react';
import {Avatar, Button, ButtonGroup, Popover, Text, TextField, Tooltip} from '@shopify/polaris';
import {
  CodeIcon,
  DesktopIcon,
  LayoutColumns2Icon,
  MenuIcon,
  MobileIcon,
  PersonIcon,
  QuestionCircleIcon,
  RedoIcon,
  SettingsIcon,
  UndoIcon,
  ViewIcon,
} from '@shopify/polaris-icons';
import {RichToolbar} from './richText.jsx';
import {initials} from './variables.js';
import {useEmailHost} from './host.js';

const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);
const MOD = isMac ? '⌘' : 'Ctrl';

function Shortcuts() {
  const [open, setOpen] = useState(false);
  const rows = [
    ['Undo', `${MOD} Z`],
    ['Redo', `${MOD} ⇧ Z`],
    ['Duplicate block', `${MOD} D`],
    ['Delete block', 'Delete'],
    ['Deselect', 'Esc'],
  ];
  return (
    <Popover
      active={open}
      onClose={() => setOpen(false)}
      activator={
        <Tooltip content="Keyboard shortcuts">
          <Button size="slim" icon={QuestionCircleIcon} accessibilityLabel="Keyboard shortcuts" onClick={() => setOpen(!open)} />
        </Tooltip>
      }
    >
      <div className="ee-pop ee-shortcuts">
        <Text as="h3" variant="headingSm">
          Keyboard shortcuts
        </Text>
        {rows.map(([name, keys]) => (
          <div key={name} className="ee-shortcuts__row">
            <span>{name}</span>
            <kbd>{keys}</kbd>
          </div>
        ))}
      </div>
    </Popover>
  );
}

function PreviewAs({customer, onPick, narrow}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const {members} = useEmailHost();
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return members.filter((m) => !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)).slice(0, 10);
  }, [query, members]);
  const label = `Preview as: ${customer ? customer.name : 'Sample data'}`;
  return (
    <Popover
      active={open}
      onClose={() => setOpen(false)}
      preferredAlignment="right"
      activator={
        <Tooltip content={label}>
          <Button size="slim" icon={PersonIcon} disclosure={narrow ? undefined : 'down'} pressed={!!customer} accessibilityLabel={label} onClick={() => setOpen(!open)}>
            {narrow ? undefined : label}
          </Button>
        </Tooltip>
      }
    >
      <div className="ee-pop ee-previewas">
        <TextField label="Preview as customer" value={query} onChange={setQuery} placeholder="Search customers" autoComplete="off" clearButton onClearButtonClick={() => setQuery('')} />
        <div className="ee-previewas__list" role="listbox" aria-label="Customers">
          {results.length === 0 ? <div className="ee-var__empty">No customers found</div> : null}
          {results.map((m) => (
            <button
              key={m.id}
              type="button"
              role="option"
              aria-selected={customer?.id === m.id}
              className={`ee-previewas__row${customer?.id === m.id ? ' is-selected' : ''}`}
              onClick={() => {
                onPick(m);
                setOpen(false);
              }}
            >
              <Avatar size="xs" initials={initials(m.name)} name={m.name} />
              <span className="ee-previewas__who">
                <span>{m.name}</span>
                <span>{m.email}</span>
              </span>
            </button>
          ))}
        </div>
        {customer ? (
          <Button
            variant="tertiary"
            onClick={() => {
              onPick(null);
              setOpen(false);
            }}
          >
            Use sample data
          </Button>
        ) : null}
      </div>
    </Popover>
  );
}

export default function Toolbar({size, rich, ed, device, setDevice, customer, setCustomer, emailId, values, onTemplate, onHtml, onPreview, onOpenLeft, onOpenRight}) {
  const narrow = size === 'narrow';
  const text = (label) => (narrow ? undefined : label);
  const toggleDevice = (
    <ButtonGroup variant="segmented">
      <Button size="slim" pressed={device === 'desktop'} icon={DesktopIcon} onClick={() => setDevice('desktop')} accessibilityLabel="Desktop">
        {text('Desktop')}
      </Button>
      <Button size="slim" pressed={device === 'mobile'} icon={MobileIcon} onClick={() => setDevice('mobile')} accessibilityLabel="Mobile">
        {text('Mobile')}
      </Button>
    </ButtonGroup>
  );

  if (rich) {
    return (
      <div className="ee-toolbar ee-toolbar--rich" data-size={size}>
        {narrow ? (
          <Button size="slim" icon={MenuIcon} accessibilityLabel="Open structure (layer tree)" onClick={onOpenLeft} />
        ) : null}
        <RichToolbar emailId={emailId} values={values} />
        {narrow ? <Button size="slim" icon={SettingsIcon} accessibilityLabel="Open blocks & properties" onClick={onOpenRight} /> : null}
      </div>
    );
  }

  return (
    <div className="ee-toolbar" data-size={size}>
      <div className="ee-toolbar__left">
        {narrow ? <Button size="slim" icon={MenuIcon} accessibilityLabel="Open structure (layer tree)" onClick={onOpenLeft} /> : null}
        <ButtonGroup variant="segmented">
          <Tooltip content="Undo">
            <Button size="slim" icon={UndoIcon} disabled={!ed.canUndo} accessibilityLabel="Undo" onClick={ed.undo} />
          </Tooltip>
          <Tooltip content="Redo">
            <Button size="slim" icon={RedoIcon} disabled={!ed.canRedo} accessibilityLabel="Redo" onClick={ed.redo} />
          </Tooltip>
        </ButtonGroup>
        <Shortcuts />
        <Button size="slim" icon={LayoutColumns2Icon} accessibilityLabel="Start from a template" onClick={onTemplate}>
          {text('Start from a template')}
        </Button>
      </div>
      <div className="ee-toolbar__center">{toggleDevice}</div>
      <div className="ee-toolbar__right">
        <PreviewAs customer={customer} onPick={setCustomer} narrow={narrow} />
        <Button size="slim" icon={CodeIcon} accessibilityLabel="HTML" onClick={onHtml}>
          {text('HTML')}
        </Button>
        <Button size="slim" icon={ViewIcon} accessibilityLabel="Preview & test" onClick={onPreview}>
          {text('Preview & test')}
        </Button>
        {narrow ? <Button size="slim" icon={SettingsIcon} accessibilityLabel="Open blocks & properties" onClick={onOpenRight} /> : null}
      </div>
    </div>
  );
}
