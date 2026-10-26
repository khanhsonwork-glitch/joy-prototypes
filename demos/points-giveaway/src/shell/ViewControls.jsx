// Floating controls for whoever reviews this: shop state and shortcuts to the customer side. Not product UI.
import React, {useState} from 'react';
import {BlockStack, Button, Checkbox, ChoiceList, Popover, Text} from '@shopify/polaris';
import {useNavigate} from './router.jsx';
import {useStore} from '../state/store.jsx';

export default function ViewControls() {
  const [open, setOpen] = useState(false);
  const store = useStore();
  const navigate = useNavigate();
  const go = (path) => {
    setOpen(false);
    navigate(path);
  };
  const chip = (
    <button type="button" className="vc-chip" aria-label="View controls" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
      <span aria-hidden="true">⚙</span>
    </button>
  );
  return (
    <div className="vc-wrap">
      <Popover active={open} activator={chip} onClose={() => setOpen(false)} preferredPosition="above" preferredAlignment="right">
        <div className="vc-pop">
          <BlockStack gap="300">
            <Text as="h2" variant="headingSm">
              View controls
            </Text>
            <ChoiceList
              title="Shop"
              choices={[
                {label: 'Has giveaways (Dec 3, 2026)', value: 'live'},
                {label: 'No giveaway yet', value: 'fresh'},
              ]}
              selected={[store.fresh ? 'fresh' : 'live']}
              onChange={([v]) => store.setFresh(v === 'fresh')}
            />
            <ChoiceList
              title="Plan"
              choices={[
                {label: 'Advanced', value: 'paid'},
                {label: 'Trial (412 emails left)', value: 'trial'},
              ]}
              selected={[store.trial ? 'trial' : 'paid']}
              onChange={([v]) => store.setTrial(v === 'trial')}
            />
            <Checkbox label="“No order in 180 days” deleted in Shopify" checked={store.segmentGone} onChange={store.setSegmentGone} />
            <BlockStack gap="100">
              <Text as="p" variant="bodySm" fontWeight="semibold">
                Customer side
              </Text>
              <Button variant="plain" onClick={() => go('/store/inbox')}>
                Maya’s email, store and cart
              </Button>
              <Button variant="plain" onClick={() => go('/store/inbox?as=jordan')}>
                Jordan’s email and store
              </Button>
              <Button variant="plain" onClick={() => go('/customers/maya-chen')}>
                Maya in Customers
              </Button>
            </BlockStack>
          </BlockStack>
        </div>
      </Popover>
    </div>
  );
}
