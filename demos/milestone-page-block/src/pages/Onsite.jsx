// On-site content: the entry to the loyalty page editor (real: Onsite.js, card "New loyalty page" → editor).
import React from 'react';
import {Badge, BlockStack, Button, Card, InlineStack, Page, Text} from '@shopify/polaris';
import {useNavigate} from '../shell/router.jsx';

export function Onsite() {
  const navigate = useNavigate();
  return (
    <Page title="On-site content">
      <Card>
        <InlineStack align="space-between" blockAlign="center" gap="400">
          <BlockStack gap="100">
            <InlineStack gap="200" blockAlign="center">
              <Text as="h2" variant="headingMd">New loyalty page</Text>
              <Badge tone="success">Live</Badge>
            </InlineStack>
            <Text as="p" tone="subdued">New · live preview</Text>
          </BlockStack>
          <Button variant="primary" onClick={() => navigate('/loyalty-page-editor')}>Customize</Button>
        </InlineStack>
      </Card>
    </Page>
  );
}
