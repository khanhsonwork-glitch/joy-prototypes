// Pieces every screen shares: the plan tag on a locked control, the upgrade modal it opens, and the banner +
// preview + switch flow an existing shop sees on the old Place order and Birthday pages.
import React, {createContext, useCallback, useContext, useMemo, useState} from 'react';
import {ActionList, Banner, BlockStack, Button, InlineStack, List, Modal, Popover, Text} from '@shopify/polaris';
import {XIcon} from '@shopify/polaris-icons';
import {useShell} from '../shell/ShellContext.jsx';
import {planLabel, useProto} from '../state/proto.jsx';

const WHAT_UNLOCKS = {
  advanced: [
    'Run several Place order programs at once, each with its own priority',
    'Place order for VIP tiers only, with points per tier',
    'Reward by number of items, or once when spending reaches an amount',
    'Different birthday and social rewards for each VIP tier',
    'Extra points for reviews with photos or videos',
  ],
  essential: [
    'Birthday rewards: points, a discount and a free gift together',
    'Order conditions, exclusions and tax settings',
  ],
};

const UpgradeContext = createContext(() => {});
const SwitchContext = createContext(() => {});

/** Wrap the app once; any screen calls `useUpgrade()(plan)` to open the upgrade modal for that plan. */
export function UpgradeProvider({children}) {
  const {setPlan, switchVersion} = useProto();
  const {notify} = useShell();
  const [need, setNeed] = useState(null);
  const [confirm, setConfirm] = useState(false);
  const open = useCallback((plan) => setNeed(plan), []);
  const openSwitch = useCallback(() => setConfirm(true), []);
  return (
    <UpgradeContext.Provider value={open}>
    <SwitchContext.Provider value={openSwitch}>
      {children}
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Switch to the new version?"
        primaryAction={{content: 'Switch', onAction: () => {switchVersion(); setConfirm(false); notify('Switched to the new version');}}}
        secondaryActions={[{content: 'Cancel', onAction: () => setConfirm(false)}]}
      >
        <Modal.Section>
          <List>
            <List.Item>Your Place order program moves to the new version with the same settings.</List.Item>
            <List.Item>Your Birthday program moves to the latest version. Rewards, limit and notifications stay the same.</List.Item>
            <List.Item>New orders earn points the new way from now on. Points already given don't change.</List.Item>
            <List.Item>You can't switch back.</List.Item>
          </List>
        </Modal.Section>
      </Modal>
      <Modal
        open={Boolean(need)}
        onClose={() => setNeed(null)}
        title={need ? `Upgrade to ${planLabel(need)}` : ''}
        primaryAction={{
          content: need ? `Upgrade to ${planLabel(need)}` : 'Upgrade',
          onAction: () => {setPlan(need); notify(`Plan changed to ${planLabel(need)}`); setNeed(null);},
        }}
        secondaryActions={[{content: 'Not now', onAction: () => setNeed(null)}]}
      >
        <Modal.Section>
          <BlockStack gap="300">
            <Text as="p">{need ? `The ${planLabel(need)} plan unlocks:` : ''}</Text>
            <List>{(WHAT_UNLOCKS[need] || []).map((t) => <List.Item key={t}>{t}</List.Item>)}</List>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </SwitchContext.Provider>
    </UpgradeContext.Provider>
  );
}
export const useUpgrade = () => useContext(UpgradeContext);
export const useSwitchConfirm = () => useContext(SwitchContext);

/** Plan tag beside a locked control, like the "Advanced" tag on the old Place order form. Click = upgrade modal. */
export function LockTag({plan}) {
  const upgrade = useUpgrade();
  const openSwitch = useSwitchConfirm();
  // plan === 'new': the option exists only in the new version and the shop's plan already includes it (old form,
  // Advanced and up). Clicking it asks to switch, never to upgrade a plan the shop already pays for.
  if (plan === 'new') {
    return (
      <button type="button" className="re-locktag" onClick={(e) => {e.preventDefault(); e.stopPropagation(); openSwitch();}} aria-label="Available in the new version. Switch">
        New version
      </button>
    );
  }
  return (
    <button type="button" className="re-locktag" onClick={(e) => {e.preventDefault(); e.stopPropagation(); upgrade(plan);}} aria-label={`Available on the ${planLabel(plan)} plan. Upgrade`}>
      {planLabel(plan)}
    </button>
  );
}

