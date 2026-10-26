// Renders an email document. One renderer for everything: the canvas (with editor chrome through ctx.Shell), the gallery
// thumbnails, the Preview & test modal and the HTML modal (renderToStaticMarkup). The email itself is NOT Polaris: it is the
// merchant's own store look, so everything is inline styles + one scoped <style>.
import {conditionMatches} from './conditions.js';
import React, {Fragment} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {PRODUCTS, money, productByHandle} from '../../data/index.js';

export const px = (n) => (n === '' || n === undefined || n === null ? undefined : typeof n === 'number' ? `${n}px` : n);
export const padCss = (p) => (p ? `${p.t || 0}px ${p.r || 0}px ${p.b || 0}px ${p.l || 0}px` : undefined);
const num = (v, fallback) => (v === '' || v === undefined || v === null || Number.isNaN(Number(v)) ? fallback : Number(v));

export const sanitizeHtml = (html) =>
  String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, '')
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');

const hash = (s) => {
  let h = 5381;
  for (let i = 0; i < s.length; i += 1) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
};

/** The doc-level look the template ships (fonts, heading sizes, colours), scoped to one class so two emails can sit side by side. */
export function emailCss(style = {}, custom = '', scope = 'em-r') {
  const s = style || {};
  const heading = (key, tag) => {
    const h = s[key] || {};
    return `.${scope} ${tag}{margin:0;font-family:${s.headFont};font-size:${h.size || 22}px;font-weight:${h.weight || 600};line-height:${h.lh || 1.2};letter-spacing:${h.spacing || 0};text-transform:${h.case || 'none'};color:${s.head}}`;
  };
  return [
    `.${scope}{font-family:${s.bodyFont};color:${s.text};line-height:1.55}`,
    `.${scope} *{box-sizing:border-box}`,
    `.${scope} p{margin:0}.${scope} p+p{margin-top:8px}`,
    `.${scope} a{color:${s.link};text-decoration:underline;text-underline-offset:2px}`,
    `.${scope} ul,.${scope} ol{margin:0;padding-left:22px}`,
    `.${scope} blockquote{margin:0;padding-left:12px;border-left:3px solid currentColor;opacity:.85}`,
    heading('h1', 'h1'),
    heading('h2', 'h2'),
    heading('h3', 'h3'),
    custom ? `.${scope}{${custom}}` : '',
  ].join('');
}

const StaticShell = ({style, children}) => <div style={style}>{children}</div>;

export const columnWidth = (device) => (device === 'mobile' ? 375 : 600);

/* ------------------------------------------------------------------ small pieces */

const SOCIAL_GLYPHS = {
  instagram: (
    <g fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="4" width="16" height="16" rx="5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="16.8" cy="7.2" r=".6" fill="currentColor" />
    </g>
  ),
  facebook: <path fill="currentColor" d="M13.5 20v-7h2.4l.4-2.8h-2.8V8.5c0-.8.3-1.4 1.5-1.4h1.4V4.6c-.3 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.600v2.100H8.400V13h2.400v7z" />,
  tiktok: <path fill="currentColor" d="M14.200 4h-2.600v10.500a2.200 2.200 0 1 1-2.200-2.200c.2 0 .4 0 .6.100V9.700a4.800 4.800 0 1 0 4.200 4.800V9.600c.9.700 2 1 3.100 1V8c-1.700 0-3.100-1.600-3.100-4z" />,
  youtube: <path fill="currentColor" d="M20.300 8.200a2.300 2.300 0 0 0-1.600-1.600C17.300 6.200 12 6.200 12 6.200s-5.300 0-6.700.4A2.300 2.300 0 0 0 3.700 8.200C3.300 9.600 3.300 12 3.300 12s0 2.400.4 3.800a2.300 2.300 0 0 0 1.600 1.600c1.400.4 6.700.4 6.700.4s5.300 0 6.700-.4a2.300 2.300 0 0 0 1.600-1.600c.4-1.400.4-3.800.4-3.800s0-2.400-.4-3.800zM10.200 14.600V9.400l4.500 2.600z" />,
  pinterest: <path fill="currentColor" d="M12 4a8 8 0 0 0-2.900 15.400c-.1-.6-.1-1.600 0-2.200l.9-3.800s-.2-.5-.2-1.200c0-1.100.7-2 1.500-2 .7 0 1 .5 1 1.100 0 .7-.4 1.800-.7 2.800-.2.800.4 1.500 1.200 1.500 1.500 0 2.600-1.600 2.600-3.800 0-2-1.400-3.300-3.500-3.300-2.400 0-3.800 1.800-3.800 3.600 0 .7.3 1.500.6 1.900.1.100.1.200.1.300l-.2.900c0 .1-.1.200-.3.100-1-.5-1.700-1.900-1.700-3.100 0-2.500 1.800-4.800 5.300-4.800 2.800 0 4.900 2 4.900 4.600 0 2.800-1.700 5-4.200 5-.8 0-1.600-.4-1.800-.9l-.5 1.900c-.2.700-.7 1.600-1 2.100A8 8 0 1 0 12 4z" />,
  custom: <path fill="currentColor" d="M12 4l2.400 5 5.600.7-4.100 3.800 1.100 5.500L12 16.200 7 19l1.100-5.500L4 9.700 9.600 9z" />,
};

