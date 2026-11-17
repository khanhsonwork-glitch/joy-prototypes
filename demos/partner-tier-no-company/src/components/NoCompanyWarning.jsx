// The one new piece of UI: a warning shown when Joy has confirmed the shop has 0 Shopify B2B companies
// (shop.hasB2bCompanies === false). Same Polaris warning banner Joy already uses (s-banner tone="warning"),
// laid out like Joy's other banners with a link: text first, the link on its own line under it.
import React from 'react';
import {Banner, BlockStack, Link, Text} from '@shopify/polaris';
// Polaris React draws a page-level Banner as a card with a coloured header; Joy's s-banner is the same tinted box
// everywhere. This context gives the Partner tier page the in-card look the Membership card and Settings get.
import {WithinContentContext} from '@shopify/polaris/build/esm/utilities/within-content-context.js';
import {useShell} from '../shell/ShellContext.jsx';

export const CREATE_COMPANY = 'Create company in Shopify';

/** In the app the link opens Shopify admin › Companies › Add company in a new tab; the prototype says so. */
function CreateCompanyLink() {
  const {notify} = useShell();
  return (
    <Link onClick={() => notify('Opens Shopify admin › Companies › Add company in a new tab')} removeUnderline={false}>
      {CREATE_COMPANY}
    </Link>
  );
}

/** Membership › Partner tier card and Partner tier programs › Tiers tab. */
export function NoCompanyBanner() {
  return (
    <div data-no-company-warning="">
      <WithinContentContext.Provider value>
        <Banner tone="warning" title="No B2B companies in Shopify yet">
          <BlockStack gap="100">
            <Text as="p">
              Partner tiers rank Shopify B2B companies. Create a company in Shopify so its customers can join a Partner tier. You can set up tiers now.
            </Text>
            <span><CreateCompanyLink /></span>
          </BlockStack>
        </Banner>
      </WithinContentContext.Provider>
    </div>
  );
}

/** Settings › General › Membership enrollment, under a ticked "Exclude B2B customers". */
export function ExcludeB2bWarning() {
  return (
    <div data-no-company-warning="" className="set-exclude-warning">
      <Banner tone="warning">
        <BlockStack gap="100">
          <Text as="p">
            Your store has no B2B companies yet, so no customers are excluded. Joy treats a customer as B2B only when they belong to a Shopify company.
          </Text>
          <span><CreateCompanyLink /></span>
        </BlockStack>
      </Banner>
    </div>
  );
}
