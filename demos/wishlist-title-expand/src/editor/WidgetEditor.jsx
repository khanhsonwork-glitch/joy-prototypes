// Joy widget editor V4 ("Widget design"), opened from On-site content › Unified widget › Setup.
// Layout follows the live editor (29/10/2026) and packages/assets/src/pages/Branding/WidgetDesign: fullscreen modal
// with a title bar (Save / Discard when there are changes), icon tab bar, settings menu, setting panel, live preview.
// The Wishlist panel mirrors panels/ExtensionPanel.js; "Product names" is the new field this prototype proposes.
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Badge,
  BlockStack,
  Box,
  Button,
  ChoiceList,
  Divider,
  DropZone,
  Icon,
  InlineStack,
  Link,
  Modal,
  Popover,
  SkeletonBodyText,
  Text,
  TextField,
  Tooltip,
} from '@shopify/polaris';
import {
  AppsIcon,
  ButtonIcon,
  CartIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CodeIcon,
  ColorIcon,
  DesktopIcon,
  DiscountIcon,
  HeartIcon,
  ImageIcon,
  LanguageTranslateIcon,
  LayoutBlockIcon,
  LayoutFooterIcon,
  LinkIcon,
  MagicIcon,
  MobileIcon,
  NoteIcon,
  NotificationIcon,
  PersonIcon,
  PlayCircleIcon,
  RefreshIcon,
  SearchIcon,
  SettingsIcon,
  StarIcon,
  XIcon,
} from '@shopify/polaris-icons';
import {JoyIcon} from '../shell/icons.jsx';
import {useNavigate, useRoute} from '../shell/router.jsx';
import {useShell} from '../shell/ShellContext.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {ErrorView} from '../kit/StateView.jsx';
import {useSettings} from '../state/settings.jsx';
import {SHOPS, STORE} from '../data/wishlist.js';
import {WishlistWidget} from '../widget/WishlistWidget.jsx';
import {useWishlistItems} from '../widget/useWishlistItems.js';

const cx = (...parts) => parts.filter(Boolean).join(' ');

// Tab bar: same five tabs, order and icons as components/WidgetEditorV4/WidgetEditorTabBar.js.
const TABS = [
  {id: 'settings', icon: SettingsIcon, label: 'Settings'},
  {id: 'sections', icon: LayoutBlockIcon, label: 'Sections'},
  {id: 'ai', icon: MagicIcon, label: 'On-brand'},
  {id: 'content', icon: LanguageTranslateIcon, label: 'Content'},
  {id: 'extensions', icon: AppsIcon, label: 'Extensions'},
];

// Menu groups per tab, names as the live editor shows them.
const MENU = {
  settings: [
    {label: 'Settings', items: [{id: 'design', label: 'Design', icon: ColorIcon}, {id: 'launcher', label: 'Launcher', icon: ButtonIcon}]},
    {
      label: 'Advanced',
      items: [
        {id: 'display', label: 'Display', icon: DesktopIcon},
        {id: 'popup', label: 'Popup', icon: NotificationIcon},
        {id: 'links', label: 'Custom links', icon: LinkIcon},
        {id: 'css', label: 'Custom CSS', icon: CodeIcon},
        {id: 'discounts', label: 'External discounts', icon: DiscountIcon},
      ],
    },
  ],
  sections: [
    {label: 'Header', items: [{id: 'header', label: 'Header', icon: ImageIcon}]},
    {
      label: 'Body',
      items: ['Membership card', 'My coupons', 'VIP tiers', 'Refer a friend', 'Ways to earn', 'Ways to redeem', 'Recently viewed', 'Promoted collections', 'Recommended', 'Recent activity', 'Milestones', 'My QR code', 'Wallet pass', 'Reviews'].map((l) => ({id: `body-${l}`, label: l, icon: LayoutBlockIcon})),
    },
    {
      label: 'Profile',
      items: ['Environmental impact', 'Account info', 'Referral link', 'Social accounts', 'Shipping addresses', 'Reviews', 'Settings', 'Log out'].map((l) => ({id: `profile-${l}`, label: l, icon: PersonIcon})),
    },
    {label: 'Footer', items: [{id: 'footer-nav', label: 'Footer menu', icon: LayoutFooterIcon}]},
  ],
  ai: [{label: 'On-brand', items: [{id: 'ai', label: 'On-brand', icon: MagicIcon}]}],
  content: [{label: 'Translations', items: [{id: 'translations', label: 'Translations', icon: LanguageTranslateIcon}]}],
  extensions: [
    {
      label: 'Extensions',
      items: [
        {id: 'ext-wishlist', label: 'Wishlist', icon: HeartIcon, toggle: 'wishlist'},
        {id: 'ext-bundling', label: 'Bundling', icon: CartIcon, toggle: 'bundling'},
        {id: 'ext-reviews', label: 'Reviews', icon: StarIcon, toggle: 'reviews'},
        {id: 'ext-subscription', label: 'Subscription', icon: RefreshIcon, toggle: 'subscription'},
        {id: 'ext-survey', label: 'Survey', icon: NoteIcon, toggle: 'survey'},
      ],
    },
  ],
};