export function SocialIcon({platform, size = 28, color = '#3b1f2b', outline = false, bg = ''}) {
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, borderRadius: '50%',
        background: outline ? 'transparent' : color, color: outline ? color : bg || '#ffffff', border: outline ? `1.5px solid ${color}` : 'none',
      }}
    >
      <svg width={Math.round(size * 0.62)} height={Math.round(size * 0.62)} viewBox="0 0 24 24" aria-hidden="true">
        {SOCIAL_GLYPHS[platform] || SOCIAL_GLYPHS.custom}
      </svg>
    </span>
  );
}

const sizeHint = (ctx) => (ctx.canvas ? ctx.hint : null);

/* ------------------------------------------------------------------ node renderers */

function RichBody({node, ctx, className = 'em-rich'}) {
  if (ctx.richText) {
    const custom = ctx.richText(node);
    if (custom) return custom;
  }
  const html = ctx.resolve(node.props.html);
  if (!html && ctx.canvas) return <div className={`${className} em-ghost`}>Your text here</div>;
  if (!html) return null;
  return <div className={className} dangerouslySetInnerHTML={{__html: sanitizeHtml(html)}} />;
}

function TextNode({node, ctx}) {
  const Shell = ctx.Shell || StaticShell;
  const p = node.props;
  const style = {
    padding: padCss(p.padding),
    background: p.bgColor || undefined,
    textAlign: p.align,
    color: p.color || undefined,
    fontSize: px(num(p.fontSize, 14)),
    lineHeight: p.lineHeight || undefined,
    letterSpacing: p.letterSpacing !== '' && p.letterSpacing !== undefined ? `${p.letterSpacing}px` : undefined,
    textTransform: p.textCase && p.textCase !== 'none' ? p.textCase : undefined,
    fontFamily: p.fontFamily || undefined,
  };
  return (
    <Shell node={node} style={style}>
      <RichBody node={node} ctx={ctx} />
    </Shell>
  );
}

function CalloutNode({node, ctx}) {
  const Shell = ctx.Shell || StaticShell;
  const p = node.props;
  const style = {
    margin: `${num(p.gapTop, 8)}px ${num(p.inset, 0)}px ${num(p.gapBottom, 8)}px`,
    padding: padCss(p.padding),
    borderRadius: px(num(p.radius, 0)),
    border: num(p.borderWidth, 0) ? `${p.borderWidth}px solid ${p.borderColor || '#ecdcc7'}` : undefined,
    background: p.bgColor || undefined,
    color: p.color || undefined,
    fontSize: 15,
  };
  return (
    <Shell node={node} style={style}>
      <RichBody node={node} ctx={ctx} />
    </Shell>
  );
}

export function imageBorder(p) {
  const edges = p.borderEdges || ['top', 'right', 'bottom', 'left'];
  return Object.fromEntries(['top', 'right', 'bottom', 'left'].map(edge => [`border${edge[0].toUpperCase() + edge.slice(1)}`, edges.includes(edge) ? `${num(p.borderWidth, 0)}px ${p.borderStyle || 'solid'} ${p.borderColor || '#e5e7eb'}` : '0']));
}
function ImageNode({node, ctx}) {
  const Shell = ctx.Shell || StaticShell;
  const p = node.props;
  const src = ctx.resolve(p.src);
  const margin = p.align === 'center' ? '0 auto' : p.align === 'right' ? '0 0 0 auto' : '0';
  const img = src ? (
    <img src={src} alt={ctx.resolve(p.alt)} style={{display: 'block', width: p.width || '100%', maxWidth: '100%', height: 'auto', margin, borderRadius: px(num(p.radius, 0)), ...imageBorder(p)}} />
  ) : ctx.canvas ? (
    <div className="ee-placeholder">Add image</div>
  ) : null;
  const linked = p.link && img && !ctx.canvas ? <a href={ctx.resolve(p.link)}>{img}</a> : img;
  return (
    <Shell node={node} style={{padding: padCss(p.padding), background: p.bgColor || undefined}}>
      {linked}
    </Shell>
  );
}

