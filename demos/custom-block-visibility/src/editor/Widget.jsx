// The storefront widget as the preview draws it: header, Home body in the order of the Body list, footer tabs.
// Each Body entry shows or hides by the same rules the panels edit (switch on/off, Show to, Show to guests).
import React from 'react';
import {Icon} from '@shopify/polaris';
import {
  ChevronRightIcon,
  CreditCardIcon,
  DiscountIcon,
  ExternalIcon,
  GiftCardIcon,
  HomeIcon,
  OrderIcon,
  PersonIcon,
  QuestionCircleIcon,
  StarIcon,
  XIcon,
} from '@shopify/polaris-icons';
import {isCustom, sectionVisible, typeOf} from '../data/widget.js';
import {cx} from './bits.jsx';

const base = import.meta.env.BASE_URL;

const TILES = [
  {title: 'Cloud Cream mini', price: '$18.00', tone: 'pink'},
  {title: 'Night Notes serum', price: '$34.00', tone: 'yellow'},
  {title: 'Glow Getter set', price: '$52.00', tone: 'cream'},
];

const PROGRAM_PREVIEW = {
  'place-order': ['Place an order', 'Earn 10 points for every $100 spent', '10 pts / $100'],
  'sign-up': ['Sign up', 'Create an account', '+100 points'],
  newsletter: ['Sign up for newsletter', 'Earn 50 points', '+50 points'],
  instagram: ['Follow on Instagram', 'Earn 25 points', '+25 points'],
  birthday: ['Birthday', 'Earn 200 points on your birthday', '+200 points'],
};

const BUILTIN = {
  COUPONS: {rows: [{icon: DiscountIcon, title: 'My coupons', sub: '2 active coupons', chevron: true}]},
  VIP_TIERS: {heading: 'VIP tiers', rows: [{title: 'Silver', sub: 'From 0 points'}, {title: 'Gold', sub: 'From 1,000 points'}]},
  PROMOTED_COLLECTIONS: {heading: 'Promoted collections', rows: [{title: 'Winter gift sets', chevron: true}, {title: 'New arrivals', chevron: true}]},
  QUEST: {rows: [{icon: QuestionCircleIcon, title: 'Welcome quiz', sub: 'Earn 100 points', trail: '+100 points'}]},
  REFERRAL: {rows: [{icon: GiftCardIcon, title: 'Refer a friend', sub: 'Give $10 off, get $10 off', chevron: true}]},
  REDEEM_TAB: {
    heading: 'Ways to redeem',
    rows: [
      {icon: DiscountIcon, title: '$5 off your next order', sub: 'Order discount', trail: '500 points'},
      {icon: GiftCardIcon, title: 'Free shipping', sub: 'On orders over $25', trail: '300 points'},
    ],
  },
  RECENTLY_VIEWED: {heading: 'Recently viewed', tiles: true},
  PRODUCTS: {heading: 'Recommended for you', tiles: true},
  ACTIVITIES: {
    heading: 'Recent activity',
    rows: [
      {title: 'Order #1043', sub: 'Nov 12, 2026', trail: '+120 points'},
      {title: 'Newsletter sign-up', sub: 'Nov 3, 2026', trail: '+50 points'},
    ],
  },
  MILESTONE: {heading: 'Milestones', rows: [{icon: StarIcon, title: 'Place 3 orders', sub: '2 of 3 done', trail: '+300 points'}]},
  FAQ: {heading: 'Frequently asked questions', rows: [{title: 'How do I earn points?', chevron: true}, {title: 'When do points expire?', chevron: true}]},
  WIDGET_QR: {rows: [{icon: CreditCardIcon, title: 'My QR code', sub: 'Show it at checkout in store', chevron: true}]},
  WALLET_PASS: {rows: [{icon: CreditCardIcon, title: 'Add to wallet', sub: 'Keep your card on your phone', chevron: true}]},
};

