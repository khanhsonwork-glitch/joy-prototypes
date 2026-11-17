// Card artwork of the Membership page, drawn for this prototype (the app's own banners are Shopify CDN images,
// and a prototype loads nothing from outside). Same idea as the app: red, one object per program, white card.
// Colours come from the --ill-* tokens in styles/tokens.css.
import React from 'react';

function Glow({id}) {
  return (
    <defs>
      <radialGradient id={`${id}-glow`} cx="50%" cy="52%" r="50%">
        <stop offset="0%" className="ill-stop-glow" />
        <stop offset="100%" className="ill-stop-clear" />
      </radialGradient>
      <linearGradient id={`${id}-red`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" className="ill-stop-500" />
        <stop offset="100%" className="ill-stop-800" />
      </linearGradient>
      <linearGradient id={`${id}-soft`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" className="ill-stop-200" />
        <stop offset="100%" className="ill-stop-400" />
      </linearGradient>
    </defs>
  );
}

const Crown = ({x, y, s = 1}) => (
  <path
    className="ill-white"
    transform={`translate(${x} ${y}) scale(${s})`}
    d="M0 14 L3 2 L9 8 L13 0 L17 8 L23 2 L26 14 Z M1 16 H25 V19 H1 Z"
  />
);

export function VipTiersArt() {
  return (
    <svg className="mb-art" viewBox="0 0 320 290" role="img" aria-label="Three tier cards rising in height">
      <Glow id="vip" />
      <ellipse cx="160" cy="150" rx="150" ry="125" fill="url(#vip-glow)" />
      <rect x="56" y="122" width="66" height="80" rx="6" fill="url(#vip-soft)" />
      <rect x="128" y="96" width="66" height="106" rx="6" className="ill-500" />
      <rect x="200" y="62" width="66" height="140" rx="6" fill="url(#vip-red)" />
      <Crown x={76} y={134} />
      <Crown x={148} y={108} />
      <Crown x={220} y={74} />
      {[152, 160].map((y) => <rect key={`a${y}`} x="70" y={y + 10} width="38" height="3" rx="1.5" className="ill-white-soft" />)}
      {[128, 138, 148].map((y) => <rect key={`b${y}`} x="142" y={y + 8} width="38" height="3" rx="1.5" className="ill-white-soft" />)}
      {[96, 108, 120, 132].map((y) => <rect key={`c${y}`} x="214" y={y + 8} width="38" height="3" rx="1.5" className="ill-white-soft" />)}
    </svg>
  );
}

export function ExclusiveDealArt() {
  return (
    <svg className="mb-art" viewBox="0 0 320 290" role="img" aria-label="A gift box inside a star">
      <Glow id="deal" />
      <ellipse cx="160" cy="150" rx="150" ry="125" fill="url(#deal-glow)" />
      <path
        className="ill-line"
        d="M160 52 L186 114 L252 118 L201 160 L218 226 L160 190 L102 226 L119 160 L68 118 L134 114 Z"
        fill="none"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="118" y="132" width="84" height="62" rx="4" fill="url(#deal-red)" />
      <rect x="110" y="112" width="100" height="24" rx="4" className="ill-500" />
      <rect x="153" y="112" width="14" height="82" className="ill-300" />
      <path className="ill-500" d="M160 112 C146 92 126 96 132 108 C136 116 150 114 160 112 Z M160 112 C174 92 194 96 188 108 C184 116 170 114 160 112 Z" />
      <path className="ill-500" d="M78 74 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 Z" />
      <path className="ill-500" d="M244 164 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 Z" />
    </svg>
  );
}

export function SubscriptionArt() {
  return (
    <svg className="mb-art" viewBox="0 0 320 290" role="img" aria-label="Two member cards on an orbit">
      <Glow id="sub" />
      <ellipse cx="160" cy="150" rx="150" ry="125" fill="url(#sub-glow)" />
      <g transform="rotate(-14 160 150)">
        <rect x="70" y="118" width="150" height="92" rx="10" fill="url(#sub-red)" />
        <rect x="104" y="84" width="150" height="92" rx="10" className="ill-900" />
        <circle cx="124" cy="104" r="8" className="ill-500" />
        <rect x="140" y="100" width="56" height="4" rx="2" className="ill-white-soft" />
        <rect x="214" y="100" width="24" height="4" rx="2" className="ill-white-soft" />
        <rect x="120" y="138" width="70" height="12" rx="3" className="ill-white" />
        <rect x="196" y="142" width="26" height="6" rx="3" className="ill-white-soft" />
        <rect x="86" y="182" width="56" height="10" rx="3" className="ill-white-soft" />
      </g>
      <ellipse cx="160" cy="150" rx="128" ry="44" transform="rotate(-18 160 150)" className="ill-line" fill="none" strokeWidth="2" />
      <path className="ill-500" d="M262 66 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4 l10 -4 Z" />
      <path className="ill-500" d="M86 214 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 Z" />
    </svg>
  );
}

export function PartnerTierArt() {
  return (
    <svg className="mb-partner-art" viewBox="0 0 156 156" role="img" aria-label="A partner building with a crown">
      <Glow id="partner" />
      <rect width="156" height="156" rx="8" fill="url(#partner-red)" />
      {Array.from({length: 7}, (_, row) =>
        Array.from({length: 7}, (__, col) => (
          <circle key={`${row}-${col}`} cx={10 + col * 9} cy={110 + row * 7} r="1.6" className="ill-dot" />
        ))
      )}
      <rect x="72" y="58" width="44" height="98" className="ill-700" />
      <rect x="84" y="36" width="20" height="22" className="ill-300" />
      {Array.from({length: 11}, (_, i) => (
        <rect key={i} x="76" y={64 + i * 8} width="36" height="3" className="ill-900" />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={36 + i * 7} y="96" width="4" height="60" className="ill-white" />
      ))}
      <Crown x={81} y={14} s={1} />
    </svg>
  );
}
