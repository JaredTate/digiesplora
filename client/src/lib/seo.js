// Per-route SEO metadata for the single-page app.
// One static index.html serves every route, so the page title, description, canonical URL,
// robots noindex and page JSON-LD are set here at runtime, per route.
// Pure CommonJS so test/seo.js (plain node) and the browserify bundle can both load it.

const SITE_URL = 'https://digiexplorer.info'
    , SITE_NAME = 'DigiExplorer'
    , HOME_TITLE = 'DigiExplorer - DigiByte Block Explorer'
    , HOME_DESC = 'Search the DigiByte (DGB) blockchain: blocks, transactions, addresses and the mempool. Free and open source.'
    , MAX_TITLE = 60
    , SUFFIX = ` – ${SITE_NAME}`

const isHash = s => /^[0-9a-f]{64}$/i.test(s)
const commas = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
const short = (s, head=8, tail=8) => s.length <= head + tail + 1 ? s : wellFormed(`${s.slice(0, head)}…${s.slice(-tail)}`)
// Strip control and bidi-override characters from user-supplied text shown in titles.
const clean = s => String(s).replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩]/g, '')

const safeDecode = s => { try { return decodeURIComponent(s) } catch (e) { return s } }
// Drop lone UTF-16 surrogates (they make encodeURIComponent throw, and slicing can create them).
const wellFormed = s => Array.from(s).filter(c => !(c.length === 1 && c >= '\ud800' && c <= '\udfff')).join('')