function Row({icon, title, sub, trail, chevron, size}) {
  return (
    <div className="wg-row">
      {icon ? (
        <span className="wg-row__icon" style={size ? {width: size, height: size} : undefined}>
          <Icon source={icon} />
        </span>
      ) : null}
      <span className="wg-row__text">
        <strong>{title}</strong>
        {sub ? <small>{sub}</small> : null}
      </span>
      {trail ? <span className="wg-row__trail">{trail}</span> : null}
      {chevron ? (
        <span className="wg-row__chev">
          <Icon source={ChevronRightIcon} />
        </span>
      ) : null}
    </div>
  );
}

function Panel({heading, children}) {
  return (
    <section className="wg-section">
      {heading ? <h3 className="wg-section__title">{heading}</h3> : null}
      <div className="wg-section__body">{children}</div>
    </section>
  );
}

function EarnSection({section, programs}) {
  const shown = programs.filter((p) => p.isShow !== false);
  const rows = section.maxItems > 0 ? shown.slice(0, section.maxItems) : shown;
  return (
    <Panel heading="Ways to earn">
      {rows.map((p) => {
        const [title, sub, trail] = PROGRAM_PREVIEW[p.id];
        return <Row key={p.id} icon={StarIcon} title={title} sub={sub} trail={trail} size={section.iconSize || undefined} />;
      })}
    </Panel>
  );
}

function BuiltIn({section, programs}) {
  if (section.id === 'EARN_TAB') return <EarnSection section={section} programs={programs} />;
  const def = BUILTIN[section.id];
  if (!def) return null;
  return (
    <Panel heading={def.heading}>
      {def.tiles ? (
        <div className="wg-tiles">
          {TILES.map((t) => (
            <div key={t.title} className="wg-tile">
              <span className={cx('wg-tile__img', `is-${t.tone}`)} />
              <strong>{t.title}</strong>
              <small>{t.price}</small>
            </div>
          ))}
        </div>
      ) : (
        def.rows.map((row) => <Row key={row.title} {...row} />)
      )}
    </Panel>
  );
}

const LINK_ICONS = {external: ExternalIcon, 'chevron-right': ChevronRightIcon, gift: GiftCardIcon, star: StarIcon};

/** One custom block, drawn like the widget's own renderer. A Link URL makes the block clickable. */
function Block({block, onLink}) {
  const type = typeOf(block);
  const link = block.url ? {role: 'link', tabIndex: 0, onClick: () => onLink(block), onKeyDown: (e) => (e.key === 'Enter' || e.key === ' ') && onLink(block)} : {};
  switch (type) {
    case 'CUSTOM_RICHTEXT':
      return (
        <p className={cx('wg-rich', `wg-rich--${block.size || 'sm'}`)} style={{textAlign: block.align || 'left'}}>
          {block.content}
        </p>
      );
    case 'CUSTOM_HEADING': {
      const Tag = block.level || 'h3';
      return (
        <div style={{textAlign: block.align || 'left'}}>
          <Tag className={cx('wg-heading', `wg-heading--${Tag}`)}>{block.text}</Tag>
          {block.subtitle ? <p className="wg-heading__sub">{block.subtitle}</p> : null}
        </div>
      );
    }
    case 'CUSTOM_BUTTON':
      return (
        <div style={{textAlign: block.align || 'center'}}>
          <button type="button" className={cx('wg-btn', `wg-btn--${block.variant || 'primary'}`, `wg-btn--${block.size || 'sm'}`, block.fullWidth !== false && 'is-full')} onClick={() => block.url && onLink(block)}>
            {block.label || 'Button'}
          </button>
        </div>
      );
    case 'CUSTOM_DIVIDER':
      return <hr className={cx('wg-divider', `wg-divider--${block.variant || 'solid'}`)} />;
    case 'CUSTOM_BANNER':
      return block.image && block.bannerType !== 'blank' ? (
        <div className={cx('wg-banner', block.url && 'is-link')} {...link}>
          <img src={block.image} alt={block.alt || ''} />
        </div>
      ) : null;
    case 'CUSTOM_LINK':
      return (
        <div className="wg-card wg-linkrow is-link" role="link" tabIndex={0} onClick={() => block.url && onLink(block)}>
          <Row icon={LINK_ICONS[block.icon] || ExternalIcon} title={block.title} sub={block.subtitle} />
          <span className="wg-row__chev">
            <Icon source={ExternalIcon} />
          </span>
        </div>
      );
    case 'CUSTOM_CTA':
      return (
        <div className="wg-cta" style={{background: block.bgColor || undefined, color: block.textColor || undefined, textAlign: block.align || 'center'}}>
          {block.title ? <strong>{block.title}</strong> : null}
          {block.subtitle ? <small>{block.subtitle}</small> : null}
          {block.buttonLabel ? (
            <button type="button" className={cx('wg-btn', 'wg-btn--primary', 'wg-btn--sm', block.fullWidth !== false && 'is-full')} style={{background: block.buttonBgColor || undefined, color: block.buttonTextColor || undefined}} onClick={() => block.url && onLink(block)}>
              {block.buttonLabel}
            </button>
          ) : null}
        </div>
      );
    case 'CUSTOM_IMAGE_TEXT': {
      const layout = block.layout || 'image-left';
      const showImage = block.image && block.bannerType !== 'blank';
      return (
        <div className={cx('wg-imgtext', `is-${layout}`, block.url && 'is-link')} {...link}>
          {showImage ? <img src={block.image} alt={block.alt || ''} /> : null}
          <div className="wg-imgtext__text">
            {block.title ? <strong>{block.title}</strong> : null}
            {block.description ? <small>{block.description}</small> : null}
            {block.url ? (
              <span className="wg-imgtext__go" aria-hidden="true">
                <Icon source={block.external !== false ? ExternalIcon : ChevronRightIcon} />
              </span>
            ) : null}
          </div>
        </div>
      );
    }
    default:
      return null;
  }
}