function ButtonNode({node, ctx}) {
  const Shell = ctx.Shell || StaticShell;
  const p = node.props;
  const solid = p.style !== 'outline';
  const style = {
    display: 'inline-block',
    width: p.width || undefined,
    maxWidth: '100%',
    padding: p.innerPadding || '14px 28px',
    borderRadius: px(num(p.radius, 0)),
    background: solid ? p.bgColor || p.accent : 'transparent',
    border: solid ? 'none' : `2px solid ${p.accent}`,
    color: solid ? p.textColor : p.accent,
    fontFamily: p.fontFamily || undefined,
    fontSize: px(num(p.fontSize, 16)),
    fontWeight: p.fontWeight,
    letterSpacing: p.letterSpacing !== '' && p.letterSpacing !== undefined ? `${p.letterSpacing}px` : undefined,
    textTransform: p.textCase && p.textCase !== 'none' ? p.textCase : undefined,
    textDecoration: 'none',
    textAlign: 'center',
    lineHeight: 1.2,
  };
  return (
    <Shell node={node} style={{padding: padCss(p.padding), textAlign: p.align}}>
      <a href={ctx.canvas ? undefined : ctx.resolve(p.link) || undefined} style={style} onClick={ctx.canvas ? (e) => e.preventDefault() : undefined}>
        {ctx.resolve(p.label) || 'Button'}
      </a>
    </Shell>
  );
}

function DividerNode({node, ctx}) {
  const Shell = ctx.Shell || StaticShell;
  const p = node.props;
  const margin = p.align === 'center' ? '0 auto' : p.align === 'right' ? '0 0 0 auto' : '0';
  const pd = p.padding || {};
  return (
    <Shell node={node} style={{padding: `${num(p.spaceAbove, 8)}px ${pd.r || 0}px ${num(p.spaceBelow, 8)}px ${pd.l || 0}px`}}>
      <div style={{borderTop: `${num(p.thickness, 1)}px ${p.style || 'solid'} ${p.color}`, width: p.width || '100%', margin}} />
    </Shell>
  );
}

function SpacerNode({node, ctx}) {
  const Shell = ctx.Shell || StaticShell;
  return <Shell node={node} style={{height: num(node.props.height, 24)}} />;
}

function SocialNode({node, ctx}) {
  const Shell = ctx.Shell || StaticShell;
  const p = node.props;
  const links = (p.links || []).filter((l) => l.show !== false);
  const vertical = p.direction === 'vertical' || (ctx.device === 'mobile' && p.stack && false);
  return (
    <Shell node={node} style={{padding: padCss(p.padding), background: p.bgColor || undefined, textAlign: p.align}}>
      <div style={{display: 'inline-flex', flexDirection: vertical ? 'column' : 'row', gap: num(p.spacing, 12)}}>
        {links.length === 0 && ctx.canvas ? <span className="ee-ghost">No links yet</span> : null}
        {links.map((l, i) => (
          <a key={`${l.platform}-${i}`} href={ctx.canvas ? undefined : ctx.resolve(l.url) || undefined} style={{textDecoration: 'none'}} aria-label={l.name || l.platform} onClick={ctx.canvas ? (e) => e.preventDefault() : undefined}>
            <SocialIcon platform={l.platform} size={num(p.iconSize, 28)} color={p.color || '#3b1f2b'} outline={p.iconStyle === 'outline'} />
          </a>
        ))}
      </div>
    </Shell>
  );
}

function HtmlNode({node, ctx}) {
  const Shell = ctx.Shell || StaticShell;
  return (
    <Shell node={node} style={{}}>
      <div dangerouslySetInnerHTML={{__html: sanitizeHtml(ctx.resolve(node.props.code))}} />
    </Shell>
  );
}

