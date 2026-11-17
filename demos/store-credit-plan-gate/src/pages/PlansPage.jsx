// Stub of Settings › Plans (/settings/subscription/plans), where every "Available on Essential" badge lands.
// Only what a reviewer needs: which plan the shop is on and that Essential unlocks store credit.
import React from 'react';
import {Badge, BlockStack, Button, Card, InlineGrid, Page, Text} from '@shopify/polaris';
import {useShell} from '../shell/ShellContext.jsx';
import {useShop} from '../kit/scenario.jsx';
import {PLANS} from '../data/programs.js';

export function PlansPage() {
  const {notify} = useShell();
  const shop = useShop();
  return (
    <Page title="Plans">
      <BlockStack gap="400">
        <div className="scg-proto-note" role="note">
          <p>Prototype · stub of Settings › Plans, reached from Settings. The “Available on Essential” badges open the upgrade dialog instead.</p>
        </div>
        <InlineGrid columns={{xs: 1, sm: 2, lg: 4}} gap="400">
          {PLANS.map((plan) => {
            const current = plan.id === shop.plan;
            return (
              <Card key={plan.id}>
                <BlockStack gap="300">
                  <div className="scg-label-row">
                    <Text as="h2" variant="headingMd">{plan.name}</Text>
                    {current ? <Badge tone="success">Current plan</Badge> : null}
                  </div>
                  <Text as="p" variant="headingLg">{plan.price}</Text>
                  <Text as="p">{`Up to ${plan.orders.toLocaleString('en-US')} free orders per month`}</Text>
                  {/* Shops installed before release keep store credit on Free, so the line only shows for newer shops. */}
                  {plan.id === 'essential' && shop.installedAfterRelease ? (
                    <div className="scg-plan-highlight" data-plan-feature="store-credit">
                      <Text as="p" fontWeight="semibold">Store credit rewards</Text>
                      <Text as="p" tone="subdued">Let customers earn and redeem store credit.</Text>
                    </div>
                  ) : null}
                  <Button
                    variant={plan.id === 'essential' && !current ? 'primary' : undefined}
                    disabled={current}
                    onClick={() => notify('Prototype: Shopify asks you to approve the charge here.')}
                  >
                    {current ? 'Current plan' : 'Choose plan'}
                  </Button>
                </BlockStack>
              </Card>
            );
          })}
        </InlineGrid>
      </BlockStack>
    </Page>
  );
}
