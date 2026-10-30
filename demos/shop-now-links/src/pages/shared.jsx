// Pieces both edit pages share: the Shop now link field with its live "Shop now opens …" line, the summary card.
import React from 'react';
import {BlockStack, Card, InlineStack, Text, TextField, Badge} from '@shopify/polaris';
import {LINK_PLACEHOLDER} from '../data/index.js';
import {linkError, shopNowTarget} from '../state/links.jsx';

export function ShopNowLinkField({value, onChange, target, help}) {
  const error = linkError(value);
  const t = shopNowTarget(target);
  return (
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
          <span className="sl-now">{`Now: Shop now opens ${t.url}, ${t.why}.`}</span>
        </BlockStack>
      )}
    />
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