const LAYOUTS = [
  {label: 'Carousel', value: 'carousel'},
  {label: 'Grid', value: 'grid'},
  {label: 'List', value: 'list'},
];

// New field, same control as "Wishlist layout" (ChoiceList), shown right under it only when List is picked.
const ROW_STYLES = [
  {label: 'One line', value: 'one-line', helpText: 'Names stay on one line. When a name is cut, an arrow next to it shows the full name. Add and remove stay on the right.'},
  {label: 'Up to two lines', value: 'two-lines', helpText: 'Names wrap to two lines, so shoppers read more without tapping. Remove moves to the corner and Add sits next to the price.'},
];

// Deep links: #/demo/widget-editor/<tab>/<item>, e.g. /extensions/wishlist. Optional ?names=two|one opens that
// "Product names" choice; ?state= works as everywhere else. The hash follows tab and item clicks so a copied URL
// reopens the same place.
const EDITOR_PATH = '/demo/widget-editor';
const slugOf = (id) => id.replace(/^ext-/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
const itemsOf = (tab) => MENU[tab].flatMap((g) => g.items);
const NAMES = {one: 'one-line', two: 'two-lines'};

function placeFromRoute(segments) {
  const [, , tabSlug, itemSlug] = segments;
  const tab = TABS.find((t) => t.id === tabSlug) ? tabSlug : 'settings';
  const item = itemsOf(tab).find((i) => slugOf(i.id) === itemSlug) || itemsOf(tab)[0];
  return {tab, active: item.id};
}

function Switch({checked, onChange, label, disabled}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={cx('ed-switch', checked && 'is-on')}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
    >
      <span />
    </button>
  );
}

function TitleBar({dirty, saving, onSave, onDiscard, onClose, onGuide}) {
  if (dirty || saving) {
    return (
      <header className="ed-titlebar ed-titlebar--save" aria-label="Unsaved changes">
        <span className="ed-titlebar__title">
          <JoyIcon size={20} />
          <span>Unsaved changes</span>
        </span>
        <InlineStack gap="200">
          <Button onClick={onDiscard} disabled={saving}>
            Discard
          </Button>
          <Button variant="primary" onClick={onSave} loading={saving}>
            Save
          </Button>
        </InlineStack>
      </header>
    );
  }
  return (
    <header className="ed-titlebar">
      <span className="ed-titlebar__title">
        <JoyIcon size={20} />
        <span>Widget design</span>
      </span>
      <InlineStack gap="200" blockAlign="center">
        <button type="button" className="ed-titlebar__guide" onClick={onGuide}>
          Watch guide
        </button>
        <button type="button" className="ed-titlebar__close" aria-label="Close" onClick={onClose}>
          <Icon source={XIcon} />
        </button>
      </InlineStack>
    </header>
  );
}

