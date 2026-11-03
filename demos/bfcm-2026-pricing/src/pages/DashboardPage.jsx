// Joy Home (Dashboard). The cross-app promotional banner slot sits in the left column after Overview,
// with the other promos. Its words, image and button are set by the team in Dev Zone — no app release.
// The cards around it are trimmed copies of the real Home so the banner is seen in its real place.
import React from 'react';
import {Badge, BlockStack, Box, Button, Card, Icon, InlineGrid, InlineStack, Text, TextField} from '@shopify/polaris';
import {MagicIcon, SearchIcon} from '@shopify/polaris-icons';
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

export function DashboardPage() {
  const navigate = useNavigate();
  const {notYet} = useShell();
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
          </InlineStack>
        </InlineStack>
        <Card>
          <BlockStack gap="300">
            <Text as="h2" variant="headingSm">
              Joy AI
            </Text>
            <TextField label="Ask Joy AI" labelHidden prefix={<Icon source={MagicIcon} tone="subdued" />} placeholder="Run a full health check on my program" autoComplete="off" />
          </BlockStack>
        </Card>
        <div className="dash-grid">
          <BlockStack gap="400">
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" variant="headingSm">
                    Overview
                  </Text>
                  <Button onClick={notYet}>Last 30 days</Button>
                </InlineStack>
                <InlineGrid columns={{xs: 1, sm: 3}} gap="300">
                  <Stat label="Revenue by Joy" value="$4,820" />
                  <Stat label="Loyalty members" value="1,286" />
                  <Stat label="Redemption rate" value="18%" />
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
                <InlineStack align="space-between">
                  <Text as="span">App embed</Text>
                  <Badge tone="success">1 Active</Badge>
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
              </BlockStack>
            </Card>
          </BlockStack>
        </div>
      </BlockStack>
    </div>
  );
}

