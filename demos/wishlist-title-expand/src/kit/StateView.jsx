// Empty, loading and error bodies that every list or detail screen reuses, so the nine states look the same everywhere.
import React from 'react';
import {Banner, BlockStack, Box, Button, Card, InlineStack, SkeletonBodyText, SkeletonDisplayText, Text} from '@shopify/polaris';

/** Line illustration drawn for the starter (not a Shopify or Joy asset). */
export function EmptyIllustration({size = 120}) {
  return (
    <svg className="kit-empty__art" width={size} height={size} viewBox="0 0 120 120" aria-hidden="true" focusable="false">
      <circle cx="60" cy="60" r="56" fill="var(--p-color-bg-surface-secondary)" />
      <rect x="30" y="50" width="60" height="42" rx="6" fill="var(--p-color-bg-surface)" stroke="var(--p-color-border)" strokeWidth="2" />
      <rect x="26" y="40" width="68" height="14" rx="4" fill="var(--p-color-bg-surface)" stroke="var(--p-color-border)" strokeWidth="2" />
      <path d="M60 40v52" stroke="var(--chrome-joy-red)" strokeWidth="4" />
      <path d="M60 40c-6-12-20-14-20-5 0 6 12 5 20 5zm0 0c6-12 20-14 20-5 0 6-12 5-20 5z" fill="none" stroke="var(--chrome-joy-red)" strokeWidth="3" strokeLinejoin="round" />
    </svg>
  );
}

export function EmptyView({heading, children, action, secondaryAction}) {
  return (
    <div className="kit-empty" data-state-view="empty">
      <EmptyIllustration />
      <BlockStack gap="200" inlineAlign="center">
        <Text as="h2" variant="headingMd" alignment="center">{heading}</Text>
        {children ? <Text as="p" variant="bodyMd" tone="subdued" alignment="center">{children}</Text> : null}
      </BlockStack>
      {action || secondaryAction ? (
        <InlineStack gap="200" align="center">
          {secondaryAction ? <Button onClick={secondaryAction.onAction} url={secondaryAction.url}>{secondaryAction.content}</Button> : null}
          {action ? <Button variant="primary" onClick={action.onAction} url={action.url} disabled={action.disabled}>{action.content}</Button> : null}
        </InlineStack>
      ) : null}
    </div>
  );
}

export function LoadingView({rows = 5}) {
  return (
    <Card>
      <div data-state-view="loading" aria-busy="true" aria-label="Loading">
        <BlockStack gap="400">
          <SkeletonDisplayText size="small" />
          <SkeletonBodyText lines={rows} />
        </BlockStack>
      </div>
    </Card>
  );
}

export function ErrorView({title, children, onRetry}) {
  return (
    <div data-state-view="error">
      <Banner tone="critical" title={title} action={onRetry ? {content: 'Try again', onAction: onRetry} : undefined}>
        <Box paddingBlockStart="100"><Text as="p">{children}</Text></Box>
      </Banner>
    </div>
  );
}
