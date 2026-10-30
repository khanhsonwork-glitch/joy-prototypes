// The Shopify admin around the app, in the current (dark sidebar) Shopify admin look: logo and search live in the
// sidebar, the page sits in a rounded panel, and the app header reads "‹ [Joy] / <page>".
// Sampled from the live admin (On-site content, 29/10/2026). Hand-written on purpose (not Polaris, not Joy).
import React, {useEffect, useRef, useState} from 'react';
import {Icon} from '@shopify/polaris';
import {
  AppsIcon,
  ArrowLeftIcon,
  ChartVerticalIcon,
  ChevronRightIcon,
  ContentIcon,
  DiscountIcon,
  FinanceIcon,
  GlobeIcon,
  HomeIcon,
  LayoutSidebarLeftIcon,
  MenuHorizontalIcon,
  MenuIcon,
  NotificationIcon,
  OrderIcon,
  PersonIcon,
  PointOfSaleIcon,
  ProductIcon,
  SearchIcon,
  SettingsIcon,
  SidekickIcon,
  StoreOnlineIcon,
  TargetIcon,
} from '@shopify/polaris-icons';
import {STORE} from '../data/wishlist.js';
import {JoyIcon, ShopifyBag} from './icons.jsx';
import {useRoute} from './router.jsx';
import {useShell} from './ShellContext.jsx';

const cx = (...parts) => parts.filter(Boolean).join(' ');

// The Joy app's own menu, same names and order as production (packages/assets/src/helpers/getAppNavigation.js):
// the last two are the cross-app entries for Joy Wishlist and Joy Subscription.
const JOY_SUB = [
  {id: 'customers', label: 'Customers'},
  {id: 'programs', label: 'Reward programs'},
  {id: 'membership', label: 'Membership'},
  {id: 'onsite', label: 'On-site content', href: '#/demo', routes: ['demo']},
  {id: 'analytics', label: 'Analytics'},
  {id: 'integrations', label: 'Integrations'},
  {id: 'settings', label: 'Settings'},
  {id: 'wishlist', label: 'Wishlist'},
  {id: 'subscription', label: 'Subscription'},
];

/** Page title in the app header, per route. */
const PAGE_TITLES = {demo: 'On-site content'};

function NavRow({icon, label, badge, onClick, app}) {
  return (
    <button type="button" className="adm-nav__row" onClick={onClick}>
      <span className="adm-nav__icon">{app || <Icon source={icon} />}</span>
      <span className="adm-nav__label">{label}</span>
      {badge ? <span className="adm-nav__badge">{badge}</span> : null}
    </button>
  );
}

function NavSection({label, onClick}) {
  return (
    <button type="button" className="adm-nav__section" onClick={onClick}>
      <span>{label}</span>
      <Icon source={ChevronRightIcon} />
    </button>
  );
}

function Navigation({open, onClose}) {
  const route = useRoute();
  const {notYet} = useShell();
  const selIdx = JOY_SUB.findIndex((s) => s.routes?.includes(route.segments[0]));
  const stub = () => {
    notYet();
    onClose();
  };
  return (
    <>
      {open ? <div className="adm-scrim" onClick={onClose} aria-hidden="true" /> : null}
      <nav className={cx('adm-nav', open && 'is-open')} aria-label="Main">
        <div className="adm-nav__brand">
          <ShopifyBag />
          <button type="button" className="adm-nav__collapse" aria-label="Collapse sidebar" onClick={notYet}>
            <Icon source={LayoutSidebarLeftIcon} />
          </button>
        </div>
        <button type="button" className="adm-search" onClick={notYet}>
          <Icon source={SearchIcon} />
          <span className="adm-search__label">Search</span>
          <span className="adm-search__keys" aria-hidden="true">⌘K</span>
        </button>
        <div className="adm-nav__scroll">
          <div className="adm-nav__group">
            <NavRow icon={HomeIcon} label="Home" onClick={stub} />
            <NavRow icon={OrderIcon} label="Orders" badge="12" onClick={stub} />
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
            <NavRow icon={AppsIcon} label="Flow" onClick={stub} />
            <a href="#/demo" className="adm-nav__row" onClick={onClose}>
              <span className="adm-nav__icon">
                <JoyIcon size={16} />
              </span>
              <span className="adm-nav__label">Joy: Loyalty Program</span>
            </a>
            <div className="adm-sub">
              {JOY_SUB.map((item, idx) => (
                <a
                  key={item.id}
                  href={item.href || '#'}
                  className={cx('adm-sub__item', idx === selIdx && 'is-selected')}
                  aria-current={idx === selIdx ? 'page' : undefined}
                  onClick={(event) => {
                    if (!item.href) {
                      event.preventDefault();
                      stub();
                    } else onClose();
                  }}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="adm-nav__bottom">
          <NavRow icon={SettingsIcon} label="Settings" onClick={stub} />
          <div className="adm-store">
            <button type="button" className="adm-store__btn" onClick={notYet} aria-label={`${STORE.name} store menu`}>
              <span className="adm-store__avatar">{STORE.initials}</span>
              <span className="adm-store__name">{STORE.name}</span>
              <span className="adm-store__pill">dev</span>
            </button>
            <button type="button" className="adm-store__bell" aria-label="Notifications" onClick={notYet}>
              <Icon source={NotificationIcon} />
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

function AppHeader({onMenu}) {
  const {notYet} = useShell();
  const route = useRoute();
  return (
    <div className="adm-appbar">
      <button type="button" className="adm-appbar__menu" aria-label="Open navigation" onClick={onMenu}>
        <Icon source={MenuIcon} />
      </button>
      <button type="button" className="adm-appbar__circle" aria-label="Back" onClick={notYet}>
        <Icon source={ArrowLeftIcon} />
      </button>
      <span className="adm-appbar__crumb">
        <JoyIcon size={20} />
        <span className="adm-appbar__slash" aria-hidden="true">
          /
        </span>
        <span className="adm-appbar__title">{PAGE_TITLES[route.segments[0]] || 'Joy: Loyalty Program'}</span>
      </span>
      <button type="button" className="adm-appbar__circle adm-appbar__more" aria-label="More actions" onClick={notYet}>
        <Icon source={MenuHorizontalIcon} />
      </button>
    </div>
  );
}

function SidekickBar() {
  const {notYet} = useShell();
  return (
    <button type="button" className="adm-sidekick" onClick={notYet}>
      <Icon source={SidekickIcon} />
      <span>Work with Sidekick</span>
    </button>
  );
}

export function AdminChrome({children}) {
  const [navOpen, setNavOpen] = useState(false);
  const route = useRoute();
  const content = useRef(null);
  useEffect(() => {
    content.current?.scrollTo(0, 0);
  }, [route.path]);
  useEffect(() => setNavOpen(false), [route.path]);
  useEffect(() => {
    if (!navOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setNavOpen(false);
        document.querySelector('.adm-appbar__menu')?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    document.querySelector('.adm-nav a, .adm-nav button')?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [navOpen]);

  return (
    <div className="adm">
      <Navigation open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="adm-main">
        <AppHeader onMenu={() => setNavOpen(true)} />
        <main ref={content} className="adm-content">
          {children}
        </main>
        <SidekickBar />
      </div>
    </div>
  );
}
