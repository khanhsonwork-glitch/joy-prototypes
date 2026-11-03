// On-site content › Unified widget › Widget design: the fullscreen widget editor (App Bridge max modal,
// pages/Branding/WidgetDesign/WidgetEditorV4.js on avada/master), Launcher panel (panels/LauncherPanel.js).
// The upgrade popup only opens inside fullscreen editors like this one: elsewhere a locked control goes to the
// Plans page (reducers/pricingReducer.js). The Launcher's "Generate AI Icon" is the editor's Advanced-gated control;
// in this prototype its "Available on Advanced" link opens the popup (today it closes the editor and opens the
// Plans page — see DECISIONS.md). An Advanced shop has nothing locked here, so it sees no popup.
import React, {useState} from 'react';
import {Badge, BlockStack, Button, Divider, Icon, InlineStack, Text, TextField} from '@shopify/polaris';
import {
  AppsIcon,
  AdjustIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  CodeIcon,
  DesktopIcon,
  DiscountIcon,
  InfoIcon,
  LinkIcon,
  MagicIcon,
  MaximizeIcon,
  NotificationIcon,
  PaintBrushFlatIcon,
  PersonIcon,
  SearchIcon,
  SettingsIcon,
  ViewIcon,
  XIcon,
} from '@shopify/polaris-icons';
import {JoyIcon} from '../shell/icons.jsx';
import {useNavigate} from '../shell/router.jsx';
import {useShell} from '../shell/ShellContext.jsx';
import {useProto} from '../state/proto.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {LoadingView} from '../kit/StateView.jsx';
import {UpgradePopup} from '../components/UpgradePopup.jsx';

// Launcher icons of the V4 editor, drawn for this prototype (24×24 strokes).
const LAUNCHER_ICONS = [
  {name: 'gift', d: 'M4 10h16v10H4zM3 7h18v3H3zM12 7v13M12 7c-2-4-6-4-6-1.5S10 7 12 7zm0 0c2-4 6-4 6-1.5S14 7 12 7z'},
  {name: 'crown', d: 'M4 18h16M4 18 3 8l5 4 4-6 4 6 5-4-1 10'},
  {name: 'bag', d: 'M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2'},
  {name: 'star', d: 'm12 4 2.4 5 5.6.8-4 3.9 1 5.5-5-2.7-5 2.7 1-5.5-4-3.9 5.6-.8z'},
  {name: 'heart', d: 'M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z'},
  {name: 'trophy', d: 'M8 4h8v5a4 4 0 0 1-8 0zM8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3M12 13v4M8 20h8M10 17h4'},
  {name: 'sparkle', d: 'M12 3c.8 4.5 2.5 6.2 7 7-4.5.8-6.2 2.5-7 7-.8-4.5-2.5-6.2-7-7 4.5-.8 6.2-2.5 7-7z'},
  {name: 'ticket', d: 'M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4zM10 7v10'},
];

const MENU = [
  {group: 'Settings', items: [{id: 'design', label: 'Design', icon: PaintBrushFlatIcon}, {id: 'launcher', label: 'Launcher', icon: ViewIcon}]},
  {
    group: 'Advanced',
    items: [
      {id: 'display', label: 'Display', icon: DesktopIcon},
      {id: 'popup', label: 'Popup', icon: NotificationIcon},
      {id: 'links', label: 'Custom links', icon: LinkIcon},
      {id: 'css', label: 'Custom CSS', icon: CodeIcon},
      {id: 'discounts', label: 'External discounts', icon: DiscountIcon},
    ],
  },
];

const PRODUCTS = [
  {name: 'Classic Cotton Tee', price: '$29.99', tone: 'sand'},
  {name: 'Leather Crossbody Bag', price: '$89.00', tone: 'clay'},
  {name: 'Ceramic Mug Set', price: '$34.50', tone: 'sky'},
  {name: 'Linen Throw', price: '$59.00', tone: 'sage'},
  {name: 'Scented Candle', price: '$24.99', tone: 'blush'},
  {name: 'Wool Beanie', price: '$19.99', tone: 'lilac'},
];