/** Label + plan tag, for ChoiceList / Checkbox labels. */
export const lockedLabel = (text, plan) => (
  <InlineStack gap="200" blockAlign="center" wrap={false}>
    <span>{text}</span>
    {plan ? <LockTag plan={plan} /> : null}
  </InlineStack>
);

const BANNER_COPY = {
  placeOrder: {
    title: 'Reward customers differently, order by order',
    body: 'The new Place order lets you add conditions, date ranges and exclusions. On the Advanced plan, run several order programs at once with their own priority.',
  },
  birthday: {
    title: 'Give more than one birthday gift',
    body: 'The new Birthday program sends points, a discount and a free gift together. On the Advanced plan, each VIP tier can get its own gift set.',
  },
};

/** Banner on the old Place order / Birthday page of an existing shop: switch, preview, hide. */
export function SwitchBanner({kind, renderPreview}) {
  const {banner, setBanner} = useProto();
  const {notify} = useShell();
  const setConfirm = useSwitchConfirm();
  const [previewMenu, setPreviewMenu] = useState(false);
  const [preview, setPreview] = useState(null);
  const [hideMenu, setHideMenu] = useState(false);
  const copy = BANNER_COPY[kind];
  if (banner !== 'shown') return null;

  return (
    <div className="re-switch-banner">
      <Banner tone="info" title={copy.title}>
        <BlockStack gap="300">
          <Text as="p">{copy.body}</Text>
          <InlineStack gap="200">
            <Button variant="primary" onClick={() => setConfirm()}>Switch to the new version</Button>
            <Popover
              active={previewMenu}
              activator={<Button disclosure onClick={() => setPreviewMenu((v) => !v)}>Preview</Button>}
              onClose={() => setPreviewMenu(false)}
            >
              <ActionList
                items={[
                  {content: 'Place order program', onAction: () => {setPreview('placeOrder'); setPreviewMenu(false);}},
                  {content: 'Birthday program', onAction: () => {setPreview('birthday'); setPreviewMenu(false);}},
                ]}
              />
            </Popover>
          </InlineStack>
        </BlockStack>
      </Banner>
      <div className="re-switch-banner__close">
        <Popover
          active={hideMenu}
          activator={<Button variant="tertiary" icon={XIcon} accessibilityLabel="Dismiss options" onClick={() => setHideMenu((v) => !v)} />}
          onClose={() => setHideMenu(false)}
          preferredAlignment="right"
        >
          <ActionList
            items={[
              {content: 'Remind me in 7 days', onAction: () => {setBanner('remind'); setHideMenu(false); notify("We'll show this again in 7 days");}},
              {content: "Don't show again", onAction: () => {setBanner('never'); setHideMenu(false); notify('Banner hidden');}},
            ]}
          />
        </Popover>
      </div>

      <Modal
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        size="large"
        title={preview === 'birthday' ? 'Preview: new Birthday program' : 'Preview: new Place order program'}
        primaryAction={{content: 'Switch to the new version', onAction: () => {setPreview(null); setConfirm();}}}
        secondaryActions={[{content: 'Close', onAction: () => setPreview(null)}]}
      >
        <Modal.Section>
          <div className="re-preview">{preview ? renderPreview(preview) : null}</div>
        </Modal.Section>
      </Modal>

    </div>
  );
}

/** Small hook so pages read the plan rules the same way. */
export function usePlanRules() {
  const {plan} = useProto();
  return useMemo(() => ({
    starter: plan === 'starter',
    belowAdvanced: plan !== 'advanced',
  }), [plan]);
}
