// The Wishlist tab of the Joy storefront widget, drawn the way the live widget draws it (list layout),
// with the two row styles this prototype proposes:
//   'one-line'  today's row: name on one line, Add + remove on the right, plus an arrow that shows the full name
//   'two-lines' new row: name up to two lines, remove in the row's top corner, Add next to the price
import React, {useLayoutEffect, useRef, useState} from 'react';

const cx = (...parts) => parts.filter(Boolean).join(' ');

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M18 6L6 18M6 6l12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M20 6L9 17l-5-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Heart() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

/** The arrow next to a cut name: brand-coloured chevron, no background, 18px icon in a 32×32 touch area. */
function ExpandButton({open, onToggle, controls, name}) {
  return (
    <button
      type="button"
      className={cx('jw-expand', open && 'is-open')}
      aria-expanded={open}
      aria-controls={controls}
      aria-label={open ? `Show less of ${name}` : `Show full name: ${name}`}
      onClick={onToggle}
    >
      <Chevron />
    </button>
  );
}

/** True when the element's text does not fit (one line: wider than its box; two lines: taller than its box). */
function useIsCut(ref, deps) {
  const [cut, setCut] = useState(false);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => setCut(el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return cut;
}

function Prices({item}) {
  return (
    <div className="jw-prices">
      <span className="jw-price">{item.price}</span>
      {item.compareAt ? <span className="jw-compare">{item.compareAt}</span> : null}
    </div>
  );
}

function AddButton({item, added, onAdd, compact}) {
  if (item.soldOut) {
    return (
      <button type="button" className={cx('jw-btn', compact && 'jw-btn--compact')} disabled>
        Sold out
      </button>
    );
  }
  return (
    <button type="button" className={cx('jw-btn', compact && 'jw-btn--compact', added && 'is-added')} onClick={() => onAdd(item)}>
      {added ? <Check /> : null}
      {added ? 'Added to cart' : 'Add'}
    </button>
  );
}

function Row({item, rowStyle, open, onToggle, added, onAdd, onRemove, onOpenProduct}) {
  const nameRef = useRef(null);
  // Measure the name while it is closed; once open it stays "cut" so the arrow is there to close it again.
  const cut = useIsCut(nameRef, [item.title, rowStyle, open]);
  const nameId = `jw-name-${item.id}`;
  const showArrow = rowStyle === 'one-line' && (cut || open);
  const media = item.img ? (
    <img className="jw-img" src={item.img} alt="" width="60" height="60" />
  ) : (
    <span className="jw-img jw-img--none" aria-hidden="true" />
  );
  const imageLink = (
    <a className="jw-img-link" href={`#product-${item.id}`} tabIndex={-1} aria-hidden="true" onClick={(e) => onOpenProduct(e, item)}>
      {media}
    </a>
  );
  const name = (
    <a
      ref={nameRef}
      id={nameId}
      className={cx('jw-name', rowStyle === 'one-line' && !open && 'is-one-line', rowStyle === 'two-lines' && 'is-two-lines')}
      href={`#product-${item.id}`}
      title={rowStyle === 'two-lines' ? item.title : undefined}
      onClick={(e) => onOpenProduct(e, item)}
    >
      {item.title}
    </a>
  );
  const variant = item.variant ? <div className="jw-variant">{item.variant}</div> : null;
  const remove = (
    <button type="button" className={cx('jw-remove', rowStyle === 'two-lines' && 'jw-remove--corner')} aria-label={`Remove ${item.title} from wishlist`} onClick={() => onRemove(item)}>
      <CloseIcon />
    </button>
  );

  if (rowStyle === 'two-lines') {
    return (
      <li className={cx('jw-row', 'jw-row--two')}>
        {imageLink}
        <div className="jw-info">
          {name}
          {variant}
          <div className="jw-priceline">
            <Prices item={item} />
            <AddButton item={item} added={added} onAdd={onAdd} compact />
          </div>
        </div>
        {remove}
      </li>
    );
  }
  return (
    <li className={cx('jw-row', open && 'is-open')}>
      {imageLink}
      <div className="jw-info">
        <div className="jw-nameline">
          {name}
          {showArrow ? <ExpandButton open={open} onToggle={onToggle} controls={nameId} name={item.title} /> : null}
        </div>
        {variant}
        <Prices item={item} />
      </div>
      <div className="jw-actions">
        <AddButton item={item} added={added} onAdd={onAdd} />
        {remove}
      </div>
    </li>
  );
}

function Skeleton() {
  return (
    <ul className="jw-list" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <li key={i} className="jw-row jw-row--skel">
          <span className="jw-skel jw-skel--img" />
          <span className="jw-skel-lines">
            <span className="jw-skel" style={{width: '78%'}} />
            <span className="jw-skel" style={{width: '36%'}} />
          </span>
          <span className="jw-skel jw-skel--btn" />
        </li>
      ))}
    </ul>
  );
}

