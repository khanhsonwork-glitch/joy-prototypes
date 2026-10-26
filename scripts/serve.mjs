// Local static server that applies dist/firebase.json (headers, redirects, rewrites, 404.html) in
// Firebase Hosting's order: static file first, then redirects, then rewrites. Usage: node scripts/serve.mjs [hub] [port]
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {DIST, SITES, fail} from './lib.mjs';

const site = process.argv[2] || 'hub';
const port = Number(process.argv[3] || 4173);
if (!SITES.includes(site)) fail(`Không có site "${site}". Chọn một trong: ${SITES.join(', ')}`);
const root = path.join(DIST, site);
if (!fs.existsSync(path.join(root, 'index.html'))) fail(`Chưa build ${site}. Chạy: npm run build`);
const config = JSON.parse(fs.readFileSync(path.join(DIST, 'firebase.json'), 'utf8')).hosting;
const types = {'.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon', '.mp4': 'video/mp4'};

function fileFor(pathname) {
  const file = path.join(root, decodeURIComponent(pathname));
  if (file !== root && !file.startsWith(root + path.sep)) return null;
  if (fs.existsSync(file) && fs.statSync(file).isFile()) return file;
  const index = path.join(file, 'index.html');
  return fs.existsSync(index) ? index : null;
}
// A folder with index.html asked for without its slash: Firebase answers with a 301 to the slash URL.
const needsSlash = pathname => !pathname.endsWith('/') && fs.existsSync(path.join(root, decodeURIComponent(pathname), 'index.html'));

const server = http.createServer((req, res) => {
  const {pathname, search} = new URL(req.url, 'http://local');
  for (const rule of config.headers || []) for (const h of rule.headers) res.setHeader(h.key, h.value);
  if (needsSlash(pathname)) {
    res.writeHead(301, {Location: `${pathname}/${search}`});
    return res.end();
  }
  let file = fileFor(pathname);
  const redirect = !file && (config.redirects || []).find(r => r.source === pathname);
  if (redirect) {
    res.writeHead(redirect.type || 301, {Location: redirect.destination});
    return res.end();
  }
  const rewrite = !file && (config.rewrites || []).find(r => r.source === pathname);
  if (rewrite) file = fileFor(rewrite.destination);
  let status = 200;
  if (!file) {
    status = 404;
    file = fs.existsSync(path.join(root, '404.html')) ? path.join(root, '404.html') : null;
    if (!file) {res.writeHead(404); return res.end('Not found');}
  }
  res.writeHead(status, {'Content-Type': types[path.extname(file)] || 'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
});
server.listen(port, '127.0.0.1', () => console.log(`${site}: http://127.0.0.1:${port}/  (Ctrl+C để dừng)`));
