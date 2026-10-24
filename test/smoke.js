// Smoke / characterization test for the explorer frontend.
// It proves that:
//   1. the dev-server starts and serves the main pages, app.js and CSS;
//   2. the same frontend works behind an nginx-like /api proxy against a live API;
//   3. the production build (build.sh -> static dist/) succeeds. Box 2 serves that build
//      (scripts/deploy-box2.sh), so this check is the deploy gate.
// Run: npm run test:smoke   (SMOKE_OFFLINE=1 skips the live API checks; SMOKE_API sets the API)
const assert = require('assert')
const vm = require('vm')
const os = require('os')
const fs = require('fs')
const path = require('path')
const { spawn, execFileSync } = require('child_process')
const { createProxy } = require('./local-proxy')

const ROOT = path.join(__dirname, '..')
const BIN = path.join(ROOT, 'node_modules', '.bin')
const DEV_PORT = +process.env.SMOKE_PORT || 5199
const API = process.env.SMOKE_API || 'https://digiexplorer.info/api'
const OFFLINE = !!process.env.SMOKE_OFFLINE

// Real mainnet objects (block 1, its coinbase tx, a recent address).
const BLOCK1 = '4da631f2ac1bed857bd968c67c913978274d8aabed64ab2bcebc1665d7f4d3a0'
const ROUTES = ['/', '/blocks/recent', '/mempool', `/block/${BLOCK1}`, '/block-height/1',
  '/tx/dd8a4a3b8ecdc14e4142ffb73a5b0c8801030f98dbd818f1b90ac3683b4f2c60',
  '/address/DK8ZTp89aahJpmnwdZ8LNsAUNoGA6qS43G', '/search?q=1', '/testnet/', '/nonexistent/page']

let passed = 0
const ok = (msg) => { passed++; console.log(`  ok - ${msg}`) }

async function get(url) {
  const res = await fetch(url, { redirect: 'manual' })
  const body = Buffer.from(await res.arrayBuffer())
  return { status: res.status, type: res.headers.get('content-type') || '', body, text: body.toString('utf8') }
}

function startDevServer() {
  const child = spawn(path.join(BIN, 'babel-node'), ['dev-server.js'], {
    cwd: ROOT, env: { ...process.env, PORT: String(DEV_PORT) },
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: true, // babel-node forks a child; kill the whole process group afterwards
  })
  let log = ''
  child.stdout.on('data', d => { log += d })
  child.stderr.on('data', d => { log += d })
  const ready = new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`dev-server did not start:\n${log}`)), 60000)
    child.stdout.on('data', () => { if (/HTTP server running/.test(log)) { clearTimeout(t); resolve() } })
    child.on('exit', code => { clearTimeout(t); reject(new Error(`dev-server exited (${code}):\n${log}`)) })
  })
  return { child, ready, log: () => log }
}

function checkBundle(src, label) {
  assert.ok(src.length > 300000, `${label} is suspiciously small (${src.length} bytes)`)
  new vm.Script(src, { filename: label }) // throws on a syntax error
  assert.ok(!/process\.env\.(API_URL|BASE_HREF|IS_ELEMENTS)/.test(src), `${label} still references process.env`)
  assert.ok(src.includes('DigiDollar'), `${label} is missing the DigiDollar UI code`)
}

