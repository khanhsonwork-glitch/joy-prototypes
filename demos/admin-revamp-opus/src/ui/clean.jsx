// Clean pass 18/11 (opus/clean/references.md): the few parts every list page is built from, so all modules read like
// the approved Points screen. A section = medium heading + small "+ X" button; a row = grey icon, name, ONE grey value,
// chevron (off = grey name + "Off"); the right column holds the one focal card and a few label–value properties.
import React from 'react';
import {Badge, BlockStack, Button, Card, Icon, InlineStack, Text, TextField} from '@shopify/polaris';
import {SearchIcon} from '@shopify/polaris-icons';
import {useNavigate} from '../shell/router.jsx';
import {cx} from './kit.jsx';

/** Medium heading + one small add button; the rows sit in one white card below. */
export function CSection({title, add, onAdd, locked, extra, children, bare = false}) {
  return (
    <section className="pt-section" aria-label={title}>
      {(title || add || extra) && (
        <div className="pt-section__head">
          {title ? <Text as="h2" variant="headingMd">{title}</Text> : <span />}
          <span className="pt-section__tools">
            {extra}
            {add && <button type="button" className="pt-add" onClick={onAdd} disabled={locked}>+ {add}</button>}
          </span>
        </div>
      )}
      {bare ? children : <div className="pt-card">{children}</div>}
    </section>
  );
}

/** One calm row. icon (Polaris source) or thumb (image url); value is the single grey value on the right. */
export function CRow({icon, thumb, name, value, off, tag, url, onClick, trailing, label}) {
  const navigate = useNavigate();
  const open = onClick ?? (url ? () => navigate(url) : undefined);
  const inner = (
    <>
      {thumb ? <img className="pt-row__thumb" src={thumb} alt="" /> : icon ? <span className="pt-row__icon" aria-hidden="true"><Icon source={icon} /></span> : null}
      <span className="pt-row__name">{name}</span>
      {off && <Badge size="small">Off</Badge>}
      {tag && <Badge size="small">{tag}</Badge>}
      {value != null && value !== '' && <span className="pt-row__value">{value}</span>}
      {trailing}
      {open && !trailing && <span className="pt-row__chev" aria-hidden="true">›</span>}
    </>
  );
  if (!open || trailing) return <div className={cx('pt-row', 'is-static', off && 'is-off')} aria-label={label}>{inner}</div>;
  return <button type="button" className={cx('pt-row', off && 'is-off')} onClick={open} aria-label={label}>{inner}</button>;
}

/** Label – grey value – chevron rows (the right-column properties). rows: [{label, value, url, onClick}] */
export function CProps({rows}) {
  const navigate = useNavigate();
  return (
    <div className="pt-props">
      {rows.filter(Boolean).map(r => {
        const open = r.onClick ?? (r.url ? () => navigate(r.url) : undefined);
        const body = <><span>{r.label}</span><span className="pt-prop__value">{r.value}</span>{open && <span className="pt-row__chev" aria-hidden="true">›</span>}</>;
        return open
          ? <button key={r.label} type="button" className="pt-prop" onClick={open}>{body}</button>
          : <div key={r.label} className="pt-prop is-static">{body}</div>;
      })}
    </div>
  );
}

/** Main column + narrow right column (300 px); on tablet the side goes on top, on phone it stacks. */
export function CCols({side, children, sideFirst = true}) {
  return (
    <div className={cx('pt-cols', !side && 'is-single', !sideFirst && 'is-side-last')}>
      <div className="pt-main">{children}</div>
      {side && <aside className="pt-side">{side}</aside>}
    </div>
  );
}

/** A quiet card for the right column: small heading, then content. */
export function CSide({title, children}) {
  return (
    <div className="pt-sidecard">
      {title && <Text as="h2" variant="headingSm">{title}</Text>}
      {children}
    </div>
  );
}

/** Always-visible search field: the Polaris TextField (A5, no native inputs in a Polaris app). */
export function CSearch({value, onChange, placeholder = 'Search', label = 'Search'}) {
  return (
    <div className="pt-search">
      <TextField label={label} labelHidden value={value} onChange={onChange} placeholder={placeholder} autoComplete="off"
        prefix={<Icon source={SearchIcon} tone="subdued" />} clearButton onClearButtonClick={() => onChange('')} />
    </div>
  );
}

/** Vertical stack of sections with the page gap. */
export function CPage({children}) {
  return <div className="pt-page">{children}</div>;
}

/**
 * An invitation under a short list: Joy's own 3D art, one heading, one sentence, exactly one primary button. Fills the
 * empty lower half of a page with the next useful step instead of numbers.
 */
export function CInvite({art, title, children, action}) {
  return (
    <Card padding="0">
      <div className="pt-invite">
        <img className="pt-invite__art" src={art} alt="" />
        <div className="pt-invite__body">
          <BlockStack gap="200">
            <Text as="h2" variant="headingMd">{title}</Text>
            <Text as="p" tone="subdued">{children}</Text>
          </BlockStack>
          <InlineStack><Button variant="primary" url={action.url} onClick={action.onAction}>{action.content}</Button></InlineStack>
        </div>
      </div>
    </Card>
  );
}