/**
 * items: wishlist rows · rowStyle: 'one-line' | 'two-lines' · device: 'mobile' | 'desktop'
 * status: 'ready' | 'loading' | 'error' · onNotify(text): toast from the host page · onClose: header × (optional)
 */
export function WishlistWidget({shop, items, rowStyle, device, status = 'ready', onNotify, onRetry, onRemove, onClose}) {
  const [openIds, setOpenIds] = useState(() => new Set());
  const [addedIds, setAddedIds] = useState(() => new Set());

  const toggle = (id) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const add = (item) => {
    setAddedIds((prev) => new Set(prev).add(item.id));
    onNotify?.(`${item.title.length > 40 ? `${item.title.slice(0, 40)}…` : item.title} added to cart`);
  };
  const openProduct = (event, item) => {
    event.preventDefault();
    onNotify?.('Opens the product page in a new tab');
  };

  let body;
  if (status === 'loading') body = <Skeleton />;
  else if (status === 'error') {
    body = (
      <div className="jw-message" role="alert">
        <p className="jw-message__title">We couldn’t load your wishlist</p>
        <p className="jw-message__text">Your saved products are safe. Check your connection and try again.</p>
        <button type="button" className="jw-btn" onClick={onRetry}>Try again</button>
      </div>
    );
  } else if (!items.length) {
    body = (
      <div className="jw-message">
        <span className="jw-message__icon"><Heart /></span>
        <p className="jw-message__title">Your wishlist is empty</p>
        <p className="jw-message__text">Tap the heart on any product to save it here.</p>
        <button type="button" className="jw-btn" onClick={() => onNotify?.('Takes the shopper back to the shop')}>Continue shopping</button>
      </div>
    );
  } else {
    body = (
      <>
        <p className="jw-count">
          <Heart />
          {`${items.length} ${items.length === 1 ? 'product' : 'products'}`}
        </p>
        <ul className={cx('jw-list', rowStyle === 'two-lines' && 'jw-list--two')}>
          {items.map((item) => (
            <Row
              key={item.id}
              item={item}
              rowStyle={rowStyle}
              open={openIds.has(item.id)}
              onToggle={() => toggle(item.id)}
              added={addedIds.has(item.id)}
              onAdd={add}
              onRemove={(it) => {
                onRemove?.(it);
                onNotify?.('Removed from wishlist');
              }}
              onOpenProduct={openProduct}
            />
          ))}
        </ul>
      </>
    );
  }

  return (
    <section
      className={cx('jw', `jw--${device}`)}
      style={{'--jw-brand': shop.brand, '--jw-brand-text': shop.brandText}}
      aria-label={`${shop.widgetTitle} widget`}
    >
      <header className="jw-head">
        <span className="jw-logo" aria-hidden="true">{shop.widgetTitle.slice(0, 1)}</span>
        <h2 className="jw-title">{shop.widgetTitle}</h2>
        <button type="button" className="jw-head-close" aria-label="Close widget" onClick={() => (onClose ? onClose() : onNotify?.('Closes the widget'))}>
          <CloseIcon />
        </button>
      </header>
      <div className="jw-tabs" role="tablist" aria-label="Widget sections">
        <span className="jw-tab is-active" role="tab" aria-selected="true">Wishlist</span>
      </div>
      <div className="jw-body">{body}</div>
    </section>
  );
}
