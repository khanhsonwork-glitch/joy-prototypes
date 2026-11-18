// Programs › Points routes.
import React from 'react';
import {PointsPage} from './PointsPage.jsx';
import {EarnEditor} from './EarnEditor.jsx';
import {RewardEditor} from './RewardEditor.jsx';
import {PointSettings} from './PointSettings.jsx';

export function resolvePoints(segments, query) {
  const [, , kind, id] = segments;
  if (!kind) return <PointsPage />;
  if (kind === 'settings') return <PointSettings />;
  if (kind === 'earn' && id) return <EarnEditor key={id + query.get('type')} id={id} query={query} />;
  if (kind === 'rewards' && id) return <RewardEditor key={id + query.get('type')} id={id} query={query} />;
  return null;
}
