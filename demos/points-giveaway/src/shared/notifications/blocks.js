// Block registry + immutable tree helpers for the email editor (Joy Email editor V2 replica).
// A document is {subject, preheader, pageBg, style, blocks: Node[]}; a Node is {id, type, props, children?, hidden?}.
// Containment (spec 3.1): root > section > row > column > content. Section-level blocks (Points card, Product) are their
// own band inside a section, like Joy's Product/Coupon/Progress bar.
import {
  ButtonIcon,
  CodeIcon,
  DiscountIcon,
  ImageIcon,
  LayoutColumn1Icon,
  LayoutColumns2Icon,
  LayoutFooterIcon,
  LayoutSectionIcon,
  MinusIcon,
  ProductIcon,
  SelectIcon,
  ShareIcon,
  TextIcon,
} from '@shopify/polaris-icons';

let seq = 0;
export const newId = () => `b${Date.now().toString(36)}${(seq++).toString(36)}${Math.random().toString(36).slice(2, 5)}`;

export const BLOCK_TYPES = {
  section: {name: 'Section', icon: LayoutSectionIcon},
  row: {name: 'Row', icon: LayoutColumns2Icon},
  column: {name: 'Column', icon: LayoutColumn1Icon},
  text: {name: 'Text', icon: TextIcon},
  callout: {name: 'Callout', icon: LayoutColumn1Icon},
  image: {name: 'Image', icon: ImageIcon},
  button: {name: 'Button', icon: ButtonIcon},
  divider: {name: 'Divider', icon: MinusIcon},
  spacer: {name: 'Spacer', icon: SelectIcon},
  social: {name: 'Social', icon: ShareIcon},
  html: {name: 'HTML', icon: CodeIcon},
  card: {name: 'Points card', icon: DiscountIcon},
  product: {name: 'Product', icon: ProductIcon},
  footer: {name: 'Footer', icon: LayoutFooterIcon}, // palette only: inserts a pre-built section
};

export const CONTENT_TYPES = ['text', 'callout', 'image', 'button', 'divider', 'spacer', 'social'];
export const SECTION_LEVEL = ['card', 'product'];
export const CONTAINER_TYPES = ['section', 'row', 'column'];
export const CONTAINS = {
  root: ['section'],
  section: ['row', ...SECTION_LEVEL, 'html'],
  row: ['column'],
  column: [...CONTENT_TYPES, 'html'],
};
export const canContain = (parentType, childType) => (CONTAINS[parentType] || []).includes(childType);
export const isContainer = (type) => CONTAINER_TYPES.includes(type);

export const pad = (t = 0, r = t, b = t, l = r) => ({t, r, b, l});

export const SOCIAL_PLATFORMS = [
  {id: 'instagram', label: 'Instagram', url: 'https://instagram.com/pomelopark'},
  {id: 'facebook', label: 'Facebook', url: 'https://facebook.com/pomelopark'},
  {id: 'tiktok', label: 'TikTok', url: 'https://tiktok.com/@pomelopark'},
  {id: 'youtube', label: 'YouTube', url: 'https://youtube.com/@pomelopark'},
  {id: 'pinterest', label: 'Pinterest', url: 'https://pinterest.com/pomelopark'},
  {id: 'custom', label: 'Custom', url: ''},
];

