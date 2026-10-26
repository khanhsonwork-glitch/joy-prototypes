import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter, Link, Route, Routes, useLocation, useParams, useSearchParams} from 'react-router-dom';
import registry from '../data/registry.json';
import {normalizeFeature, statuses, bands, kindLabels, canonical, featureProducts, reviewTarget, inProduct, matches} from './registry.mjs';
import './tokens.css';
import './style.css';

const features = registry.features.map(normalizeFeature);
const runtime = __RUNTIME__;
const quarantineMessage = 'Link tạm ẩn: bản dựng cũ còn dữ liệu mẫu cần làm sạch.';
const products = {loyalty: 'Joy Loyalty', wishlist: 'Joy Wishlist'};
const parityLabels = {matched: 'Khớp', missing: 'Còn thiếu', wrong: 'Khác production', stale: 'Cần cập nhật', 'not-measured': 'Chưa đo', deliberate: 'Khác có chủ đích'};
const home = product => product === 'wishlist' ? '/?product=wishlist' : '/';
const date = (value, full = false) => {
  if (!value) return 'Chưa rõ ngày';
  const [year, month, day] = value.slice(0, 10).split('-');
  return `${day}/${month}${full ? `/${year}` : ''}`;
};
const sorted = list => [...list].sort((a, b) => b.updated.localeCompare(a.updated) || (b.stage === 'Ready') - (a.stage === 'Ready') || (b.round ?? -1) - (a.round ?? -1) || a.name.localeCompare(b.name));
function Status({status}) {return <span className={`status ${status}`}><i aria-hidden="true"/>{statuses[status]}</span>;}
function Arrow({diagonal = false}) {return <span aria-hidden="true">{diagonal ? '↗' : '→'}</span>;}
function Search({value, onChange}) {
  return <label className="search"><span>Tìm tính năng</span><svg aria-hidden="true" viewBox="0 0 20 20" fill="none"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4 4"/></svg><input type="search" placeholder="Tìm tính năng" value={value} onChange={event => onChange(event.target.value)}/></label>;
}
function Tabs({product, onChange}) {
  return <div role="tablist" aria-label="Sản phẩm" className="tabs">{Object.entries(products).map(([key, label]) => <button key={key} id={`tab-${key}`} role="tab" aria-selected={product === key} aria-controls="feature-panel" tabIndex={product === key ? 0 : -1} onClick={() => onChange(key)} onKeyDown={event => {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault(); const next = event.key === 'Home' ? 'loyalty' : event.key === 'End' ? 'wishlist' : product === 'loyalty' ? 'wishlist' : 'loyalty';
      onChange(next); document.getElementById(`tab-${next}`).focus();
    }
  }}>{label}<span className="count">{features.filter(f => inProduct(f, key) && f.status !== 'paused').length}</span></button>)}</div>;
}
function Card({feature: f, product, spot = false}) {
  const [shotFailed, setShotFailed] = useState(false);
  const hasShot = f.shot && !shotFailed;
  return <article className={`feature-card${hasShot ? '' : ' text-card'}${spot ? ' is-spot' : ''}`} data-feature={f.slug}>
    <a className="card-main" href={canonical(f, product)} aria-label={`${kindLabels[f.kind]} ${f.name}`}>
      {hasShot && <span className="card-stage"><img className="card-shot" src={f.shot} alt={`Giao diện ${f.name}`} loading="lazy" width="1280" height="720" onError={() => setShotFailed(true)}/></span>}
      <div className="card-content"><h3>{f.name}</h3><p className="card-area">{f.area}</p><p className="card-surfaces">{f.surfaces.join(' · ')}</p>{spot && <span className="spot-cta" aria-hidden="true">Mở bản dựng</span>}</div>
    </a>
    <div className="card-bottom"><div className="card-meta"><span className="card-stamp">{f.round != null && <>Vòng {f.round} · </>}<time dateTime={f.updated}>{date(f.updated)}</time></span>{f.stage && <span className="stage-chip" title={`Trạng thái trên Notion: ${f.stage}`}>Notion · {f.stage}</span>}{f.entryNote && <span className="entry-note">{f.entryNote}</span>}</div><Link className="info-link" to={`${canonical(f, product)}/info`} aria-label={`Chi tiết ${f.name}`}>Chi tiết</Link></div>
  </article>;
}
function Home() {
  const [search, setSearch] = useSearchParams();
  const product = search.get('product') === 'wishlist' ? 'wishlist' : 'loyalty';
  const query = search.get('q') || '';
  const list = features.filter(f => inProduct(f, product));
  const visible = list.filter(f => f.status !== 'paused' && matches(f, query));
  const update = (key, value) => {const next = new URLSearchParams(search); value ? next.set(key, value) : next.delete(key); setSearch(next, {replace: key === 'q'});};
  const groups = bands.map(status => [status, sorted(visible.filter(f => f.status === status))]).filter(([, group]) => group.length);
  return <><header className="hb"><BrandPattern/><div className="hb-in wrap"><h1 className="brand"><img src="/brand/joy-wordmark-white.png" alt="Joy" width="815" height="407"/><span>Prototypes</span></h1><div className="home-controls"><Tabs product={product} onChange={value => update('product', value === 'loyalty' ? '' : value)}/><Search value={query} onChange={value => update('q', value)}/></div></div></header>
    {groups.length > 0 && <nav className="statusbar" aria-label="Nhóm trạng thái"><div className="wrap">{groups.map(([status, group]) => <a key={status} className={`chip ${status}`} href={`#band-${status}`}><i aria-hidden="true"/>{statuses[status]} <b>{group.length}</b></a>)}</div></nav>}
    <div className="wrap home-body"><div id="feature-panel" role="tabpanel" aria-labelledby={`tab-${product}`} className="bands">
      {groups.map(([status, group]) => <section key={status} className={`band band-${status}`} aria-labelledby={`band-${status}`}><h2 id={`band-${status}`} className={`band-heading ${status}`}><i aria-hidden="true"/>{statuses[status]}<span className="section-count">{group.length}</span></h2><div className={`feature-grid${status === 'review' ? ` grid-review${group.length === 1 ? ' solo' : ''}` : ''}`}>{group.map((f, index) => <Card key={`${f.product}/${f.slug}`} feature={f} product={product} spot={status === 'review' && index === 0}/>)}</div></section>)}
      {!visible.length && <p className="empty-state" role="status">{query ? 'Không tìm thấy tính năng phù hợp.' : `Chưa có prototype đang hoạt động cho ${products[product]}.`}</p>}
    </div><footer className="home-footer"><img src="/brand/joyso-logo-red.svg" alt="Joy.so" width="2840" height="820"/><a className="starter-link" href="/starter/">Bộ khung để dựng prototype mới (starter)</a>{runtime && <span>Joy master {runtime.sha.slice(0,7)} · {date(runtime.date, true)}</span>}</footer></div></>;
}
// JOY Drive dots on JOY Red (Brand Guidelines 2.0, p.24 Grid + Radial Circle, p.26 short title on red).
function BrandPattern() {
  const ref = useRef(null);
  const [dots, setDots] = useState([]);
  useLayoutEffect(() => {
    const draw = () => {
      const svg = ref.current; if (!svg) return;
      const {width: W, height: H} = svg.getBoundingClientRect(), mobile = W < 720, next = [];
      if (!mobile) for (let y = 108; y < H * 0.8; y += 26) for (let x = 15; x < W * 0.58; x += 30) {
        const r = 4.6 * (1 - (y - 108) / (H * 0.8 - 108)); if (r > 0.5) next.push([x, y, r]);
      }
      const cx = mobile ? W - 20 : W - 210, cy = mobile ? H + 40 : H + 60, R = mobile ? 120 : 420;
      for (let ring = 30; ring <= R; ring += mobile ? 14 : 18) {
        const count = Math.round(2 * Math.PI * ring / (mobile ? 13 : 17)), dr = (0.8 + 4.2 * ring / R) * (mobile ? 0.7 : 1);
        for (let k = 0; k < count; k++) {
          const a = (k / count) * 2 * Math.PI + ring, x = cx + ring * Math.cos(a), y = cy + ring * Math.sin(a);
          if (y >= -10 && x <= W + 10) next.push([x, y, dr]);
        }
      }
      setDots(next);
    };
    draw(); window.addEventListener('resize', draw);
    return () => window.removeEventListener('resize', draw);
  }, []);
  return <svg ref={ref} className="hb-pattern" aria-hidden="true">{dots.map(([x, y, r], i) => <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={r.toFixed(2)}/>)}</svg>;
}
function DetailShot({feature: f, product}) {
  const [failed, setFailed] = useState(false);
  return f.shot && !failed && !f.quarantined ? <a href={canonical(f, product)} className="detail-shot-link" aria-label={`${kindLabels[f.kind]} ${f.name}`}><img className="detail-shot" src={f.shot} alt={`Giao diện ${f.name}`} width="1280" height="720" onError={() => setFailed(true)}/></a> : null;
}
function Versions({title, links}) {
  return links.length ? <section><h2>{title}</h2><ul className="legacy-list">{links.map((link, index) => <li key={`${link.url}-${index}`}><a href={link.url}>{link.label}<Arrow diagonal/></a><time dateTime={link.updated}>{date(link.updated, true)}</time></li>)}</ul></section> : null;
}
function Info() {
  const {product, slug} = useParams(); const [search] = useSearchParams();
  const f = features.find(f => inProduct(f, product) && f.slug === slug);
  if (!f) return <NotFound/>;
  const returnProduct = search.get('product') === 'wishlist' && inProduct(f, 'wishlist') ? 'wishlist' : product;
  const current = f.legacy.filter(link => link.current).map(link => ({...link, url: reviewTarget(f, product)}));
  const previous = f.legacy.filter(link => !link.current);
  return <div className="detail"><Link className="back-link" to={home(returnProduct)}>← {products[returnProduct]}</Link><header className="detail-header"><div><div className="title-row"><h1>{f.name}</h1><Status status={f.status}/>{f.stage && <span className="stage-chip">Notion: {f.stage}</span>}</div><p className="detail-area">{f.area}</p><p className="detail-surfaces">{f.surfaces.join(' · ')}</p><p className="detail-meta" title="Ngày deploy hoặc ngày sửa file gần nhất, có thể lệch ±1 ngày">Bản dựng gần nhất khoảng <time dateTime={f.updated}>{date(f.updated, true)}</time>{f.round != null && <> · Vòng {f.round}</>}</p></div>{f.quarantined ? <p className="quarantine-note muted">{quarantineMessage}</p> : <div className="detail-actions"><div className="actions"><div className="primary-action"><a className="button primary" href={canonical(f, product)}>{kindLabels[f.kind]} <Arrow diagonal/></a>{f.entryNote && <p className="entry-note">{f.entryNote}</p>}</div>{f.notion && <a className="button" href={f.notion}>Task Notion <Arrow diagonal/></a>}{f.prd && <a className="button" href={f.prd}>PRD <Arrow diagonal/></a>}</div></div>}</header>
      {f.slug === 'custom-plan' && runtime && <div className="pairing-row"><a href="/app/#/customize_plan">Màn này hôm nay (code thật) <Arrow/></a></div>}
      <DetailShot key={f.shot} feature={f} product={product}/>
      <div className="detail-sections">{!f.quarantined && <><Versions title="Bản hiện tại" links={current.length ? current : [{url: reviewTarget(f, product), label: kindLabels[f.kind], updated: f.updated}]}/><Versions title="Các bản trước" links={previous}/></>}
        {f.slug !== 'custom-plan' && f.parity?.length > 0 && <section className="parity-section"><h2>So với production</h2><table className="parity-table"><thead><tr><th>Màn hình</th><th>Đánh giá</th><th>Nguồn</th></tr></thead><tbody>{f.parity.map((p, index) => <tr key={index}><th scope="row">{p.screen}</th><td><span className={`parity-state ${p.state === 'matched' ? 'live' : 'review'}`}>{parityLabels[p.state]}</span><p>{p.note}</p></td><td>{p.sourceCommit && <code>{p.sourceCommit.slice(0,7)}</code>}<time dateTime={p.checkedAt}>{date(p.checkedAt, true)}</time></td></tr>)}</tbody></table></section>}
      </div>
    </div>;
}
function Archive() {
  const [search, setSearch] = useSearchParams();
  const product = search.get('product') || 'all'; const requestedStatus = search.get('status') || 'all';
  // Alex 21/10: "Mấy cái tạm dừng bỏ đi" — paused builds are hidden from hub lists; their info pages and links stay.
  const status = ['archived', 'paused'].includes(requestedStatus) ? 'all' : requestedStatus === 'approved' ? 'todo' : requestedStatus;
  const query = search.get('q') || '';
  const update = (key, value) => {const next = new URLSearchParams(search); value && value !== 'all' ? next.set(key, value) : next.delete(key); setSearch(next, {replace: true});};
  const rows = sorted(features.filter(f => f.status !== 'paused' && (product === 'all' || inProduct(f, product)) && (status === 'all' || f.status === status) && matches(f, query)));
  return <><Link className="back-link" to={home(product)}>← Joy Prototypes</Link><header className="archive-header"><h1>Tất cả bản dựng</h1><Search value={query} onChange={value => update('q', value)}/></header><div className="filters"><div role="group" aria-label="Lọc sản phẩm">{Object.entries({all: 'Tất cả sản phẩm', ...products}).map(([key,label]) => <button key={key} aria-pressed={product === key} onClick={() => update('product',key)}>{label}</button>)}</div><div role="group" aria-label="Lọc trạng thái">{Object.entries({all: 'Tất cả trạng thái', ...statuses}).filter(([key]) => key !== 'paused').map(([key,label]) => <button key={key} aria-pressed={status === key} onClick={() => update('status',key)}>{label}</button>)}</div></div>
      <div className="archive-table" role="table" aria-label="Tất cả bản dựng"><div className="archive-row table-head" role="row">{['Tính năng','Sản phẩm','Trạng thái','Bản dựng gần nhất','Các bản dựng'].map(x => <span role="columnheader" key={x}>{x}</span>)}</div>{rows.map(f => <div className="archive-row" role="row" data-archive-feature={f.slug} key={`${f.product}/${f.slug}`}><div role="cell"><Link className="feature-name" to={`${canonical(f, product === 'all' ? f.product : product)}/info`}>{f.name}</Link><span className="row-area">{f.area}</span></div><div role="cell" className="row-product">{[...new Set([f.product, ...f.alsoIn])].map(p => products[p]).join(' · ')}</div><div role="cell"><Status status={f.status}/></div><time role="cell" dateTime={f.updated}>{date(f.updated,true)}</time><div role="cell" className="archive-links">{f.quarantined ? <span className="muted">{quarantineMessage}</span> : <><a href={canonical(f, product === 'all' ? f.product : product)}>{kindLabels[f.kind]}<Arrow diagonal/></a><Link to={`${canonical(f, product === 'all' ? f.product : product)}/info`}>Lịch sử bản dựng <Arrow/></Link></>}</div></div>)}</div>{!rows.length && <p className="empty-state" role="status">Không tìm thấy tính năng phù hợp.</p>}</>;
}
function NotFound() {return <><h1>Không tìm thấy trang</h1><Link className="back-link" to="/">← Joy Prototypes</Link></>;}
function App() {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0,0);
    const feature = features.find(f => featureProducts(f).some(product => location.pathname.replace(/\/$/, '') === `${canonical(f, product)}/info`));
    document.title = feature ? `${feature.name} · Joy Prototypes` : location.pathname.replace(/\/$/, '') === '/archive' ? 'Tất cả bản dựng · Joy Prototypes' : 'Joy Prototypes';
  }, [location.pathname]);
  return <><a className="skip-link" href="#main">Đến nội dung</a><main id="main" tabIndex={-1}><Routes><Route path="/" element={<Home/>}/><Route path="/:product/:slug/info" element={<div className="container"><Info/></div>}/><Route path="/archive" element={<div className="container"><Archive/></div>}/><Route path="*" element={<div className="container"><NotFound/></div>}/></Routes></main></>;
}
createRoot(document.getElementById('root')).render(<BrowserRouter><App/></BrowserRouter>);