async function testDevServer() {
  console.log('# dev-server (production mode on Box 2)')
  const dev = startDevServer()
  try {
    await dev.ready
    const base = `http://127.0.0.1:${DEV_PORT}`

    for (const route of ROUTES) {
      const r = await get(base + route)
      assert.strictEqual(r.status, 200, `${route} -> ${r.status}`)
      assert.match(r.type, /html/)
      assert.match(r.text, /<div id="explorer">/, `${route} has no #explorer root`)
      assert.match(r.text, /src="app\.js"/, `${route} does not load app.js`)
    }
    ok(`index served for ${ROUTES.length} SPA routes`)

    const app = await get(base + '/app.js')
    assert.strictEqual(app.status, 200, `/app.js -> ${app.status}: ${app.text.slice(0, 500)}`)
    assert.match(app.type, /javascript/)
    checkBundle(app.text, 'dev app.js')
    ok(`app.js builds and parses (${app.body.length} bytes)`)

    for (const [p, re] of [['/style.css', /css/], ['/style-rtl.css', /css/], ['/bootstrap.min.css', /css/],
                           ['/light-theme_style.css', /css/], ['/img/favicon.png', /png/], ['/robots.txt', /text/]]) {
      const r = await get(base + p)
      assert.strictEqual(r.status, 200, `${p} -> ${r.status}`)
      assert.match(r.type, re, `${p} content-type ${r.type}`)
      assert.ok(r.body.length > 10, `${p} is empty`)
    }
    ok('static assets and CSS served')

    if (OFFLINE) return console.log('  skip - live API proxy checks (SMOKE_OFFLINE)')
    const proxy = createProxy({ apiUpstream: API, frontendUrl: base })
    await new Promise(r => proxy.listen(0, r))
    try {
      const pbase = `http://127.0.0.1:${proxy.address().port}`
      const height = await get(pbase + '/api/blocks/tip/height')
      assert.strictEqual(height.status, 200, `/api/blocks/tip/height -> ${height.status}`)
      assert.ok(+height.text > 20000000, `unexpected tip height ${height.text}`)
      const blocks = JSON.parse((await get(pbase + '/api/blocks')).text)
      assert.ok(Array.isArray(blocks) && blocks.length > 0 && blocks[0].id, 'no blocks from /api/blocks')
      const b1 = await get(`${pbase}/api/block/${BLOCK1}`)
      assert.strictEqual(JSON.parse(b1.text).height, 1)
      const page = await get(`${pbase}/block/${BLOCK1}`)
      assert.match(page.text, /<div id="explorer">/)
      ok(`frontend + /api proxy work against ${API} (tip ${height.text})`)
    } finally { proxy.close() }
  } finally {
    try { process.kill(-dev.child.pid) } catch (_) {}
  }
}

function testProductionBuild() {
  console.log('# production build (build.sh)')
  const dest = fs.mkdtempSync(path.join(os.tmpdir(), 'esplora-dist-'))
  try {
    execFileSync('./build.sh', [], { cwd: ROOT, stdio: 'pipe',
      env: { ...process.env, DEST: dest, PATH: `${BIN}:${process.env.PATH}` } })
    for (const f of ['index.html', 'app.js', 'style.css', 'style-rtl.css', 'notfound.html', 'bootstrap.min.css',
                     'img/favicon.png', 'instascan.min.js']) {
      assert.ok(fs.existsSync(path.join(dest, f)), `dist is missing ${f}`)
    }
    const html = fs.readFileSync(path.join(dest, 'index.html'), 'utf8')
    assert.match(html, /src="app\.js"/)
    // Search engines: a title and description that say DigiByte, plus a sitemap.
    assert.match(html, /<title>DigiExplorer - DigiByte Block Explorer<\/title>/)
    assert.match(html, /<meta name="description" content="[^"]*DigiByte \(DGB\)[^"]*"/)
    assert.match(fs.readFileSync(path.join(dest, 'robots.txt'), 'utf8'), /^Sitemap: https:\/\/digiexplorer\.info\/sitemap\.xml$/m)
    const sitemap = fs.readFileSync(path.join(dest, 'sitemap.xml'), 'utf8')
    for (const u of ['/', '/blocks/recent', '/mempool']) assert.ok(sitemap.includes(`<loc>https://digiexplorer.info${u}</loc>`), `sitemap is missing ${u}`)
    const app = fs.readFileSync(path.join(dest, 'app.js'), 'utf8')
    checkBundle(app, 'dist app.js')
    ok(`build.sh produced a static site (app.js ${app.length} bytes)`)
  } finally {
    fs.rmSync(dest, { recursive: true, force: true })
  }
}

;(async () => {
  await testDevServer()
  testProductionBuild()
  console.log(`\n${passed} checks passed`)
})().catch(err => { console.error(`\nnot ok - ${err.stack || err}`); process.exit(1) })
