// #/membership: Joy › Membership (pages/Membership/Membership.js on avada/master), shop on the Advanced plan.
// Change: the "B2B programs" section no longer hides when Joy counted 0 Shopify companies; the Partner tier card
// stays and carries a warning banner. With companies the card is exactly as today.
import React, {useEffect, useState} from 'react';
import {Badge, BlockStack, Box, Button, Card, InlineStack, Page, Text} from '@shopify/polaris';
import {XIcon} from '@shopify/polaris-icons';
import {useShell} from '../shell/ShellContext.jsx';
import {useNavigate} from '../shell/router.jsx';
import {useShop} from '../kit/scenario.jsx';
import {useStore} from '../state/store.jsx';
import {NoCompanyBanner} from '../components/NoCompanyWarning.jsx';
import {ExclusiveDealArt, PartnerTierArt, SubscriptionArt, VipTiersArt} from '../components/Illustrations.jsx';

const statusBadge = (active) => <Badge tone={active ? 'success' : undefined}>{active ? 'Active' : 'Inactive'}</Badge>;

function Actions({onSetUp, label = 'Set up'}) {
  const {notify} = useShell();
  return (
    <InlineStack gap="200">
      <Button onClick={onSetUp}>{label}</Button>
      <Button variant="tertiary" onClick={() => notify('Opens the Joy help center in a new tab')}>Learn more</Button>
    </InlineStack>
  );
}

function SupportCard() {
  const [hidden, setHidden] = useState(false);
  const {notify} = useShell();
  if (hidden) return null;
  return (
    <Card>
      <div className="mb-support">
        <BlockStack gap="200">
          <BlockStack gap="100">
            <Text as="h2" variant="headingSm">Need support?</Text>
            <Text as="p">We are here to help! Contact us for assistance with any questions or issues</Text>
          </BlockStack>
          <InlineStack>
            <Button onClick={() => notify('Opens the support chat')}>Contact us</Button>
          </InlineStack>
        </BlockStack>
        <Button variant="tertiary" icon={XIcon} accessibilityLabel="Dismiss" onClick={() => setHidden(true)} />
      </div>
    </Card>
  );
}

export function MembershipPage() {
  const {hasB2bCompanies} = useShop();
  const {partnerActive} = useStore();
  const {notify} = useShell();
  const navigate = useNavigate();
  const notDrawn = () => notify('This prototype draws only Partner tier and Settings › General');
  // The hub card picture (npm run shot opens ?shot=1 at 1280×720) must show the change, which sits below the fold.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('shot') !== '1') return undefined;
    const timer = setTimeout(() => document.querySelector('[data-partner-card]')?.scrollIntoView({block: 'end'}), 50);
    return () => clearTimeout(timer);
  }, []);

  const dtc = [
    {
      art: <VipTiersArt />,
      title: 'VIP Tiers',
      badge: statusBadge(true),
      text: 'Tiers based on spending, points, or order count. Welcome new tier members with entry rewards — and unlock real perks: automatic discounts, free shipping, and exclusive access',
    },
    {
      art: <ExclusiveDealArt />,
      title: 'Member-exclusive deal',
      text: 'Drive urgency with time-limited deals only loyalty members can access — boost repeat purchases and reward engagement',
    },
    {
      art: <SubscriptionArt />,
      title: 'Subscription membership',
      text: 'Generate recurring revenue with paid memberships — unlock exclusive perks, VIP benefits, and premium access for subscribers',
    },
  ];

  return (
    <Page title="Membership">
      <div className="mb-root">
        <BlockStack gap="400">
          <SupportCard />
          <BlockStack gap="600">
            <BlockStack gap="200">
              <Box paddingInline={{xs: '400', sm: '0'}}><Text as="h2" variant="headingSm">DTC programs</Text></Box>
              <div className="mb-grid">
                {dtc.map((card) => (
                  <div key={card.title} className="mb-card">
                    <div className="mb-card__image">{card.art}</div>
                    <div className="mb-card__title">
                      <InlineStack gap="200" blockAlign="center">
                        <Text as="h3" variant="bodyMd">{card.title}</Text>
                        {card.badge}
                      </InlineStack>
                    </div>
                    <div className="mb-card__text">
                      <Text as="p" tone="subdued">{card.text}</Text>
                    </div>
                    <div className="mb-card__actions">
                      <Actions onSetUp={notDrawn} />
                    </div>
                  </div>
                ))}
              </div>
            </BlockStack>

            {/* Today: rendered only when shop.hasB2bCompanies !== false. Now: always, with the banner when it is false. */}
            <BlockStack gap="200">
              <Box paddingInline={{xs: '400', sm: '0'}}><Text as="h2" variant="headingSm">B2B programs</Text></Box>
              <Card padding="0">
                <div className="mb-partner" data-partner-card="">
                  <div className="mb-partner__image"><PartnerTierArt /></div>
                  <div className="mb-partner__body">
                    <BlockStack gap="200">
                      <InlineStack gap="200" blockAlign="center">
                        <Text as="h3" variant="bodyMd">Partner tier</Text>
                        {statusBadge(partnerActive)}
                      </InlineStack>
                      <Text as="p">Incentivize higher wholesale orders with tiered pricing, volume discounts, and exclusive partner perks</Text>
                    </BlockStack>
                    {hasB2bCompanies ? null : <NoCompanyBanner />}
                    <Actions onSetUp={() => navigate('/wholesale/vip')} />
                  </div>
                </div>
              </Card>
            </BlockStack>
          </BlockStack>
        </BlockStack>
      </div>
    </Page>
  );
}