function Glyph({d, size = 24}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
      <path d={d} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SettingsMenu() {
  const {notYet} = useShell();
  return (
    <aside className="fse-menu" aria-label="Widget settings">
      <div className="fse-menu__tabs" role="tablist" aria-label="Editor sections">
        {[SettingsIcon, MaximizeIcon, MagicIcon, AdjustIcon, AppsIcon].map((icon, i) => (
          <button key={i} type="button" role="tab" aria-selected={i === 0} className={`fse-menu__tab${i === 0 ? ' is-selected' : ''}`} onClick={i === 0 ? undefined : notYet} aria-label={['Settings', 'Layout', 'AI', 'Translations', 'Blocks'][i]}>
            <Icon source={icon} />
          </button>
        ))}
      </div>
      <div className="fse-menu__search">
        <span className="fse-menu__search-icon"><Icon source={SearchIcon} tone="subdued" /></span>
        <input type="search" placeholder="Search settings" aria-label="Search settings" />
      </div>
      {MENU.map((section) => (
        <div key={section.group} className="fse-menu__group">
          <div className="fse-menu__heading">
            <span>{section.group}</span>
            <Icon source={ChevronDownIcon} tone="subdued" />
          </div>
          {section.items.map((item) => (
            <button key={item.id} type="button" className={`fse-menu__item${item.id === 'launcher' ? ' is-selected' : ''}`} aria-current={item.id === 'launcher' ? 'true' : undefined} onClick={item.id === 'launcher' ? undefined : notYet}>
              <Icon source={item.icon} tone="subdued" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ))}
    </aside>
  );
}

function LauncherPanel({locked, onLocked}) {
  const {notify} = useShell();
  const [style, setStyle] = useState('both');
  const [icon, setIcon] = useState('crown');
  const [label, setLabel] = useState('Reward');
  return (
    <section className="fse-panel" aria-label="Launcher">
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd" fontWeight="semibold">
          Launcher
        </Text>
        <div className="fse-note">
          <span className="fse-note__icon"><Icon source={InfoIcon} tone="info" /></span>
          <Text as="p" variant="bodyMd">To hide the launcher button, go to Advanced → Display in the sidebar.</Text>
        </div>
        <Divider />
        <Text as="h2" variant="headingSm" fontWeight="medium">
          Float button
        </Text>
        <BlockStack gap="200">
          <Text as="p" variant="bodyMd">Launcher</Text>
          <div className="fse-styles">
            {[
              {id: 'icon', label: 'Icon only'},
              {id: 'label', label: 'Label only'},
              {id: 'both', label: 'Icon & label'},
              {id: 'points', label: 'Point balance'},
            ].map((s) => (
              <button key={s.id} type="button" className={`fse-style${style === s.id ? ' is-selected' : ''}`} aria-pressed={style === s.id} onClick={() => setStyle(s.id)}>
                <span className="fse-style__box">
                  {s.id === 'icon' ? <span className="fse-pill fse-pill--muted fse-pill--round"><Glyph d={LAUNCHER_ICONS[1].d} size={18} /></span> : null}
                  {s.id === 'label' ? <span className="fse-pill fse-pill--muted">Reward</span> : null}
                  {s.id === 'both' ? <span className="fse-pill"><Glyph d={LAUNCHER_ICONS[1].d} size={18} />Reward</span> : null}
                  {s.id === 'points' ? <span className="fse-pill fse-pill--points"><span>Loyalty points</span><strong>500</strong></span> : null}
                </span>
                <span className="fse-style__label">{s.label}</span>
              </button>
            ))}
          </div>
        </BlockStack>
        <Divider />
        <TextField label="Label" value={label} onChange={setLabel} autoComplete="off" helpText="To translate this label for other languages, go to Translations → Launcher." />
        <Divider />
        <Text as="h2" variant="headingSm" fontWeight="medium">
          Button icon
        </Text>
        <div className="fse-icons">
          {LAUNCHER_ICONS.map((g) => (
            <button key={g.name} type="button" className={`fse-icon${icon === g.name ? ' is-selected' : ''}`} aria-pressed={icon === g.name} aria-label={`${g.name} icon`} onClick={() => setIcon(g.name)}>
              <Glyph d={g.d} />
            </button>
          ))}
        </div>
        <Text as="p" variant="bodyMd" tone="subdued">
          <Button variant="plain" onClick={() => notify('Opens the chat with Joy support.')}>Contact us</Button> to customize your floating button icon.
        </Text>
        {locked ? (
          <BlockStack gap="200" inlineAlign="center">
            <div className="fse-wide">
              <Button icon={MagicIcon} disabled fullWidth>Generate AI Icon</Button>
            </div>
            <Button variant="plain" onClick={onLocked} accessibilityLabel="Generate AI Icon is available on Advanced. See the plan">
              Available on Advanced
            </Button>
          </BlockStack>
        ) : (
          <div className="fse-wide">
            <Button icon={MagicIcon} fullWidth onClick={() => notify('Opens the AI icon generator.')}>Generate AI Icon</Button>
          </div>
        )}
        <Divider />
        <Text as="h2" variant="headingSm" fontWeight="medium">
          Button color
        </Text>
        <InlineStack gap="800">
          <InlineStack gap="300" blockAlign="center">
            <span className="fse-swatch fse-swatch--dark" />
            <BlockStack gap="050">
              <Text as="span" variant="bodyMd">Button color</Text>
              <Text as="span" variant="bodySm" tone="subdued">#1a1a1a</Text>
            </BlockStack>
          </InlineStack>
          <InlineStack gap="300" blockAlign="center">
            <span className="fse-swatch fse-swatch--light" />
            <BlockStack gap="050">
              <Text as="span" variant="bodyMd">Text color</Text>
              <Text as="span" variant="bodySm" tone="subdued">#ffffff</Text>
            </BlockStack>
          </InlineStack>
        </InlineStack>
      </BlockStack>
    </section>
  );
}

function Preview() {
  const {notify} = useShell();
  return (
    <section className="fse-preview" aria-label="Widget preview">
      <div className="fse-preview__bar">
        <InlineStack gap="200" blockAlign="center">
          <button type="button" className="fse-chip" onClick={() => notify('Switches the preview device and customer.')}>
            <span>Preview as ·</span>
            <Icon source={DesktopIcon} />
            <span>Desktop ·</span>
            <Icon source={PersonIcon} />
            <span>Signed in</span>
            <Icon source={ChevronDownIcon} />
          </button>
          <button type="button" className="fse-chip" onClick={() => notify('Click a part of the widget to jump to its setting.')}>
            <Icon source={SearchIcon} />
            <span>Inspect</span>
          </button>
          <Badge tone="success">Embed active</Badge>
        </InlineStack>
        <Button variant="plain" onClick={() => notify('Opens your storefront in a new tab.')}>View on store</Button>
      </div>
      <div className="fse-browser">
        <div className="fse-browser__top">
          <span className="fse-browser__dots" aria-hidden="true"><i /><i /><i /></span>
          <span className="fse-browser__url">pomelopark.com</span>
        </div>
        <div className="fse-store">
          <div className="fse-store__nav">
            <strong>YOUR STORE</strong>
            <span>Home</span>
            <span>Shop</span>
            <span>About</span>
          </div>
          <div className="fse-store__hero">
            <span className="fse-store__title">New Arrivals</span>
            <span className="fse-store__sub">Explore our latest collection</span>
          </div>
          <div className="fse-store__grid">
            {PRODUCTS.map((p) => (
              <div key={p.name} className="fse-product">
                <div className={`fse-product__img fse-product__img--${p.tone}`} />
                <span className="fse-product__name">{p.name}</span>
                <span className="fse-product__price">{p.price}</span>
              </div>
            ))}
          </div>
          <span className="fse-launcher" aria-hidden="true">
            <Glyph d={LAUNCHER_ICONS[1].d} size={16} />
            Reward
          </span>
        </div>
      </div>
    </section>
  );
}

export function UpgradePopupPage() {
  const {shop} = useProto();
  const {state} = useScenario();
  const {notify} = useShell();
  const navigate = useNavigate();
  // "Generate AI Icon" needs Advanced or above (isPremium(shop, PLAN_TIER_1) in LauncherPanel.js).
  const locked = shop !== 'advanced';
  const [open, setOpen] = useState(locked);

  return (
    <div className="fse" role="dialog" aria-modal="true" aria-label="Widget design">
      <header className="fse-title">
        <InlineStack gap="200" blockAlign="center">
          <JoyIcon size={20} />
          <Text as="h1" variant="headingMd">Widget design</Text>
        </InlineStack>
        <InlineStack gap="200" blockAlign="center">
          <button type="button" className="fse-title__guide" onClick={() => notify('Plays the widget design guide.')}>Watch guide</button>
          <button type="button" className="fse-title__close" aria-label="Close" onClick={() => navigate('/dashboard')}>
            <Icon source={XIcon} />
          </button>
        </InlineStack>
      </header>
      <div className="fse-body">
        <SettingsMenu />
        <button type="button" className="fse-collapse" aria-label="Collapse settings" onClick={() => notify('Hides the settings menu.')}>
          <Icon source={ChevronLeftIcon} tone="subdued" />
        </button>
        <div className="fse-panel-wrap">
          {state === 'loading' ? <LoadingView rows={12} /> : <LauncherPanel locked={locked} onLocked={() => setOpen(true)} />}
        </div>
        <Preview />
      </div>
      {locked && state !== 'loading' ? <UpgradePopup open={open} onClose={() => setOpen(false)} planId="advanced" /> : null}
    </div>
  );
}