const DEFAULTS = {
  section: () => ({fullWidth: false, padding: pad(24, 0), minHeight: '', radius: 0, bgColor: '', bgImage: '', bgPosition: 'center', label: ''}),
  row: () => ({layout: [100], gap: 0, padding: pad(0), bgColor: ''}),
  column: () => ({vAlign: 'top', padding: pad(0)}),
  text: () => ({html: '', align: 'left', padding: pad(10, 20), color: '', lineHeight: '', letterSpacing: '', textCase: 'none', bgColor: '', fontSize: 14, fontFamily: '', hideOnMobile: false}),
  callout: () => ({html: '', padding: pad(16, 20), inset: 0, gapTop: 8, gapBottom: 8, radius: 12, borderWidth: 1, borderColor: '#ecdcc7', bgColor: '#fffdf7', color: '', hideOnMobile: false}),
  image: () => ({src: '', alt: '', link: '', width: '', align: 'center', padding: pad(10, 20), radius: 0, bgColor: '', hideOnMobile: false}),
  button: () => ({label: 'Button', link: '', style: 'solid', accent: '#fae13f', bgColor: '', textColor: '#3b1f2b', fontFamily: '', fontSize: 16, fontWeight: '600', width: '', align: 'center', innerPadding: '14px 28px', radius: 999, letterSpacing: '', textCase: 'none', padding: pad(12, 20), hideOnMobile: false}),
  divider: () => ({color: '#ecdcc7', thickness: 1, style: 'solid', width: '100%', align: 'center', spaceAbove: 8, spaceBelow: 8, padding: pad(0, 20), hideOnMobile: false}),
  spacer: () => ({height: 24, hideOnMobile: false}),
  social: () => ({
    links: SOCIAL_PLATFORMS.slice(0, 3).map((p) => ({platform: p.id, name: p.label, url: p.url, show: true})),
    iconStyle: 'filled', direction: 'horizontal', iconSize: 28, spacing: 12, align: 'center', stack: true, color: '#3b1f2b', bgColor: '', padding: pad(10, 20), hideOnMobile: false,
  }),
  html: () => ({code: '<p style="margin:0;text-align:center;font-size:13px">Your HTML here</p>', hideOnMobile: false}),
  card: () => ({bgColor: '#fffdf7', borderColor: '#ecdcc7', borderWidth: 1, radius: 14, padding: pad(16, 18), textColor: '', mutedColor: '', hideOnMobile: false}),
  product: () => ({handles: ['vitamin-c-glow-serum', 'pomelo-cloud-cream'], columns: 2, showPrice: true, ctaLabel: 'Shop now', accent: '#3b1f2b', padding: pad(8, 20), hideOnMobile: false}),
};

export const defaultProps = (type) => (DEFAULTS[type] ? DEFAULTS[type]() : {});

export function makeNode(type, props = {}, children) {
  const node = {id: newId(), type, props: {...defaultProps(type), ...props}};
  if (isContainer(type)) node.children = children || [];
  return node;
}

/** section > row > column (1 column) holding `blocks`. */
export const band = (blocks, sectionProps = {}, rowProps = {}) =>
  makeNode('section', sectionProps, [makeNode('row', {layout: [100], ...rowProps}, [makeNode('column', {}, blocks)])]);

/** A row of N columns with the given width percentages (children arrays optional). */
export const makeRow = (layout, columns = [], rowProps = {}) =>
  makeNode('row', {layout, ...rowProps}, layout.map((_, i) => makeNode('column', {}, columns[i] || [])));

/** The tag tied to a footer line: shop name, address, reason, unsubscribe. Built from four Text blocks. */
export function makeFooter(emailId = 'gift', style = {}) {
  const reason = "You get this email because you're a member of {{shop_name}} Rewards.";
  const p = (html, extra = {}) => makeNode('text', {html, align: 'center', fontSize: 12, color: style.muted || '#6b4a58', padding: pad(2, 20), ...extra});
  return band(
    [p('<b>{{shop_name}}</b>'), p('{{shop_address}}'), p(reason), p('<a href="{{link_unsubscribe}}">Unsubscribe</a>')],
    {padding: pad(18, 0, 22), label: 'Footer', bgColor: style.bg || '', fullWidth: !!style.fullWidth},
  );
}

/** Per-type factory used by the Add block palette. */
export function makeForPalette(type, ctx = {}) {
  switch (type) {
    case 'section': return makeNode('section', {padding: pad(24, 0)});
    case 'row': return makeRow([50, 50]);
    case 'text': return makeNode('text', {html: ''});
    case 'callout': return makeNode('callout', {html: '<p style="margin:0">Your note here</p>'});
    case 'image': return makeNode('image', {src: '', padding: pad(10, 20)});
    case 'button': return makeNode('button', {label: 'Button', link: '{{reward_url}}'});
    case 'divider': return makeNode('divider');
    case 'spacer': return makeNode('spacer');
    case 'social': return makeNode('social');
    case 'html': return makeNode('html');
    case 'card': return makeNode('card');
    case 'product': return makeNode('product');
    case 'footer': return makeFooter(ctx.emailId, ctx.style);
    default: return null;
  }
}

