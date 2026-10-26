// Small pieces shared by the list and the giveaway page.
import React from 'react';
import {Badge, Box, InlineStack, Text} from '@shopify/polaris';
import {STATUS} from '../data/giveaways.js';

export function StatusBadge({status}) {
  const s = STATUS[status] || STATUS.draft;
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

/** Label / value row in summary cards. */
export function Fact({label, children}) {
  return (
    <InlineStack align="space-between" blockAlign="start" gap="300" wrap={false}>
      <Text as="span" variant="bodyMd" tone="subdued">
        {label}
      </Text>
      <Box maxWidth="64%">
        <Text as="span" variant="bodyMd" alignment="end">
          {children}
        </Text>
      </Box>
    </InlineStack>
  );
}

/** A big number with a label, for results. */
export function Metric({label, value, sub}) {
  return (
    <div className="pg-metric">
      <Text as="p" variant="bodySm" tone="subdued">
        {label}
      </Text>
      <Text as="p" variant="headingLg">
        {value}
      </Text>
      {sub ? (
        <Text as="p" variant="bodySm" tone="subdued">
          {sub}
        </Text>
      ) : null}
    </div>
  );
}
