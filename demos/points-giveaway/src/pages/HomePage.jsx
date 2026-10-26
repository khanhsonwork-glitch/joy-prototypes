// #/home: Joy Home (ref: Joy admin landing). The promote card shows only while the shop has no giveaway yet.
import React from 'react';
import {Badge, BlockStack, Box, Button, Card, Divider, InlineStack, Page, ProgressBar, Text} from '@shopify/polaris';
import {STORE} from '../data/index.js';
import {useShell} from '../shell/ShellContext.jsx';
import {useStore} from '../state/store.jsx';

function PromoArt() {
  return (
    <div className="pg-promo-art" aria-hidden="true">
      <div className="pg-promo-art__row">
        <span className="pg-promo-art__name">Maya</span>
        <span className="pg-promo-art__bar">
          <i style={{width: '70%'}} />
          <b style={{left: '70%', width: '30%'}} />
        </span>
        <span className="pg-promo-art__gift">+150</span>
      </div>
      <div className="pg-promo-art__row">
        <span className="pg-promo-art__name">Leo</span>
        <span className="pg-promo-art__bar">
          <i style={{width: '15%'}} />
          <b style={{left: '15%', width: '30%'}} />
        </span>
        <span className="pg-promo-art__gift">+150</span>
      </div>
      <div className="pg-promo-art__chip">Use by Fri, Dec 4</div>
    </div>
  );
}

export default function HomePage() {
  const {notYet} = useShell();
  const {giveaways} = useStore();
  const showPromo = giveaways.length === 0;

  return (
    <Page title={`Good morning, ${STORE.owner}!`} secondaryActions={[{content: 'English (US)', onAction: notYet}]}>
      <BlockStack gap="400">
        <Card>
          <BlockStack gap="300">
            <InlineStack align="space-between" blockAlign="center" wrap>
              <InlineStack gap="200" blockAlign="center">
                <Text as="span" variant="headingSm">
                  App status
                </Text>
                <Badge tone="success">Active</Badge>
              </InlineStack>
              <InlineStack gap="200" blockAlign="center">
                <Text as="span" variant="headingSm">
                  Loyalty program status:
                </Text>
                <Badge tone="success">Live mode</Badge>
              </InlineStack>
            </InlineStack>
            <Divider />
            <InlineStack gap="200" blockAlign="center">
              <Text as="span" variant="bodyMd">
                App embed
              </Text>
              <Badge tone="success">2 Active</Badge>
              <Text as="span" variant="bodyMd">
                App block
              </Text>
              <Badge tone="success">6 Added</Badge>
            </InlineStack>
          </BlockStack>
        </Card>

        {showPromo ? (
          <Card padding="0">
            <div className="pg-promo">
              <div className="pg-promo__copy">
                <BlockStack gap="300">
                  <InlineStack gap="200" blockAlign="center">
                    <Badge tone="new">New</Badge>
                    <Text as="h2" variant="headingMd">
                      Points Giveaway
                    </Text>
                  </InlineStack>
                  <Text as="p" variant="bodyMd">
                    Give a group of members points. Joy adds them, emails members and shows the orders that used them.
                  </Text>
                  <InlineStack gap="200">
                    <Button variant="primary" url="/points-giveaway">
                      Create giveaway
                    </Button>
                    <Button onClick={notYet}>Learn more</Button>
                  </InlineStack>
                </BlockStack>
              </div>
              <PromoArt />
            </div>
          </Card>
        ) : null}

        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingSm">
              Program health
            </Text>
            <BlockStack gap="100">
              <Text as="span" variant="bodyMd" fontWeight="semibold">
                Joy AI
              </Text>
              <button type="button" className="pg-ai" onClick={notYet}>
                Run a full health check on my program
              </button>
            </BlockStack>
            <InlineStack gap="600" blockAlign="center" wrap={false}>
              <div className="pg-health-ring" aria-label="Program health 72%">
                <span>72%</span>
              </div>
              <Box width="100%">
                <BlockStack gap="300">
                  {[
                    ['Setup', 100, '6/6'],
                    ['Touchpoints', 25, '1/4'],
                    ['Engagement', 80, '4/5'],
                    ['Performance', 67, '4/6'],
                  ].map(([label, value, count]) => (
                    <InlineStack key={label} gap="300" blockAlign="center" wrap={false}>
                      <Box minWidth="104px">
                        <Text as="span" variant="bodyMd">
                          {label}
                        </Text>
                      </Box>
                      <Box width="100%">
                        <ProgressBar progress={value} size="small" tone="primary" />
                      </Box>
                      <Text as="span" variant="bodyMd" tone="subdued">
                        {count}
                      </Text>
                    </InlineStack>
                  ))}
                </BlockStack>
              </Box>
            </InlineStack>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
