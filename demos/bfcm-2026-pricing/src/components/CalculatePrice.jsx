// "Calculate your price" card as on the Plans page. The slider is live; prices on the cards stay at the
// base fee because this prototype reviews the Black Friday display, not the per-order price maths.
import React, {useState} from 'react';
import {BlockStack, Button, Card, InlineStack, RangeSlider, Text, TextField} from '@shopify/polaris';

export function CalculatePrice() {
  const [orders, setOrders] = useState(180);
  const [hidden, setHidden] = useState(false);
  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="start" wrap={false}>
          <BlockStack gap="100">
            <Text as="h2" variant="headingLg">
              Calculate your price
            </Text>
            <Text as="p" variant="bodyMd">
              Adjust the slider or enter a value to see pricing based on your monthly order volume
            </Text>
          </BlockStack>
          <Button variant="plain" onClick={() => setHidden((v) => !v)}>
            {hidden ? 'Show' : 'Hide'}
          </Button>
        </InlineStack>
        {hidden ? null : (
          <BlockStack gap="200">
            <Text as="p" variant="headingSm">
              Your monthly order volume
            </Text>
            <InlineStack gap="400" blockAlign="center" wrap={false}>
              <div className="calc-slider">
                <RangeSlider label="Your monthly order volume" labelHidden min={0} max={20000} step={10} value={orders} onChange={setOrders} output={false} />
              </div>
              <div className="calc-input">
                <TextField
                  label="Monthly orders"
                  labelHidden
                  type="number"
                  value={String(orders)}
                  onChange={(v) => setOrders(Math.max(0, Math.min(20000, Number(v) || 0)))}
                  suffix="orders"
                  autoComplete="off"
                />
              </div>
            </InlineStack>
            <InlineStack align="space-between">
              <Text as="span" variant="bodyMd">
                0 orders
              </Text>
              <Text as="span" variant="bodyMd">
                20,000 orders
              </Text>
            </InlineStack>
          </BlockStack>
        )}
      </BlockStack>
    </Card>
  );
}
