// On-site content › Ways to earn: the program list and its "Edit <program>" modal (WayToEarn in the Joy admin;
// the Loyalty page editor's Programs card opens the same fields). New: "Open in new tab" under "Custom URL on click".
import React, {useEffect, useMemo, useState} from 'react';
import {BlockStack, Button, Card, Icon, InlineGrid, Modal, Page, Tabs, Text, TextField} from '@shopify/polaris';
import {
  CartIcon, EditIcon, PersonAddIcon, StarIcon, LogoInstagramIcon, GiftCardIcon, HeartIcon, ChatIcon, SearchIcon, CalendarIcon,
} from '@shopify/polaris-icons';
import {useShell} from '../shell/ShellContext.jsx';
import {useNavigate, useRoute} from '../shell/router.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {ErrorView, LoadingView} from '../kit/StateView.jsx';
import {linkError} from '../state/links.jsx';
import {NewTabCheckbox} from './shared.jsx';

const PROGRAMS = [
  {id: 'order', title: 'Place an order', sub: '1 point for every $1 spent', icon: CartIcon, url: '/collections/best-sellers', social: false},
  {id: 'signup', title: 'Sign up', sub: '200 points', icon: PersonAddIcon, url: '', social: false},
  {id: 'review', title: 'Write a review', sub: '50 points', icon: StarIcon, url: '', social: false},
  {id: 'instagram', title: 'Follow on Instagram', sub: '100 points', icon: LogoInstagramIcon, url: 'https://instagram.com/pomelopark', social: true},
];
const ICONS = [CartIcon, GiftCardIcon, HeartIcon, StarIcon, ChatIcon, CalendarIcon, PersonAddIcon, SearchIcon];

export function WaysToEarn() {
  const {notify, notYet} = useShell();
  const navigate = useNavigate();
  const {query} = useRoute();
  const {state} = useScenario();
  const today = state === 'today';
  const openId = query?.get?.('program') || 'order';
  const program = PROGRAMS.find((p) => p.id === openId) || PROGRAMS[0];
  const [open, setOpen] = useState(true);
  const [tab, setTab] = useState(0);
  const initial = useMemo(() => ({
    url: state === 'worst' ? 'collections/best-sellers' : state === 'blank' ? '' : program.url,
    newTab: state === 'own' && !program.social ? false : true,
  }), [state, program]);
  const [form, setForm] = useState(initial);
  useEffect(() => {setForm(initial); setOpen(true);}, [initial]);
  const error = linkError(form.url);

  const onSave = () => {
    if (error) {
      notify('1 field needs attention', {error: true});
      document.querySelector('#custom-url')?.focus();
      return;
    }
    setOpen(false);
    notify('Program saved');
  };

  if (state === 'loading') return <Page title="Ways To Earn"><Card><LoadingView /></Card></Page>;
  if (state === 'error') return <Page title="Ways To Earn"><ErrorView onRetry={() => notify('Programs loaded')}>We couldn’t load your programs. Nothing you saved is lost.</ErrorView></Page>;

  return (
    <Page backAction={{content: 'On-site content', onAction: notYet}} title="Ways To Earn" subtitle="Display ways to earn points in this block">
      <Card>
        <BlockStack gap="200">
          {PROGRAMS.map((p) => (
            <div key={p.id} className="sl-row">
              <span className="sl-row__icon"><Icon source={p.icon} /></span>
              <BlockStack gap="050">
                <Text as="span" fontWeight="semibold">{p.title}</Text>
                <Text as="span" tone="subdued">{p.sub}</Text>
              </BlockStack>
              <Button variant="tertiary" icon={EditIcon} accessibilityLabel={`Edit ${p.title}`} onClick={() => {navigate(`/earn?program=${p.id}`); setOpen(true);}} />
            </div>
          ))}
        </BlockStack>
      </Card>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Edit ${program.title}`}
        primaryAction={{content: 'Save', onAction: onSave}}
        secondaryActions={[{content: 'Cancel', onAction: () => setOpen(false)}]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <Tabs tabs={[{id: 'builtin', content: 'Built-in icons'}, {id: 'custom', content: 'Custom image'}]} selected={tab} onSelect={setTab} fitted />
            {tab === 0 ? (
              <BlockStack gap="300">
                <TextField label="Search icons" labelHidden placeholder="Search icons" autoComplete="off" value="" onChange={() => {}} />
                <InlineGrid columns={8} gap="200">
                  {ICONS.map((ic, i) => (
                    <button key={i} type="button" className={`sl-icon${i === 0 ? ' is-on' : ''}`} aria-label={`Icon ${i + 1}`} onClick={notYet}><Icon source={ic} /></button>
                  ))}
                </InlineGrid>
              </BlockStack>
            ) : <Text as="p" tone="subdued">Upload a square image, at least 64 × 64 px.</Text>}
            <BlockStack gap="200">
              <TextField
                id="custom-url"
                label="Custom URL on click"
                placeholder="Add your URL here"
                autoComplete="url"
                value={form.url}
                onChange={(v) => setForm((f) => ({...f, url: v}))}
                error={error}
                helpText="Enter the URL to which you'd like your customers to be redirected."
              />
              {today ? null : (
                <NewTabCheckbox
                  checked={program.social ? true : form.newTab}
                  disabled={program.social}
                  onChange={(v) => setForm((f) => ({...f, newTab: v}))}
                  help={program.social ? 'Social programs always open in a new tab, so the points can still be awarded.' : undefined}
                />
              )}
            </BlockStack>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
