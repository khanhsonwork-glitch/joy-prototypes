// Shopify's new admin frame around the demo. The app content remains Polaris React.
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {Button, Icon} from '@shopify/polaris';
import {
  ChartVerticalIcon, ChevronLeftIcon, ChevronRightIcon, ContentIcon,
  DiscountIcon, FinanceIcon, GlobeIcon, HomeIcon,
  MenuHorizontalIcon, MenuIcon, NotificationIcon, OrderIcon, PersonIcon,
  PointOfSaleIcon, ProductIcon, SearchIcon, SettingsIcon, SidekickIcon,
  StoreOnlineIcon, TargetIcon,
} from '@shopify/polaris-icons';
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
        <button type="button" className="adm-nav__collapse" aria-label="Collapse navigation" onClick={stub}><Icon source={MenuIcon} /></button>
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
          <NavRow app={<JoyIcon size={18} tone="grey" />} label={APP_NAME} href={DEMO.home ?? '#/demo'} onClick={onClose} />
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
    {back
      ? <HashLink className="adm-appbar__back" url={back} aria-label="Back"><Icon source={ChevronLeftIcon} /></HashLink>
      : <button type="button" className="adm-appbar__back" aria-label="Back" onClick={notYet}><Icon source={ChevronLeftIcon} /></button>}
    <JoyIcon size={18} /> <span className="adm-appbar__divider">/</span>
    <span className="adm-appbar__title">{title}</span>
    <button type="button" className="adm-appbar__more" aria-label="More" onClick={notYet}><Icon source={MenuHorizontalIcon} /></button>
  </div>;
}

function SidekickButton() {
  const {notYet} = useShell();
  return <button type="button" className="adm-sidekick" onClick={notYet} aria-label="Work with Sidekick">
    <Icon source={SidekickIcon} /><span>Work with Sidekick</span><span aria-hidden="true">＋　♧　☷</span>
  </button>;
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
    </div>
  </div>;
}
