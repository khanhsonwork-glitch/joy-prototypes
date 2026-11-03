// Joy Home (Dashboard), in the order of the real page: greeting · Joy AI · Video guides · then two columns —
// left: Discover new features, Overview, promos (the cross-app promotional banner slot); right: program status,
// Helpdesk, FAQs. The banner's words, image and button are set by the team in Dev Zone — no app release.
// Opening #/dashboard scrolls to the banner, the part under review.
import React, {useEffect} from 'react';
import {Badge, BlockStack, Box, Button, Card, Icon, InlineGrid, InlineStack, ProgressBar, Text, TextField} from '@shopify/polaris';
import {ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, MagicIcon, PlayCircleIcon, SearchIcon} from '@shopify/polaris-icons';
import {BfcmDashboardBanner} from '../components/Banners.jsx';
import {useNavigate} from '../shell/router.jsx';
import {useShell} from '../shell/ShellContext.jsx';

function Stat({label, value}) {
  return (
    <Box padding="400" borderWidth="025" borderColor="border" borderRadius="300">
      <BlockStack gap="300">
        <Text as="p" variant="headingSm">
          {label}
        </Text>
        <Text as="p" variant="headingXl">
          {value}
        </Text>
      </BlockStack>
    </Box>
  );
}

const PROGRESS = [
  {label: 'Setup', done: 5, of: 6},
  {label: 'Touchpoints', done: 2, of: 4},
  {label: 'Engagement', done: 4, of: 5},
  {label: 'Performance', done: 2, of: 6},
];

const FAQS = ['Do you only have a widget?', 'Do you have x2, x3 reward features?', 'Can you help me customize to fit my brand?'];

