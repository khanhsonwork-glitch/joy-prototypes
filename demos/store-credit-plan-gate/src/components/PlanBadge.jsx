// "Available on Essential", drawn like Joy's AvailableBadge: an info badge in a clickable wrapper that opens the
// Plans page (openPricingModal → /settings/subscription/plans). Inside a row that is itself the button, the badge
// is drawn without its own button (`decorative`) so the row stays one control and the HTML stays valid.
import React from 'react';
import {Badge} from '@shopify/polaris';
import {useNavigate} from '../shell/router.jsx';
import {BADGE_PLAN} from '../data/programs.js';

export function PlanBadge({decorative = false}) {
  const navigate = useNavigate();
  const text = `Available on ${BADGE_PLAN}`;
  if (decorative) return <span className="scg-plan-badge scg-plan-badge--static"><Badge tone="info">{text}</Badge></span>;
  return (
    <button type="button" className="scg-plan-badge" onClick={() => navigate('/plans')} aria-label={`${text}. View plans`}>
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