function Sidebar({tab, setTab, active, setActive, onTab, toggles, setToggle, lockWishlist}) {
  const [closed, setClosed] = useState({});
  return (
    <aside className="ed-side">
      <div className="ed-tabbar" role="tablist" aria-label="Editor tabs">
        {TABS.map((t) => (
          <Tooltip key={t.id} content={t.label} dismissOnMouseOut>
            <button
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              aria-label={t.label}
              className={cx('ed-tabbar__tab', tab === t.id && 'is-active')}
              onClick={() => {
                setTab(t.id);
                onTab(t.id, MENU[t.id][0].items[0].id);
              }}
            >
              <Icon source={t.icon} />
            </button>
          </Tooltip>
        ))}
      </div>
      <div className="ed-menu">
        <div className="ed-menu__search">
          <TextField label="Search settings" labelHidden placeholder="Search settings" prefix={<Icon source={SearchIcon} />} autoComplete="off" value="" onChange={() => {}} />
        </div>
        {MENU[tab].map((g) => (
          <div key={g.label} className="ed-menu__group">
            <button type="button" className="ed-menu__grouphead" aria-expanded={!closed[g.label]} onClick={() => setClosed((c) => ({...c, [g.label]: !c[g.label]}))}>
              <Text as="span" variant="headingSm">
                {g.label}
              </Text>
              <Icon source={closed[g.label] ? ChevronDownIcon : ChevronUpIcon} />
            </button>
            {closed[g.label] ? null : (
              <div className="ed-menu__items">
                {g.items.map((it) => (
                  <div key={it.id} className={cx('ed-menu__item', active === it.id && 'is-active')}>
                    <button type="button" className="ed-menu__itembtn" aria-current={active === it.id ? 'true' : undefined} onClick={() => setActive(it.id)}>
                      <Icon source={it.icon} />
                      <span>{it.label}</span>
                    </button>
                    {it.toggle ? (
                      <Switch
                        label={`${it.label} ${toggles[it.toggle] ? 'on' : 'off'}`}
                        checked={toggles[it.toggle]}
                        disabled={it.toggle === 'wishlist' && lockWishlist}
                        onChange={(v) => setToggle(it.toggle, v)}
                      />
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}

function OtherPanel({label}) {
  return (
    <BlockStack gap="400">
      <Text as="h2" variant="headingMd">
        {label}
      </Text>
      <Divider />
      <div className="fx-note" role="note">
        Prototype note: only Extensions › Wishlist is built in this prototype.
      </div>
    </BlockStack>
  );
}

function WishlistPanel({draft, set, enabled, notInstalled, notYet}) {
  return (
    <BlockStack gap="400">
      <InlineStack gap="200" blockAlign="center" align="space-between" wrap={false}>
        <Text as="h2" variant="headingMd" fontWeight="semibold">
          Wishlist
        </Text>
        <InlineStack gap="200" blockAlign="center" wrap={false}>
          <Button variant="plain" icon={PlayCircleIcon} onClick={notYet}>
            Watch setup guide
          </Button>
          <Badge tone={enabled ? 'success' : undefined} progress="complete">
            {enabled ? 'On' : 'Off'}
          </Badge>
        </InlineStack>
      </InlineStack>
      <Divider />
      <Text as="p" variant="bodyMd" tone="subdued">
        Let customers save their favorite products and come back to buy them later
      </Text>
      <ChoiceList
        title="Wishlist provider"
        choices={[
          {label: 'Auto-detect', value: ''},
          {label: 'Joy Wishlist', value: 'joy'},
          {label: 'Wishlist King', value: 'wishlist-king'},
          {label: 'Swym', value: 'swym'},
        ]}
        selected={[draft.provider]}
        onChange={([v]) => set({provider: v})}
      />
      {notInstalled ? (
        <div className="ed-banner" role="status">
          <Text as="p" variant="bodySm">
            This extension requires the Joy Wishlist app. Install it to let customers save and manage their favorite products.
          </Text>
          <Link onClick={notYet}>Install Joy Wishlist</Link>
        </div>
      ) : enabled ? (
        <>
          <Divider />
          <BlockStack gap="100">
            <InlineStack gap="200" blockAlign="center" align="space-between" wrap={false}>
              <Text as="h3" variant="headingSm" fontWeight="semibold">
                Wishlist features
              </Text>
              <Link onClick={notYet}>Manage in Wishlist app</Link>
            </InlineStack>
            <Text as="p" variant="bodySm" tone="subdued">
              Configured in the Joy Wishlist app — shown here for reference.
            </Text>
          </BlockStack>
          <BlockStack gap="0">
            {[
              ['Guest wishlist', 'Let visitors save items without an account', true],
              ['Share wishlist', 'Shoppers can share a public wishlist link', false],
            ].map(([l, h, on], i) => (
              <Box key={l} borderColor="border" borderBlockStartWidth={i === 0 ? '0' : '025'}>
                <Box paddingBlock="200">
                  <InlineStack gap="200" blockAlign="center" align="space-between" wrap={false}>
                    <BlockStack gap="050">
                      <Text as="span" variant="bodyMd">
                        {l}
                      </Text>
                      <Text as="span" variant="bodySm" tone="subdued">
                        {h}
                      </Text>
                    </BlockStack>
                    <Badge tone={on ? 'success' : undefined}>{on ? 'On' : 'Off'}</Badge>
                  </InlineStack>
                </Box>
              </Box>
            ))}
          </BlockStack>
        </>
      ) : null}
      {enabled && !notInstalled ? (
        <>
          <Divider />
          <Text as="h3" variant="headingSm" fontWeight="semibold">
            Display settings
          </Text>
          <ChoiceList title="Wishlist layout" choices={LAYOUTS} selected={[draft.layout]} onChange={([v]) => set({layout: v})} />
          {draft.layout === 'list' ? (
            <div className="ed-newfield">
              <ChoiceList title="Product names" choices={ROW_STYLES} selected={[draft.rowStyle]} onChange={([v]) => set({rowStyle: v})} />
            </div>
          ) : null}
          <ChoiceList
            title="Product image hover effect"
            choices={[
              {label: 'Hover effect off', value: 'off'},
              {label: 'Swap to second image', value: 'swap'},
            ]}
            selected={[draft.hover]}
            onChange={([v]) => set({hover: v})}
          />
          <BlockStack gap="300">
            <Text as="p" variant="bodyMd">
              Empty state image
            </Text>
            <DropZone accept="image/*" type="image" allowMultiple={false} onDrop={notYet} label="Empty state image" labelHidden>
              <DropZone.FileUpload actionTitle="Add image" actionHint="Recommended 1:1 (144 x 144px)" />
            </DropZone>
            <Text as="p" variant="bodySm" tone="subdued">
              Shown when the wishlist has no items yet. Square image recommended. Leave empty to use the default icon.
            </Text>
          </BlockStack>
        </>
      ) : null}
    </BlockStack>
  );
}

function PreviewToolbar({device, setDevice, customer, setCustomer, notYet}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="ed-ptool">
      <Popover
        active={open}
        onClose={() => setOpen(false)}
        activator={
          <button type="button" className="ed-ptool__as" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            <span>Preview as ·</span>
            <Icon source={device === 'mobile' ? MobileIcon : DesktopIcon} />
            <span>{device === 'mobile' ? 'Mobile' : 'Desktop'}</span>
            <span>·</span>
            <Icon source={PersonIcon} />
            <span>{customer === 'guest' ? 'Guest' : 'Signed in'}</span>
            <Icon source={ChevronDownIcon} />
          </button>
        }
      >
        <Box padding="400" minWidth="240px">
          <BlockStack gap="300">
            <Text as="h3" variant="headingSm">
              Preview settings
            </Text>
            <ChoiceList
              title="Device"
              choices={[
                {label: 'Desktop', value: 'desktop'},
                {label: 'Mobile', value: 'mobile'},
              ]}
              selected={[device]}
              onChange={([v]) => setDevice(v)}
            />
            <ChoiceList
              title="Customer"
              choices={[
                {label: 'Signed in', value: 'signed-in'},
                {label: 'Guest', value: 'guest'},
              ]}
              selected={[customer]}
              onChange={([v]) => setCustomer(v)}
            />
          </BlockStack>
        </Box>
      </Popover>
      <Button icon={SearchIcon} onClick={notYet}>
        Inspect
      </Button>
      <Badge tone="success">Embed active</Badge>
      <span className="ed-ptool__spacer" />
      <a className="ed-ptool__store" href="#/demo/storefront" target="_blank" rel="noreferrer">
        View on store
      </a>
    </div>
  );
}

function Preview({draft, enabled, state, notify}) {
  const [device, setDevice] = useState('desktop');
  const [customer, setCustomer] = useState('signed-in');
  const {notYet} = useShell();
  const {items, status, remove, reset} = useWishlistItems('moto', state === 'disabled' ? 'default' : state);
  return (
    <section className="ed-preview" aria-label="Preview">
      <PreviewToolbar device={device} setDevice={setDevice} customer={customer} setCustomer={setCustomer} notYet={notYet} />
      <div className={cx('ed-canvas', `ed-canvas--${device}`)}>
        <div className="ed-store" aria-hidden="true">
          <div className="ed-store__nav">
            <strong>{STORE.name.toUpperCase()}</strong>
            <span>Home · Shop · About</span>
          </div>
          <div className="ed-store__hero">
            <b>New arrivals</b>
            <span>Parts for the next ride</span>
          </div>
          <div className="ed-store__grid">
            {SHOPS.moto.items.slice(0, 6).map((i) => (
              <span key={i.id}>
                <img src={i.img} alt="" />
              </span>
            ))}
          </div>
        </div>
        <div className={device === 'mobile' ? 'ed-device' : 'ed-panel'}>
          {enabled ? (
            <WishlistWidget
              key={`${draft.layout}-${draft.rowStyle}-${device}-${customer}`}
              shop={SHOPS.moto}
              items={items}
              status={status}
              rowStyle={draft.rowStyle}
              layout={draft.layout}
              device={device === 'mobile' ? 'mobile' : 'desktop'}
              onNotify={notify}
              onRetry={reset}
              onRemove={remove}
            />
          ) : (
            <div className="ed-preview__off">
              <Text as="p" variant="bodyMd" tone="subdued">
                Wishlist is off, so the widget doesn’t show the Wishlist tab.
              </Text>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function WidgetEditor() {
  const navigate = useNavigate();
  const route = useRoute();
  const {notify, notYet} = useShell();
  const {state} = useScenario();
  const {settings, save} = useSettings();
  const notInstalled = state === 'disabled';

  const linkedNames = NAMES[route.query.get('names')];
  const savedAll = useMemo(
    () => ({provider: '', layout: settings.layout, rowStyle: linkedNames || settings.rowStyle, hover: 'swap', toggles: {wishlist: true, bundling: false, reviews: true, subscription: false, survey: false}}),
    // Only the first render matters (draft/base are seeded once); later saves update base directly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [draft, setDraft] = useState(savedAll);
  const [base, setBase] = useState(savedAll);
  const [place] = useState(() => placeFromRoute(route.segments));
  const [tab, setTab] = useState(place.tab);
  const [active, setActive] = useState(place.active);
  const [saving, setSaving] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const dirty = JSON.stringify(draft) !== JSON.stringify(base);
  // Keep the hash in step with what is open, keeping ?state= and writing ?names= for "Up to two lines".
  const writeUrl = (nextTab, nextActive, rowStyle) => {
    const query = new URLSearchParams(route.query);
    if (rowStyle === 'two-lines') query.set('names', 'two');
    else query.delete('names');
    const qs = query.toString();
    navigate(`${EDITOR_PATH}/${nextTab}/${slugOf(nextActive)}${qs ? `?${qs}` : ''}`, {replace: true});
  };
  const set = (patch) => {
    setDraft((d) => ({...d, ...patch}));
    if (patch.rowStyle) writeUrl(tab, active, patch.rowStyle);
  };
  const setToggle = (key, v) => setDraft((d) => ({...d, toggles: {...d.toggles, [key]: v}}));
  const enabled = draft.toggles.wishlist && !notInstalled;
  const close = () => navigate('/demo');
  const contentRef = useRef(null);
  // Narrow screens stack menu, panel and preview (prototype adaptation), so bring the picked panel into view.
  const pick = (id) => {
    setActive(id);
    writeUrl(tab, id, draft.rowStyle);
    if (window.matchMedia('(max-width: 899.98px)').matches) {
      window.requestAnimationFrame(() => contentRef.current?.scrollIntoView({block: 'start'}));
    }
  };

  const openTab = (nextTab, firstId) => {
    setActive(firstId);
    writeUrl(nextTab, firstId, draft.rowStyle);
  };

  // Opened straight on Wishlist (the review link): bring Display settings, with "Product names", into view.
  useEffect(() => {
    if (place.active !== 'ext-wishlist') return;
    window.requestAnimationFrame(() => {
      const heading = [...(contentRef.current?.querySelectorAll('h3') || [])].find((h) => h.textContent.trim() === 'Display settings');
      heading?.scrollIntoView({block: 'start'});
    });
  }, [place]);

  const onSave = () => {
    setSaving(true);
    window.setTimeout(() => {
      save({layout: draft.layout, rowStyle: draft.rowStyle});
      setBase(draft);
      setSaving(false);
      notify('Saved');
    }, 600);
  };

  const label = Object.values(MENU)
    .flat()
    .flatMap((g) => g.items)
    .find((i) => i.id === active)?.label;

  let panel;
  if (state === 'loading') panel = <SkeletonBodyText lines={8} />;
  else if (state === 'error') {
    panel = (
      <ErrorView title="Couldn’t load widget settings" onRetry={notYet}>
        Your widget keeps running on your store with the last saved settings. Try again in a moment.
      </ErrorView>
    );
  } else if (active === 'ext-wishlist') {
    panel = <WishlistPanel draft={draft} set={set} enabled={enabled} notInstalled={notInstalled} notYet={notYet} />;
  } else panel = <OtherPanel label={label} />;

  return (
    <div className="ed-backdrop">
      <div className="ed-modal" role="dialog" aria-modal="true" aria-label="Widget design">
        <TitleBar
          dirty={dirty}
          saving={saving}
          onSave={onSave}
          onDiscard={() => setDraft(base)}
          onClose={() => (dirty ? setConfirmClose(true) : close())}
          onGuide={notYet}
        />
        <div className={cx('ed-body', collapsed && 'is-collapsed')}>
          {collapsed ? null : (
            <Sidebar tab={tab} setTab={setTab} active={active} setActive={pick} onTab={openTab} toggles={draft.toggles} setToggle={setToggle} lockWishlist={notInstalled} />
          )}
          <button type="button" className="ed-collapse" aria-label={collapsed ? 'Show menu' : 'Hide menu'} onClick={() => setCollapsed((v) => !v)}>
            {collapsed ? '›' : '‹'}
          </button>
          <section ref={contentRef} className="ed-content" aria-label={label}>
            {panel}
          </section>
          <Preview draft={draft} enabled={enabled} state={state} notify={notify} />
        </div>
      </div>
      <Modal
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        title="Leave without saving?"
        primaryAction={{content: 'Leave', destructive: true, onAction: close}}
        secondaryActions={[{content: 'Keep editing', onAction: () => setConfirmClose(false)}]}
      >
        <Modal.Section>
          <Text as="p">Your changes to the widget will be lost.</Text>
        </Modal.Section>
      </Modal>
    </div>
  );
}
