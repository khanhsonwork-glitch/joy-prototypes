// Shopify's new admin frame around the demo. The app content remains Polaris React.
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {Button, Icon} from '@shopify/polaris';
import {ChartVerticalIcon, ChevronLeftIcon, ChevronRightIcon, ContentIcon, DiscountIcon, FinanceIcon, GlobeIcon, HomeIcon, MenuHorizontalIcon, MenuIcon, NotificationIcon, OrderIcon, PersonIcon, PointOfSaleIcon, ProductIcon, SearchIcon, SettingsIcon, SidekickIcon, StoreOnlineIcon, TargetIcon, PlusIcon, MicrophoneIcon, MagicIcon} from '@shopify/polaris-icons';
import {STORE} from '../data/index.js';
import {DEMO} from '../demo.config.js';
import {JoyIcon, ShopifyWordmark} from './icons.jsx';
import {HashLink, useRoute} from './router.jsx';
import {useShell} from './ShellContext.jsx';

const cx = (...parts) => parts.filter(Boolean).join(' ');
const APP_NAME = DEMO.product === 'wishlist' ? 'Joy: Wishlist' : 'Joy: Loyalty Program';
const DEFAULT_APP_MENU = [
  {id: 'customers', label: 'Customers'},
  {id: 'rewards', label: 'Reward programs', href: '#/demo', routes: ['demo']},
  {id: 'membership', label: 'Membership'},
  {id: 'onsite', label: 'On-site content'},
  {id: 'analytics', label: 'Analytics'},
  {id: 'integrations', label: 'Integrations'},
  {id: 'more', label: 'View more'},
];
const APP_MENU = DEMO.menu ?? DEFAULT_APP_MENU;

function NavRow({icon, label, badge, selected, href, onClick, app}) {
  const body = <>
    <span className="adm-nav__icon">{app || <Icon source={icon} />}</span>
    <span className="adm-nav__label">{label}</span>
    {badge && <span className="adm-nav__badge">{badge}</span>}
  </>;
  const props = {className: cx('adm-nav__row', selected && 'is-selected'), onClick, 'aria-current': selected ? 'page' : undefined};
  return href ? <a href={href} {...props}>{body}</a> : <button type="button" {...props}>{body}</button>;
}

function NavSection({label, onClick}) {
  return <button type="button" className="adm-nav__section" onClick={onClick}>
    {label} <Icon source={ChevronRightIcon} />
  </button>;
}

function Navigation({open, onClose}) {
  const route = useRoute();
  const {notYet} = useShell();
  const selected = APP_MENU.findIndex(item => item.routes?.includes(route.segments[0]));
  const stub = () => {notYet(); onClose();};
  return <>
    {open && <div className="adm-scrim" onClick={onClose} aria-hidden="true" />}
    <nav className={cx('adm-nav', open && 'is-open')} aria-label="Main">
      <div className="adm-nav__brand">
        <ShopifyWordmark />
        <button type="button" className="adm-nav__collapse" aria-label="Collapse navigation" onClick={stub}><SidebarToggle /></button>
      </div>
      <button type="button" className="adm-search" onClick={stub} aria-label="Search">
        <Icon source={SearchIcon} /><span>Search</span><kbd>⌘K</kbd>
      </button>
      <div className="adm-nav__scroll">
        <div className="adm-nav__group">
          <NavRow icon={HomeIcon} label="Home" onClick={stub} />
          <NavRow icon={OrderIcon} label="Orders" badge="206" onClick={stub} />
          <NavRow icon={ProductIcon} label="Products" onClick={stub} />
          <NavRow icon={PersonIcon} label="Customers" onClick={stub} />
          <NavRow icon={TargetIcon} label="Growth" onClick={stub} />
          <NavRow icon={DiscountIcon} label="Discounts" onClick={stub} />
          <NavRow icon={ContentIcon} label="Content" onClick={stub} />
          <NavRow icon={GlobeIcon} label="Markets" onClick={stub} />
          <NavRow icon={FinanceIcon} label="Finance" onClick={stub} />
          <NavRow icon={ChartVerticalIcon} label="Analytics" onClick={stub} />
        </div>
        <div className="adm-nav__group">
          <NavSection label="Sales channels" onClick={stub} />
          <NavRow icon={StoreOnlineIcon} label="Online Store" onClick={stub} />
          <NavRow icon={PointOfSaleIcon} label="Point of Sale" onClick={stub} />
        </div>
        <div className="adm-nav__group">
          <NavSection label="Apps" onClick={stub} />
          <NavRow app={<JoyIcon size={18} tone="grey" />} label={APP_NAME} href="#/demo" onClick={onClose} />
          <div className="adm-sub">
            {APP_MENU.map((item, index) => <a key={item.id} href={item.href || '#'}
              className={cx('adm-sub__item', index === selected && 'is-selected')}
              aria-current={index === selected ? 'page' : undefined}
              onClick={event => {if (!item.href) {event.preventDefault(); stub();} else onClose();}}>{item.label}</a>)}
          </div>
        </div>
      </div>
      <div className="adm-nav__footer">
        <NavRow icon={SettingsIcon} label="Settings" onClick={stub} />
        <button type="button" className="adm-store" aria-label={`${STORE.name} store menu`} onClick={stub}>
          <span className="adm-store__avatar">PP</span><span className="adm-store__name">{STORE.name}</span><span className="adm-store__pill">dev</span>
          <Icon source={NotificationIcon} />
        </button>
      </div>
    </nav>
  </>;
}

