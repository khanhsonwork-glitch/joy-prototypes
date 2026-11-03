// Amber panel that is visibly NOT product UI: pick the customer scenario, jump to the page or the open modal.
import React, {useEffect, useRef, useState} from 'react';
import {STATES, useScenario} from './scenario.jsx';

export function ProtoControls() {
  const {state, setState} = useScenario();
  const [open, setOpen] = useState(false);
  // Pulses until the reviewer opens it once (skill rule 7f), so a first-time visitor notices it.
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
  const stateQuery = state === 'default' ? '' : `?state=${state}`;

  return (
    <div className="kit-proto">
      {open ? (
        <div ref={panel} className="kit-proto__panel" id="kit-proto-panel" role="group" aria-label="Prototype settings">
          <p className="kit-proto__title">Prototype · not part of the product</p>
          <fieldset className="kit-proto__states">
            <legend>Customer</legend>
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
            <a className="kit-proto__link" href={`#/customer${stateQuery}`} onClick={() => setOpen(false)}>
              Customer page · Store credit tab →
            </a>
            <a className="kit-proto__link" href={`#/customer${stateQuery ? `${stateQuery}&` : '?'}modal=adjust`} onClick={() => setOpen(false)}>
              Adjust store credit modal →
            </a>
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
        {/* Phones keep the word (Alex 20/10: an icon-only chip was unclear) and drop the state name; a dot marks a
            non-default state there, and screen readers still hear the full label. */}
        Prototype settings
        {state !== 'default' ? <span className="kit-proto__current">{` · ${STATES.find((s) => s.value === state).label}`}</span> : null}
        {state !== 'default' ? <span className="kit-proto__dot" aria-hidden="true" /> : null}
      </button>
    </div>
  );
}
