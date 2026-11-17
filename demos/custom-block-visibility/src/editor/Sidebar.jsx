// Left column of the Widget editor, Sections tab: icon tab bar, search, and the Header / Body / Profile / Footer groups.
// Body rows: drag handle, icon, label, and on the right the on/off switch. Custom blocks also get the trash icon.
import React, {useState} from 'react';
import {ActionList, Button, Icon, Popover, Tooltip} from '@shopify/polaris';
import {
  AppsIcon,
  BarcodeIcon,
  ButtonPressIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  CodeIcon,
  CollectionIcon,
  CreditCardIcon,
  DeleteIcon,
  DesktopIcon,
  DiscountIcon,
  DragHandleIcon,
  ExternalIcon,
  GiftCardIcon,
  ImageAltIcon,
  ImageIcon,
  LanguageTranslateIcon,
  LayoutBlockIcon,
  LinkIcon,
  MagicIcon,
  MinusIcon,
  PersonAddIcon,
  PersonIcon,
  PlusIcon,
  QuestionCircleIcon,
  SearchIcon,
  SettingsIcon,
  ShieldPersonIcon,
  StarIcon,
  TargetIcon,
  TextAlignLeftIcon,
  TextFontIcon,
  TextIcon,
  ThumbsUpIcon,
  ViewIcon,
  WalletIcon,
} from '@shopify/polaris-icons';
import {ADD_BLOCK_GROUPS, CUSTOM_LABELS, SECTION_META, isCustom, rowLabel, typeOf} from '../data/widget.js';
import {useEditor} from '../state/editor.jsx';
import {useShell} from '../shell/ShellContext.jsx';
import {Switch, cx, useSortable} from './bits.jsx';

const SECTION_ICONS = {
  COUPONS: DiscountIcon,
  VIP_TIERS: ShieldPersonIcon,
  PROMOTED_COLLECTIONS: CollectionIcon,
  QUEST: QuestionCircleIcon,
  REFERRAL: PersonAddIcon,
  EARN_TAB: StarIcon,
  REDEEM_TAB: GiftCardIcon,
  RECENTLY_VIEWED: ViewIcon,
  PRODUCTS: ThumbsUpIcon,
  ACTIVITIES: ClockIcon,
  MILESTONE: TargetIcon,
  FAQ: QuestionCircleIcon,
  WIDGET_QR: BarcodeIcon,
  WALLET_PASS: WalletIcon,
};
const CUSTOM_ICONS = {
  CUSTOM_LINK: ExternalIcon,
  CUSTOM_CTA: ButtonPressIcon,
  CUSTOM_BANNER: ImageAltIcon,
  CUSTOM_BUTTON: ButtonPressIcon,
  CUSTOM_HEADING: CreditCardIcon,
  CUSTOM_RICHTEXT: CodeIcon,
  CUSTOM_DIVIDER: DesktopIcon,
  CUSTOM_IMAGE_TEXT: ImageIcon,
};
const ADD_ICONS = {
  CUSTOM_HEADING: TextFontIcon,
  CUSTOM_RICHTEXT: TextAlignLeftIcon,
  CUSTOM_BUTTON: ButtonPressIcon,
  CUSTOM_DIVIDER: MinusIcon,
  CUSTOM_BANNER: ImageAltIcon,
  CUSTOM_IMAGE_TEXT: TextIcon,
  CUSTOM_LINK: ExternalIcon,
  CUSTOM_CTA: LinkIcon,
};

const TABS = [
  {id: 'settings', label: 'Settings', icon: SettingsIcon},
  {id: 'sections', label: 'Sections', icon: LayoutBlockIcon},
  {id: 'ai', label: 'On-brand', icon: MagicIcon},
  {id: 'content', label: 'Content', icon: LanguageTranslateIcon},
  {id: 'extensions', label: 'Extensions', icon: AppsIcon},
];

function TabBar() {
  const {notify} = useShell();
  return (
    <div className="we-tabs" role="tablist" aria-label="Editor tabs">
      {TABS.map((tab) => (
        <Tooltip key={tab.id} content={tab.label} preferredPosition="below">
          <button
            type="button"
            role="tab"
            aria-selected={tab.id === 'sections'}
            aria-label={tab.label}
            className={cx('we-tab', tab.id === 'sections' && 'is-active')}
            onClick={() => tab.id !== 'sections' && notify(`${tab.label} isn't part of this prototype.`)}
          >
            <Icon source={tab.icon} />
          </button>
        </Tooltip>
      ))}
    </div>
  );
}

function AddBlock({onAdd}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="we-add">
      <Popover
        active={open}
        onClose={() => setOpen(false)}
        activator={<Button icon={PlusIcon} accessibilityLabel="Add block" onClick={() => setOpen((v) => !v)} />}
      >
        <ActionList
          actionRole="menuitem"
          sections={ADD_BLOCK_GROUPS.map((group) => ({
            title: group.title,
            items: group.types.map((type) => ({
              content: CUSTOM_LABELS[type],
              icon: ADD_ICONS[type],
              onAction: () => {
                setOpen(false);
                onAdd(type);
              },
            })),
          }))}
        />
      </Popover>
    </div>
  );
}