/* ------------------------------------------------------------------ tree helpers (immutable) */

export function find(blocks, id, parent = null) {
  for (let i = 0; i < blocks.length; i += 1) {
    const node = blocks[i];
    if (node.id === id) return {node, parent, index: i, siblings: blocks};
    if (node.children) {
      const hit = find(node.children, id, node);
      if (hit) return hit;
    }
  }
  return null;
}

export const typeOf = (blocks, id) => (id === null ? 'root' : find(blocks, id)?.node.type || null);

export function mapNode(blocks, id, fn) {
  let changed = false;
  const out = blocks.map((node) => {
    if (node.id === id) {
      changed = true;
      return fn(node);
    }
    if (node.children) {
      const kids = mapNode(node.children, id, fn);
      if (kids !== node.children) {
        changed = true;
        return {...node, children: kids};
      }
    }
    return node;
  });
  return changed ? out : blocks;
}

export function removeNode(blocks, id) {
  let changed = false;
  const out = [];
  blocks.forEach((node) => {
    if (node.id === id) {
      changed = true;
      return;
    }
    if (node.children) {
      const kids = removeNode(node.children, id);
      if (kids !== node.children) {
        changed = true;
        out.push({...node, children: kids});
        return;
      }
    }
    out.push(node);
  });
  return changed ? out : blocks;
}

export function insertAt(blocks, parentId, index, node) {
  if (parentId === null) {
    const next = blocks.slice();
    next.splice(index < 0 || index > next.length ? next.length : index, 0, node);
    return next;
  }
  return mapNode(blocks, parentId, (p) => {
    const kids = (p.children || []).slice();
    kids.splice(index < 0 || index > kids.length ? kids.length : index, 0, node);
    return {...p, children: kids};
  });
}

export function cloneNode(node) {
  const copy = {...node, id: newId(), props: JSON.parse(JSON.stringify(node.props))};
  if (node.children) copy.children = node.children.map(cloneNode);
  return copy;
}

export function walk(blocks, cb, parent = null, depth = 0) {
  blocks.forEach((node) => {
    cb(node, parent, depth);
    if (node.children) walk(node.children, cb, node, depth + 1);
  });
}

export const containsId = (node, id) => node.id === id || (node.children || []).some((c) => containsId(c, id));

/** What wrappers a node needs to live under `parentType` (null = it cannot be wrapped there: climb instead). */
function wrapChain(parentType, nodeType) {
  const content = CONTENT_TYPES.includes(nodeType) || nodeType === 'html';
  if (parentType === 'root') {
    if (nodeType === 'section') return [];
    if (nodeType === 'row') return ['section'];
    if (content || SECTION_LEVEL.includes(nodeType)) return nodeType === 'html' || SECTION_LEVEL.includes(nodeType) ? ['section'] : ['section', 'row', 'column'];
  }
  if (parentType === 'section') {
    if (nodeType === 'row' || SECTION_LEVEL.includes(nodeType) || nodeType === 'html') return [];
    if (content) return ['row', 'column'];
  }
  if (parentType === 'row' && content) return ['column'];
  return null;
}

function wrapNode(node, chain, sectionProps = {}) {
  return chain.reduceRight((inner, type) => {
    if (type === 'row') return makeNode('row', {layout: [100]}, [inner]);
    return makeNode(type, type === 'section' ? sectionProps : {}, [inner]);
  }, node);
}

/**
 * Insert `node` at {parentId, index}; when the parent cannot hold it, wrap it (section > row > column) or climb to the
 * nearest parent that can. Returns {blocks, nodeId} or null.
 */
