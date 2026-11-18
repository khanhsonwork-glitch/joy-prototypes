// Editor helpers: one draft model for create and edit, so "new" shows the save bar from the first second and a
// saved new record moves to its own address (refresh keeps it), and a discarded new record goes back to the list.
import React, {useEffect, useMemo, useRef} from 'react';
import {BlockStack, Box, Button, Card, InlineStack, Popover, ActionList, Text} from '@shopify/polaris';
import {useNavigate} from '../shell/router.jsx';
import {useDraft} from './SaveBar.jsx';
import {newId} from '../state/store.jsx';
import {EmptyView} from '../kit/StateView.jsx';
import {PageFrame} from './page.jsx';

/**
 * const d = useRecordDraft({record, isNew, backUrl, prefix: 'e', save: item => upsert(item), urlFor: id => `/x/${id}`})
 * Same API as useDraft. New records get an id on Save and the page moves to their URL.
 */
export function useRecordDraft({record, isNew, backUrl, prefix = 'x', save, urlFor, validate, message = 'Saved', locked}) {
  const navigate = useNavigate();
  const source = useMemo(() => (isNew ? {...record, _new: true} : record), [record, isNew]);
  const d = useDraft(source, {
    validate, locked, message: isNew ? message.replace('Saved', 'Created') : message,
    onSave: value => {
      const {_new, ...clean} = value;
      const item = {...clean, id: clean.id ?? newId(prefix)};
      save(item);
      if (isNew && urlFor) window.setTimeout(() => navigate(urlFor(item.id), {replace: true}), 60);
    },
  });
  const started = useRef(false);
  useEffect(() => {
    if (!isNew) return;
    if (!started.current) {
      started.current = true;
      d.set(x => {const {_new, ...rest} = x; return rest;});
      return;
    }
    if (d.draft?._new) navigate(backUrl);
  }, [isNew, d.draft?._new]); // eslint-disable-line react-hooks/exhaustive-deps
  return d;
}

export function Missing({title = 'Not found', backUrl, what = 'item'}) {
  return (
    <PageFrame title={title} backUrl={backUrl}>
      <Card>
        <EmptyView heading={`This ${what} doesn't exist any more`} action={{content: 'Back to the list', url: backUrl}}>
          It may have been deleted. Open one from the list instead.
        </EmptyView>
      </Card>
    </PageFrame>
  );
}

/** "⋯" menu on a list row. items: [{content, onAction, destructive, disabled}] */
export function RowMenu({items, label = 'More actions'}) {
  const [open, setOpen] = React.useState(false);
  return (
    <Popover active={open} onClose={() => setOpen(false)} preferredAlignment="right"
      activator={<Button variant="tertiary" size="slim" accessibilityLabel={label} onClick={() => setOpen(v => !v)} disclosure={false}>⋯</Button>}>
      <ActionList actionRole="menuitem" onActionAnyItem={() => setOpen(false)} items={items} />
    </Popover>
  );
}

/** Repeating rows editor (perks, form fields, steps): add / remove / move. */
export function RepeatList({items, onChange, render, addLabel, make, max, min = 0, disabled}) {
  const move = (i, dir) => {
    const next = [...items];
    const [x] = next.splice(i, 1);
    next.splice(i + dir, 0, x);
    onChange(next);
  };
  return (
    <BlockStack gap="200">
      {items.map((it, i) => (
        <div key={it.id ?? i} className="op-repeat">
          <div className="op-repeat__body">{render(it, patch => onChange(items.map((x, j) => (j === i ? (typeof patch === 'function' ? patch(x) : {...x, ...patch}) : x))), i)}</div>
          <InlineStack gap="100" wrap={false}>
            <Button size="slim" variant="tertiary" accessibilityLabel="Move up" disabled={disabled || i === 0} onClick={() => move(i, -1)}>↑</Button>
            <Button size="slim" variant="tertiary" accessibilityLabel="Move down" disabled={disabled || i === items.length - 1} onClick={() => move(i, 1)}>↓</Button>
            <Button size="slim" variant="tertiary" tone="critical" accessibilityLabel="Remove" disabled={disabled || items.length <= min} onClick={() => onChange(items.filter((_, j) => j !== i))}>✕</Button>
          </InlineStack>
        </div>
      ))}
      {(!max || items.length < max) && (
        <Box><Button onClick={() => onChange([...items, make(items.length)])} disabled={disabled}>{addLabel}</Button></Box>
      )}
      {max && items.length >= max && <Text as="p" variant="bodySm" tone="subdued">You can have up to {max}.</Text>}
    </BlockStack>
  );
}