export function DashboardPage() {
  const navigate = useNavigate();
  const {notYet} = useShell();
  useEffect(() => {
    const id = window.setTimeout(() => document.getElementById('bfcm-dashboard-banner')?.scrollIntoView({block: 'center'}), 150);
    return () => window.clearTimeout(id);
  }, []);
  return (
    <div className="dash">
      <BlockStack gap="400">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h1" variant="headingLg">
            Good afternoon, Rosa!
          </Text>
          <InlineStack gap="200">
            <Button icon={SearchIcon} onClick={notYet}>
              Quick search
            </Button>
            <Button onClick={notYet} disclosure>
              What&apos;s new
            </Button>
            <Button onClick={notYet} disclosure>
              English
            </Button>
          </InlineStack>
        </InlineStack>
        <Card>
          <BlockStack gap="300">
            <Text as="h2" variant="headingSm">
              Joy AI
            </Text>
            <TextField
              label="Ask Joy AI"
              labelHidden
              prefix={<Icon source={MagicIcon} tone="subdued" />}
              placeholder="Run a full health check on my program"
              helpText="Press Tab to accept suggestion, Enter to send"
              autoComplete="off"
            />
          </BlockStack>
        </Card>
        <Card>
          <InlineStack align="space-between" blockAlign="center">
            <BlockStack gap="100">
              <Text as="h2" variant="headingSm">
                Video guides
              </Text>
              <Text as="p" variant="bodyMd">
                Short videos that walk you through Joy, one feature at a time.
              </Text>
            </BlockStack>
            <Button icon={PlayCircleIcon} onClick={notYet}>
              Browse guides
            </Button>
          </InlineStack>
        </Card>
        <div className="dash-grid">
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingSm">
                    Discover new features in Joy
                  </Text>
                  <InlineStack gap="100">
                    <Button icon={ChevronLeftIcon} accessibilityLabel="Previous" onClick={notYet} />
                    <Button icon={ChevronRightIcon} accessibilityLabel="Next" onClick={notYet} />
                  </InlineStack>
                </InlineStack>
                <Box padding="400" borderWidth="025" borderColor="border" borderRadius="300">
                  <InlineGrid columns={{xs: 1, sm: ['oneThird', 'twoThirds']}} gap="400">
                  <div className="dash-feature-art" aria-hidden="true">
                    <div className="dash-feature-art__cart">
                      <span className="dash-feature-art__line" />
                      <span className="dash-feature-art__line dash-feature-art__line--short" />
                      <span className="dash-feature-art__btn" />
                    </div>
                  </div>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingSm">
                      Redeem in Cart rebuilt: Smarter, more intuitive
                    </Text>
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Customers apply points, free shipping or dynamic rewards straight from the cart, no page reload, no lost momentum.
                    </Text>
                    <InlineStack gap="200">
                      <Button onClick={notYet}>Try now</Button>
                      <Button variant="plain" onClick={notYet}>
                        Find out more
                      </Button>
                    </InlineStack>
                  </BlockStack>
                  </InlineGrid>
                </Box>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingSm">
                    Overview
                  </Text>
                  <InlineStack gap="200">
                    <Button onClick={notYet}>View report</Button>
                    <Button onClick={notYet}>Last 30 days</Button>
                  </InlineStack>
                </InlineStack>
                <InlineGrid columns={{xs: 1, sm: 3}} gap="300">
                  <Stat label="Revenue by Joy" value="$4,820" />
                  <Stat label="Loyalty members" value="1,286" />
                  <Stat label="Redemption rate" value="18%" />
                </InlineGrid>
                <InlineGrid columns={{xs: 1, sm: ['oneThird', 'twoThirds']}} gap="400">
                  <BlockStack gap="100">
                    <Text as="p" variant="headingSm">
                      Program health
                    </Text>
                    <Text as="p" variant="bodySm" tone="subdued">
                      Could Be Better
                    </Text>
                    <div className="dash-ring" style={{'--ring': '64%'}}>
                      <span>64%</span>
                    </div>
                  </BlockStack>
                  <BlockStack gap="200">
                    <Text as="p" variant="bodySm" tone="subdued">
                      Your progress
                    </Text>
                    {PROGRESS.map((p) => (
                      <InlineGrid key={p.label} columns={['oneThird', 'oneHalf', 'oneThird']} gap="200" alignItems="center">
                        <Text as="span" variant="bodySm">
                          {p.label}
                        </Text>
                        <ProgressBar progress={(p.done / p.of) * 100} size="small" />
                        <Text as="span" variant="bodySm">
                          {`${p.done}/${p.of}`}
                        </Text>
                      </InlineGrid>
                    ))}
                  </BlockStack>
                </InlineGrid>
              </BlockStack>
            </Card>
            <BfcmDashboardBanner onCta={() => navigate('/plans')} />
          </BlockStack>
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="300">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingSm">
                    Loyalty program status:
                  </Text>
                  <Badge tone="success">Live mode</Badge>
                </InlineStack>
                <InlineStack align="space-between" blockAlign="center">
                  <InlineStack gap="200" blockAlign="center">
                    <Text as="span">App embed</Text>
                    <Badge tone="success">1 Active</Badge>
                  </InlineStack>
                  <Button variant="plain" onClick={notYet}>
                    Open theme
                  </Button>
                </InlineStack>
                <InlineStack align="space-between" blockAlign="center">
                  <InlineStack gap="200" blockAlign="center">
                    <Text as="span">App block</Text>
                    <Badge tone="attention">0 Added</Badge>
                  </InlineStack>
                  <Button variant="plain" onClick={notYet}>
                    Open theme
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingSm">
                  Helpdesk
                </Text>
                <Text as="p" variant="bodyMd">
                  Our support team is ready to help with our in-app live chat
                </Text>
                <Button fullWidth onClick={notYet}>
                  Chat with us
                </Button>
                <InlineStack align="space-between">
                  <Button variant="plain" onClick={notYet}>
                    Read guide
                  </Button>
                  <Button variant="plain" onClick={notYet}>
                    Feature Requests
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="300">
                <Text as="h2" variant="headingSm">
                  FAQs
                </Text>
                <Text as="p" variant="bodyMd">
                  Some questions to understand us better
                </Text>
                {FAQS.map((q) => (
                  <button key={q} type="button" className="dash-faq" onClick={notYet}>
                    <span>{q}</span>
                    <Icon source={ChevronDownIcon} />
                  </button>
                ))}
              </BlockStack>
            </Card>
          </BlockStack>
        </div>
      </BlockStack>
    </div>
  );
}