/** Points card (Dynamic, Joy): the points this email is about, the balance and the use-by date, from the email's variables. */
function CardNode({node, ctx}) {
  const Shell = ctx.Shell || StaticShell;
  const p = node.props;
  const v = ctx.values;
  const reminder = ctx.emailId === 'reminder';
  const muted = p.mutedColor || undefined;
  const label = {fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase', opacity: muted ? 1 : 0.7, color: muted};
  const value = {fontSize: 15, fontWeight: 600};
  const style = {
    background: p.bgColor || undefined,
    border: num(p.borderWidth, 0) ? `${p.borderWidth}px solid ${p.borderColor}` : undefined,
    borderRadius: px(num(p.radius, 0)),
    padding: padCss(p.padding),
    color: p.textColor || undefined,
  };
  const facts = [
    ['Your balance', `${v.points_balance} points`],
    ['Use by', v.point_expired_at],
  ].filter(([, val]) => val);
  return (
    <Shell node={node} style={style}>
      <div style={label}>{reminder ? 'Points expiring' : 'Points added'}</div>
      <h2 style={{margin: '4px 0 2px', color: p.textColor || undefined}}>{reminder ? v.earning_points : `+${v.earning_points}`}</h2>
      <div style={{fontSize: 13, color: muted, opacity: muted ? 1 : 0.8}}>{v.earning_program}</div>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px 32px', marginTop: 12}}>
        {facts.map(([k, val]) => (
          <div key={k}>
            <div style={label}>{k}</div>
            <div style={value}>{val}</div>
          </div>
        ))}
      </div>
    </Shell>
  );
}

function ProductNode({node, ctx}) {
  const Shell = ctx.Shell || StaticShell;
  const p = node.props;
  const items = (p.handles || []).map(productByHandle).filter(Boolean).slice(0, 6);
  const cols = ctx.device === 'mobile' ? 1 : Math.min(3, Math.max(1, num(p.columns, 2)));
  return (
    <Shell node={node} style={{padding: padCss(p.padding)}}>
      {items.length === 0 && ctx.canvas ? <div className="ee-placeholder">Pick products in Properties</div> : null}
      <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: 12}}>
        {items.map((item) => (
          <div key={item.handle} style={{textAlign: 'center'}}>
            <img src={item.image} alt={item.title} style={{display: 'block', width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', borderRadius: 10}} />
            <div style={{fontSize: 14, fontWeight: 600, margin: '8px 0 2px'}}>{item.title}</div>
            {p.showPrice ? <div style={{fontSize: 13, opacity: 0.8}}>{money(item.price)}</div> : null}
            <div style={{display: 'inline-block', marginTop: 8, padding: '8px 16px', borderRadius: 999, background: p.accent, color: '#ffffff', fontSize: 13, fontWeight: 600}}>{p.ctaLabel || 'Shop now'}</div>
          </div>
        ))}
      </div>
    </Shell>
  );
}

function ColumnNode({node, ctx, pct}) {
  const Shell = ctx.Shell || StaticShell;
  const p = node.props;
  const mobile = ctx.device === 'mobile';
  const style = {
    flex: mobile ? '0 0 auto' : `${pct} 1 0%`,
    minWidth: 0,
    padding: padCss(p.padding),
    alignSelf: p.vAlign === 'middle' ? 'center' : p.vAlign === 'bottom' ? 'flex-end' : 'flex-start',
  };
  return (
    <Shell node={node} style={style}>
      {renderChildren(node.children, ctx)}
      {sizeHint(ctx) && node.children.length === 0 ? <div className="ee-dropbox">Drop a block here</div> : null}
    </Shell>
  );
}

function RowNode({node, ctx}) {
  const Shell = ctx.Shell || StaticShell;
  const p = node.props;
  const mobile = ctx.device === 'mobile';
  const style = {
    display: 'flex',
    flexDirection: mobile ? 'column' : 'row',
    gap: px(num(p.gap, 0)),
    padding: padCss(p.padding),
    background: p.bgColor || undefined,
  };
  const layout = p.layout && p.layout.length ? p.layout : node.children.map(() => 100 / node.children.length);
  return (
    <Shell node={node} style={style}>
      {node.children.map((col, i) => (
        <Fragment key={col.id}>{renderNode(col, ctx, {pct: layout[i] ?? 100 / node.children.length})}</Fragment>
      ))}
    </Shell>
  );
}

function SectionNode({node, ctx}) {
  const Shell = ctx.Shell || StaticShell;
  const p = node.props;
  const w = columnWidth(ctx.device);
  const bg = {
    backgroundColor: p.bgColor || undefined,
    backgroundImage: p.bgImage ? `url(${ctx.resolve(p.bgImage)})` : undefined,
    backgroundSize: p.bgImage ? 'cover' : undefined,
    backgroundPosition: p.bgImage ? p.bgPosition || 'center' : undefined,
  };
  const inner = {
    maxWidth: w,
    margin: '0 auto',
    padding: padCss(p.padding),
    minHeight: px(num(p.minHeight, 0) || undefined),
    borderRadius: px(num(p.radius, 0)),
    ...(p.fullWidth ? {} : bg),
  };
  const empty = node.children.length === 0 && !p.bgImage;
  const body = (
    <Shell node={node} style={inner}>
      {renderChildren(node.children, ctx)}
      {sizeHint(ctx) && empty ? <div className="ee-dropbox">Drop a block here</div> : null}
    </Shell>
  );
  if (p.fullWidth) return <div style={{...bg, minHeight: px(num(p.minHeight, 0) || undefined)}}>{body}</div>;
  return <div style={{maxWidth: w, margin: '0 auto'}}>{body}</div>;
}

const RENDERERS = {
  section: SectionNode,
  row: RowNode,
  column: ColumnNode,
  text: TextNode,
  callout: CalloutNode,
  image: ImageNode,
  button: ButtonNode,
  divider: DividerNode,
  spacer: SpacerNode,
  social: SocialNode,
  html: HtmlNode,
  card: CardNode,
  product: ProductNode,
};

export function renderNode(node, ctx, extra = {}) {
  if (!ctx.canvas) {
    if (node.hidden || !conditionMatches(node.props.condition, ctx.values)) return null;
    if (node.props.hideOnMobile && ctx.device === 'mobile') return null;
  }
  const Comp = RENDERERS[node.type];
  return Comp ? <Comp node={node} ctx={ctx} {...extra} /> : null;
}

export function renderChildren(children, ctx) {
  return (children || []).map((child) => <Fragment key={child.id}>{renderNode(child, ctx)}</Fragment>);
}

/**
 * <EmailDocument doc ctx/>: the whole email on its page background.
 * ctx = {values, resolve, emailId, device, canvas?, Shell?, richText?, customCss?}
 */
export function EmailDocument({doc, ctx, bare = false}) {
  const css = emailCss(doc.style, ctx.customCss || '', 'em-r');
  const scope = `em-${hash(css)}`;
  const scoped = emailCss(doc.style, ctx.customCss || '', scope);
  return (
    <div className={`em-r ${scope}`} style={bare ? undefined : {background: doc.pageBg || undefined}} data-device={ctx.device}>
      <style dangerouslySetInnerHTML={{__html: scoped}} />
      {renderChildren(doc.blocks, ctx)}
    </div>
  );
}

/** Build a render context from the pieces the editor knows. */
export function makeCtx({values, resolve, emailId, device = 'desktop', customCss = ''}) {
  return {values, resolve, emailId, device, customCss, canvas: false};
}

/** Pretty-printed static HTML for the HTML modal. */
export function docToHtml(doc, ctx) {
  const raw = renderToStaticMarkup(<EmailDocument doc={doc} ctx={{...ctx, canvas: false, Shell: undefined, richText: undefined}} bare />);
  let depth = 0;
  const out = [];
  raw
    .replace(/></g, '>\n<')
    .split('\n')
    .forEach((line) => {
      const t = line.trim();
      if (!t) return;
      if (/^<\//.test(t)) depth = Math.max(0, depth - 1);
      out.push(`${'  '.repeat(depth)}${t}`);
      if (/^<[a-zA-Z][^>]*[^/]>$/.test(t) && !/^<(img|br|hr|input|meta|link)\b/.test(t) && !/<\/[a-z0-9]+>$/.test(t)) depth += 1;
    });
  return out.join('\n');
}

export const docSizeBytes = (doc, ctx) => new Blob([renderToStaticMarkup(<EmailDocument doc={doc} ctx={{...ctx, canvas: false}} bare />)]).size;

export const PRODUCT_OPTIONS = PRODUCTS.map((p) => ({value: p.handle, label: `${p.title} · ${money(p.price)}`}));
