// Pieces the Settings pages share: the Settings side menu (Setting.js + listSettings.js on avada/master), the
// "Leave page with unsaved changes?" guard, and the failed-sync banner of the Worst case state.
import React, {useEffect, useRef, useState} from 'react';
import {Banner, Card, Icon, Modal, Text, TextField} from '@shopify/polaris';
import {
  AppExtensionIcon, ClockIcon, CodeIcon, ColorIcon, EmailNewsletterIcon, LanguageTranslateIcon, NotificationIcon,
  OrderDraftIcon, PaymentIcon, PlusCircleIcon, SearchIcon,
} from '@shopify/polaris-icons';
import {useNavigate} from '../shell/router.jsx';
import {useShell} from '../shell/ShellContext.jsx';

const SETTINGS_MENU = [
  {value: 'general', label: 'General', icon: AppExtensionIcon, url: '/settings'},
  {value: 'colors', label: 'Brand', icon: ColorIcon},
  {value: 'email-report', label: 'Email', icon: EmailNewsletterIcon},
  {value: 'notifications', label: 'Notifications', icon: NotificationIcon},
  {value: 'before-launch', label: 'Pre-launch', icon: ClockIcon},
  {value: 'order', label: 'Order', icon: OrderDraftIcon},
  {value: 'translations', label: 'Translations', icon: LanguageTranslateIcon, url: '/settings/translations'},
  {value: 'subscription', label: 'Subscription', icon: PaymentIcon},
  {value: 'developers', label: 'Developers', icon: CodeIcon},
  {value: 'additional-features', label: 'Additional features', icon: PlusCircleIcon},
];

/** Settings page frame: the side menu card on the left (1/3), the selected section on the right (2/3). */
export function SettingsLayout({selected, children}) {
  const navigate = useNavigate();
  const {notify} = useShell();
  const [query, setQuery] = useState('');
  return (
    <div className="pnf-page pnf-settings">
      <div className="pnf-settings__nav">
        <Card padding="0">
          <div className="pnf-settings__search">
            <TextField label="Search settings" labelHidden placeholder="Search settings..." autoComplete="off" value={query} onChange={setQuery}
              prefix={<Icon source={SearchIcon} tone="subdued" />} />
          </div>
          <ul className="pnf-settings__list">
            {SETTINGS_MENU.map((item) => (
              <li key={item.value}>
                <button type="button" className={`pnf-settings__item${selected === item.value ? ' is-selected' : ''}`}
                  aria-current={selected === item.value ? 'page' : undefined}
                  onClick={() => (item.url ? navigate(item.url) : notify(`${item.label} isn't part of this prototype`))}>
                  <Icon source={item.icon} /><span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      </div>
      <div className="pnf-settings__body">{children}</div>
    </div>
  );
}

/**
 * The admin's leave prompt: while `dirty`, any route change (menu, link, back) waits for Leave page / Stay.
 * Leave page discards the draft, then goes on.
 */
export function useLeaveGuard(dirty, onDiscard) {
  const [pending, setPending] = useState(null);
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;
  const discardRef = useRef(onDiscard);
  discardRef.current = onDiscard;
  useEffect(() => {
    const onBefore = (event) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
      setPending(() => event.detail.proceed);
    };
    window.addEventListener('prototype:before-navigate', onBefore);
    return () => window.removeEventListener('prototype:before-navigate', onBefore);
  }, []);
  return (
    <Modal
      open={!!pending}
      onClose={() => setPending(null)}
      title="Leave page with unsaved changes?"
      primaryAction={{content: 'Leave page', destructive: true, onAction: () => {
        const proceed = pending;
        setPending(null);
        discardRef.current();
        proceed?.();
      }}}
      secondaryActions={[{content: 'Stay', onAction: () => setPending(null)}]}
    >
      <Modal.Section><Text as="p">Leaving this page will delete all unsaved changes.</Text></Modal.Section>
    </Modal>
  );
}

/** Worst case: the last save did not reach the storefront. */
export function SyncBanner({what}) {
  const {notify} = useShell();
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <Banner tone="warning" title="Your last save didn't reach your storefront"
      action={{content: 'Try again', onAction: () => {setHidden(true); notify('Synced to your storefront');}}}
      onDismiss={() => setHidden(true)}>
      <p>{`Customers still see the previous ${what}. Nothing you saved is lost.`}</p>
    </Banner>
  );
}

/** Disabled state: why the page is read-only. */
export function LockedBanner() {
  return (
    <Banner tone="info" title="You can view these settings but not change them">
      <p>Your staff account doesn't have permission to edit Joy settings. Ask the store owner to give you access.</p>
    </Banner>
  );
}