export function insertSmart(blocks, node, target) {
  let parentId = target.parentId;
  let index = target.index;
  for (let guard = 0; guard < 8; guard += 1) {
    const parentType = typeOf(blocks, parentId);
    if (!parentType) return null;
    if (canContain(parentType, node.type)) return {blocks: insertAt(blocks, parentId, index, node), nodeId: node.id};
    // a Row stays a Row of Columns: content goes in a column, never next to them
    const chain = parentType === 'row' ? null : wrapChain(parentType, node.type);
    if (chain && chain.length) {
      const first = chain[0];
      // a new band takes the surface of the band it lands next to, so added blocks sit on the email, not on the page wash
      let sectionProps = {};
      if (parentType === 'root' && first === 'section') {
        const ref = [blocks[index - 1], blocks[index]].find((b) => b && !b.props.bgImage);
        if (ref) sectionProps = {bgColor: ref.props.bgColor, fullWidth: ref.props.fullWidth};
      }
      const wrapped = wrapNode(node, chain, sectionProps);
      if (canContain(parentType, first)) return {blocks: insertAt(blocks, parentId, index, wrapped), nodeId: node.id};
    }
    if (parentId === null) return null;
    const hit = find(blocks, parentId);
    parentId = hit.parent ? hit.parent.id : null;
    index = hit.index + 1;
  }
  return null;
}

/** Move `id` to {parentId, index} (index counted in the target's children BEFORE the move). Wraps/climbs like insertSmart. */
export function moveSmart(blocks, id, target) {
  const hit = find(blocks, id);
  if (!hit) return null;
  if (target.parentId !== null && containsId(hit.node, target.parentId)) return null; // cannot drop inside itself
  let index = target.index;
  if ((hit.parent ? hit.parent.id : null) === target.parentId && hit.index < index) index -= 1;
  const without = removeNode(blocks, id);
  const out = insertSmart(without, hit.node, {parentId: target.parentId, index});
  return out ? out.blocks : null;
}

export function moveSibling(blocks, id, dir) {
  const hit = find(blocks, id);
  if (!hit) return blocks;
  const to = hit.index + dir;
  if (to < 0 || to >= hit.siblings.length) return blocks;
  const without = removeNode(blocks, id);
  return insertAt(without, hit.parent ? hit.parent.id : null, to, hit.node);
}

/** Where a click-add should land (spec 3.1, simplified). `beforeFooter` keeps new bands above the Footer section. */
export function addTargetFor(blocks, selectedId, node) {
  const sel = selectedId ? find(blocks, selectedId) : null;
  if (!sel) {
    let index = blocks.length;
    const last = blocks[blocks.length - 1];
    if (last && last.props.label === 'Footer' && node.type !== 'section') index = blocks.length - 1;
    return {parentId: null, index};
  }
  const selType = sel.node.type;
  if (canContain(selType, node.type)) return {parentId: sel.node.id, index: (sel.node.children || []).length};
  if (selType === 'row' && (CONTENT_TYPES.includes(node.type) || node.type === 'html')) {
    const cols = sel.node.children || [];
    const lastCol = cols[cols.length - 1];
    return {parentId: lastCol.id, index: (lastCol.children || []).length};
  }
  if (selType === 'section') return {parentId: sel.node.id, index: (sel.node.children || []).length};
  return {parentId: sel.parent ? sel.parent.id : null, index: sel.index + 1};
}

/** Re-cut a row into `layout` (percent widths). Fewer columns merge the extra columns' blocks into the last one; nothing is deleted. */
export function setRowLayout(blocks, rowId, layout) {
  return mapNode(blocks, rowId, (row) => {
    const cols = row.children || [];
    let next = cols.slice(0, layout.length);
    if (cols.length > layout.length) {
      const spill = cols.slice(layout.length).flatMap((c) => c.children || []);
      const last = next[next.length - 1];
      next = [...next.slice(0, -1), {...last, children: [...(last.children || []), ...spill]}];
    }
    while (next.length < layout.length) next.push(makeNode('column'));
    return {...row, props: {...row.props, layout}, children: next};
  });
}

export function nodeLabel(node) {
  if (node.type === 'section' && node.props.label) return node.props.label;
  return BLOCK_TYPES[node.type]?.name || node.type;
}

export const plainText = (html) =>
  String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Layers label: "Text · You're in, {{customer…" (first 24 characters of the text). */
export function layerName(node) {
  const base = nodeLabel(node);
  if (node.type === 'text' || node.type === 'callout') {
    const t = plainText(node.props.html);
    if (t) return `${base} · ${t.slice(0, 24)}`;
  }
  if (node.type === 'button' && node.props.label) return `${base} · ${node.props.label.slice(0, 24)}`;
  return base;
}
