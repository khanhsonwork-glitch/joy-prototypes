// The Shopify admin around the app: black top bar, left navigation, app title bar.
// Hand-written on purpose (it is not Polaris and it is not Joy), Polaris tokens where they exist.
import React, {useEffect, useRef, useState} from 'react';
import {Icon} from '@shopify/polaris';
import {
  ChartVerticalFilledIcon,
  ChevronRightIcon,
  ContentFilledIcon,
  DiscountFilledIcon,
  FinanceFilledIcon,
  GlobeFilledIcon,
  HomeFilledIcon,
  MenuHorizontalIcon,
  MenuIcon,
  NotificationIcon,
  OrderFilledIcon,
  PersonFilledIcon,
  PointOfSaleIcon,
  ProductFilledIcon,
  SearchIcon,
  SettingsFilledIcon,
  SidekickIcon,
  StoreOnlineIcon,
  TargetFilledIcon,
} from '@shopify/polaris-icons';
import {STORE} from '../data/index.js';
import {DEMO} from '../demo.config.js';
import {JoyIcon, ShopifyWordmark} from './icons.jsx';
import {useRoute} from './router.jsx';
import {useShell} from './ShellContext.jsx';

const cx = (...parts) => parts.filter(Boolean).join(' ');

/* ---------------------------------------------------------------- top bar */

function TopBar({onMenu}) {
  const {notYet} = useShell();
  return (
    <header className="adm-top">
      <button type="button" className="adm-top__menu" aria-label="Open navigation" onClick={onMenu}>
        <Icon source={MenuIcon} />
      </button>
      <ShopifyWordmark />
      <button type="button" className="adm-search" onClick={notYet} aria-label="Search">
        <span className="adm-search__icon">
          <Icon source={SearchIcon} />
        </span>
        <span className="adm-search__label">Search</span>
        <span className="adm-search__keys" aria-hidden="true">
          <kbd>⌘</kbd>
          <kbd>K</kbd>
        </span>
      </button>
      <div className="adm-top__right">
        <button type="button" className="adm-top__icon" aria-label="Sidekick" onClick={notYet}>
          <Icon source={SidekickIcon} />
        </button>
        <button type="button" className="adm-top__icon" aria-label="Notifications" onClick={notYet}>
          <Icon source={NotificationIcon} />
        </button>
        <button type="button" className="adm-store" onClick={notYet} aria-label={`${STORE.name} store menu`}>
          <span className="adm-store__avatar">PP</span>
          <span className="adm-store__name">{STORE.name}</span>
          <span className="adm-store__pill">dev</span>
        </button>
      </div>
    </header>
  );
}

/* ---------------------------------------------------------------- navigation */

function NavRow({icon, label, badge, selected, href, onClick, app}) {
  const body = (
    <>
      <span className="adm-nav__icon">{app ? app : <Icon source={icon} />}</span>
      <span className="adm-nav__label">{label}</span>
      {badge ? <span className="adm-nav__badge">{badge}</span> : null}
    </>
  );
  if (href) {
    return (
      <a href={href} className={cx('adm-nav__row', selected && 'is-selected')} aria-current={selected ? 'page' : undefined} onClick={onClick}>
        {body}
      </a>
    );
  }
  return (
    <button type="button" className={cx('adm-nav__row', selected && 'is-selected')} onClick={onClick}>
      {body}
    </button>
  );
}

function NavSection({label, onClick}) {
  return (
    <button type="button" className="adm-nav__section" onClick={onClick}>
      <span>{label}</span>
      <span className="adm-nav__section-chevron">
        <Icon source={ChevronRightIcon} />
      </span>
    </button>
  );
}

// The Joy app's own pages in the Shopify sidebar. Point `href` at a route of this prototype to make it live;
// rows without `href` show a toast instead (they exist only for the look of the real app).
const JOY_SUB = [
  {id: 'customers', label: 'Customers'},
  {id: 'rewards', label: 'Reward programs'},
  {id: 'membership', label: 'Membership'},
  {id: 'onsite', label: 'On-site content', href: '#/demo', routes: ['demo']},
  {id: 'analytics', label: 'Analytics'},
  {id: 'integrations', label: 'Integrations'},
  {id: 'settings', label: 'Settings'},
];
const APP_NAME = DEMO.product === 'wishlist' ? 'Joy: Wishlist' : 'Joy: Loyalty Program';

