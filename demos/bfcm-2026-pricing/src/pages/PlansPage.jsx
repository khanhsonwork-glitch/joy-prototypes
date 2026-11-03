// Settings › Subscription › View plans (route /settings/subscription/plans in the Joy admin).
// Same order as the real page: Calculate your price → banner slot above the cards → plan cards → Starter.
// Black Friday puts its words in the banner slot that shows "Joy AI Copilot is live…" today.
import React, {useState} from 'react';
import {BlockStack, SkeletonBodyText, SkeletonDisplayText, Card} from '@shopify/polaris';
import {CalculatePrice} from '../components/CalculatePrice.jsx';
import {BfcmInlineBanner} from '../components/Banners.jsx';
import {IntervalToggle, PlanCards} from '../components/PlanCards.jsx';
import {useProto} from '../state/proto.jsx';
import {useScenario} from '../kit/scenario.jsx';

function Skeleton() {
  return (
    <BlockStack gap="800">
      <Card>
        <BlockStack gap="200">
          <SkeletonDisplayText size="small" />
          <SkeletonBodyText lines={3} />
        </BlockStack>
      </Card>
      <Card>
        <SkeletonBodyText lines={1} />
      </Card>
      <div className="plan-grid">
        {[1, 2, 3].map((n) => (
          <Card key={n}>
            <BlockStack gap="300">
              <SkeletonDisplayText size="large" />
              <SkeletonBodyText lines={10} />
            </BlockStack>
          </Card>
        ))}
      </div>
    </BlockStack>
  );
}

export function PlansPage() {
  const {annual} = useProto();
  const {state} = useScenario();
  const [interval, setInterval] = useState('monthly');
  const shown = annual ? interval : 'monthly';
  return (
    <div className="plans-page">
      {state === 'loading' ? (
        <Skeleton />
      ) : (
        <BlockStack gap="400">
          <CalculatePrice />
          <BfcmInlineBanner />
          {annual ? <IntervalToggle interval={interval} setInterval={setInterval} /> : null}
          <PlanCards interval={shown} />
        </BlockStack>
      )}
    </div>
  );
}
