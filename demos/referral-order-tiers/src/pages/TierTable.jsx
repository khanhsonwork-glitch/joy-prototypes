// The order-amount table both Edit pages put inside their Reward settings card: one row per order amount,
// "Friend's first order from" → the reward, up to 5 rows, worked examples under it. No "tier" wording on screen:
// it would read as VIP tiers (Alex 29/10 17:53).
import React, {useEffect, useState} from 'react';
import {BlockStack, Button, InlineStack, Text, TextField} from '@shopify/polaris';
import {DeleteIcon, PlusIcon} from '@shopify/polaris-icons';
import {MAX_TIERS} from '../data/index.js';
import {canAddTier} from '../state/logic.js';

// Phones stack each tier into a block, so every field needs its own label there.
function useNarrow() {
  const query = '(max-width: 640px)';
  const [narrow, setNarrow] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setNarrow(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return narrow;
}

/**
 * tiers: [{id, min, value}] sorted · valueLabel / unit: the reward column · minLocked: amounts come from elsewhere
 * onMin(id, v) · onValue(id, v) · onAdd() · onRemove(id) · check: {errors, warnings} · show: show errors
 */
export function TierTable({tiers, valueLabel, unit, minLocked, minLockedHelp, onMin, onValue, onAdd, onRemove, onResort, check, show, locked, examples}) {
  const narrow = useNarrow();
  return (
    <BlockStack gap="300">
      <div className="rt-table" role="group" aria-label="Order amounts">
        {tiers.map((t, i) => {
          const hide = i > 0 && !narrow;
          const e = check.errors[t.id] || {};
          const w = check.warnings[t.id];
          return (
            <div className="rt-row" data-tier-row={i + 1} key={t.id} onBlur={onResort}>
              <div className="rt-cell">
                <TextField
                  label="Friend's first order from"
                  labelHidden={hide}
                  type="number"
                  prefix="$"
                  value={String(t.min)}
                  onChange={(v) => onMin(t.id, v)}
                  error={show ? e.min : undefined}
                  disabled={locked || minLocked}
                  autoComplete="off"
                />
              </div>
              <div className="rt-cell">
                <TextField
                  label={valueLabel}
                  labelHidden={hide}
                  type="number"
                  prefix={unit.prefix}
                  suffix={unit.suffix}
                  value={String(t.value)}
                  onChange={(v) => onValue(t.id, v)}
                  error={show ? e.value : undefined}
                  disabled={locked}
                  autoComplete="off"
                />
              </div>
              <div className="rt-cell rt-cell--action">
                <Button
                  icon={DeleteIcon}
                  variant="tertiary"
                  accessibilityLabel={`Remove row ${i + 1}`}
                  onClick={() => onRemove(t.id)}
                  disabled={locked || minLocked || tiers.length === 1}
                />
              </div>
              {w?.length ? (
                <div className="rt-warn" role="note">
                  {w.map((x) => <Text key={x} as="p" variant="bodySm" tone="caution">{x}</Text>)}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      {minLocked ? (
        <Text as="p" variant="bodySm" tone="subdued">{minLockedHelp}</Text>
      ) : (
        <InlineStack gap="300" blockAlign="center">
          <Button icon={PlusIcon} onClick={onAdd} disabled={locked || !canAddTier(tiers)}>Add order amount</Button>
          <Text as="span" variant="bodySm" tone="subdued">{canAddTier(tiers) ? `Up to ${MAX_TIERS} order amounts` : `You've reached ${MAX_TIERS} order amounts`}</Text>
        </InlineStack>
      )}
      {examples}
    </BlockStack>
  );
}

/** New tier under the last one: double its amount and its reward, so the merchant edits rather than types from zero. */
export function nextTier(tiers, fallbackMin, fallbackValue) {
  const last = tiers.at(-1);
  if (!last) return {min: String(fallbackMin), value: String(fallbackValue)};
  const min = Math.round((Number(last.min) || 0) * 2) || 100;
  const value = (Number(last.value) || 0) * 2 || '';
  return {min: String(min), value: String(value)};
}

