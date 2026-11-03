// The plan cards of the Joy Plans page: three paid plans side by side, Starter as a full-width card underneath.
// The Plans page and the onboarding plan step render this same component, so a price can never differ between them.
import React from 'react';
import {Badge, BlockStack, Button, ButtonGroup, Card, Icon, InlineGrid, InlineStack, Text, Tooltip} from '@shopify/polaris';
import {CheckIcon, InfoIcon} from '@shopify/polaris-icons';
import {BFCM_COPY, PLANS, planView} from '../data/plans.js';
import {useProto} from '../state/proto.jsx';
import {useShell} from '../shell/ShellContext.jsx';

function Feature({feature}) {
  const label = typeof feature === 'string' ? feature : feature.label;
  const badge = typeof feature === 'string' ? null : feature.badge;
  return (
    <div className="plan-feature">
      <span className="plan-feature__check">
        <Icon source={CheckIcon} tone="success" />
      </span>
      <span>
        {label}
        {badge ? (
          <span className="plan-feature__badge">
            <Badge tone="info">{badge}</Badge>
          </span>
        ) : null}
      </span>
    </div>
  );
}

function Price({view, reserve}) {
  return (
    <div className={reserve ? 'plan-price plan-price--reserve' : 'plan-price'}>
    <BlockStack gap="100">
      <InlineStack gap="100" blockAlign="end">
        <span className="plan-price__main">${view.price}</span>
        <span className="plan-price__suffix">/{view.suffix}</span>
      </InlineStack>
      {view.promo ? (
        <>
          <InlineStack gap="150" blockAlign="center">
            <Text as="span" variant="bodyMd" tone="subdued" textDecorationLine="line-through">
              ${view.originalPrice}
            </Text>
            <span className="plan-price__badge">{`-${view.promo.percent}% · ${view.promo.cycles} months`}</span>
            <Tooltip content={BFCM_COPY.tooltip}>
              <span className="plan-price__info" tabIndex={0} role="img" aria-label="About this discount">
                i
              </span>
            </Tooltip>
          </InlineStack>
          <Text as="p" variant="bodySm" tone="subdued">
            {`From month ${view.promo.cycles + 1}: $${view.originalPrice}/month`}
          </Text>
        </>
      ) : null}
    </BlockStack>
    </div>
  );
}

function Cta({view, onboarding}) {
  const {notify} = useShell();
  const choose = () => notify(view.cta.label === 'Downgrade' ? 'Opens the downgrade confirmation.' : 'Shopify opens to approve the charge.');
  const main = (
    <Button variant="primary" fullWidth disabled={view.cta.disabled} onClick={choose}>
      {view.cta.label}
    </Button>
  );
  if (view.id !== 'ultimate') return main;
  return (
    <InlineGrid columns={2} gap="200">
      {main}
      <Button fullWidth onClick={() => notify('Opens the demo booking page in a new tab.')}>
        Request a demo
      </Button>
    </InlineGrid>
  );
}

function PaidCard({view, onboarding, reserve}) {
  // Advanced always wears the light "best value" gradient; Ultimate the dark header.
  const headerTone = view.id === 'ultimate' ? 'dark' : view.id === 'advanced' ? 'light' : 'pink';
  return (
    <div className={`plan-card${view.recommended ? ' plan-card--recommended' : ''}`} data-plan={view.id}>
      {view.recommended ? <div className="plan-card__tab">Recommended</div> : null}
      <div className="plan-card__inner">
        <div className={`plan-card__header plan-card__header--${headerTone}`}>
          <h2 className="plan-card__name">{view.name}</h2>
          <p className="plan-card__desc">{view.description}</p>
        </div>
        <div className="plan-card__body">
          <BlockStack gap="400">
            <Price view={view} reserve={reserve} />
            <Cta view={view} onboarding={onboarding} />
            <div className="plan-orders">
              <strong>{view.freeOrders}</strong>
              <span>{view.extraOrders}</span>
            </div>
            <Text as="p" variant="headingMd" fontWeight="bold">
              {view.heading}
            </Text>
            <BlockStack gap="200">
              {view.features.map((f) => (
                <Feature key={typeof f === 'string' ? f : f.label} feature={f} />
              ))}
            </BlockStack>
          </BlockStack>
        </div>
      </div>
    </div>
  );
}

function StarterCard({view, onboarding, onContinueFree}) {
  return (
    <div className="starter-card" data-plan="starter">
      <div className="starter-card__header">
        <h2 className="plan-card__name">{view.name}</h2>
        <Text as="p" variant="bodyMd" tone="subdued">
          {view.description}
        </Text>
      </div>
      <div className="starter-card__body">
        <InlineGrid columns={{xs: 1, md: ['oneThird', 'twoThirds']}} gap="400">
          <BlockStack gap="300">
            <InlineStack gap="100" blockAlign="end">
              <span className="plan-price__main">${view.price}</span>
              <span className="plan-price__suffix">/month</span>
            </InlineStack>
            {onboarding ? (
              <Button variant="primary" onClick={onContinueFree}>
                Continue as Free
              </Button>
            ) : (
              <Cta view={view} />
            )}
            <div className="plan-orders">
              <strong>{view.freeOrders}</strong>
              <span>{view.extraOrders}</span>
            </div>
          </BlockStack>
          <BlockStack gap="300">
            <Text as="p" variant="headingMd" fontWeight="bold">
              {view.heading}
            </Text>
            <div className="starter-card__features">
              {view.features.map((f) => (
                <Feature key={typeof f === 'string' ? f : f.label} feature={f} />
              ))}
            </div>
          </BlockStack>
        </InlineGrid>
        <div className="starter-card__note">
          <Icon source={InfoIcon} tone="subdued" />
          <Text as="p" variant="bodySm" tone="subdued">
            {`Above ${view.freeOrderCount} orders in a month, your loyalty program pauses until the next monthly reset or until you upgrade.`}
          </Text>
        </div>
      </div>
    </div>
  );
}

export function IntervalToggle({interval, setInterval}) {
  return (
    <InlineGrid columns={{xs: 1, md: 3}} gap="400">
      <div className="interval-spacer" />
      <Card padding="200">
        <ButtonGroup gap="tight" fullWidth>
          <Button variant={interval === 'monthly' ? 'primary' : 'tertiary'} onClick={() => setInterval('monthly')} pressed={interval === 'monthly'}>
            Monthly
          </Button>
          <Button variant={interval === 'annually' ? 'primary' : 'tertiary'} onClick={() => setInterval('annually')} pressed={interval === 'annually'}>
            Annually
          </Button>
        </ButtonGroup>
      </Card>
      <div className="interval-spacer" />
    </InlineGrid>
  );
}

export function PlanCards({interval, onboarding = false, onContinueFree}) {
  const {shop, campaign} = useProto();
  const views = PLANS.map((p) => planView(p, {shopPlan: shop, campaign, interval}));
  const starter = views.find((v) => v.id === 'starter');
  const paid = views.filter((v) => v.id !== 'starter');
  // When one card shows the discount lines, the others keep the same height so the buttons line up.
  const reserve = paid.some((v) => v.promo);
  return (
    <BlockStack gap="400">
      <div className="plan-grid">
        {paid.map((v) => (
          <PaidCard key={v.id} view={v} onboarding={onboarding} reserve={reserve} />
        ))}
      </div>
      <StarterCard view={starter} onboarding={onboarding} onContinueFree={onContinueFree} />
    </BlockStack>
  );
}
