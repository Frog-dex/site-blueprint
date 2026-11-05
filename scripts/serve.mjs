// Zero-dependency static server for local preview.
// Usage: node scripts/serve.mjs [port] [dir]   (defaults: 8803, repo root)
import http from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const port = Number(process.argv[2] || process.env.PORT || 8803);
const root = resolve(process.argv[3] || join(fileURLToPath(import.meta.url), '..', '..'));
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.md': 'text/markdown; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.mp4': 'video/mp4',
  '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};

http.createServer((req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (path.endsWith('/')) path += 'index.html';
  const file = normalize(join(root, path));
  if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403).end('forbidden'); return; }
  let st;
  try { st = statSync(file); } catch { res.writeHead(404, { 'content-type': 'text/plain' }).end('not found'); return; }
  if (st.isDirectory()) { res.writeHead(302, { location: path + '/' }).end(); return; }
  res.writeHead(200, { 'content-type': TYPES[extname(file).toLowerCase()] || 'application/octet-stream', 'content-length': st.size, 'cache-control': 'no-store' });
  if (req.method === 'HEAD') { res.end(); return; }
  createReadStream(file).pipe(res);
}).listen(port, () => {
  console.log(`Site Blueprint → http://localhost:${port}/`);
  console.log(`  tool on the demo:  http://localhost:${port}/blueprint.html?site=demo.html`);
  console.log(`  radio layout plan: http://localhost:${port}/radio-plan.html`);
});
