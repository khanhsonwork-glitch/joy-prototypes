// Settings panel of the new "Milestones" block, in the same shape as the real section panels
// (SectionContentDetail: shared card first, then collapsible SectionSettingCards, then the Edit text card).
import React, {useState} from 'react';
import {Banner, BlockStack, Button, Card, Checkbox, Collapsible, Icon, InlineStack, Select, Text} from '@shopify/polaris';
import {ChevronDownIcon, ChevronUpIcon, DragHandleIcon, EditIcon, HideIcon, InfoIcon, ViewIcon, CashDollarIcon, OrderIcon, PersonAddIcon} from '@shopify/polaris-icons';
import {EmptyView, ErrorView} from '../kit/StateView.jsx';
import {amount} from '../data/milestones.js';
import {useShell} from '../shell/ShellContext.jsx';

const PROGRAM_ICON = {referral: PersonAddIcon, orders: OrderIcon, spend: CashDollarIcon};

/** Same behaviour as the real SectionSettingCard: a heading button that opens and closes the group. */
export function SettingCard({title, id, defaultOpen = false, badge, children}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card>
      <BlockStack gap="400">
        <button type="button" className="lpe-card-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls={`group-${id}`}>
          <span className="lpe-card-toggle__title">
            <Text as="h3" variant="headingMd">{title}</Text>
            {badge}
          </span>
          <Icon source={open ? ChevronUpIcon : ChevronDownIcon} tone="subdued" />
        </button>
        <Collapsible id={`group-${id}`} open={open}>
          <BlockStack gap="400">{children}</BlockStack>
        </Collapsible>
      </BlockStack>
    </Card>
  );
}

export function InfoCard({children, action}) {
  return (
    <Card>
      <InlineStack gap="300" wrap={false} blockAlign="start">
        <span className="lpe-info-icon"><Icon source={InfoIcon} tone="info" /></span>
        <BlockStack gap="300" inlineAlign="start">
          <Text as="p" variant="bodySm">{children}</Text>
          {action}
        </BlockStack>
      </InlineStack>
    </Card>
  );
}

