// Small shared pieces of the revamp: section heading outside the card (Polaris 2), clickable rows, icon chip,
// tier strip and the tier card. Built from Polaris components + tokens only.
import React from 'react';
import {Badge, Button, Icon, InlineStack, Text} from '@shopify/polaris';
import {
  CalendarIcon, ChevronRightIcon, ConfettiIcon, DeliveryIcon, DiscountIcon, EmailNewsletterIcon, GiftCardIcon,
  LockIcon, LogoInstagramIcon, OrderIcon, PersonAddIcon, PlusIcon, ProductIcon, StarFilledIcon, StarIcon, DataTableIcon,
  WalletIcon,
} from '@shopify/polaris-icons';
import {STORE} from '../data/index.js';
import {num} from '../data/program.js';

export const ICONS = {
  gift: GiftCardIcon, delivery: DeliveryIcon, calendar: CalendarIcon, order: OrderIcon, personAdd: PersonAddIcon,
  email: EmailNewsletterIcon, cake: ConfettiIcon, star: StarIcon, instagram: LogoInstagramIcon, discount: DiscountIcon,
  wallet: WalletIcon, product: ProductIcon, lock: LockIcon,
};

const cx = (...parts) => parts.filter(Boolean).join(' ');

/** Section = heading + optional small pill action OUTSIDE the card, card below (Polaris 2 pattern). */
export function Section({title, action, children, id}) {
  return (
    <section className="rv-section" aria-labelledby={id}>
      <div className="rv-section__head">
        <Text as="h2" variant="headingMd" id={id}>{title}</Text>
        {action ? <Button size="slim" icon={PlusIcon} onClick={action.onAction} disabled={action.disabled}>{action.content}</Button> : null}
      </div>
      <div className="rv-card">{children}</div>
    </section>
  );
}

export function IconChip({icon, tone}) {
  return <span className={cx('rv-chip', tone && `rv-chip--${tone}`)}><Icon source={ICONS[icon] || icon} /></span>;
}

/** One line of a settings list: icon, label (+ badge), value, chevron. The whole row is the button. */
export function Row({icon, label, badge, value, hint, onClick, locked, disabled}) {
  return (
    <button type="button" className={cx('rv-row', locked && 'is-locked')} onClick={onClick} disabled={disabled}>
      {icon ? <IconChip icon={locked ? 'lock' : icon} /> : null}
      <span className="rv-row__label">
        <span className="rv-row__name">{label}</span>
        {badge}
        {hint ? <span className="rv-row__hint">{hint}</span> : null}
      </span>
      <span className="rv-row__value">{value}</span>
      <span className="rv-row__chev"><Icon source={ChevronRightIcon} /></span>
    </button>
  );
}

/** Horizontal tier picker: the program is set up tier by tier. */
export function TierStrip({tiers, selected, onSelect, onAdd, onOverview, disabled}) {
  return (
    <div className="rv-tierbar">
      <div className="rv-tierstrip" role="tablist" aria-label="Tiers">
        {tiers.map((tier, index) => (
          <button key={tier.id} type="button" role="tab" aria-selected={tier.id === selected}
            className={cx('rv-tier', tier.id === selected && 'is-selected')} onClick={() => onSelect(tier.id)}>
            <span className={cx('rv-tier__swatch', `rv-look--${tier.look}`)} aria-hidden="true"><Icon source={StarFilledIcon} /></span>
            <span className="rv-tier__text">
              <span className="rv-tier__name">{tier.name}</span>
              <span className="rv-tier__meta">{index === 0 ? 'Starting tier' : `${num(tier.members)} members`}</span>
            </span>
          </button>
        ))}
        <button type="button" className="rv-tier rv-tier--add" onClick={onAdd} disabled={disabled}>
          <Icon source={PlusIcon} /><span>Tier</span>
        </button>
      </div>
      <button type="button" className="rv-overview-btn" onClick={onOverview} aria-label="All tiers side by side" title="All tiers side by side">
        <Icon source={DataTableIcon} />
      </button>
    </div>
  );
}

/** The membership card members see in the widget and in Apple / Google Wallet. */
export function TierCard({tier, images}) {
  const art = images?.[tier.look];
  return (
    <div className={cx('rv-pass', `rv-look--${tier.look}`)} style={art ? {backgroundImage: `url(${art})`} : undefined}
      role="img" aria-label={`${tier.name} membership card preview`}>
      <div className="rv-pass__top">
        <span className="rv-pass__icon"><Icon source={StarFilledIcon} /></span>
        <span className="rv-pass__shop">{STORE.name.toUpperCase()}</span>
      </div>
      <div className="rv-pass__bottom">
        <span className="rv-pass__tier">{tier.name}</span>
        <span className="rv-pass__qr" aria-hidden="true">
          {Array.from({length: 25}, (_, i) => <i key={i} className={(i * 7 + tier.name.length) % 3 ? 'on' : ''} />)}
        </span>
      </div>
    </div>
  );
}

export function NewBadge() {
  return <Badge tone="info">New</Badge>;
}

export function TierBadge({tier}) {
  return <InlineStack gap="100" blockAlign="center"><Badge>{`From ${tier.name}`}</Badge></InlineStack>;
}
