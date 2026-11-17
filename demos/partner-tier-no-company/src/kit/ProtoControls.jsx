// Amber panel that is visibly NOT product UI: switch the shop (companies, and on Settings › General the plan),
// open the component sheet.
import React, {useEffect, useRef, useState} from 'react';
import {useRoute} from '../shell/router.jsx';
import {DEFAULT_STATE, PLANS, STATES, useScenario, useShop} from './scenario.jsx';

export function ProtoControls() {
  const {state, setState, setPlan} = useScenario();
  const {planKey} = useShop();
  const route = useRoute();
  const onSettings = route.segments[0] === 'settings';
  const [open, setOpen] = useState(false);
  const toggle = useRef(null);
  const panel = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    panel.current?.querySelector('input:checked, input')?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  if (new URLSearchParams(window.location.search).get('shot') === '1') return null;
  const current = [
    state !== DEFAULT_STATE ? STATES.find((s) => s.value === state).label : null,
    onSettings && planKey !== 'advanced' ? PLANS.find((p) => p.value === planKey).label : null,
  ].filter(Boolean);

  return (
    <div className="kit-proto">
      {open ? (
        <div ref={panel} className="kit-proto__panel" id="kit-proto-panel" role="group" aria-label="Prototype settings">
          <p className="kit-proto__title">Prototype · not part of the product</p>
          <fieldset className="kit-proto__states">
            <legend>Shopify B2B companies</legend>
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
          {onSettings ? (
            <fieldset className="kit-proto__states">
              <legend>Plan (Settings › General)</legend>
              {PLANS.map((p) => (
                <label key={p.value} className="kit-proto__state">
                  <input type="radio" name="kit-proto-plan" value={p.value} checked={planKey === p.value} onChange={() => setPlan(p.value)} />
                  <span>
                    <strong>{p.label}</strong>
                    <small>{p.help}</small>
                  </span>
                </label>
              ))}
            </fieldset>
          ) : null}
          <a className="kit-proto__link" href="#/kit" onClick={() => setOpen(false)}>Components and tokens →</a>
        </div>
      ) : null}
      <button
        ref={toggle}
        type="button"
        className="kit-proto__toggle"
        aria-expanded={open}
        aria-controls="kit-proto-panel"
        onClick={() => setOpen((v) => !v)}
      >
        {/* Phones keep the word (Alex 20/10: an icon-only chip was unclear) and drop the state name; a dot marks a
            non-default state there, and screen readers still hear the full label. */}
        Prototype
        {current.length ? <span className="kit-proto__current">{` · ${current.join(' · ')}`}</span> : null}
        {current.length ? <span className="kit-proto__dot" aria-hidden="true" /> : null}
      </button>
    </div>
  );
}
