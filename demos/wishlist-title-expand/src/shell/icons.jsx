import React from 'react';

/** Red rounded square with the Joy mark. size in px. */
export function JoyIcon({size = 20, tone = 'red'}) {
  const fill = tone === 'grey' ? 'var(--chrome-nav-icon)' : 'var(--chrome-joy-red)';
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" aria-hidden="true" focusable="false" style={{display: 'block', flex: 'none'}}>
      <rect width="20" height="20" rx="5" fill={fill} />
      <text
        x="10"
        y="13.4"
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="8.6"
        fontWeight="700"
        fontStyle="italic"
        letterSpacing="-0.3"
        fill="var(--p-color-text-inverse)"
      >
        Joy
      </text>
    </svg>
  );
}

/** Wordmark for the admin top bar: a bag mark plus "shopify" set in bold italic. */
export function ShopifyWordmark() {
  return (
    <span className="adm-wordmark" aria-label="Shopify">
      <svg width="24" height="26" viewBox="0 0 24 26" aria-hidden="true" focusable="false">
        <path
          d="M4.1 6.4c.1-.4.5-.7.9-.7l1 0 .3-.7C6.9 3.1 8.2 1.5 10 1.5c1.2 0 2 .7 2.5 1.7.3-.1.7-.1 1-.1 1.4 0 2.3.9 2.6 2.2l1.3.1c.4 0 .8.3.8.8l1.3 14.5c0 .4-.2.8-.6.9l-8.4 3c-.3.1-.7.1-1-.1L2.3 21.7c-.3-.2-.5-.5-.5-.9L3.4 8.5z"
          fill="currentColor"
        />
        <path
          d="M12.2 7.6c-.3-.1-.9-.3-1.7-.3-1.6 0-2.3.9-2.3 1.8 0 1.2 1 1.6 1.9 2 .7.3 1.2.5 1.2 1 0 .5-.4.8-1.1.8-.9 0-1.8-.4-2.2-.7l-.4 1.5c.5.3 1.4.6 2.5.6 1.8 0 2.8-.9 2.8-2.1 0-1.1-.9-1.6-1.8-2-.7-.3-1.2-.5-1.2-1 0-.4.4-.7.9-.7.7 0 1.2.2 1.6.4z"
          fill="var(--chrome-topbar)"
        />
      </svg>
      <span className="adm-wordmark__text">shopify</span>
    </span>
  );
}

/** The green Shopify bag that opens the new admin sidebar. */
export function ShopifyBag() {
  return (
    <svg width="22" height="25" viewBox="0 0 24 26" aria-label="Shopify" role="img" focusable="false" style={{display: 'block'}}>
      <path
        d="M4.1 6.4c.1-.4.5-.7.9-.7l1 0 .3-.7C6.9 3.1 8.2 1.5 10 1.5c1.2 0 2 .7 2.5 1.7.3-.1.7-.1 1-.1 1.4 0 2.3.9 2.6 2.2l1.3.1c.4 0 .8.3.8.8l1.3 14.5c0 .4-.2.8-.6.9l-8.4 3c-.3.1-.7.1-1-.1L2.3 21.7c-.3-.2-.5-.5-.5-.9L3.4 8.5z"
        fill="var(--adm2-shopify-green)"
      />
      <path
        d="M12.2 7.6c-.3-.1-.9-.3-1.7-.3-1.6 0-2.3.9-2.3 1.8 0 1.2 1 1.6 1.9 2 .7.3 1.2.5 1.2 1 0 .5-.4.8-1.1.8-.9 0-1.8-.4-2.2-.7l-.4 1.5c.5.3 1.4.6 2.5.6 1.8 0 2.8-.9 2.8-2.1 0-1.1-.9-1.6-1.8-2-.7-.3-1.2-.5-1.2-1 0-.4.4-.7.9-.7.7 0 1.2.2 1.6.4z"
        fill="var(--p-color-text-inverse)"
      />
    </svg>
  );
}
