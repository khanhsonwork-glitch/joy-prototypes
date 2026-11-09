// Settings panel of the new "Milestone rewards" block, in the same shape as the real section panels
// (SectionContentDetail: shared card first, then collapsible SectionSettingCards, then the Edit text card).
// Programs card copies Ways to earn's ProgramsManagerCard (DraggableList + eye + edit).
import React, {useState} from 'react';
import {Badge, Banner, BlockStack, Button, Card, Checkbox, Collapsible, Icon, InlineStack, Select, Text} from '@shopify/polaris';
import {ChevronDownIcon, ChevronUpIcon, DragHandleIcon, EditIcon, HideIcon, InfoIcon, ViewIcon, CashDollarIcon, OrderIcon, PersonAddIcon} from '@shopify/polaris-icons';
import {EmptyView, ErrorView} from '../kit/StateView.jsx';
import {amount} from '../data/milestones.js';
import {useShell} from '../shell/ShellContext.jsx';

const PROGRAM_ICON = {referral: PersonAddIcon, orders: OrderIcon, spend: CashDollarIcon};

export const LAYOUTS = [
  {label: 'One under another', value: 'stacked', help: 'Every program open, one under another. Shoppers see every step without clicking.'},
  {label: 'Collapsible', value: 'accordion', help: 'One row per program with its progress and an arrow. The first program opens when the page loads; shoppers open the others.'},
  {label: 'Tabs', value: 'tabs', help: 'One tab per program, in the order above. Shows one program at a time and keeps the page shortest.'},
];

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
        if (!program) {
          // Chosen, then deleted in Reward programs: keep a row from the saved id so the merchant can remove it.
          return (
            <li key={row.id} data-row={row.id} className="lpe-prog is-hidden is-deleted">
              <span className="lpe-prog__handle" aria-hidden="true" />
              <span className="lpe-prog__thumb" aria-hidden="true"><Icon source={HideIcon} tone="subdued" /></span>
              <span className="lpe-prog__text">
                <InlineStack gap="150" blockAlign="center">
                  <Text as="span" variant="bodyMd" fontWeight="semibold">{row.name || 'Deleted program'}</Text>
                  <Badge tone="critical">Deleted</Badge>
                </InlineStack>
                <Text as="span" variant="bodySm" tone="subdued">Shoppers don’t see it. Remove it from this block.</Text>
              </span>
              <Button variant="tertiary" tone="critical" onClick={() => onChange({programs: rows.filter((r) => r.id !== row.id)})} accessibilityLabel={`Remove ${row.name || 'deleted program'} from this block`}>Remove</Button>
            </li>
          );
        }
        const steps = program.steps.map((s) => (program.unit ? s.at.toLocaleString('en-US') : amount(program, s.at))).join(', ');
        return (
          <li
            key={row.id}
            data-row={row.id}
            className={`lpe-prog${row.shown && !program.inactive ? '' : ' is-hidden'}${drag === index ? ' is-dragging' : ''}`}
            draggable
            onDragStart={() => setDrag(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => { move(drag, index); setDrag(null); }}
            onDragEnd={() => setDrag(null)}
          >
            <span className="lpe-prog__handle" aria-hidden="true"><Icon source={DragHandleIcon} tone="subdued" /></span>
            <span className="lpe-prog__thumb" aria-hidden="true"><Icon source={PROGRAM_ICON[program.kind]} /></span>
            <span className="lpe-prog__text">
              <InlineStack gap="150" wrap={false} blockAlign="center">
                <Text as="span" variant="bodyMd" fontWeight="semibold" truncate>{program.name}</Text>
                {program.inactive ? <Badge tone="warning">Inactive</Badge> : null}
              </InlineStack>
              <Text as="span" variant="bodySm" tone="subdued" truncate>
                {program.inactive ? 'Not shown until you turn it back on' : `Steps at ${steps}${program.unit ? ` ${program.unit[1]}` : ' spent'}`}
              </Text>
            </span>
            <Button
              variant="tertiary"
              icon={row.shown ? ViewIcon : HideIcon}
              accessibilityLabel={row.shown ? `Hide ${program.name} in this block` : `Show ${program.name} in this block`}
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
  const usable = settings.programs.filter((r) => {
    const p = programs.find((x) => x.id === r.id);
    return r.shown && p && !p.inactive;
  });
  const allHidden = !noPrograms && usable.length === 0;
  const layout = LAYOUTS.find((l) => l.value === settings.layout) || LAYOUTS[0];
  return (
    <BlockStack gap="400">
      <Text as="h2" variant="headingMd">Milestone rewards</Text>

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
            Your saved programs and order are kept. Try again to edit them.
          </ErrorView>
        ) : null}
        {noPrograms ? (
          <EmptyView heading="No milestone programs yet" action={{content: 'Create milestone program', onAction: () => notify('Opens Reward programs › Milestones › Create in the app')}}>
            This block stays off the storefront until a milestone program is active.
          </EmptyView>
        ) : null}
        {state !== 'loading' && state !== 'error' && !noPrograms ? (
          <>
            <Text as="p" variant="bodySm" tone="subdued">Drag to set the order shoppers see. Click the eye to show or hide a program in this block.</Text>
            <ProgramRows settings={settings} programs={programs} onChange={onChange} />
            {allHidden ? <Banner tone="warning">No program is shown, so this block stays off the storefront.</Banner> : null}
          </>
        ) : null}
      </SettingCard>

      <SettingCard title="Layout" id="ms-layout" defaultOpen>
        <Select
          label="Layout"
          options={LAYOUTS.map(({label, value}) => ({label, value}))}
          value={layout.value}
          onChange={(v) => onChange({layout: v})}
          helpText={usable.length === 1 ? 'With one program shown, the block shows it directly, without tabs or a collapsible row.' : layout.help}
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