function AppTitleBar({onMenu}) {
  const route = useRoute();
  const {notYet, saveBar} = useShell();
  const title = DEMO.titleFor ? DEMO.titleFor(route.segments)
    : route.segments[0] === 'kit' ? 'Components and tokens'
      : route.segments.length > 1 ? (DEMO.detailTitle ?? 'Reward details')
        : (DEMO.pageTitle ?? (DEMO.name === 'Starter kit' ? 'Rewards' : DEMO.name));
  const back = DEMO.backFor ? DEMO.backFor(route.segments) : '/demo';
  const crumb = DEMO.crumbFor && back ? DEMO.crumbFor(route.segments) : null;
  // Unsaved changes: the admin swaps the title bar for its save bar (Discard · Save), as the embedded app's
  // contextual save bar does on Settings and Translations.
  if (saveBar) {
    return <div className="adm-appbar adm-savebar" role="region" aria-label="Unsaved changes">
      <button type="button" className="adm-appbar__menu" aria-label="Open navigation" onClick={onMenu}><Icon source={MenuIcon} /></button>
      <span className="adm-savebar__msg">Unsaved changes</span>
      <span className="adm-savebar__actions">
        <Button onClick={saveBar.onDiscard} disabled={saveBar.saving}>Discard</Button>
        <Button variant="primary" onClick={saveBar.onSave} loading={saveBar.saving} disabled={saveBar.disabled}>Save</Button>
      </span>
    </div>;
  }
  return <div className="adm-appbar">
    <button type="button" className="adm-appbar__menu" aria-label="Open navigation" onClick={onMenu}><Icon source={MenuIcon} /></button>
    <HashLink className="adm-appbar__back" url={back || '/demo'} aria-label="Back"><Icon source={ChevronLeftIcon} /></HashLink>
    <JoyIcon size={18} /> <span className="adm-appbar__divider">/</span>
    {crumb ? <><HashLink className="adm-appbar__crumb" url={back}>{crumb}</HashLink><span className="adm-appbar__divider">/</span></> : null}
    <span className="adm-appbar__title">{title}</span>
    <button type="button" className="adm-appbar__more" aria-label="More" onClick={notYet}><Icon source={MenuHorizontalIcon} /></button>
  </div>;
}

function SidebarToggle({side = 'left'}) {
  // Real admin: a rounded square with a pane line (nav collapse on the left, Sidekick panel on the right).
  const x = side === 'left' ? 7.5 : 12.5;
  return <svg viewBox="0 0 20 20" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <rect x="3.5" y="4" width="13" height="12" rx="3" /><path d={`M${x} 4.5v11`} />
  </svg>;
}

