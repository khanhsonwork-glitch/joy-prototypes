// The two Black Friday banners. Both read their words from BFCM_COPY so the three screens say the same thing.
// - BfcmInlineBanner: the slot above the plan cards where the "Joy AI Copilot is live…" banner sits today
//   (Plans page), reused on the onboarding plan step.
// - BfcmDashboardBanner: the Dashboard promotional banner slot, "Promotional (Background image)" template,
//   whose words, image and button the team sets in Dev Zone.
import React, {useState} from 'react';
import {Banner, Button, Text} from '@shopify/polaris';
import {DiscountIcon, XIcon} from '@shopify/polaris-icons';
import {BFCM_COPY} from '../data/plans.js';
import {useProto} from '../state/proto.jsx';
import bannerArt from '../assets/bfcm-banner.svg';

export function BfcmInlineBanner() {
  const {campaign} = useProto();
  const [dismissed, setDismissed] = useState(false);
  if (campaign !== 'running' || dismissed) return null;
  return (
    <div className="bfcm-inline">
      <Banner tone="warning" icon={DiscountIcon} onDismiss={() => setDismissed(true)}>
        <Text as="p" variant="bodyMd">
          <Text as="span" fontWeight="semibold">
            {BFCM_COPY.title}.
          </Text>{' '}
          {BFCM_COPY.line}
        </Text>
      </Banner>
    </div>
  );
}

export function BfcmDashboardBanner({onCta}) {
  const {campaign} = useProto();
  const [dismissed, setDismissed] = useState(false);
  if (campaign !== 'running' || dismissed) return null;
  return (
    <div className="promo-bg" style={{backgroundImage: `url("${bannerArt}")`}} id="bfcm-dashboard-banner">
      <div className="promo-bg__scrim" />
      <div className="promo-bg__content">
        <Text variant="bodyMd" fontWeight="semibold" as="h3">
          {BFCM_COPY.title}
        </Text>
        <span className="promo-bg__desc">
          <Text as="span" variant="bodyMd">
            {BFCM_COPY.line}
          </Text>
        </span>
        <div className="promo-bg__cta">
          <Button onClick={onCta}>See plans</Button>
        </div>
      </div>
      <div className="promo-bg__close">
        <Button variant="plain" icon={XIcon} onClick={() => setDismissed(true)} accessibilityLabel="Close banner" />
      </div>
    </div>
  );
}
