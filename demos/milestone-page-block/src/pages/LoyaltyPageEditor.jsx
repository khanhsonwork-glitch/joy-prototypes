// Loyalty page editor (On-site content › New loyalty page), Sections tab, with the new "Milestones" block.
// Shape copied from the real editor: tab bar + section list | settings column | preview with "Preview as".
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ActionList, Banner, BlockStack, Button, ContextualSaveBar, Icon, Popover, Text, TextField, Tooltip} from '@shopify/polaris';
import {
  ChevronDownIcon,
  DesktopIcon,
  DragHandleIcon,
  LanguageTranslateIcon,
  LayoutBlockIcon,
  MagicIcon,
  MobileIcon,
  PersonIcon,
  PlusIcon,
  SearchIcon,
  ThemeEditIcon,
  XIcon,
  StarIcon,
  ImageIcon,
  InfoIcon,
  DiscountIcon,
  PersonAddIcon,
  ChatIcon,
  TargetIcon,
  GiftCardIcon,
  ClockIcon,
  ListBulletedIcon,
} from '@shopify/polaris-icons';
import {useNavigate, useRoute} from '../shell/router.jsx';
import {useShell} from '../shell/ShellContext.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {MilestonePanel, InfoCard} from './MilestonePanel.jsx';
import {StorefrontPage} from './Storefront.jsx';
import {OVERFLOW_PROGRAMS, PROGRAMS, PROGRESS} from '../data/milestones.js';

const LABEL = {
  hero: 'Hero banner',
  inlineBanner: 'Sign-up banner',
  howItWorks: 'How it works',
  earn: 'Ways to earn',
  milestones: 'Milestones',
  redeem: 'Ways to redeem',
  tiers: 'VIP tiers',
  referral: 'Refer a friend',
  redeemProgram: 'Rewards redemption',
  myRewards: 'My rewards',
  activity: 'Rewards activity',
  faq: 'FAQs',
  accountDashboard: 'Loyalty dashboard',
  referralManagement: 'Referral management',
  walletPass: 'Loyalty pass wallet',
  linkAccounts: 'Link accounts',
};
const SECTION_ICON = {
  hero: ImageIcon, inlineBanner: InfoIcon, howItWorks: InfoIcon, earn: StarIcon, milestones: TargetIcon, redeem: DiscountIcon,
  tiers: GiftCardIcon, referral: PersonAddIcon, redeemProgram: DiscountIcon, myRewards: GiftCardIcon, activity: ClockIcon, faq: ChatIcon,
  accountDashboard: ListBulletedIcon, referralManagement: PersonAddIcon, walletPass: GiftCardIcon, linkAccounts: ListBulletedIcon,
};
// Blocks drawn in this prototype's preview. The others keep their real rows but are not part of this change.
const DRAWN = new Set(['hero', 'howItWorks', 'earn', 'milestones', 'redeem', 'referral', 'faq']);

const PAGE_START = ['hero', 'howItWorks', 'earn', 'redeem', 'referral', 'faq'];
const MORE_START = ['inlineBanner', 'tiers', 'redeemProgram', 'myRewards', 'activity', 'accountDashboard', 'referralManagement', 'walletPass', 'linkAccounts', 'milestones'];

/** Defaults a merchant gets the moment the block is added. */
export const DEFAULT_SETTINGS = {
  fullWidth: false,
  audience: 'everyone',
  layout: 'roadmap',
  multi: 'tabs',
  showLocked: true,
  alsoInEarn: false,
  programs: PROGRAMS.map((p) => ({id: p.id, shown: true})),
};

function initialSections(withBlock) {
  const page = withBlock ? ['hero', 'howItWorks', 'earn', 'milestones', 'redeem', 'referral', 'faq'] : PAGE_START;
  return {
    page: page.map((id) => ({id, on: true})),
    more: MORE_START.filter((id) => !page.includes(id)),
  };
}

