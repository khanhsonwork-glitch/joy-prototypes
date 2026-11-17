// Right column: preview toolbar (Preview as, Inspect, embed badge) over a mock storefront with the widget on it.
import React, {useState} from 'react';
import {ActionList, Badge, Button, Icon, Popover} from '@shopify/polaris';
import {CheckIcon, ChevronDownIcon, DesktopIcon, MobileIcon, PersonExitIcon, PersonIcon, SearchIcon} from '@shopify/polaris-icons';
import {VIEWERS, viewerLabel} from '../data/widget.js';
import {useEditor} from '../state/editor.jsx';
import {useShell} from '../shell/ShellContext.jsx';
import {Widget} from './Widget.jsx';
import {cx} from './bits.jsx';

const PRODUCTS = [
  {title: 'Cloud Cream', price: '$24.00', tone: 'pink'},
  {title: 'Night Notes serum', price: '$34.00', tone: 'yellow'},
  {title: 'Glow Getter set', price: '$52.00', tone: 'cream'},
  {title: 'Sun Day SPF', price: '$22.00', tone: 'yellow'},
  {title: 'Pomelo Peel mask', price: '$29.00', tone: 'pink'},
  {title: 'Barrier balm', price: '$19.00', tone: 'cream'},
];

function Toolbar() {
  const ed = useEditor();
  const [open, setOpen] = useState(false);
  const mark = (on) => (on ? <Icon source={CheckIcon} /> : null);
  const DeviceIcon = ed.device === 'mobile' ? MobileIcon : DesktopIcon;
  return (
    <div className="we-toolbar">
      <Popover
        active={open}
        onClose={() => setOpen(false)}
        preferredAlignment="left"
        activator={
          <button type="button" className="we-previewbtn" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            <span>Preview as ·</span>
            <Icon source={DeviceIcon} />
            <span>{ed.device === 'mobile' ? 'Mobile' : 'Desktop'}</span>
            <span aria-hidden="true">·</span>
            <Icon source={ed.viewer === 'guest' ? PersonExitIcon : PersonIcon} />
            <span data-testid="viewer-label">{viewerLabel(ed.viewer)}</span>
            <Icon source={ChevronDownIcon} />
          </button>
        }
      >
        <ActionList
          actionRole="menuitemradio"
          sections={[
            {
              title: 'Device',
              items: [
                {content: 'Desktop', icon: DesktopIcon, active: ed.device === 'desktop', suffix: mark(ed.device === 'desktop'), onAction: () => {ed.setDevice('desktop'); setOpen(false);}},
                {content: 'Mobile', icon: MobileIcon, active: ed.device === 'mobile', suffix: mark(ed.device === 'mobile'), onAction: () => {ed.setDevice('mobile'); setOpen(false);}},
              ],
            },
            {
              title: 'Customer',
              items: VIEWERS.map((v) => ({
                content: v.label,
                icon: v.value === 'guest' ? PersonExitIcon : PersonIcon,
                active: ed.viewer === v.value,
                suffix: mark(ed.viewer === v.value),
                onAction: () => {
                  ed.setViewer(v.value);
                  setOpen(false);
                },
              })),
            },
          ]}
        />
      </Popover>
      <Button icon={SearchIcon} pressed={ed.inspect} onClick={() => ed.setInspect(!ed.inspect)}>
        Inspect
      </Button>
      <Badge tone="success">Embed active</Badge>
    </div>
  );
}

function Storefront({children}) {
  return (
    <div className="we-store">
      <div className="we-store__chrome">
        <span className="we-store__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="we-store__url">store.example</span>
      </div>
      <div className="we-store__nav">
        <strong>YOUR STORE</strong>
        <span className="we-store__links">
          <span>Home</span>
          <span>Shop</span>
          <span>About</span>
        </span>
      </div>
      <div className="we-store__content">
        <div className="we-store__hero">
          <strong>New arrivals</strong>
          <span>Explore our latest collection</span>
        </div>
        <div className="we-store__grid">
          {PRODUCTS.map((p) => (
            <div key={p.title} className="we-store__product">
              <span className={cx('we-store__img', `is-${p.tone}`)} />
              <strong>{p.title}</strong>
              <small>{p.price}</small>
            </div>
          ))}
        </div>
      </div>
      {children}
    </div>
  );
}

export function Preview({onInspect}) {
  const ed = useEditor();
  const {notify} = useShell();
  const onLink = (block) => notify(`Opens ${block.url} ${block.external === false ? 'in the same tab' : 'in a new tab'}`);
  return (
    <div className="we-preview">
      <Toolbar />
      <div className={cx('we-stage', ed.device === 'mobile' && 'is-mobile', ed.inspect && 'is-inspecting')}>
        <Storefront>
          <Widget
            sections={ed.sections}
            membership={ed.membership}
            programs={ed.programs}
            viewer={ed.viewer}
            inspect={ed.inspect}
            onInspect={onInspect}
            onLink={onLink}
            onJoin={() => ed.setViewer('member')}
            onSignIn={() => ed.setViewer('signed-in')}
          />
        </Storefront>
      </div>
    </div>
  );
}