// Path segments without query, hash, empty, "." or ".." parts. Decoded once.
function segments(pathname) {
  const p = typeof pathname === 'string' ? pathname.split(/[?#]/)[0] : ''
  return p.split('/').map(s => wellFormed(safeDecode(s))).filter(s => s && s !== '.' && s !== '..')
}

const urlFor = segs => `${SITE_URL}/${segs.map(encodeURIComponent).join('/')}`

function canonicalUrl(pathname) {
  return urlFor(segments(pathname))
}

// "<label> – DigiExplorer", shortening the middle of the label to fit MAX_TITLE.
function fitTitle(label) {
  label = clean(label)
  const room = MAX_TITLE - SUFFIX.length
  if (label.length > room) {
    const head = Math.ceil((room - 1) / 2), tail = room - 1 - head
    label = label.slice(0, head) + '…' + (tail > 0 ? label.slice(-tail) : '')
  }
  return wellFormed(label) + SUFFIX
}

// Descriptions must be 70-160 chars; pad short ones with a fixed, true sentence.
function fitDesc(desc) {
  desc = clean(desc)
  if (desc.length < 70) desc = `${desc} Data from a DigiByte full node.`
  return desc.length > 160 ? desc.slice(0, 159) + '…' : desc
}

function pageLd(canonical, title, description, crumbs) {
  const items = [[SITE_NAME, `${SITE_URL}/`], ...crumbs]
  return {
    '@context': 'https://schema.org'
  , '@graph': [
      { '@type': 'WebPage', '@id': canonical, url: canonical, name: title, description
      , isPartOf: { '@id': `${SITE_URL}/#website` } }
    , { '@type': 'BreadcrumbList'
      , itemListElement: items.map(([ name, item ], i) => ({ '@type': 'ListItem', position: i + 1, name, item })) }
    ]
  }
}

// Route + loaded data -> { title, description, canonical, noindex, jsonLd }.
// data: { block, tx, view } where view is the app's current view name.
// Data is used only when it belongs to the route (stale data from the previous page is ignored).
function pageMeta(pathname, data) {
  const d = data && typeof data === 'object' ? data : {}
      , segs = segments(pathname)
      , [ a, b ] = segs
      , n = segs.length

  let label = null, desc = HOME_DESC, canonSegs = segs, crumbs = [], noindex = false, home = false

  if (n == 0) home = true
  else if (n == 2 && a == 'blocks' && b == 'recent') {
    label = 'Recent DigiByte Blocks'
    desc = 'The latest blocks on the DigiByte (DGB) blockchain, with height, time, transaction count and size. Live data from a DigiByte full node.'
  }
  else if (n == 1 && a == 'mempool') {
    label = 'DigiByte Mempool'
    desc = 'Unconfirmed DigiByte (DGB) transactions waiting in the mempool, with fee rates and sizes. Live data from a DigiByte full node.'
  }
  else if (n == 2 && a == 'block' && isHash(b)) {
    const hash = b.toLowerCase()
        , blk = d.block && typeof d.block === 'object' && String(d.block.id).toLowerCase() === hash ? d.block : null
        , name = blk && Number.isSafeInteger(blk.height) && blk.height >= 0 ? commas(blk.height) : short(hash)
    canonSegs = [ 'block', hash ]
    label = `Block ${name}`
    desc = `DigiByte (DGB) block ${name}: hash, time, size, confirmations and the transactions it contains.`
    crumbs = [[ 'Blocks', `${SITE_URL}/blocks/recent` ]]
  }
  else if (n == 2 && a == 'block-height' && /^\d{1,15}$/.test(b)) {
    const h = String(parseInt(b, 10))
    canonSegs = [ 'block-height', h ]
    label = `Block ${commas(h)}`
    desc = `DigiByte (DGB) block at height ${commas(h)}: hash, time, size and the transactions it contains.`
    crumbs = [[ 'Blocks', `${SITE_URL}/blocks/recent` ]]
  }
  else if (n == 2 && a == 'tx' && b == 'push') {
    label = 'Broadcast Transaction'
    desc = 'Broadcast a signed raw DigiByte (DGB) transaction to the network. Paste the transaction hex and send it.'
  }
  else if (n == 2 && a == 'tx' && b == 'recent') {
    label = 'Recent DigiByte Transactions'
    desc = 'The latest transactions on the DigiByte (DGB) blockchain, with amounts and fees. Live data from a DigiByte full node.'
  }
  else if (n == 2 && a == 'tx' && isHash(b)) {
    const txid = b.toLowerCase()
    canonSegs = [ 'tx', txid ]
    label = `Transaction ${short(txid)}`
    desc = `DigiByte (DGB) transaction ${short(txid)}: inputs, outputs, fee and confirmation status.`
    crumbs = [[ 'Transactions', `${SITE_URL}/tx/recent` ]]
  }
  else if (n == 2 && a == 'address') {
    const addr = clean(b)
        , full = `Address ${addr}`
    label = (full + SUFFIX).length <= MAX_TITLE ? full : `Address ${short(addr, 12, 6)}`
    desc = `DigiByte (DGB) address ${short(addr, 12, 6)}: balance, total received and sent, and transaction history.`
  }
  else if (n == 1 && a == 'search') {
    label = 'Search'
    desc = 'Search the DigiByte (DGB) blockchain by block height, block hash, transaction ID or address.'
    noindex = true
  }
  else if (n == 1 && a == 'scan-qr') {
    label = 'Scan QR Code'
    desc = 'Scan a DigiByte (DGB) address or transaction QR code with your camera to open it in the block explorer.'
  }
  else home = null // unknown route: keep the site title until the view says what it is

  if (d.view === 'notFound' || d.view === 'error') {
    label = d.view === 'notFound' ? 'Page Not Found' : 'Error'
    desc = 'This page was not found on DigiExplorer, the DigiByte (DGB) block explorer. Try a block, transaction or address search.'
    noindex = true
    home = false
  }

  const title = home !== false || !label ? HOME_TITLE : fitTitle(label)
      , description = fitDesc(desc)
      , canonical = urlFor(canonSegs)
      , crumbList = label && !noindex ? [ ...crumbs, [ clean(label), canonical ] ] : []

  return {
    title, description, canonical, noindex
  , jsonLd: home !== false || noindex || !label ? null : pageLd(canonical, title, description, crumbList)
  }
}

// Write the metadata into the live document <head> (browser only).
function applyMeta(doc, meta) {
  if (!doc || !meta) return
  const head = doc.head
      , el = (sel, tag, attrs) => {
          let e = head.querySelector(sel)
          if (!e) {
            e = doc.createElement(tag)
            Object.keys(attrs).forEach(k => e.setAttribute(k, attrs[k]))
            head.appendChild(e)
          }
          return e
        }
      , setMeta = (attr, key, content) => el(`meta[${attr}="${key}"]`, 'meta', { [attr]: key }).setAttribute('content', content)
      , remove = sel => { const e = head.querySelector(sel); e && e.parentNode.removeChild(e) }

  doc.title = meta.title
  el('link[rel="canonical"]', 'link', { rel: 'canonical' }).setAttribute('href', meta.canonical)
  setMeta('name', 'description', meta.description)
  setMeta('property', 'og:title', meta.title)
  setMeta('property', 'og:description', meta.description)
  setMeta('property', 'og:url', meta.canonical)
  setMeta('name', 'twitter:title', meta.title)
  setMeta('name', 'twitter:description', meta.description)

  if (meta.noindex) setMeta('name', 'robots', 'noindex')
  else remove('meta[name="robots"]')

  if (meta.jsonLd) el('script#ld-page', 'script', { id: 'ld-page', type: 'application/ld+json' }).textContent = JSON.stringify(meta.jsonLd)
  else remove('script#ld-page')
}

module.exports = { SITE_URL, SITE_NAME, HOME_TITLE, HOME_DESC, pageMeta, canonicalUrl, applyMeta }
