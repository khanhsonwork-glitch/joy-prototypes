// Wishlist and Subscription: doors to the sister apps. Installed → open the app; not installed → what it adds to
// loyalty, in the shop's own product photos, and one install button.
import React from 'react';
import {Badge, BlockStack, Button, Card, InlineGrid, InlineStack, Text} from '@shopify/polaris';
import {HeartIcon, OrderRepeatIcon, StarIcon, CreditCardIcon, EmailIcon, ChartVerticalIcon} from '@shopify/polaris-icons';
import {PageFrame} from '../../ui/page.jsx';
import {ScreenState} from '../../ui/kit.jsx';
import {IconTile} from '../../ui/parts.jsx';
import {useStore} from '../../state/store.jsx';
import {useShell} from '../../shell/ShellContext.jsx';
import {PHOTOS} from '../../assets/index.js';

const APPS = {
  wishlist: {id: 'wishlist', title: 'Wishlist', app: 'Joy Wishlist', photo: PHOTOS.giftSet, head: 'Let customers save what they love, and remind them when it’s on sale',
    benefits: [[HeartIcon, 'Wishlist on every product', 'A heart on product and collection pages, saved to their account.'], [EmailIcon, 'Back-in-stock and price-drop emails', 'Bring people back when a saved item changes.'], [ChartVerticalIcon, 'See what people want', 'Most-wished products, to plan stock and promos.']],
    loyalty: 'With Joy Loyalty: give points when a customer adds to their wishlist, and show their points next to the list.'},
  subscription: {id: 'subs', title: 'Subscription', app: 'Joy Subscription', photo: PHOTOS.miniJar, head: 'Sell refills on repeat, and turn subscribers into paying members',
    benefits: [[OrderRepeatIcon, 'Subscribe and save', 'Weekly, monthly or custom plans on any product.'], [CreditCardIcon, 'Paid membership billing', 'Powers Paid membership in VIP & membership.'], [StarIcon, 'Customer portal', 'Subscribers skip, swap and pause themselves.']],
    loyalty: 'With Joy Loyalty: points on every subscription order, and paid plans that give VIP perks.'},
};

export function CrossApp({which}) {
  const {db} = useStore();
  const {notify} = useShell();
  const a = APPS[which];
  const installed = db.integrations.find(i => i.id === a.id)?.connected;
  return (
    <PageFrame title={a.title} width="default">
      <ScreenState>
        <BlockStack gap="500">
          <Card padding="0">
            <div className="op-crosshero">
              <img src={a.photo} alt="" />
              <BlockStack gap="300">
                <InlineStack gap="200" blockAlign="center"><Text as="span" variant="bodySm" tone="subdued">{a.app}</Text>{installed ? <Badge tone="success">Installed</Badge> : <Badge>Not installed</Badge>}</InlineStack>
                <Text as="h1" variant="headingLg">{a.head}</Text>
                <Text as="p" tone="subdued">{a.loyalty}</Text>
                <InlineStack gap="200">
                  {installed ? <Button variant="primary" onClick={() => notify(`Opens ${a.app}`)}>Open {a.app}</Button>
                    : <Button variant="primary" onClick={() => notify('Opens the Shopify App Store')}>Install {a.app}</Button>}
                  <Button url={`/integrations/${a.id}`}>How it connects</Button>
                </InlineStack>
                <Text as="p" variant="bodySm" tone="subdued">Free plan available. Made by the Joy team, same support.</Text>
              </BlockStack>
            </div>
          </Card>
          <InlineGrid columns={{xs: 1, sm: 3}} gap="300">
            {a.benefits.map(([icon, t, d]) => (
              <Card key={t}><BlockStack gap="200"><IconTile icon={icon} /><Text as="h3" variant="headingSm">{t}</Text><Text as="p" variant="bodySm" tone="subdued">{d}</Text></BlockStack></Card>
            ))}
          </InlineGrid>
        </BlockStack>
      </ScreenState>
    </PageFrame>
  );
}

export function resolve(segments) {
  if (segments[0] === 'wishlist') return <CrossApp which="wishlist" />;
  if (segments[0] === 'subscription') return <CrossApp which="subscription" />;
  return null;
}
