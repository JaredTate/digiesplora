// Unit tests for the per-route SEO metadata (client/src/lib/seo.js).
// pageMeta(pathname, data) -> { title, description, canonical, noindex, jsonLd }
// Run: npm run test:seo   (also run by test/smoke.js, the Box 2 deploy gate)
const assert = require('assert')
const { pageMeta, canonicalUrl, SITE_URL, HOME_TITLE } = require('../client/src/lib/seo')

const BLOCK = '4da631f2ac1bed857bd968c67c913978274d8aabed64ab2bcebc1665d7f4d3a0'
const TXID = 'dd8a4a3b8ecdc14e4142ffb73a5b0c8801030f98dbd818f1b90ac3683b4f2c60'
const ADDR = 'DK8ZTp89aahJpmnwdZ8LNsAUNoGA6qS43G'
const BECH = 'dgb1qw508d6qejxtdg4y5r3zarvary0c5xw7k3lh6fv'

function checkShape(m, label) {
  assert.ok(m && typeof m === 'object', `${label}: no meta object`)
  assert.strictEqual(typeof m.title, 'string', `${label}: title is not a string`)
  assert.ok(m.title.length > 0 && m.title.length <= 60, `${label}: title length ${m.title.length}: ${m.title}`)
  assert.ok(/DigiExplorer/.test(m.title), `${label}: title lacks site name: ${m.title}`)
  assert.ok(!/[\u0000-\u001f\u007f]/.test(m.title), `${label}: title has control characters`)
  assert.ok(m.description.length >= 70 && m.description.length <= 160, `${label}: description length ${m.description.length}: ${m.description}`)
  assert.ok(m.canonical.startsWith(SITE_URL + '/'), `${label}: canonical not absolute: ${m.canonical}`)
  assert.ok(!/[?#\s"<>\\]/.test(m.canonical), `${label}: canonical has query/hash/unsafe chars: ${m.canonical}`)
  assert.doesNotThrow(() => new URL(m.canonical), `${label}: canonical is not a valid URL`)
  assert.strictEqual(new URL(m.canonical).origin, SITE_URL, `${label}: canonical left the site`)
  assert.strictEqual(typeof m.noindex, 'boolean', `${label}: noindex is not boolean`)
  if (m.jsonLd) {
    const ld = JSON.parse(JSON.stringify(m.jsonLd))
    assert.strictEqual(ld['@context'], 'https://schema.org', `${label}: JSON-LD context`)
  }
}

function run() {
  let n = 0
  const t = (name, fn) => { fn(); n++ }

  t('home', () => {
    const m = pageMeta('/')
    checkShape(m, 'home')
    assert.strictEqual(m.title, HOME_TITLE)
    assert.strictEqual(m.title, 'DigiExplorer - DigiByte Block Explorer')
    assert.strictEqual(m.canonical, 'https://digiexplorer.info/')
    assert.strictEqual(m.noindex, false)
    assert.strictEqual(m.jsonLd, null) // the WebSite JSON-LD is static in index.html
  })

  t('recent blocks drops ?start', () => {
    const m = pageMeta('/blocks/recent?start=100')
    checkShape(m, 'blocks')
    assert.strictEqual(m.canonical, 'https://digiexplorer.info/blocks/recent')
    assert.match(m.title, /^Recent DigiByte Blocks – DigiExplorer$/)
  })

  t('mempool', () => {
    const m = pageMeta('/mempool')
    checkShape(m, 'mempool')
    assert.strictEqual(m.title, 'DigiByte Mempool – DigiExplorer')
    assert.strictEqual(m.canonical, 'https://digiexplorer.info/mempool')
  })

  t('block before and after data', () => {
    const m0 = pageMeta(`/block/${BLOCK}`)
    checkShape(m0, 'block (loading)')
    assert.strictEqual(m0.canonical, `https://digiexplorer.info/block/${BLOCK}`)
    assert.strictEqual(m0.title, 'Block 4da631f2…d7f4d3a0 – DigiExplorer')
    const m1 = pageMeta(`/block/${BLOCK.toUpperCase()}`, { block: { id: BLOCK, height: 24442000 } })
    checkShape(m1, 'block')
    assert.strictEqual(m1.title, 'Block 24,442,000 – DigiExplorer')
    assert.strictEqual(m1.canonical, `https://digiexplorer.info/block/${BLOCK}`) // lower-case hash
    assert.match(m1.description, /24,442,000/)
    const crumbs = m1.jsonLd['@graph'].find(x => x['@type'] === 'BreadcrumbList').itemListElement
    assert.deepStrictEqual(crumbs.map(c => c.position), [1, 2, 3])
    assert.strictEqual(crumbs[2].item, m1.canonical)
    assert.ok(m1.jsonLd['@graph'].some(x => x['@type'] === 'WebPage' && x.url === m1.canonical))
  })

  t('stale block data from another page is ignored', () => {
    const m = pageMeta(`/block/${BLOCK}`, { block: { id: 'ff'.repeat(32), height: 5 } })
    assert.ok(!/Block 5 /.test(m.title), m.title)
    const tx = pageMeta(`/tx/${TXID}`, { tx: { txid: 'aa'.repeat(32) }, block: { id: BLOCK, height: 7 } })
    assert.ok(/^Transaction /.test(tx.title), tx.title)
  })

  t('block height', () => {
    const m = pageMeta('/block-height/0001234')
    checkShape(m, 'height')
    assert.strictEqual(m.title, 'Block 1,234 – DigiExplorer')
    assert.strictEqual(m.canonical, 'https://digiexplorer.info/block-height/1234')
  })

  t('transaction', () => {
    const m = pageMeta(`/tx/${TXID}`, { tx: { txid: TXID } })
    checkShape(m, 'tx')
    assert.strictEqual(m.title, 'Transaction dd8a4a3b…3b4f2c60 – DigiExplorer')
    assert.strictEqual(m.canonical, `https://digiexplorer.info/tx/${TXID}`)
    assert.strictEqual(pageMeta(`/tx/${TXID}?expand`).canonical, m.canonical)
    assert.strictEqual(pageMeta('/tx/push').title, 'Broadcast Transaction – DigiExplorer')
    assert.strictEqual(pageMeta('/tx/recent').title, 'Recent DigiByte Transactions – DigiExplorer')
  })

  t('address', () => {
    const m = pageMeta(`/address/${ADDR}`)
    checkShape(m, 'addr')
    assert.strictEqual(m.title, `Address ${ADDR} – DigiExplorer`)
    assert.strictEqual(m.canonical, `https://digiexplorer.info/address/${ADDR}`) // case kept (base58)
    const b = pageMeta(`/address/${BECH}`)
    checkShape(b, 'bech32 addr')
    assert.match(b.title, /^Address dgb1q.*….*3lh6fv – DigiExplorer$/)
  })

  t('search, not found and errors are noindex', () => {
    const s = pageMeta('/search?q=abc')
    checkShape(s, 'search')
    assert.strictEqual(s.canonical, 'https://digiexplorer.info/search')
    assert.strictEqual(s.noindex, true)
    const nf = pageMeta('/no/such/page', { view: 'notFound' })
    checkShape(nf, 'notFound')
    assert.strictEqual(nf.noindex, true)
    assert.match(nf.title, /Not Found/)
    assert.strictEqual(nf.jsonLd, null)
    const er = pageMeta(`/block/zzz`, { view: 'error' })
    checkShape(er, 'error')
    assert.strictEqual(er.noindex, true)
  })

  t('a loaded view after a brief notFound is indexable again', () => {
    const addr = pageMeta(`/address/${ADDR}`, { view: 'addr', block: null, tx: null })
    assert.strictEqual(addr.noindex, false)
    assert.strictEqual(addr.title, `Address ${ADDR} – DigiExplorer`)
    const blk = pageMeta(`/block/${BLOCK}`, { view: 'block', block: { id: BLOCK, height: 1 }, tx: null })
    assert.strictEqual(blk.title, 'Block 1 – DigiExplorer')
    assert.strictEqual(pageMeta('/mempool', { view: 'loading' }).noindex, false)
  })

  t('canonical normalisation', () => {
    assert.strictEqual(canonicalUrl('//mempool//'), 'https://digiexplorer.info/mempool')
    assert.strictEqual(canonicalUrl('/a b/<x>'), 'https://digiexplorer.info/a%20b/%3Cx%3E')
    assert.strictEqual(canonicalUrl('/%E0%A4%A'), 'https://digiexplorer.info/%25E0%25A4%25A')
    assert.strictEqual(canonicalUrl('/../../etc/passwd'), 'https://digiexplorer.info/etc/passwd')
    assert.strictEqual(canonicalUrl('https://evil.example/x'), 'https://digiexplorer.info/https%3A/evil.example/x')
    assert.strictEqual(canonicalUrl('/a\udc00\udc00b/\ud800'), 'https://digiexplorer.info/ab') // lone surrogates
    for (const bad of [undefined, null, 42, {}, [], '', '?', '#x']) assert.strictEqual(canonicalUrl(bad), 'https://digiexplorer.info/')
  })

  t('fuzz: 200+ random paths never throw and stay well formed', () => {
    let seed = 20261024
    const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648
    const pick = a => a[Math.floor(rnd() * a.length)]
    const alphabet = 'abcdefABCDEF0123456789/-_.~%?#&=+ :;@!$\'"()*,<>\\|`{}[]^é中\u0000\u0007\n\t‮😀'
    const prefixes = ['', '/', '/block/', '/block-height/', '/tx/', '/address/', '/blocks/recent', '/mempool', '/search?q=', '//', '/../', '/tx/push/', '/asset/']
    const views = [undefined, 'notFound', 'error', 'block', 'tx', 'addr', 'loading']
    const randStr = len => Array.from({ length: len }, () => pick(alphabet)).join('')
    const inputs = [undefined, null, 0, NaN, {}, [], true, '/'.repeat(500), '/address/' + 'D'.repeat(400),
      '/block-height/' + '9'.repeat(40), '/block-height/-1', '/block-height/1e9', `/block/${BLOCK}x`]
    for (let i = 0; i < 220; i++) inputs.push(pick(prefixes) + randStr(Math.floor(rnd() * 90)))
    for (const p of inputs) {
      const datas = [undefined, {}, { view: pick(views) }, { block: { id: String(p).slice(7), height: Math.floor(rnd() * 3e7) } },
        { tx: { txid: String(p).slice(4) } }, { block: null, tx: null }, { block: { id: 1, height: 'x' } }]
      for (const d of datas) {
        let m
        assert.doesNotThrow(() => { m = pageMeta(p, d) }, `pageMeta threw for ${String(JSON.stringify(p))}`)
        checkShape(m, `fuzz ${String(JSON.stringify(p)).slice(0, 80)}`)
      }
    }
  })

  return n
}

module.exports = { run }

if (require.main === module) {
  const n = run()
  console.log(`seo: ${n} test groups passed`)
}
