// "Limit Joy reward codes per order": its own card in Settings › Additional features, built like the "Limit customer
// earning" card (GlobalEarningLimit.js): SettingToggle + subdued subtitle, and when on a divider then sub-sections with a
// heading each — the two fields, what Joy counts as a Joy code, the check against the shop's own codes, and a code tester.
import React, {useState} from 'react';
import {Banner, BlockStack, Button, Card, Divider, Icon, InlineStack, Select, Spinner, Text, TextField} from '@shopify/polaris';
import {CheckCircleIcon, XCircleIcon} from '@shopify/polaris-icons';
import {useShell} from '../shell/ShellContext.jsx';
import {useScenario} from '../kit/scenario.jsx';
import {SettingToggle} from './SettingToggle.jsx';
import {
  CHECKED, CLASHES, EMPTY_FORMATS, EXACT, FORMATS, MESSAGE_MAX, NO_PREFIX, OVERFLOW_FORMATS, WORST_CLASHES, num, testCode,
} from '../data/codes.js';

const HELP = 'Applies to every discount code issued by Joy, including codes your customers already have and free shipping codes. Your own Shopify discount codes are not affected, unless they have exactly the same format as your Joy codes (same prefix and same length).';

/** A sub-section of the card: <s-heading> + optional subdued line, like "Time period" in Limit customer earning. */
function Inset({id, title, subtitle, children}) {
  return (
    <div id={id} className="lc-anchor">
      <BlockStack gap="200">
        <Text as="h3" variant="headingSm">{title}</Text>
        {subtitle ? <Text as="p" tone="subdued">{subtitle}</Text> : null}
        {children}
      </BlockStack>
    </div>
  );
}

function scenarioData(state) {
  const big = state === 'overflow' || state === 'worst';
  let formats = big ? OVERFLOW_FORMATS : FORMATS;
  if (state === 'empty') formats = EMPTY_FORMATS;
  if (state === 'empty-prefix') formats = [...FORMATS, NO_PREFIX];
  const clashes = state === 'conflict' ? CLASHES : state === 'worst' ? WORST_CLASHES : [];
  return {
    formats,
    exact: state === 'empty' ? [] : EXACT,
    clashes,
    checked: big ? CHECKED.overflow : CHECKED.default,
    checkFailed: state === 'worst',
    big,
  };
}

/* ---------------------------------------------------------------- Joy code formats */

function Formats({formats, exact, empty}) {
  return (
    <Inset id="joy-code-formats" title="Joy code formats" subtitle="At checkout, a code counts as a Joy code when it has one of these formats. Case doesn’t matter.">
      <div className="lc-table" role="table" aria-label="Joy code formats">
        <div className="lc-table__head" role="row">
          <span role="columnheader">Format</span>
          <span role="columnheader">Comes from</span>
          <span role="columnheader">Last issued</span>
        </div>
        {[...formats, ...exact].map((f) => (
          <div className="lc-table__row" role="row" key={f.id || f.code}>
            <span role="cell" className="lc-table__format">
              <Text as="span" fontWeight="medium">{f.label}</Text>
              <span className="lc-code lc-code--subdued">{f.example}</span>
            </span>
            <span role="cell" className="lc-table__from">
              <span className="lc-table__label" aria-hidden="true">Comes from</span>
              <Text as="span" tone={f.retired ? 'caution' : undefined}>{f.from}</Text>
            </span>
            <span role="cell" className="lc-table__last">
              <span className="lc-table__label" aria-hidden="true">Last issued</span>
              <Text as="span" tone={f.last === 'Not yet' ? 'subdued' : undefined}>{f.last}</Text>
            </span>
          </div>
        ))}
      </div>
      <Text as="p" tone="subdued">
        {empty
          ? 'Joy hasn’t issued a discount code yet. Joy adds a format automatically whenever it issues a code in a new format.'
          : 'Joy adds a format automatically whenever it issues a code in a new format.'}
      </Text>
    </Inset>
  );
}

/* ---------------------------------------------------------------- check against the shop's own codes */