function BodyRow({section, active, onSelect, onRemove, rowProps}) {
  const ed = useEditor();
  const label = rowLabel(section);
  const custom = isCustom(section);
  const icon = custom ? CUSTOM_ICONS[typeOf(section)] || ExternalIcon : SECTION_ICONS[section.id];
  const badge = SECTION_META[section.id]?.badge;
  return (
    <div className={cx('we-row', 'we-row--drag', active && 'is-active')} {...rowProps}>
      <span className="we-row__handle" aria-hidden="true">
        <Icon source={DragHandleIcon} tone="subdued" />
      </span>
      <button type="button" className="we-row__main" aria-current={active ? 'true' : undefined} onClick={() => onSelect(section.id)}>
        <span className="we-row__icon">
          <Icon source={icon} tone="subdued" />
        </span>
        <span className="we-row__label">{label}</span>
        {badge ? <span className="we-row__badge">{badge}</span> : null}
      </button>
      {custom ? (
        <button
          type="button"
          className="we-row__trash"
          aria-label={`Remove ${label}`}
          onClick={(event) => {
            event.stopPropagation();
            onRemove(section.id);
          }}
        >
          <Icon source={DeleteIcon} tone="critical" />
        </button>
      ) : null}
      <Switch checked={section.enabled !== false} onChange={() => ed.toggle(section.id)} label={`Show ${label}`} />
    </div>
  );
}

function Group({id, label, open, onToggle, searching, children}) {
  const expanded = searching || open;
  return (
    <div className="we-group">
      <button type="button" className="we-group__head" aria-expanded={expanded} onClick={() => !searching && onToggle(id)}>
        <span>{label}</span>
        <Icon source={expanded ? ChevronUpIcon : ChevronDownIcon} tone="subdued" />
      </button>
      {expanded ? <div className="we-group__items">{children}</div> : null}
    </div>
  );
}

const PROFILE_ROWS = ['Account info', 'Referral link', 'Social accounts', 'Shipping addresses', 'Settings', 'Log out'];

export function Sidebar({selectedId, onSelect, onAdd, onRemove}) {
  const ed = useEditor();
  const {notify} = useShell();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState({header: true, body: true, profile: false, footer: false});
  const rowProps = useSortable(ed.move);
  const q = query.trim().toLowerCase();
  const searching = q.length > 0;
  const match = (label) => !searching || label.toLowerCase().includes(q);
  const notYet = (label) => notify(`${label} isn't part of this prototype.`);

  const bodyRows = ed.sections.filter((s) => match(rowLabel(s)));
  const showMembership = match('Membership card');
  const showHeader = match('Header');
  const profileRows = PROFILE_ROWS.filter(match);
  const showFooter = match('Footer menu');
  const nothing = searching && !bodyRows.length && !showMembership && !showHeader && !profileRows.length && !showFooter;

  const toggleGroup = (id) => setOpen((o) => ({...o, [id]: !o[id]}));

  return (
    <div className="we-sidebar">
      <TabBar />
      <div className="we-menu">
        <div className="we-search">
          <label className="we-search__field">
            <span className="we-search__icon">
              <Icon source={SearchIcon} tone="subdued" />
            </span>
            <input type="search" placeholder="Search settings" aria-label="Search settings" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
        </div>

        {showHeader || !searching ? (
          <Group id="header" label="Header" open={open.header} onToggle={toggleGroup} searching={searching}>
            <div className="we-row">
              <button type="button" className="we-row__main" onClick={() => notYet('Header')}>
                <span className="we-row__icon">
                  <Icon source={ImageIcon} tone="subdued" />
                </span>
                <span className="we-row__label">Header</span>
              </button>
            </div>
          </Group>
        ) : null}

        {bodyRows.length || showMembership || !searching ? (
          <Group id="body" label="Body" open={open.body} onToggle={toggleGroup} searching={searching}>
            {showMembership ? (
              <div className="we-row we-row--fixed">
                <button type="button" className="we-row__main" onClick={() => notYet('Membership card')}>
                  <span className="we-row__icon">
                    <Icon source={CreditCardIcon} tone="subdued" />
                  </span>
                  <span className="we-row__label">Membership card</span>
                </button>
                <Switch checked={ed.membership} onChange={() => ed.toggle('membership-card')} label="Show Membership card" />
              </div>
            ) : null}
            {bodyRows.map((section) => (
              <BodyRow key={section.id} section={section} active={selectedId === section.id} onSelect={onSelect} onRemove={onRemove} rowProps={searching ? {} : rowProps(section.id)} />
            ))}
            {!searching ? <AddBlock onAdd={onAdd} /> : null}
          </Group>
        ) : null}

        {profileRows.length || !searching ? (
          <Group id="profile" label="Profile" open={open.profile} onToggle={toggleGroup} searching={searching}>
            {profileRows.map((label) => (
              <div className="we-row we-row--fixed" key={label}>
                <button type="button" className="we-row__main" onClick={() => notYet(label)}>
                  <span className="we-row__icon">
                    <Icon source={PersonIcon} tone="subdued" />
                  </span>
                  <span className="we-row__label">{label}</span>
                </button>
              </div>
            ))}
          </Group>
        ) : null}

        {showFooter || !searching ? (
          <Group id="footer" label="Footer" open={open.footer} onToggle={toggleGroup} searching={searching}>
            <div className="we-row">
              <button type="button" className="we-row__main" onClick={() => notYet('Footer menu')}>
                <span className="we-row__icon">
                  <Icon source={LayoutBlockIcon} tone="subdued" />
                </span>
                <span className="we-row__label">Footer menu</span>
              </button>
            </div>
          </Group>
        ) : null}

        {nothing ? <p className="we-menu__empty">No settings found</p> : null}
      </div>
    </div>
  );
}
