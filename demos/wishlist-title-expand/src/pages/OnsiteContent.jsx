// Joy admin › On-site content › Widget, as the live app shows it (29/10/2026): page tabs, "Loyalty widget" with the
// Unified / Classic cards, and "Referral claim popup". "Setup" on the Unified widget card opens the widget editor.
import React from 'react';
import {Badge, BlockStack, Box, Button, Card, InlineStack, Link, Text} from '@shopify/polaris';
import {PlayCircleIcon} from '@shopify/polaris-icons';
import {useNavigate} from '../shell/router.jsx';
import {useShell} from '../shell/ShellContext.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {ErrorView, LoadingView} from '../kit/StateView.jsx';

const TABS = ['Widget', 'Loyalty page', 'Account page', 'Product page', 'Cart drawer', 'Checkout page', 'Thank you page'];

/** The small browser drawing on each card: the widget open on the left of a page. */
function WidgetSketch({variant}) {
  return (
    <div className="os-sketch" aria-hidden="true">
      <div className="os-sketch__window">
        <div className="os-sketch__bar">
          <i />
          <i />
          <i />
          <span />
        </div>
        <div className="os-sketch__page">
          <div className={`os-sketch__widget os-sketch__widget--${variant}`}>
            <span className="os-l w60" />
            <span className={variant === 'unified' ? 'os-card os-card--yellow' : 'os-card'} />
            <span className="os-l w80" />
            <span className="os-l w40" />
            <span className="os-row">
              <i />
              <i />
              <i />
              <i />
            </span>
          </div>
          <div className="os-sketch__content">
            <span className="os-l w50" />
            <span className="os-blocks">
              <i />
              <i />
            </span>
            <span className="os-l w90" />
            <span className="os-l w70" />
          </div>
        </div>
      </div>
    </div>
  );
}

function WidgetCard({title, live, children, onSetup}) {
  return (
    <Card padding="0">
      <Box padding="400">
        <BlockStack gap="400">
          <WidgetSketch variant={live ? 'unified' : 'classic'} />
          <BlockStack gap="200">
            <InlineStack gap="200" blockAlign="center">
              <Text as="h3" variant="headingSm">
                {title}
              </Text>
              {live ? <Badge tone="success">Live</Badge> : null}
            </InlineStack>
            <Text as="p" variant="bodyMd">
              {children}
            </Text>
          </BlockStack>
          <InlineStack>
            <Button onClick={onSetup}>Setup</Button>
          </InlineStack>
        </BlockStack>
      </Box>
    </Card>
  );
}

export function OnsiteContent() {
  const navigate = useNavigate();
  const {notYet} = useShell();
  const {state} = useScenario();

  if (state === 'loading') {
    return (
      <div className="os-page">
        <Card>
          <LoadingView rows={4} />
        </Card>
      </div>
    );
  }
  if (state === 'error') {
    return (
      <div className="os-page">
        <Card>
          <ErrorView title="Couldn’t load On-site content" onRetry={notYet}>
            Your widget keeps running on your store. Try again in a moment.
          </ErrorView>
        </Card>
      </div>
    );
  }

  return (
    <div className="os-page">
      <BlockStack gap="500">
        <div className="os-tabs" role="tablist" aria-label="On-site content">
          {TABS.map((t, i) => (
            <button key={t} type="button" role="tab" aria-selected={i === 0} className={i === 0 ? 'is-active' : undefined} onClick={i === 0 ? undefined : notYet}>
              {t}
              {t === 'Checkout page' ? <span className="os-tabs__pill">Shopify Plus only</span> : null}
            </button>
          ))}
        </div>

        <BlockStack gap="300">
          <InlineStack align="space-between" blockAlign="center" gap="200">
            <InlineStack gap="200" blockAlign="center">
              <Text as="h2" variant="headingMd">
                Loyalty widget
              </Text>
              <Badge tone="success">Unified is live</Badge>
            </InlineStack>
            <Button onClick={notYet}>Switch to Classic</Button>
          </InlineStack>
          <div className="os-grid">
            <WidgetCard title="Unified widget" live onSetup={() => navigate('/demo/widget-editor')}>
              An all-in-one widget with profile, orders, wishlist, recommendations, and more.{' '}
              <Link onClick={notYet}>Learn more</Link>
            </WidgetCard>
            <WidgetCard title="Classic widget" onSetup={notYet}>
              The classic floating widget — focused on points and rewards. <Link onClick={notYet}>Learn more</Link>
            </WidgetCard>
          </div>
        </BlockStack>

        <BlockStack gap="300">
          <InlineStack align="space-between" blockAlign="center" gap="200">
            <Text as="h2" variant="headingMd">
              Referral claim popup
            </Text>
            <Button icon={PlayCircleIcon} onClick={notYet}>
              Watch guide
            </Button>
          </InlineStack>
          <div className="os-grid">
            <Card>
              <BlockStack gap="200">
                <Text as="h3" variant="headingSm">
                  Referral claim popup
                </Text>
                <Text as="p" variant="bodyMd">
                  Design what a friend sees after opening a referral link; customers get their referral links from the loyalty
                  widget. <Link onClick={notYet}>Learn more</Link>
                </Text>
                <InlineStack>
                  <Button onClick={notYet}>Setup</Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </div>
        </BlockStack>
      </BlockStack>
    </div>
  );
}