function Check({data, excluded, onExclude, onUndo, onChangePrefix, disabled, empty}) {
  const {notify} = useShell();
  const [checking, setChecking] = useState(false);
  const open = data.clashes.filter((c) => !excluded.includes(c.code));
  const out = data.clashes.filter((c) => excluded.includes(c.code));
  const again = () => {
    setChecking(true);
    window.setTimeout(() => {
      setChecking(false);
      notify('Check finished');
    }, 700);
  };

  let result;
  if (empty) {
    result = (
      <Banner tone="info">
        <p>No discount codes were used in your orders in the last 90 days yet. Joy checks again every day.</p>
      </Banner>
    );
  } else if (open.length) {
    result = (
      <BlockStack gap="300">
        <Banner tone="warning" title={open.length === 1 ? '1 of your own codes matches a Joy format and would be counted as a Joy code:' : `${open.length} of your own codes match a Joy format and would be counted as Joy codes:`} />
        <div className="lc-clash">
          {open.map((c) => (
            <div className="lc-clash__row" key={c.code}>
              <BlockStack gap="050">
                <span className="lc-code">{c.code}</span>
                <Text as="span" tone="subdued" variant="bodySm">{`Used in ${num(c.orders)} ${c.orders === 1 ? 'order' : 'orders'}`}</Text>
              </BlockStack>
              <InlineStack gap="200" wrap>
                <Button onClick={() => onExclude(c.code)} disabled={disabled}>Don’t count as Joy code</Button>
                <Button variant="tertiary" onClick={() => onChangePrefix(c.code)} disabled={disabled}>Change prefix</Button>
              </InlineStack>
            </div>
          ))}
        </div>
      </BlockStack>
    );
  } else {
    result = (
      <Banner tone="success">
        <p>
          {out.length
            ? `Checked ${num(data.checked)} discount codes used in your orders in the last 90 days. Apart from the codes you excluded, none of your own codes match a Joy format.`
            : `Checked ${num(data.checked)} discount codes used in your orders in the last 90 days. None of your own codes match a Joy format.`}
        </p>
      </Banner>
    );
  }

  return (
    <Inset id="own-code-check" title="Check against your own codes" subtitle="Joy runs the discount codes used in your orders through the formats above, now and every day.">
      {data.checkFailed ? (
        <Banner tone="critical" title="The last check didn’t finish" action={{content: 'Check again', onAction: again, loading: checking}}>
          <p>68,504 codes from orders before Aug 30 weren’t checked. The results below cover the rest. Nothing in your settings changed.</p>
        </Banner>
      ) : null}
      {result}
      {out.length ? (
        <BlockStack gap="200">
          <Text as="h5" variant="headingXs">Excluded codes</Text>
          <div className="lc-clash">
            {out.map((c) => (
              <div className="lc-clash__row" key={c.code}>
                <BlockStack gap="050">
                  <span className="lc-code">{c.code}</span>
                  <Text as="span" tone="subdued" variant="bodySm">Not counted as a Joy code</Text>
                </BlockStack>
                <Button variant="plain" onClick={() => onUndo(c.code)} disabled={disabled}>Undo</Button>
              </div>
            ))}
          </div>
        </BlockStack>
      ) : null}
      {!data.checkFailed ? (
        <InlineStack gap="200" blockAlign="center">
          <Text as="span" tone="subdued" variant="bodySm">Last checked today at 6:00 AM</Text>
          {checking ? <Spinner size="small" accessibilityLabel="Checking" /> : <Button variant="plain" onClick={again} disabled={disabled}>Check again</Button>}
        </InlineStack>
      ) : null}
    </Inset>
  );
}

/* ---------------------------------------------------------------- test a code */

function Tester({data, excluded, disabled, preset}) {
  const [value, setValue] = useState(preset ? 'NB-O8QY6BW9J3FC' : '');
  const opts = {formats: data.formats, exact: data.exact, excluded, clashes: data.clashes};
  const [results, setResults] = useState(() => (preset ? ['NB-15', 'NB-O8QY6BW9J3FC'].map((c) => testCode(c, opts)) : []));
  const run = () => {
    const r = testCode(value, opts);
    if (!r) return;
    setResults((list) => [...list.filter((x) => x.code !== r.code), r].slice(-5));
  };
  return (
    <Inset id="test-a-code" title="Test a code" subtitle="Type any discount code to see whether Joy counts it as a Joy code, and why.">
      <form
        className="lc-test"
        onSubmit={(e) => {
          e.preventDefault();
          run();
        }}
      >
        <div className="lc-test__field">
          <TextField label="Discount code" labelHidden autoComplete="off" placeholder="e.g. NB-O8QY6BW9J3FC" value={value} onChange={setValue} disabled={disabled} />
        </div>
        <Button submit disabled={disabled || !value.trim()}>Test</Button>
      </form>
      <div className="lc-results" aria-live="polite">
        {results.length ? (
          results.map((r) => (
            <div className={`lc-result${r.joy ? ' is-joy' : ''}`} key={r.code}>
              <span className="lc-result__icon"><Icon source={r.joy ? CheckCircleIcon : XCircleIcon} tone={r.joy ? 'success' : 'subdued'} /></span>
              <p>
                <span className="lc-code">{r.code}</span>
                {' — '}
                <strong>{r.text.slice(0, r.text.indexOf('.') + 1)}</strong>
                {r.text.slice(r.text.indexOf('.') + 1)}
              </p>
            </div>
          ))
        ) : (
          <Text as="p" tone="subdued">Results show here.</Text>
        )}
      </div>
    </Inset>
  );
}

