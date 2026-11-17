// Joy's AvailableBadge (components/Atoms/PlanLimited/AvailableBadge): <s-badge tone="info">Available on {plan}</s-badge>
// in a clickable wrapper; a click opens the upgrade dialog on that plan. The prototype says so with a toast.
import React from 'react';
import {Badge} from '@shopify/polaris';
import {useShell} from '../shell/ShellContext.jsx';

export function PlanBadge({plan = 'Advanced'}) {
  const {notify} = useShell();
  return (
    <button
      type="button"
      className="plan-badge"
      data-plan-badge=""
      aria-label={`Available on ${plan}: see the ${plan} plan`}
      onClick={() => notify(`Opens the upgrade dialog on the ${plan} plan`)}
    >
      <Badge tone="info">{`Available on ${plan}`}</Badge>
    </button>
  );
}
