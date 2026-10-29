// Pieces the three admin screens share: unsaved-changes guard, plan banner, sync banner.
import React, {useEffect, useState} from 'react';
import {Banner, Modal, Text} from '@shopify/polaris';

/** Joy asks before leaving a page with unsaved edits (same words as the app's leave prompt). */
export function useLeaveGuard(dirty) {
  const [pending, setPending] = useState(null);
  useEffect(() => {
    if (!dirty) return undefined;
    const onBefore = (event) => {
      event.preventDefault();
      setPending(() => event.detail.proceed);
    };
    window.addEventListener('prototype:before-navigate', onBefore);
    return () => window.removeEventListener('prototype:before-navigate', onBefore);
  }, [dirty]);
  const modal = (
    <Modal
      open={Boolean(pending)}
      onClose={() => setPending(null)}
      title="Discard all unsaved changes"
      primaryAction={{content: 'Leave page', destructive: true, onAction: () => {const go = pending; setPending(null); go?.();}}}
      secondaryActions={[{content: 'Cancel', onAction: () => setPending(null)}]}
    >
      <Modal.Section>
        <Text as="p">If you discard changes, you'll delete any edits made since your last save.</Text>
      </Modal.Section>
    </Modal>
  );
  return modal;
}

export function PlanBanner({onViewPlans}) {
  return (
    <Banner tone="warning" title="Order value tiers are available on the Advanced plan" action={{content: 'View plans', onAction: onViewPlans}}>
      <p>Your current plan is Essential. Your referral rewards keep working as they are.</p>
    </Banner>
  );
}

export function SyncBanner({onRetry}) {
  return (
    <Banner tone="critical" title="Friend tier discounts couldn't update at checkout" action={{content: 'Try again', onAction: onRetry}}>
      <p>Your tiers are saved. Until checkout updates, friends still get the tiers saved before 2:14 PM. Joy retries every 15 minutes.</p>
    </Banner>
  );
}