function ProgramRows({settings, programs, onChange}) {
  const {notify} = useShell();
  const [drag, setDrag] = useState(null);
  const rows = settings.programs;
  const move = (from, to) => {
    if (from === to || from == null) return;
    const next = [...rows];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    onChange({programs: next});
  };
  return (
    <ul className="lpe-prog-list">
      {rows.map((row, index) => {
        const program = programs.find((p) => p.id === row.id);
        if (!program) return null;
        const steps = program.steps.map((s) => (program.unit ? s.at.toLocaleString('en-US') : amount(program, s.at))).join(', ');
        return (
          <li
            key={row.id}
            className={`lpe-prog${row.shown ? '' : ' is-hidden'}${drag === index ? ' is-dragging' : ''}`}
            draggable
            onDragStart={() => setDrag(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => { move(drag, index); setDrag(null); }}
            onDragEnd={() => setDrag(null)}
          >
            <span className="lpe-prog__handle" aria-hidden="true"><Icon source={DragHandleIcon} tone="subdued" /></span>
            <span className="lpe-prog__thumb" aria-hidden="true"><Icon source={PROGRAM_ICON[program.kind]} /></span>
            <span className="lpe-prog__text">
              <Text as="span" variant="bodyMd" fontWeight="semibold" truncate>{program.name}</Text>
              <Text as="span" variant="bodySm" tone="subdued" truncate>Steps at {steps}{program.unit ? ` ${program.unit[1]}` : ' spent'}</Text>
            </span>
            <Button
              variant="tertiary"
              icon={row.shown ? ViewIcon : HideIcon}
              accessibilityLabel={row.shown ? `Hide ${program.name} from the loyalty page` : `Show ${program.name} on the loyalty page`}
              onClick={() => onChange({programs: rows.map((r) => (r.id === row.id ? {...r, shown: !r.shown} : r))})}
            />
            <Button variant="tertiary" icon={EditIcon} accessibilityLabel={`Edit ${program.name}`} onClick={() => notify('Opens Reward programs › Milestones › Edit in the app')} />
          </li>
        );
      })}
    </ul>
  );
}

export function MilestonePanel({settings, onChange, programs, state, onRetry, onEditText}) {
  const {notify} = useShell();
  const noPrograms = state === 'empty';
  const allHidden = !noPrograms && settings.programs.every((r) => !r.shown);
  return (
    <BlockStack gap="400">
      <Text as="h2" variant="headingMd">Milestones</Text>

      <Card>
        <BlockStack gap="300">
          <Checkbox
            label="Full width"
            helpText="Extend this block beyond the page max-width to the viewport edges."
            checked={settings.fullWidth}
            onChange={(v) => onChange({fullWidth: v})}
          />
          <Select
            label="Show this block to"
            options={[
              {label: 'Everyone', value: 'everyone'},
              {label: 'Members', value: 'members'},
              {label: 'Guests', value: 'guests'},
            ]}
            value={settings.audience}
            onChange={(v) => onChange({audience: v})}
            helpText="Guests see every step and reward with a Join button. Members see their own progress."
          />
        </BlockStack>
      </Card>

      <SettingCard title="Programs" id="ms-programs" defaultOpen>
        {state === 'loading' ? (
          <BlockStack gap="200" aria-busy="true">
            <span className="lpe-skel" /><span className="lpe-skel" /><span className="lpe-skel" />
          </BlockStack>
        ) : null}
        {state === 'error' ? (
          <ErrorView title="Couldn’t load your milestone programs" onRetry={onRetry}>
            Your block settings are kept. Try again to see the programs.
          </ErrorView>
        ) : null}
        {noPrograms ? (
          <EmptyView heading="No milestone programs yet" action={{content: 'Create milestone program', onAction: () => notify('Opens Reward programs › Milestones › Create in the app')}}>
            This block stays off the storefront until a milestone program is active.
          </EmptyView>
        ) : null}
        {state !== 'loading' && state !== 'error' && !noPrograms ? (
          <>
            <Text as="p" variant="bodySm" tone="subdued">Drag to reorder. Click the eye to show or hide a program in this block.</Text>
            <ProgramRows settings={settings} programs={programs} onChange={onChange} />
            {allHidden ? <Banner tone="warning">Every program is hidden, so this block shows nothing on the storefront.</Banner> : null}
          </>
        ) : null}
      </SettingCard>

      <SettingCard title="Layout" id="ms-layout" defaultOpen>
        <Select
          label="Layout"
          options={[
            {label: 'Roadmap · next reward and every step', value: 'roadmap'},
            {label: 'Progress bar only', value: 'compact'},
          ]}
          value={settings.layout}
          onChange={(v) => onChange({layout: v})}
          helpText={settings.layout === 'roadmap' ? 'Shows what to do for the next reward, then each step with its reward.' : 'One slim bar per program. Takes the least space on a long page.'}
        />
        <Select
          label="More than one program"
          options={[
            {label: 'Tabs', value: 'tabs'},
            {label: 'One under another', value: 'stacked'},
          ]}
          value={settings.multi}
          onChange={(v) => onChange({multi: v})}
          helpText={settings.multi === 'tabs' ? 'One program at a time. Keeps the page short.' : 'Every program at once. The page gets longer with each one.'}
        />
        <Checkbox
          label="Show rewards of steps not reached yet"
          helpText="Off: steps the customer has not reached show “Mystery reward”."
          checked={settings.showLocked}
          onChange={(v) => onChange({showLocked: v})}
        />
        <Checkbox
          label="Also list milestones in Ways to earn"
          helpText="Off: milestone programs leave Ways to earn while this block is on the page, so customers don’t see them twice."
          checked={settings.alsoInEarn}
          onChange={(v) => onChange({alsoInEarn: v})}
        />
      </SettingCard>

      <InfoCard action={<Button onClick={() => notify('Opens Reward programs › Milestones in the app')}>Edit program details</Button>}>
        Steps, rewards and progress come from your active milestone programs. The settings above only change how this block looks.
      </InfoCard>

      <InfoCard action={<Button onClick={onEditText}>Edit text</Button>}>
        Headings, button labels, and every other word in this section are written in Translations.
      </InfoCard>
    </BlockStack>
  );
}
