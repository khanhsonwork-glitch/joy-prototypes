// Amber panel that is visibly NOT product UI: pick the shop, whether Black Friday still runs, annual billing,
// and jump between the three screens this prototype changes.
import React, {useEffect, useRef, useState} from 'react';
import {STATES, useScenario} from './scenario.jsx';
import {CAMPAIGN, SHOPS} from '../data/plans.js';
import {useProto} from '../state/proto.jsx';

const SCREENS = [
  {href: '#/plans', label: 'Plans page'},
  {href: '#/onboarding-plan', label: 'Onboarding · plan step'},
  {href: '#/dashboard', label: 'Dashboard banner'},
];

export function ProtoControls() {
  const {state, setState} = useScenario();
  const {shop, campaign, annual, set} = useProto();
  const [open, setOpen] = useState(false);
  const [seen, setSeen] = useState(() => sessionStorage.getItem('proto-settings-seen') === '1');
  const toggle = useRef(null);
  const panel = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    if (!seen) {
      sessionStorage.setItem('proto-settings-seen', '1');
      setSeen(true);
    }
    panel.current?.querySelector('input:checked, input')?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, seen]);

  if (new URLSearchParams(window.location.search).get('shot') === '1') return null;

  return (
    <div className="kit-proto">
      {open ? (
        <div ref={panel} className="kit-proto__panel" id="kit-proto-panel" role="group" aria-label="Prototype settings">
          <p className="kit-proto__title">Prototype · not part of the product</p>
          <fieldset className="kit-proto__states">
            <legend>Shop</legend>
            {SHOPS.map((s) => (
              <label key={s.value} className="kit-proto__state">
                <input type="radio" name="kit-proto-shop" value={s.value} checked={shop === s.value} onChange={() => set({shop: s.value})} />
                <span>
                  <strong>{s.label}</strong>
                  <small>{s.help}</small>
                </span>
              </label>
            ))}
          </fieldset>
          <fieldset className="kit-proto__states">
            <legend>Black Friday</legend>
            {CAMPAIGN.map((c) => (
              <label key={c.value} className="kit-proto__state">
                <input type="radio" name="kit-proto-campaign" value={c.value} checked={campaign === c.value} onChange={() => set({campaign: c.value})} />
                <span>
                  <strong>{c.label}</strong>
                  <small>{c.help}</small>
                </span>
              </label>
            ))}
          </fieldset>
          <fieldset className="kit-proto__states">
            <legend>Billing</legend>
            <label className="kit-proto__state">
              <input type="checkbox" checked={annual} onChange={(e) => set({annual: e.target.checked})} />
              <span>
                <strong>Shop is offered annual billing</strong>
                <small>Shows the Monthly / Annually switch on the Plans page</small>
              </span>
            </label>
          </fieldset>
          <fieldset className="kit-proto__states">
            <legend>Screen state</legend>
            {STATES.map((s) => (
              <label key={s.value} className="kit-proto__state">
                <input type="radio" name="kit-proto-state" value={s.value} checked={state === s.value} onChange={() => setState(s.value)} />
                <span>
                  <strong>{s.label}</strong>
                  <small>{s.help}</small>
                </span>
              </label>
            ))}
          </fieldset>
          <div className="kit-proto__screens">
            {SCREENS.map((s) => (
              <a key={s.href} className="kit-proto__link" href={s.href} onClick={() => setOpen(false)}>
                {s.label} →
              </a>
            ))}
          </div>
        </div>
      ) : null}
      <button
        ref={toggle}
        type="button"
        className={`kit-proto__toggle${seen ? '' : ' is-pulsing'}`}
        aria-expanded={open}
        aria-controls="kit-proto-panel"
        onClick={() => setOpen((v) => !v)}
      >
        {/* Phones keep the word (Alex 20/10: an icon-only chip was unclear); a dot marks a non-default state. */}
        Prototype settings
        {state !== 'default' ? <span className="kit-proto__current">{` · ${STATES.find((s) => s.value === state).label}`}</span> : null}
        {state !== 'default' ? <span className="kit-proto__dot" aria-hidden="true" /> : null}
      </button>
    </div>
  );
}
