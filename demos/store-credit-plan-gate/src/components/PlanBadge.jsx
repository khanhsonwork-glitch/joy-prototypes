// "Available on Essential", drawn like Joy's AvailableBadge: an info badge in a clickable wrapper. A click opens the
// upgrade dialog on the Essential plan (UpgradeDialog.jsx, after usePricingModal.js), not the Plans page. Inside a
// row that is itself the button, the badge is drawn without its own button (`decorative`) so the row stays one
// control and the HTML stays valid.
import React from 'react';
import {Badge} from '@shopify/polaris';
import {BADGE_PLAN} from '../data/programs.js';
import {useUpgrade} from './UpgradeDialog.jsx';

export function PlanBadge({decorative = false}) {
  const {openUpgrade} = useUpgrade();
  const text = `Available on ${BADGE_PLAN}`;
  if (decorative) return <span className="scg-plan-badge scg-plan-badge--static"><Badge tone="info">{text}</Badge></span>;
  return (
    <button type="button" className="scg-plan-badge" onClick={openUpgrade} aria-label={`${text}. Upgrade`}>
      <Badge tone="info">{text}</Badge>
    </button>
  );
}

/** A field label with the badge beside it, for controls whose own label is hidden (the UseSelectExpired layout). */
export function LabelWithBadge({htmlFor, children, locked}) {
  return (
    <div className="scg-label-row">
      {htmlFor ? <label htmlFor={htmlFor} className="scg-label">{children}</label> : <span className="scg-label">{children}</span>}
      {locked ? <PlanBadge /> : null}
    </div>
  );
}
