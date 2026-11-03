// The upgrade popup a locked feature opens: hooks/modal/usePricingModal.js on avada/master (layout + strings from
// locale/input/Modal.json › usePricingModal). Same order as the real popup: header art, "Available in [plan] - $X/month",
// "What's in [plan]:" two-column list with green checks, one full-width dark button.
// Black Friday adds exactly what the plan cards add, from the same planView() + PromoLines: discounted price in the
// headline, struck price + "-30% · 3 months" + ⓘ, "From month 4". After Dec 31 the popup is today's popup.
import React from 'react';
import {Badge, BlockStack, Button, Icon, InlineStack, Modal, Text} from '@shopify/polaris';
import {CheckIcon} from '@shopify/polaris-icons';
import {PLANS, POPUP_FEATURES, planView} from '../data/plans.js';
import {useProto} from '../state/proto.jsx';
import {useShell} from '../shell/ShellContext.jsx';
import {PromoLines} from './PlanCards.jsx';
import art from '../assets/upgrade-popup-art.svg';

export function UpgradePopup({open, onClose, planId}) {
  const {shop, campaign} = useProto();
  const {notify} = useShell();
  const plan = PLANS.find((p) => p.id === planId);
  const view = planView(plan, {shopPlan: shop, campaign, interval: 'monthly'});
  // Real rule: the button says "Upgrade" once the shop has used its trial, else "Start N-day free trial".
  const trialUsed = shop !== 'starter';
  const cta = trialUsed ? 'Upgrade' : `Start ${plan.trialDays}-day free trial`;
  const upgrade = () => {
    notify(view.promo ? `Shopify opens to approve $${view.price} for the first ${view.promo.cycles} months.` : 'Shopify opens to approve the charge.');
    onClose();
  };

  return (
    <Modal size="fullScreen" instant open={open} onClose={onClose} title={`Available in ${plan.name}`} titleHidden noScroll>
      <div className="upgrade-popup">
        <img className="upgrade-popup__art" src={art} alt="" />
        <div className="upgrade-popup__body">
          <BlockStack gap="400">
            <BlockStack gap="150">
              <InlineStack gap="200" blockAlign="center">
                <Text as="h1" variant="headingXl">
                  Available in
                </Text>
                <Badge tone="attention" size="large">
                  <Text as="p" variant="headingLg" fontWeight="bold">
                    {plan.name}
                  </Text>
                </Badge>
                <Text as="h1" variant="headingXl">
                  {`- $${view.price}/month`}
                </Text>
              </InlineStack>
              {view.promo ? (
                <BlockStack gap="100">
                  <PromoLines view={view} />
                </BlockStack>
              ) : null}
            </BlockStack>
            <InlineStack gap="200" blockAlign="baseline">
              <Text as="p" variant="headingMd" fontWeight="regular">
                What’s in
              </Text>
              <Badge tone="attention">
                <Text as="p" variant="bodyMd" fontWeight="semibold">
                  {plan.name}
                </Text>
              </Badge>
              <Text as="p" variant="bodyMd">
                :
              </Text>
            </InlineStack>
            <div className="upgrade-popup__features">
              {POPUP_FEATURES[planId].map((feature) => (
                <InlineStack key={feature} wrap={false} blockAlign="start" gap="200">
                  <span className="upgrade-popup__tick">
                    <Icon source={CheckIcon} tone="success" />
                  </span>
                  <Text as="p">{feature}</Text>
                </InlineStack>
              ))}
            </div>
            <div className="upgrade-popup__action">
              <div className="upgrade-popup__button">
                <Button fullWidth onClick={upgrade}>
                  <span className="upgrade-popup__cta">{cta}</span>
                </Button>
              </div>
            </div>
          </BlockStack>
        </div>
      </div>
    </Modal>
  );
}

/** The small "Available on [plan]" badge a locked control wears (AvailableBadge / PlanGate on avada/master). */
export function AvailableOnBadge({plan, onClick}) {
  return (
    <button type="button" className="available-badge" onClick={onClick} aria-haspopup="dialog">
      <Badge tone="info">{`Available on ${plan}`}</Badge>
    </button>
  );
}