export function Widget({sections, membership, programs, viewer, inspect, onInspect, onLink, onJoin}) {
  const member = viewer === 'member';
  const rows = sections.filter((s) => sectionVisible(s, viewer));
  const tap = (id) => (event) => {
    if (!inspect) return;
    event.preventDefault();
    event.stopPropagation();
    onInspect(id);
  };
  return (
    <div className={cx('wg', inspect && 'is-inspect')} data-viewer={viewer}>
      <header className="wg__head">
        <img src={`${base}img/icon.png`} alt="" width="28" height="28" />
        <span>Pomelo Rewards</span>
        <span className="wg__close" aria-hidden="true">
          <Icon source={XIcon} />
        </span>
      </header>
      <div className="wg__body">
        {membership ? (
          member ? (
            <div className="wg-card wg-member" data-inspect="membership-card" onClickCapture={tap('membership-card')}>
              <div className="wg-member__top">
                <strong>Welcome back, Ava</strong>
                <span className="wg-link">View profile</span>
              </div>
              <div className="wg-member__points">
                <span>Points</span>
                <strong>1,240</strong>
              </div>
              <small>Points expire on Nov 17, 2027</small>
            </div>
          ) : (
            <div className="wg-card wg-guest" data-inspect="membership-card" onClickCapture={tap('membership-card')}>
              <strong>Welcome to Pomelo Rewards</strong>
              <p>Join our loyalty program to earn points, redeem rewards and more.</p>
              <button type="button" className="wg-btn wg-btn--dark wg-btn--md" onClick={onJoin}>
                Join Program
              </button>
              {viewer === 'guest' ? (
                <small>
                  Already a member?{' '}
                  <button type="button" className="wg-link wg-link--button" onClick={onJoin}>
                    Sign in
                  </button>
                </small>
              ) : (
                <small>Signed in as ava@example.com</small>
              )}
            </div>
          )
        ) : null}
        {rows.map((section) => (
          <div key={section.id} className="wg-sec" data-inspect={section.id} onClickCapture={tap(section.id)}>
            {isCustom(section) ? <Block block={section} onLink={onLink} /> : <BuiltIn section={section} programs={programs} />}
          </div>
        ))}
      </div>
      <nav className="wg__foot" aria-label="Widget navigation">
        {[
          ['Home', HomeIcon, true],
          ['Rewards', GiftCardIcon],
          ['Orders', OrderIcon],
          ['Profile', PersonIcon],
        ].map(([label, icon, on]) => (
          <span key={label} className={cx('wg__tab', on && 'is-on')}>
            <Icon source={icon} />
            {label}
          </span>
        ))}
      </nav>
    </div>
  );
}

