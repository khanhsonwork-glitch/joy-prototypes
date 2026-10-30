// Pieces both edit pages share: the Shop now link field with its live "Shop now opens …" line, the summary card.
import React from 'react';
import {BlockStack, Card, Checkbox, InlineStack, Text, TextField, Badge} from '@shopify/polaris';
import {LINK_PLACEHOLDER} from '../data/index.js';
import {linkError, shopNowTarget} from '../state/links.jsx';

/** The Widget Design control for the same choice (Subscription / Survey links), reused under every link field. */
export function NewTabCheckbox({checked, onChange, disabled, help}) {
  return (
    <Checkbox
      label="Open in new tab"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      helpText={help || 'When off, the link opens in the current tab instead of a new one'}
    />
  );
}

export function ShopNowLinkField({value, onChange, target, help, newTab, onNewTab}) {
  const error = linkError(value);
  const t = shopNowTarget(target);
  return (
    <BlockStack gap="200">
    <TextField
      id="shop-now-link"
      label="Shop now link (optional)"
      autoComplete="url"
      placeholder={LINK_PLACEHOLDER}
      value={value}
      onChange={onChange}
      error={error}
      helpText={(
        <BlockStack gap="100">
          <span>{help}</span>
          <span className="sl-now">{error ? `Until the link is fixed: Shop now opens ${t.url}, ${t.why}.` : `Now: Shop now opens ${t.url}, ${t.why}.`}</span>
        </BlockStack>
      )}
    />
    <NewTabCheckbox checked={newTab} onChange={onNewTab} />
    </BlockStack>
  );
}

export function SummaryCard({title, lines}) {
  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack gap="200" blockAlign="center">
          <Text as="h2" variant="headingSm">{title}</Text>
          <Badge tone="success">Active</Badge>
        </InlineStack>
        <Text as="p" tone="subdued">Period: Oct 1, 2026 - No end date</Text>
        <BlockStack gap="100">
          {lines.map((l) => <Text as="p" key={l}>{`• ${l}`}</Text>)}
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
