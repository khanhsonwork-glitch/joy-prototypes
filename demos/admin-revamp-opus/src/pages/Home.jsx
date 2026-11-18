// Home: what needs the merchant now (setup left, what's new), what the program earned, in that order.
// Marketing art (made with Codex image generation) sits in the "What's new" cards, never inside forms.
import React from 'react';
import {Badge, BlockStack, Button, Icon, InlineStack, Page, ProgressBar, Text} from '@shopify/polaris';
import {CheckCircleIcon, XIcon} from '@shopify/polaris-icons';
import {useState} from 'react';
import {useNavigate} from '../shell/router.jsx';
import {useShell} from '../shell/ShellContext.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {ErrorView, LoadingView} from '../kit/StateView.jsx';
import {MKT_ART} from '../assets/index.js';
import {money, num} from '../data/program.js';
import {useProgram} from '../state/program.jsx';

const STEPS = [
  {id: 's1', label: 'Pick your rewards rate', done: true},
  {id: 's2', label: 'Turn on the program', done: true},
  {id: 's3', label: 'Show rewards on your store', done: true, hint: 'Widget and Loyalty page are live'},
  {id: 's4', label: 'Add a referral reward', done: false, hint: 'Referred friends spend 2× more on their first order', to: '/referrals'},
];

const NEWS = [
  {id: 'n1', art: 'credit', title: 'Points to store credit', body: 'Customers turn points into store credit that applies at checkout. No code to copy.', cta: 'Add reward', to: '/program?tier=member'},
  {id: 'n2', art: 'banner', photo: true, title: 'AI images for your Loyalty page', body: 'Joy makes desktop, mobile and referral images from your own products. This one was made for North Bloom.', cta: 'Make images'},
  {id: 'n3', art: 'wallet', title: 'Apple Wallet opens in one tap', body: 'On iPhone the pass opens straight away. No QR code on the same phone.', cta: 'See the pass'},
];

const STATS = [
  {id: 'k1', label: 'Sales from members', value: money(48210), delta: '+12% vs last 30 days'},
  {id: 'k2', label: 'Repeat purchase rate', value: '31%', delta: 'Members 31% · others 14%'},
  {id: 'k3', label: 'Points redeemed', value: num(182400), delta: `${money(1824)} in rewards`},
];

export function Home() {
  const navigate = useNavigate();
  const {notify} = useShell();
  const {state, setState} = useScenario();
  const [showNews, setShowNews] = useState(true);
  const {status, tiers} = useProgram();
  const members = state === 'empty' ? 0 : tiers.reduce((sum, t) => sum + t.members, 0);
  const header = {title: 'Home'};
  if (state === 'loading') return <Page {...header}><LoadingView rows={10} /></Page>;
  if (state === 'error') return <Page {...header}><ErrorView title="Couldn't load your dashboard" onRetry={() => setState('default')}>Your program keeps running. Try again in a moment.</ErrorView></Page>;
  const done = STEPS.filter(s => s.done).length;
  const next = STEPS.find(s => !s.done);

  return (
    <Page {...header}>
      <div className="rv-stack">
        <div className="rv-card rv-status">
          <InlineStack align="space-between" blockAlign="center" gap="300">
            <InlineStack gap="200" blockAlign="center">
              {status === 'live' ? <Badge tone="success">Live</Badge> : <Badge tone="warning">Paused</Badge>}
              <Text as="p" variant="bodyMd">{status === 'live' ? `${num(members)} members earning on North Bloom` : 'Customers are not earning points until you resume'}</Text>
            </InlineStack>
            <Button onClick={() => navigate('/program')}>Edit program</Button>
          </InlineStack>
        </div>

        {next && (
          <div className="rv-card rv-setup">
            <BlockStack gap="300">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h2" variant="headingMd">Finish setting up</Text>
                <Text as="span" tone="subdued">{done} of {STEPS.length} done</Text>
              </InlineStack>
              <ProgressBar progress={(done / STEPS.length) * 100} size="small" tone="primary" />
              <div className="rv-steps">
                {STEPS.map(step => (
                  <div key={step.id} className={step.done ? 'rv-step is-done' : 'rv-step'}>
                    <span className="rv-step__mark">{step.done ? <Icon source={CheckCircleIcon} tone="success" /> : <span className="rv-step__dot" />}</span>
                    <span className="rv-step__text"><span>{step.label}</span>{step.hint ? <span className="rv-row__hint">{step.hint}</span> : null}</span>
                    {!step.done && <Button variant="primary" onClick={() => navigate(step.to)}>Set up</Button>}
                  </div>
                ))}
              </div>
            </BlockStack>
          </div>
        )}

        {showNews && (
          <section aria-labelledby="news">
            <div className="rv-section__head">
              <Text as="h2" variant="headingMd" id="news">New in Joy</Text>
              <Button variant="tertiary" icon={XIcon} accessibilityLabel="Hide new features" onClick={() => setShowNews(false)} />
            </div>
            <div className="rv-news">
              {NEWS.map(item => (
                <article key={item.id} className="rv-newscard">
                  <div className="rv-newscard__art">
                    {MKT_ART[item.art] ? <img src={MKT_ART[item.art]} alt={item.photo ? 'Loyalty page banner made by Joy AI from the shop products' : ''} /> : null}
                    {item.photo ? <span className="rv-ai-tag">Made with Joy AI</span> : null}
                  </div>
                  <div className="rv-newscard__body">
                    <Text as="h3" variant="headingSm">{item.title}</Text>
                    <Text as="p" tone="subdued">{item.body}</Text>
                    <div><Button onClick={() => (item.to ? navigate(item.to) : notify(`${item.title}: opens the editor`))}>{item.cta}</Button></div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <section aria-labelledby="perf">
          <div className="rv-section__head">
            <Text as="h2" variant="headingMd" id="perf">Last 30 days</Text>
            <Button variant="tertiary" onClick={() => notify('Analytics opens here')}>View analytics</Button>
          </div>
          <div className="rv-card rv-kpis">
            {STATS.map(stat => (
              <div key={stat.id} className="rv-kpi">
                <Text as="p" tone="subdued">{stat.label}</Text>
                <p className="rv-kpi__value">{stat.value}</p>
                <Text as="p" tone="subdued" variant="bodySm">{stat.delta}</Text>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Page>
  );
}
