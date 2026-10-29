// What the shopper sees: the storefront with the Joy widget open on the Wishlist tab.
// The amber bar is for reviewers only (shop, name setting, device); it is not part of the product.
import React, {useState} from 'react';
import {useShell} from '../shell/ShellContext.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {useSettings} from '../state/settings.jsx';
import {SHOPS} from '../data/wishlist.js';
import {WishlistWidget} from '../widget/WishlistWidget.jsx';
import {useWishlistItems} from '../widget/useWishlistItems.js';

function Segmented({label, value, options, onChange}) {
  return (
    <fieldset className="fx-seg">
      <legend>{label}</legend>
      <div className="fx-seg__row">
        {options.map((o) => (
          <label key={o.value} className={value === o.value ? 'is-on' : undefined}>
            <input type="radio" name={label} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function readQuery() {
  const q = new URLSearchParams(window.location.hash.split('?').slice(1).join('?'));
  return {shop: q.get('shop'), rows: q.get('rows'), device: q.get('device')};
}

export function Storefront() {
  const {notify} = useShell();
  const {state} = useScenario();
  const {settings} = useSettings();
  const q = readQuery();
  const [shopId, setShopId] = useState(SHOPS[q.shop] ? q.shop : 'moto');
  const [rowStyle, setRowStyle] = useState(['one-line', 'two-lines'].includes(q.rows) ? q.rows : settings.rowStyle);
  const [device, setDevice] = useState(['mobile', 'desktop'].includes(q.device) ? q.device : window.innerWidth < 760 ? 'mobile' : 'desktop');
  const {items, status, remove, reset} = useWishlistItems(shopId, state);
  const shop = SHOPS[shopId];
  // Closing really closes: reopening starts a fresh widget, so every opened name is back on one line.
  const [widgetOpen, setWidgetOpen] = useState(true);
  const [session, setSession] = useState(0);

  return (
    <div className="fx-store">
      <details className="fx-bar" open={window.innerWidth >= 760} aria-label="Prototype controls, not part of the product">
        <summary className="fx-bar__head">
          <strong>Prototype · storefront view</strong>
          <span className="fx-bar__now">{`${shop.label.split(' (')[0]} · ${rowStyle === 'one-line' ? 'One line + arrow' : 'Up to two lines'}`}</span>
          <a href="#/demo" onClick={(e) => e.stopPropagation()}>← Admin setting</a>
        </summary>
        <div className="fx-bar__controls">
          <Segmented label="Shop" value={shopId} onChange={setShopId} options={Object.values(SHOPS).map((s) => ({value: s.id, label: s.label}))} />
          <Segmented
            label="Product names"
            value={rowStyle}
            onChange={setRowStyle}
            options={[
              {value: 'one-line', label: 'One line + arrow'},
              {value: 'two-lines', label: 'Up to two lines'},
            ]}
          />
          <Segmented
            label="Device"
            value={device}
            onChange={setDevice}
            options={[
              {value: 'mobile', label: 'Mobile 390'},
              {value: 'desktop', label: 'Desktop popup'},
            ]}
          />
        </div>
      </details>

      <div className={`fx-stage fx-stage--${device}`} style={{'--fx-brand': shop.brand}}>
        {device === 'desktop' ? (
          <div className="fx-site" aria-hidden="true">
            <div className="fx-site__nav">
              <span className="fx-site__logo">{shop.label.split(' (')[0]}</span>
              <span className="fx-site__links">Shop · New · Sale · Help</span>
            </div>
            <div className="fx-site__hero" />
            <div className="fx-site__grid">
              {shop.items.slice(0, 4).map((i) => (
                <div key={i.id} className="fx-site__card">
                  <img src={i.img} alt="" />
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {widgetOpen ? (
        <div className={device === 'mobile' ? 'fx-phone' : 'fx-popup fx-popup--float'}>
          <WishlistWidget
            key={`${shopId}-${rowStyle}-${device}-${session}`}
            shop={shop}
            items={items}
            status={status}
            rowStyle={rowStyle}
            device={device}
            onNotify={(t) => notify(t)}
            onRetry={reset}
            onRemove={remove}
            onClose={() => setWidgetOpen(false)}
          />
        </div>
        ) : (
          <button
            type="button"
            className="fx-launcher"
            style={{background: shop.brand, color: shop.brandText}}
            onClick={() => {
              setSession((n) => n + 1);
              setWidgetOpen(true);
            }}
          >
            {shop.widgetTitle}
          </button>
        )}
      </div>
    </div>
  );
}
