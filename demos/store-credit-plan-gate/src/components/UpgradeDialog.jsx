// Upgrade dialog every "Available on Essential" badge opens, drawn after Joy's pricing modal
// (hooks/modal/usePricingModal.js): hidden title, no footer, "Available in <plan pill> - $price/month",
// "What's in <plan>:" with a two-column tick list, one full-width trial button. The Essential list is the one a
// shop installed from 2025 sees (isUpgradedFeature2025), plus the "Store credit rewards" line this feature adds.
// The modal's header photo (a CDN image) is left out: the prototype loads nothing from outside.
import React, {createContext, useCallback, useContext, useMemo, useState} from 'react';
import {Button, Icon, Modal, Text} from '@shopify/polaris';
import {CheckIcon} from '@shopify/polaris-icons';
import {useShell} from '../shell/ShellContext.jsx';
import {BADGE_PLAN} from '../data/programs.js';

const ESSENTIAL = {
  price: 29,
  trialDays: 14,
  features: [
    'All features in Starter plan',
    'Up to 500 monthly free orders',
    'Store credit rewards',
    'On-brand loyalty page',
    'Shopify Flow and 30+ integrations',
    'Shopify Metafield integration',
    'Analytics',
    'Advanced widget design',
    'Potential points on product page',
    'Customizable notifications',
    'Unlimited Points Rewards and Redeem Programs',
  ],
};

const UpgradeContext = createContext({openUpgrade: () => {}});

export function UpgradeProvider({children}) {
  const {notify} = useShell();
  const [open, setOpen] = useState(false);
  const openUpgrade = useCallback(() => setOpen(true), []);
  const value = useMemo(() => ({openUpgrade}), [openUpgrade]);
  return (
    <UpgradeContext.Provider value={value}>
      {children}
      <Modal open={open} onClose={() => setOpen(false)} title={`Upgrade to ${BADGE_PLAN}`} titleHidden>
        <div className="scg-upgrade" data-dialog="upgrade">
          <div className="scg-upgrade__heading">
            <Text as="h2" variant="headingXl">Available in</Text>
            <span className="scg-upgrade__pill scg-upgrade__pill--lg">{BADGE_PLAN}</span>
            <Text as="p" variant="headingXl">{`- $${ESSENTIAL.price}/month`}</Text>
          </div>
          <div className="scg-upgrade__whats">
            <Text as="p">What’s in</Text>
            <span className="scg-upgrade__pill">{BADGE_PLAN}</span>
            <Text as="p">:</Text>
          </div>
          <ul className="scg-upgrade__features">
            {ESSENTIAL.features.map((f) => (
              <li key={f} data-feature={f === 'Store credit rewards' ? 'store-credit' : undefined}>
                <span className="scg-upgrade__tick"><Icon source={CheckIcon} tone="success" /></span>
                <Text as="span">{f}</Text>
              </li>
            ))}
          </ul>
          <div className="scg-upgrade__action">
            <Button
              variant="primary"
              size="large"
              fullWidth
              onClick={() => {
                setOpen(false);
                notify('Prototype: Shopify asks you to approve the charge here.');
              }}
            >
              {`Start ${ESSENTIAL.trialDays}-day free trial`}
            </Button>
          </div>
        </div>
      </Modal>
    </UpgradeContext.Provider>
  );
}

/** {openUpgrade()}: opens the upgrade dialog on the Essential plan. */
export const useUpgrade = () => useContext(UpgradeContext);