function TabBar() {
  const {notify} = useShell();
  const tabs = [
    {id: 'design', icon: ThemeEditIcon, label: 'Design'},
    {id: 'sections', icon: LayoutBlockIcon, label: 'Sections'},
    {id: 'on-brand', icon: MagicIcon, label: 'On-brand'},
    {id: 'translations', icon: LanguageTranslateIcon, label: 'Translations'},
  ];
  return (
    <div className="lpe-tabs" role="tablist" aria-label="Editor sections">
      {tabs.map((t) => (
        <Tooltip key={t.id} content={t.label}>
          <button
            type="button"
            role="tab"
            aria-label={t.label}
            aria-selected={t.id === 'sections'}
            className={`lpe-tab${t.id === 'sections' ? ' is-active' : ''}`}
            onClick={() => (t.id === 'sections' ? null : notify(`${t.label} is unchanged in this prototype`))}
          >
            <Icon source={t.icon} />
          </button>
        </Tooltip>
      ))}
    </div>
  );
}

function Toggle({on, label, onChange}) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} className={`lpe-switch${on ? ' is-on' : ''}`} onClick={() => onChange(!on)}>
      <span />
    </button>
  );
}

function SectionsList({sections, setSections, selectedId, onSelect}) {
  const [drag, setDrag] = useState(null);
  const pageCount = sections.page.length;
  const move = (from, to) => {
    if (from == null || from === to) return;
    const page = [...sections.page];
    const [m] = page.splice(from, 1);
    page.splice(to, 0, m);
    setSections({...sections, page});
  };
  return (
    <div className="lpe-group">
      <div className="lpe-group__head">Page sections</div>
      <ul className="lpe-rows">
        {sections.page.map((s, i) => (
          <li
            key={s.id}
            className={`lpe-row${selectedId === s.id ? ' is-selected' : ''}${drag === i ? ' is-dragging' : ''}`}
            draggable
            onDragStart={() => setDrag(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => { move(drag, i); setDrag(null); }}
            onDragEnd={() => setDrag(null)}
          >
            <span className="lpe-row__handle" aria-hidden="true"><Icon source={DragHandleIcon} tone="subdued" /></span>
            <button type="button" className="lpe-row__name" onClick={() => onSelect(s.id)}>
              <Icon source={SECTION_ICON[s.id]} tone="subdued" />
              <span>{LABEL[s.id]}</span>
            </button>
            <Toggle on={s.on} label={`${s.on ? 'Hide' : 'Show'} ${LABEL[s.id]}`} onChange={(on) => setSections({...sections, page: sections.page.map((x) => (x.id === s.id ? {...x, on} : x))})} />
            {pageCount > 1 ? (
              <button
                type="button"
                className="lpe-row__x"
                aria-label={`Remove ${LABEL[s.id]} from page`}
                onClick={() => {
                  setSections({page: sections.page.filter((x) => x.id !== s.id), more: [...sections.more, s.id]});
                  if (selectedId === s.id) onSelect(null);
                }}
              >
                <Icon source={XIcon} tone="subdued" />
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      <div className="lpe-group__sub">More sections</div>
      <ul className="lpe-rows">
        {sections.more.map((id) => (
          <li key={id} className="lpe-row lpe-row--more">
            <span className="lpe-row__handle" aria-hidden="true"><Icon source={DragHandleIcon} tone="subdued" /></span>
            <span className="lpe-row__name lpe-row__name--static">
              <Icon source={SECTION_ICON[id]} tone="subdued" />
              <span>{LABEL[id]}</span>
            </span>
            <button
              type="button"
              className="lpe-row__x"
              aria-label={`Add ${LABEL[id]} to page`}
              onClick={() => {
                setSections({page: [...sections.page, {id, on: true}], more: sections.more.filter((x) => x !== id)});
                onSelect(id);
              }}
            >
              <Icon source={PlusIcon} tone="subdued" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PreviewAs({device, viewer, onDevice, onViewer}) {
  const [open, setOpen] = useState(false);
  const {notify} = useShell();
  const activator = (
    <button type="button" className="lpe-previewas" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
      <span>Preview as ·</span>
      <Icon source={device === 'desktop' ? DesktopIcon : MobileIcon} />
      <span>{device === 'desktop' ? 'Desktop' : 'Mobile'}</span>
      <span>·</span>
      <Icon source={PersonIcon} />
      <span>{viewer === 'member' ? 'Member' : 'Guest'}</span>
      <Icon source={ChevronDownIcon} />
    </button>
  );
  return (
    <div className="lpe-preview__bar">
      <Popover active={open} activator={activator} onClose={() => setOpen(false)} autofocusTarget="first-node">
        <ActionList
          actionRole="menuitem"
          sections={[
            {title: 'Device', items: [
              {content: 'Desktop', icon: DesktopIcon, active: device === 'desktop', onAction: () => { onDevice('desktop'); setOpen(false); }},
              {content: 'Mobile', icon: MobileIcon, active: device === 'mobile', onAction: () => { onDevice('mobile'); setOpen(false); }},
            ]},
            {title: 'Customer', items: [
              {content: 'Member', active: viewer === 'member', onAction: () => { onViewer('member'); setOpen(false); }},
              {content: 'Guest', active: viewer === 'guest', onAction: () => { onViewer('guest'); setOpen(false); }},
            ]},
          ]}
        />
      </Popover>
      <button type="button" className="lpe-link" onClick={() => notify('Opens your loyalty page on the storefront')}>View on store</button>
    </div>
  );
}

export function LoyaltyPageEditor() {
  const route = useRoute();
  const navigate = useNavigate();
  const {notify} = useShell();
  const {state, setState} = useScenario();
  const deepBlock = route.segments[1] === 'milestones';

  const [saved, setSaved] = useState(() => ({sections: initialSections(deepBlock), settings: DEFAULT_SETTINGS}));
  const [sections, setSections] = useState(saved.sections);
  const [settings, setSettings] = useState(saved.settings);
  const [selectedId, setSelectedId] = useState(deepBlock ? 'milestones' : null);
  const q = route.query;
  const [device, setDevice] = useState(q.get('device') === 'mobile' ? 'mobile' : 'desktop');
  const [viewer, setViewer] = useState(q.get('as') === 'guest' ? 'guest' : 'member');
  const previewRef = useRef(null);

  // Keep the address in step with what is open, so the link can be shared.
  useEffect(() => {
    const params = new URLSearchParams();
    if (device === 'mobile') params.set('device', 'mobile');
    if (viewer === 'guest') params.set('as', 'guest');
    if (state !== 'default') params.set('state', state);
    const path = selectedId === 'milestones' ? '/loyalty-page-editor/milestones' : '/loyalty-page-editor';
    const target = `${path}${params.toString() ? `?${params}` : ''}`;
    const now = window.location.hash.replace(/^#/, '');
    if (now !== target) window.history.replaceState(null, '', `${window.location.search}#${target}`);
  }, [selectedId, device, viewer, state]);

  const dirty = JSON.stringify({sections, settings}) !== JSON.stringify(saved);
  const select = useCallback((id) => setSelectedId(id), []);

  // Scroll the preview to the selected block, as the real editor does.
  const scrollPreviewTo = useCallback((id) => {
    const stage = previewRef.current;
    if (!stage) return;
    const box = stage.querySelector('.lpe-phone__screen') || stage;
    const el = stage.querySelector(`[data-section="${id}"]`);
    if (!el) return;
    const top = el.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - 12;
    box.scrollTo({top: Math.max(0, top)});
  }, []);
  useEffect(() => {
    if (!selectedId) return undefined;
    const id = requestAnimationFrame(() => scrollPreviewTo(selectedId));
    return () => cancelAnimationFrame(id);
  }, [selectedId, device, sections, scrollPreviewTo]);

  const programs = state === 'overflow' || state === 'worst' ? OVERFLOW_PROGRAMS : PROGRAMS;
  const progress = state === 'complete' ? PROGRESS.done : state === 'overflow' || state === 'worst' ? PROGRESS.overflow : PROGRESS.member;
  const panelState = state === 'worst' ? 'error' : state;
  const visiblePrograms = state === 'empty' ? {...settings, programs: []} : settings;

  const onCta = (what) => {
    const text = {invite: 'Scrolls to Refer a friend on the page', shop: 'Opens the shop’s Continue shopping URL', join: 'Opens sign-up', signin: 'Opens sign-in'}[what];
    notify(text);
    if (what === 'invite') scrollPreviewTo('referral');
  };

  let panel;
  if (selectedId === 'milestones') {
    panel = (
      <MilestonePanel
        settings={settings}
        programs={programs}
        state={panelState}
        onRetry={() => setState('default')}
        onChange={(patch) => setSettings((s) => ({...s, ...patch}))}
        onEditText={() => notify('Opens Translations › Milestones')}
      />
    );
  } else if (selectedId) {
    panel = (
      <BlockStack gap="400">
        <Text as="h2" variant="headingMd">{LABEL[selectedId]}</Text>
        <InfoCard action={sections.page.some((s) => s.id === 'milestones') ? <Button onClick={() => setSelectedId('milestones')}>Open Milestones</Button> : null}>
          {DRAWN.has(selectedId) ? 'This block keeps its current settings. This prototype only adds the Milestones block.' : 'This block is not drawn in this prototype. This prototype only adds the Milestones block.'}
        </InfoCard>
      </BlockStack>
    );
  } else {
    panel = (
      <div className="lpe-hint">
        <Text as="p" variant="bodyMd" tone="subdued">Select a section on the left to edit its content.</Text>
      </div>
    );
  }

  const page = (
    <StorefrontPage
      sections={sections.page.filter((s) => DRAWN.has(s.id))}
      settings={visiblePrograms}
      programs={programs}
      progress={progress}
      viewer={viewer}
      device={device}
      selectedId={selectedId}
      onSelect={select}
      loading={state === 'loading'}
      onCta={onCta}
    />
  );

  return (
    <div className="lpe">
      {dirty ? (
        <ContextualSaveBar
          message="Unsaved changes"
          saveAction={{content: 'Save', onAction: () => { setSaved({sections, settings}); notify(state === 'disabled' ? 'Draft saved' : 'Saved and published'); }}}
          discardAction={{content: 'Discard', onAction: () => { setSections(saved.sections); setSettings(saved.settings); }}}
        />
      ) : null}
      <div className="lpe-side">
        <TabBar />
        <div className="lpe-search">
          <TextField label="Search settings" labelHidden placeholder="Search settings" prefix={<Icon source={SearchIcon} tone="subdued" />} autoComplete="off" value="" onChange={() => notify('Search is unchanged in this prototype')} />
        </div>
        <SectionsList sections={sections} setSections={setSections} selectedId={selectedId} onSelect={select} />
      </div>
      <div className="lpe-settings">
        <BlockStack gap="400">
          {state === 'disabled' ? <Banner tone="info"><Text as="p">Edit and save drafts on Free. Publish with Essential.</Text></Banner> : null}
          {panel}
        </BlockStack>
      </div>
      <div className="lpe-preview">
        <PreviewAs device={device} viewer={viewer} onDevice={setDevice} onViewer={setViewer} />
        <div className="lpe-preview__stage" ref={previewRef}>
          {device === 'desktop' ? (
            <div className="lpe-browser">
              <div className="lpe-browser__bar"><span className="lpe-dots" aria-hidden="true"><i /><i /><i /></span><span className="lpe-browser__url">pomelopark.com/pages/rewards</span></div>
              {page}
            </div>
          ) : (
            <div className="lpe-phone"><div className="lpe-phone__screen">{page}</div></div>
          )}
        </div>
      </div>
    </div>
  );
}
