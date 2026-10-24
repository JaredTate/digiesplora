// Small stand-in for the production nginx site (digiexplorer.info):
//   /api/*  -> the Esplora/electrs REST API (API_UPSTREAM)
//   /*      -> the frontend: a running dev-server (FRONTEND_URL) or a static build dir (STATIC_DIR)
// Used by test/smoke.js and for local QA against the live API:
//   API_UPSTREAM=https://digiexplorer.info/api FRONTEND_URL=http://localhost:5010 PORT=8080 node test/local-proxy.js
//   API_UPSTREAM=https://digiexplorer.info/api STATIC_DIR=dist PORT=8080 node test/local-proxy.js
const http = require('http')
const fs = require('fs')
const path = require('path')

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.css': 'text/css',
  '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.ttf': 'font/ttf', '.woff': 'font/woff',
  '.woff2': 'font/woff2', '.txt': 'text/plain', '.xml': 'application/xml', '.json': 'application/json' }

async function forward(req, res, target) {
  try {
    const up = await fetch(target, { method: req.method, redirect: 'manual',
      headers: { accept: req.headers.accept || '*/*' } })
    const headers = {}
    for (const h of ['content-type', 'cache-control', 'location']) if (up.headers.get(h)) headers[h] = up.headers.get(h)
    res.writeHead(up.status, headers)
    res.end(Buffer.from(await up.arrayBuffer()))
  } catch (err) {
    res.writeHead(502, { 'content-type': 'text/plain' })
    res.end(`proxy error: ${err.message}`)
  }
}

function serveStatic(req, res, dir) {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  let file = path.join(dir, path.normalize(urlPath).replace(/^(\.\.[/\\])+/, ''))
  if (!file.startsWith(path.resolve(dir))) file = path.join(dir, 'index.html')
  // SPA fallback, same as nginx `try_files $uri /index.html`
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) file = path.join(dir, 'index.html')
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' })
  fs.createReadStream(file).pipe(res)
}

function createProxy({ apiUpstream, frontendUrl, staticDir }) {
  const api = apiUpstream.replace(/\/+$/, '')
  return http.createServer((req, res) => {
    if (req.url.startsWith('/api/')) return forward(req, res, api + req.url.slice(4))
    if (staticDir) return serveStatic(req, res, path.resolve(staticDir))
    return forward(req, res, frontendUrl.replace(/\/+$/, '') + req.url)
  })
}

module.exports = { createProxy }

if (require.main === module) {
  const server = createProxy({
    apiUpstream: process.env.API_UPSTREAM || 'https://digiexplorer.info/api',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5010',
    staticDir: process.env.STATIC_DIR,
  })
  server.listen(process.env.PORT || 8080, () => console.log(`local proxy on http://localhost:${server.address().port}`))
}