function Navigation({open, onClose}) {
  const route = useRoute();
  const {notYet} = useShell();

  const section = route.segments[0];
  const selIdx = JOY_SUB.findIndex((s) => s.routes?.includes(section));

  const stub = () => {
    notYet();
    onClose();
  };

  return (
    <>
      {open ? <div className="adm-scrim" onClick={onClose} aria-hidden="true" /> : null}
      <nav className={cx('adm-nav', open && 'is-open')} aria-label="Main">
        <div className="adm-nav__group">
          <NavRow icon={HomeFilledIcon} label="Home" onClick={stub} />
          <NavRow icon={OrderFilledIcon} label="Orders" badge="12" onClick={stub} />
          <NavRow icon={ProductFilledIcon} label="Products" onClick={stub} />
          <NavRow icon={PersonFilledIcon} label="Customers" onClick={stub} />
          <NavRow icon={TargetFilledIcon} label="Marketing" onClick={stub} />
          <NavRow icon={DiscountFilledIcon} label="Discounts" onClick={stub} />
          <NavRow icon={ContentFilledIcon} label="Content" onClick={stub} />
          <NavRow icon={GlobeFilledIcon} label="Markets" onClick={stub} />
          <NavRow icon={FinanceFilledIcon} label="Finance" onClick={stub} />
          <NavRow icon={ChartVerticalFilledIcon} label="Analytics" onClick={stub} />
        </div>

        <div className="adm-nav__group">
          <NavSection label="Sales channels" onClick={stub} />
          <NavRow icon={StoreOnlineIcon} label="Online Store" onClick={stub} />
          <NavRow icon={PointOfSaleIcon} label="Point of Sale" onClick={stub} />
        </div>

        <div className="adm-nav__group">
          <NavSection label="Apps" onClick={stub} />
          <NavRow app={<JoyIcon size={20} />} label={APP_NAME} href="#/demo" onClick={onClose} />
          <div className="adm-sub">
            {JOY_SUB.map((item, idx) => {
              const selected = idx === selIdx;
              return (
                <a
                  key={item.id}
                  href={item.href || '#'}
                  className={cx('adm-sub__item', selected && 'is-selected', selIdx > -1 && idx < selIdx && 'has-line')}
                  aria-current={selected ? 'page' : undefined}
                  onClick={(event) => {
                    if (!item.href) {
                      event.preventDefault();
                      stub();
                    } else {
                      onClose();
                    }
                  }}
                >
                  {item.label}
                </a>
              );
            })}
          </div>
        </div>

        <div className="adm-nav__group adm-nav__group--bottom">
          <NavRow icon={SettingsFilledIcon} label="Settings" onClick={stub} />
        </div>
      </nav>
    </>
  );
}

/* ---------------------------------------------------------------- app title bar */

function AppTitleBar() {
  const {notYet} = useShell();
  return (
    <div className="adm-appbar">
      <div className="adm-appbar__title">
        <JoyIcon size={20} />
        <span>{APP_NAME}</span>
      </div>
      <button type="button" className="adm-appbar__more" aria-label="More" onClick={notYet}>
        <Icon source={MenuHorizontalIcon} />
      </button>
    </div>
  );
}

function SidekickButton() {
  const {notYet} = useShell();
  return (
    <button type="button" className="adm-sidekick" aria-label="Sidekick" onClick={notYet}>
      <Icon source={SidekickIcon} />
    </button>
  );
}

/* ---------------------------------------------------------------- shell */

export function AdminChrome({children}) {
  const [navOpen, setNavOpen] = useState(false);
  const route = useRoute();
  const content = useRef(null);
  useEffect(() => {content.current?.scrollTo(0, 0);}, [route.path]);

  // close the mobile drawer whenever the route changes, and on Esc
  useEffect(() => setNavOpen(false), [route.path]);
  useEffect(() => {
    if (!navOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setNavOpen(false);
        document.querySelector('.adm-top__menu')?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    document.querySelector('.adm-nav a, .adm-nav button')?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [navOpen]);

  return (
    <div className="adm">
      <TopBar onMenu={() => setNavOpen(true)} />
      <Navigation open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="adm-corner adm-corner--left" aria-hidden="true" />
      <div className="adm-corner adm-corner--right" aria-hidden="true" />
      <SidekickButton />
      <div className="adm-main">
        <AppTitleBar />
        <main ref={content} className="adm-content">{children}</main>
      </div>
    </div>
  );
}
