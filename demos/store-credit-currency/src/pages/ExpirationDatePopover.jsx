// The Expiration field of the real Adjust store credit modal: a button that opens presets + a calendar.
// Same behaviour as Joy's ExpirationDatePopover (presets 1/3/5 years, typed date, past dates disabled).
import React, {useCallback, useState} from 'react';
import {ActionList, Box, Button, DatePicker, Labelled, Popover, TextField} from '@shopify/polaris';
import {CalendarIcon} from '@shopify/polaris-icons';

const pad = (n) => String(n).padStart(2, '0');
export const formatYMD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function dateFromPreset({type, value}) {
  const now = new Date();
  if (type === 'year') return new Date(now.getFullYear() + value, now.getMonth(), now.getDate());
  if (type === 'month') return new Date(now.getFullYear(), now.getMonth() + value, now.getDate());
  return null;
}

/** YYYY-MM-DD typed by hand → local date (new Date('2027-01-05') would be UTC midnight). */
function parseYMD(value) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function ExpirationDatePopover({label, noExpirationLabel, presets = [], value = '', onChange}) {
  const [active, setActive] = useState(false);
  const toggle = useCallback(() => setActive((v) => !v), []);
  const selectedDate = parseYMD(value);
  const [{month, year}, setMonthYear] = useState(() => {
    const d = selectedDate || new Date();
    return {month: d.getMonth(), year: d.getFullYear()};
  });

  const pickPreset = (preset) => {
    if (!preset) {
      onChange('');
      setActive(false);
      return;
    }
    const date = dateFromPreset(preset);
    if (date) {
      onChange(formatYMD(date));
      setMonthYear({month: date.getMonth(), year: date.getFullYear()});
    }
  };

  const items = [
    {content: noExpirationLabel, active: !value, onAction: () => pickPreset(null)},
    ...presets.map((p) => ({content: p.label, onAction: () => pickPreset(p)})),
  ];

  return (
    <Labelled id="expiration-date" label={label}>
      <Popover
        active={active}
        activator={
          <Button textAlign="left" onClick={toggle} icon={CalendarIcon} disclosure={active ? 'up' : 'down'}>
            {value || noExpirationLabel}
          </Button>
        }
        onClose={() => setActive(false)}
        preferredAlignment="left"
        fluidContent
        zIndexOverride={999}
      >
        <div className="sc-exp">
          <div className="sc-exp__presets">
            <ActionList items={items} />
          </div>
          <div className="sc-exp__calendar">
            <Box paddingBlockEnd="300">
              <TextField
                label="Expiration date"
                labelHidden
                value={value}
                onChange={(val) => {
                  onChange(val);
                  const parsed = parseYMD(val);
                  if (parsed) setMonthYear({month: parsed.getMonth(), year: parsed.getFullYear()});
                }}
                autoComplete="off"
                placeholder="YYYY-MM-DD"
                connectedLeft={
                  <Box>
                    <Button icon={CalendarIcon} accessibilityLabel="Calendar" />
                  </Box>
                }
              />
            </Box>
            <DatePicker
              month={month}
              year={year}
              selected={selectedDate ? {start: selectedDate, end: selectedDate} : undefined}
              onChange={({start}) => {
                onChange(formatYMD(start));
                setActive(false);
              }}
              onMonthChange={(m, y) => setMonthYear({month: m, year: y})}
              disableDatesBefore={new Date()}
            />
          </div>
        </div>
      </Popover>
    </Labelled>
  );
}
