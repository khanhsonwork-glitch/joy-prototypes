// Amber panel that is visibly NOT product UI: switch the screen state, open the component sheet.
import React, {useEffect, useRef, useState} from 'react';
import {STATES, useScenario} from './scenario.jsx';

export function ProtoControls() {
  const {state, setState} = useScenario();
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

  return (
    <div className="kit-proto">
      {open ? (
        <div ref={panel} className="kit-proto__panel" id="kit-proto-panel" role="group" aria-label="Prototype settings">
          <p className="kit-proto__title">Prototype · not part of the product</p>
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
        {state !== 'default' ? <span className="kit-proto__current">{` · ${STATES.find((s) => s.value === state).label}`}</span> : null}
        {state !== 'default' ? <span className="kit-proto__dot" aria-hidden="true" /> : null}
      </button>
    </div>
  );
}