function VoiceWave() {
  // Polaris icons has no waveform glyph; the real bar shows four rounded bars (admin screenshot 18/11/2026).
  return <svg viewBox="0 0 20 20" width="18" height="18" fill="#4a4a4a">
    <rect x="4" y="7" width="1.6" height="6" rx=".8" /><rect x="7.6" y="4" width="1.6" height="12" rx=".8" />
    <rect x="11.2" y="6" width="1.6" height="8" rx=".8" /><rect x="14.8" y="8" width="1.6" height="4" rx=".8" />
  </svg>;
}

function SidekickFace() {
  return <svg viewBox="0 0 20 20" width="20" height="20">
    <circle cx="10" cy="10.5" r="7.6" fill="#fff" stroke="#2b1b6b" strokeWidth="1.3" />
    <path d="M2.8 9.2C3.2 4.6 6.4 2.6 10 2.6s6.9 2 7.2 6.6c-1.6-1.9-3.6-2.6-5.3-2.4L10 8.3 8.4 6.9C6.3 6.8 4.4 7.6 2.8 9.2Z" fill="#2b1b6b" />
    <rect x="3.6" y="9" width="5.4" height="3.6" rx="1.8" fill="#ede7ff" stroke="#6b3cf5" strokeWidth="1.3" />
    <rect x="11" y="9" width="5.4" height="3.6" rx="1.8" fill="#ede7ff" stroke="#6b3cf5" strokeWidth="1.3" />
    <path d="M9 10.6h2" stroke="#6b3cf5" strokeWidth="1.3" />
    <circle cx="6.3" cy="10.8" r=".75" fill="#2b1b6b" /><circle cx="13.7" cy="10.8" r=".75" fill="#2b1b6b" />
    <path d="M9.2 15.1c.5.3 1.1.3 1.6 0" stroke="#2b1b6b" strokeWidth="1" strokeLinecap="round" fill="none" />
  </svg>;
}

function SidekickButton() {
  const {notYet} = useShell();
  // Real bar (admin screenshot 18/11/2026): face icon, grey placeholder, then + · mic · voice, a hairline, sidebar toggle.
  return <button type="button" className="adm-sidekick" onClick={notYet} aria-label="Work with Sidekick">
    <span className="adm-sidekick__face" aria-hidden="true"><SidekickFace /></span>
    <span className="adm-sidekick__text">Work with Sidekick</span>
    <span className="adm-sidekick__tools" aria-hidden="true">
      <Icon source={PlusIcon} /><Icon source={MicrophoneIcon} /><span className="adm-sidekick__wave"><VoiceWave /></span>
      <span className="adm-sidekick__sep" /><SidebarToggle side="right" />
    </span>
  </button>;
}

function JoyAiButton() {
  const {notYet} = useShell();
  return <button type="button" className="adm-joy-ai" aria-label="Open Joy AI agent" onClick={notYet}><Icon source={MagicIcon} /></button>;
}

export function AdminChrome({children}) {
  const [navOpen, setNavOpen] = useState(false);
  const route = useRoute();
  const content = useRef(null);
  useLayoutEffect(() => {content.current?.scrollTo(0, 0);}, [route.path]);
  useEffect(() => setNavOpen(false), [route.path]);
  useEffect(() => {
    if (!navOpen) return undefined;
    const onKey = event => {
      if (event.key === 'Escape') {setNavOpen(false); document.querySelector('.adm-appbar__menu')?.focus();}
    };
    document.addEventListener('keydown', onKey);
    document.querySelector('.adm-nav a, .adm-nav button')?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [navOpen]);
  return <div className="adm">
    <Navigation open={navOpen} onClose={() => setNavOpen(false)} />
    <div className="adm-main">
      <AppTitleBar onMenu={() => setNavOpen(true)} />
      <main ref={content} className="adm-content" onClickCapture={event => {
        if (event.target.closest('a[href^="#/"]')) content.current?.scrollTo(0, 0);
      }}>{children}</main>
      <SidekickButton />
      {/* Joy's own floating AI agent button (AssistantWidget/AiAgentButton: fixed, 20px from the bottom-left corner of
          the app frame, white circle, magic icon) — real admin screenshot 18/11/2026. */}
      <JoyAiButton />
    </div>
  </div>;
}
