// "Configure column layout" (spec 3.4): 1-4 columns and a ratio per count. Used when adding a Row and by Row > Edit layout.
import React, {useEffect, useState} from 'react';
import {BlockStack, Button, ButtonGroup, Modal, Text} from '@shopify/polaris';

export const COLUMN_LAYOUTS = {
  1: [[100]],
  2: [[50, 50], [33.33, 66.67], [66.67, 33.33], [25, 75], [75, 25]],
  3: [[33.34, 33.33, 33.33], [25, 50, 25], [50, 25, 25], [25, 25, 50]],
  4: [[25, 25, 25, 25]],
};

const isEqual = (layout) => layout.every((n) => Math.abs(n - 100 / layout.length) < 0.5);
const label = (layout) => (layout.length === 1 ? '100%' : isEqual(layout) ? 'Equal' : layout.map((n) => `${Math.round(n)}%`).join(' / '));
const same = (a, b) => a.length === b.length && a.every((n, i) => Math.abs(n - b[i]) < 0.5);

export default function ColumnLayoutModal({open, mode = 'add', initial = [50, 50], onClose, onSubmit}) {
  const [count, setCount] = useState(initial.length);
  const [layout, setLayout] = useState(initial);
  useEffect(() => {
    if (open) {
      setCount(initial.length);
      const match = (COLUMN_LAYOUTS[initial.length] || []).find((l) => same(l, initial));
      setLayout(match || COLUMN_LAYOUTS[initial.length]?.[0] || initial);
    }
  }, [open, initial]);
  const pickCount = (n) => {
    setCount(n);
    setLayout(COLUMN_LAYOUTS[n][0]);
  };
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Configure column layout"
      primaryAction={{content: mode === 'edit' ? 'Apply layout' : 'Add column layout', onAction: () => onSubmit(layout)}}
      secondaryActions={[{content: 'Cancel', onAction: onClose}]}
    >
      <Modal.Section>
        <BlockStack gap="400">
          <BlockStack gap="150">
            <Text as="span" variant="bodyMd">
              Number of columns
            </Text>
            <ButtonGroup variant="segmented">
              {[1, 2, 3, 4].map((n) => (
                <Button key={n} pressed={count === n} onClick={() => pickCount(n)}>
                  {String(n)}
                </Button>
              ))}
            </ButtonGroup>
          </BlockStack>
          <BlockStack gap="150">
            <Text as="span" variant="bodyMd">
              Column layout
            </Text>
            <div className="ee-layouts" role="radiogroup" aria-label="Column layout">
              {COLUMN_LAYOUTS[count].map((l) => {
                const selected = same(l, layout);
                return (
                  <button key={l.join('-')} type="button" role="radio" aria-checked={selected} className={`ee-layout${selected ? ' is-selected' : ''}`} onClick={() => setLayout(l)}>
                    <span className="ee-layout__glyph" aria-hidden="true">
                      {l.map((n, i) => (
                        <i key={i} style={{flex: `${n} 1 0`}} />
                      ))}
                    </span>
                    <span className="ee-layout__label">{label(l)}</span>
                  </button>
                );
              })}
            </div>
          </BlockStack>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
