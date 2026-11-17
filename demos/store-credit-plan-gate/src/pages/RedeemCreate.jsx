// Where an unlocked row of "Add new redeem program" leads (/programs/<event>/new in the app). The create forms
// themselves do not change, so this page only names the program. Opened by URL on a new Free shop, the store
// credit page is blocked the same way the modal is.
import React from 'react';
import {BlockStack, Button, Card, Page, Text} from '@shopify/polaris';
import {useNavigate} from '../shell/router.jsx';
import {useShop} from '../kit/scenario.jsx';
import {PlanBadge} from '../components/PlanBadge.jsx';
import {REDEEM_OPTIONS} from '../data/programs.js';

const OTHER = {'free-product': {title: 'Free product', proPlan: true}, 'free-shipping': {title: 'Free shipping', proPlan: true}};

export function RedeemCreate({slug}) {
  const navigate = useNavigate();
  const shop = useShop();
  const option = REDEEM_OPTIONS.find((o) => o.slug === slug) || OTHER[slug];
  const back = {content: 'Reward programs', url: '/redeem'};
  if (!option) {
    return (
      <Page title="Program not found" backAction={back}>
        <Card><Text as="p">There is no redeem program at this address. Go back to Redeeming programs.</Text></Card>
      </Page>
    );
  }
  const gated = (option.proPlan && !shop.isPremium) || (option.storeCredit && shop.storeCreditLocked);
  return (
    <Page title={option.title} backAction={back}>
      {gated ? (
        <Card>
          <BlockStack gap="300">
            <div className="scg-label-row">
              <Text as="h2" variant="headingSm">{`${option.title} needs a paid plan`}</Text>
              <PlanBadge />
            </div>
            <Text as="p">Upgrade to Essential to create this program.</Text>
            <span><Button variant="primary" onClick={() => navigate('/plans')}>View plans</Button></span>
          </BlockStack>
        </Card>
      ) : (
        <div className="scg-proto-note" role="note">
          <p>{`Prototype · the ${option.title.toLowerCase()} create form opens here. It does not change with this feature, so the prototype stops at this page.`}</p>
          <Button onClick={() => navigate('/redeem')}>Back to Redeeming programs</Button>
        </div>
      )}
    </Page>
  );
}