/* ---------------------------------------------------------------- the block */

export function CodeLimit({form, set, saved, failed, onDismissFailed, messageError, onChangePrefix}) {
  const {notYet} = useShell();
  const {state} = useScenario();
  const data = scenarioData(state);
  const disabled = state === 'disabled';
  const exclude = (code) => set({excluded: [...form.excluded, code]});
  const undo = (code) => set({excluded: form.excluded.filter((c) => c !== code)});

  return (
    <div id="limit-reward-codes" className="lc-anchor">
      <Card>
        <BlockStack gap="400">
          <BlockStack gap="100">
            <SettingToggle
              title="Limit Joy reward codes per order"
              status={form.enabled}
              disabled={disabled}
              onToggle={(on) => {
                if (on) onDismissFailed();
                set({enabled: on});
              }}
            />
            <Text as="p" tone="subdued">{HELP}</Text>
          </BlockStack>

          {disabled ? (
            <Banner tone="warning" title="You can view this setting but not change it">
              <p>Changing Settings needs the Settings permission in Joy. Ask the store owner to give you access.</p>
            </Banner>
          ) : null}
          {failed ? (
            <Banner tone="critical" title="Couldn’t turn on the limit" onDismiss={onDismissFailed} action={{content: 'Open Shopify discounts', onAction: notYet}}>
              <p>Shopify allows up to 25 active automatic discounts. Deactivate one in Shopify, then try again.</p>
            </Banner>
          ) : null}
          {state === 'empty-prefix' ? (
            <Banner tone="warning" action={{content: 'Set a prefix', onAction: notYet}}>
              <BlockStack gap="100">
                <p>Some Joy rewards have no prefix, so their codes are just 12 random characters. Any of your own codes that are exactly 12 letters or numbers will be counted as Joy codes. Add a prefix to those rewards before turning this on.</p>
                <p>No prefix: Free shipping (Redeeming programs).</p>
              </BlockStack>
            </Banner>
          ) : null}

          {form.enabled ? (
            <BlockStack gap="400">
              <Divider />
              <Inset id="max-codes" title="Maximum Joy codes per order">
                <div className="lc-fields">
                  <Select
                    label="Maximum Joy codes per order"
                    labelHidden
                    options={['1', '2', '3', '4']}
                    value={form.max}
                    onChange={(v) => set({max: v})}
                    disabled={disabled}
                    helpText="Your own Shopify discount codes don’t count toward this number."
                  />
                </div>
              </Inset>
              <Inset id="removal-message" title="Message when a code is removed">
                <TextField
                  id="code-limit-message"
                  label="Message when a code is removed"
                  labelHidden
                  autoComplete="off"
                  value={form.message}
                  onChange={(v) => set({message: v})}
                  maxLength={MESSAGE_MAX}
                  showCharacterCount
                  multiline
                  disabled={disabled}
                  error={messageError}
                  helpText="Shown at checkout under the discount code field. {code} becomes the removed code and {max} the number above."
                />
              </Inset>
              <Divider />
              <Formats formats={data.formats} exact={data.exact} empty={state === 'empty'} />
              <Divider />
              <Check
                data={data}
                excluded={form.excluded}
                onExclude={exclude}
                onUndo={undo}
                onChangePrefix={onChangePrefix}
                disabled={disabled}
                empty={state === 'empty'}
              />
              <Divider />
              <Tester key={`${state}-${saved.excluded.join()}`} data={data} excluded={form.excluded} disabled={disabled} preset={state === 'test'} />
            </BlockStack>
          ) : null}
        </BlockStack>
      </Card>
    </div>
  );
}
