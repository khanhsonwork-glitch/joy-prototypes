// Onboarding V2, last step (plan selection): a new shop sees it before it finishes setup.
// Real layout: thin 6-part progress bar, then the step — banner slot (where "Referral discount applied" sits
// when a referral applies) → Calculate your price → the same plan cards as the Plans page → Starter with
// "Continue as Free".
import React from 'react';
import {BlockStack} from '@shopify/polaris';
import {CalculatePrice} from '../components/CalculatePrice.jsx';
import {BfcmInlineBanner} from '../components/Banners.jsx';
import {PlanCards} from '../components/PlanCards.jsx';
import {useNavigate} from '../shell/router.jsx';

export function OnboardingPlanPage() {
  const navigate = useNavigate();
  return (
    <div className="onboarding">
      <div className="onboarding__wrap">
        <div className="onboarding__progress" aria-label="Step 6 of 6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <span key={n} className="onboarding__segment is-done" />
          ))}
        </div>
      </div>
      <div className="onboarding__wrap">
        <BlockStack gap="400">
          <BfcmInlineBanner />
          <CalculatePrice />
          <PlanCards interval="monthly" onboarding onContinueFree={() => navigate('/dashboard')} />
        </BlockStack>
      </div>
    </div>
  );
}
