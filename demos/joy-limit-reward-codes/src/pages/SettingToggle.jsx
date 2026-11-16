// The header row every on/off card in Settings › Additional features uses (components/SettingToggle in the Joy admin):
// heading + On/Off badge on the left; on the right a switch labelled "Turn on" / "Turn off" (or, on older cards such as
// Pre-login URLs, a "Turn on" button).
import React from 'react';
import {Badge, Button, InlineStack, Text} from '@shopify/polaris';

/** Same size and colours as the Polaris switch (s-switch) the Joy admin uses. */
export function Switch({checked, onChange, disabled, label}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={`lc-switch${checked ? ' is-on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="lc-switch__knob" />
    </button>
  );
}

export function SettingToggle({title, status, onToggle, disabled, button = false}) {
  const action = status ? 'Turn off' : 'Turn on';
  return (
    <div className="lc-toggle">
      <InlineStack gap="200" blockAlign="center" wrap>
        <Text as="h2" variant="headingSm">{title}</Text>
        <Badge tone={status ? 'success' : undefined}>{status ? 'On' : 'Off'}</Badge>
      </InlineStack>
      {button ? (
        <Button size="slim" onClick={() => onToggle(!status)} disabled={disabled}>{action}</Button>
      ) : (
        <label className="lc-toggle__control">
          <Switch checked={status} onChange={onToggle} disabled={disabled} label={`${action}: ${title}`} />
          <span aria-hidden="true">{action}</span>
        </label>
      )}
    </div>
  );
}
