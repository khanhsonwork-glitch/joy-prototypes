// On-site content: where the merchant opens the widget editor from (Joy › On-site content › Unified widget).
import React from 'react';
import {Badge, BlockStack, Button, Card, InlineStack, Page, Text} from '@shopify/polaris';
import {useNavigate} from '../shell/router.jsx';

export function OnSite() {
  const navigate = useNavigate();
  return (
    <Page title="On-site content">
      <Card>
        <InlineStack align="space-between" blockAlign="center" gap="400" wrap={false}>
          <BlockStack gap="100">
            <InlineStack gap="200" blockAlign="center">
              <Text as="h2" variant="headingMd">
                Unified widget
              </Text>
              <Badge tone="success">Live</Badge>
            </InlineStack>
            <Text as="p" tone="subdued">
              An all-in-one widget with profile, orders, wishlist, recommendations, and more.
            </Text>
          </BlockStack>
          <Button onClick={() => navigate('/rich-text')}>Customize</Button>
        </InlineStack>
      </Card>
    </Page>
  );
}
