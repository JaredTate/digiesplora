// Unit tests for the first-timer, slow-network and accessibility fixes (run with babel-node, see `npm test`)
// IDs refer to the 2026-10-24 break-it reports.
process.env.TZ = 'America/Denver' // times must not depend on the visitor's time zone
import assert from 'assert'
import fs from 'fs'
import path from 'path'
import toHTML from 'snabbdom-to-html'
import Snabbdom from '../client/node_modules/snabbdom-pragma'
import l10n from '../client/src/l10n'
import { badAddressMessage, NOT_DGB_ADDRESS, TYPO_ADDRESS } from '../client/src/lib/dgb-address'
import { friendlyError } from '../client/src/views/error'
import { formatTime } from '../client/src/views/util'
import searchDriver from '../client/src/driver/search'
import { Observable as O } from '../client/src/rxjs'
import search from '../client/src/views/search'
import layout from '../client/src/views/layout'
import navbar from '../client/src/views/navbar'
import subnav from '../client/src/views/sub-navbar'
import footer from '../client/src/views/footer'
import loading from '../client/src/views/loading'
import txView from '../client/src/views/tx'
import { blks } from '../client/src/views/blocks'

const t = l10n.en
const ROOT = path.join(__dirname, '..')
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8')
const page = (pathname, query = {}) => ({ pathname, query })
let checks = 0
const ok = (cond, msg) => { assert.ok(cond, msg); checks++ }
const eq = (a, b, msg) => { assert.strictEqual(a, b, msg); checks++ }

// ---------------------------------------------------------------------------
// FIRST-TIMER-11: a typo in a DigiByte address gets its own message, and the search box keeps the query
eq(TYPO_ADDRESS, 'This looks like a DigiByte address, but it has a typo. Check each character.')
;[ 'DRGNhTiYdetetvRo3qnUFpo3PYUrVYPHZQ'          // last character changed
 , 'DRGNhTiYdetetvRo3qnUFpo3PYUrVYPHZ'           // one character short
 , 'SQgg31eBWKDbxxq2ym2UMdg9YB834eWHrX'          // P2SH, last character changed
 , 'dgb1qf6rxawqk6chveffxqstdpvr428yekf73hz4sj'  // bech32, one character short
 , 'DGB1QK9Z8N53S0W2Z42F8G0SWERSZZ8S6WTPRCVMYVV' // bech32, upper case, bad checksum
 , 'DD1NQeCkofg1AyWvCWdki4N44Dihox91Xw8aYSotx7bb2cNaf6Ab' // DigiDollar address, last character changed
 ].forEach(a => eq(badAddressMessage(a), TYPO_ADDRESS, `${a} is a mistyped DigiByte address`))
;[ '1NXnuCA3chiizYGKp7Kxppk2k2nWBHe6jv', '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy'
 , 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', 'LNcdGPArrcGThTjjcU2h5kbM6cFtK5TvMF'
 , 'dgbt1qy5epvfs535a96tygn945a3a85lauh3ddf0xzvf', '<img src=x>', '', null
 ].forEach(a => eq(badAddressMessage(a), NOT_DGB_ADDRESS, `${a} is not a DigiByte address`))

// the form submit must not reload the page (a reload empties the search box)
ok(/on\('\.search', 'submit', \{ preventDefault: true \}\)/.test(read('client/src/app.js')), 'search submit must call preventDefault')
// the address page uses the same two messages
ok(/goBadAddr\$\.map\(d => badAddressMessage\(d\.addr\)\)/.test(read('client/src/app.js')), 'address page must use badAddressMessage')

// the search box shows the query of the current /search page
{
  const html = toHTML(search({ t, query: 'DRGNhTiYdetetvRo3qnUFpo3PYUrVYPHZQ' }))
  ok(html.includes('value="DRGNhTiYdetetvRo3qnUFpo3PYUrVYPHZQ"'), 'search box keeps the query')
  ok(!toHTML(search({ t })).includes('value='), 'empty search box when there is no query')
  const onSearch = toHTML(layout(Snabbdom.createElement('div', null),  { t, page: page('/search', { q: 'hello world' }) }))
  ok(/<input[^>]*search-bar-input[^>]*value="hello world"/.test(onSearch), 'layout passes the /search query to the box')
  const onTx = toHTML(layout(Snabbdom.createElement('div', null),  { t, page: page('/tx/abc', { q: 'x' }) }))
  ok(!/<input[^>]*search-bar-input[^>]*value=/.test(onTx), 'other pages do not prefill the box')
}

// the search driver answers a mistyped DigiByte address right away (no API call: the base points nowhere)
const searchP = (async () => {
  const run = q => searchDriver('http://127.0.0.1:9')(O.of(q)).toPromise()
  assert.deepStrictEqual(await run('DRGNhTiYdetetvRo3qnUFpo3PYUrVYPHZQ'), { error: TYPO_ADDRESS }); checks++
  assert.deepStrictEqual(await run('dgb1qf6rxawqk6chveffxqstdpvr428yekf73hz4sj'), { error: TYPO_ADDRESS }); checks++
  assert.deepStrictEqual(await run('1NXnuCA3chiizYGKp7Kxppk2k2nWBHe6jv'), { error: NOT_DGB_ADDRESS }); checks++
})()

// ---------------------------------------------------------------------------
// WEIRD-INPUT-8 leftover: an unknown hash must not say "No block at that height."
const HASH_MSG = 'No block or transaction with that hash.'
eq(friendlyError({ status: 404, message: 'Block not found' }, page('/block/' + '0'.repeat(64))), HASH_MSG)
eq(friendlyError({ status: 404, message: 'Transaction not found' }, page('/tx/' + '0'.repeat(64))), HASH_MSG)
eq(friendlyError({ status: 404, message: 'Block not found' }, page('/block-height/99999999')), 'No block at that height.')
eq(friendlyError({ status: 404, message: 'Block not found' }), 'No block at that height.')

// ---------------------------------------------------------------------------
// FIRST-TIMER-22: short phone hint, and every time is shown in UTC with a "UTC" label
{
  const html = toHTML(search({ t }))
      , placeholder = html.match(/placeholder="([^"]*)"/)[1]
  ok(placeholder.length <= 24, `placeholder must fit a phone search box: "${placeholder}"`)
  ok(/title="[^"]*address[^"]*"/.test(html), 'full search hint stays available as a title')
}
eq(formatTime(1792879991), '2026-10-24 22:13:11 UTC')
eq(formatTime(1792879991, false), '2026-10-24 22:13:11')
{
  const process_browser = process.browser
  process.browser = true // the browser header used to drop the "(UTC)" label
  const html = toHTML(blks([ { id: 'ab', height: 1, timestamp: 1792879991, tx_count: 1, size: 1000, weight: 4000 } ], false, false, { t }))
  process.browser = process_browser
  ok(html.includes('Timestamp (UTC)'), 'block list header says UTC')
  ok(html.includes('2026-10-24 22:13:11'), 'block list time is in UTC')
}

// ---------------------------------------------------------------------------
// FIRST-TIMER-19: names, labels and alt text (axe: button-name, image-alt, select-name, link-name, aria-command-name)
{
  const s = toHTML(search({ t }))
  ok(/<button[^>]*aria-label="Search"/.test(s), 'search button has a name')
  const n = toHTML(navbar({ t, view: 'home' }))
  ok(/class="navbar-brand"[^>]*aria-label="DigiExplorer home"/.test(n) || /aria-label="DigiExplorer home"[^>]*class="navbar-brand"/.test(n), 'logo link has a name')
  const f = toHTML(footer({ t, page: { query: {} } }))
  ok(/<select[^>]*aria-label="Language"/.test(f), 'language select has a label')
  ok(/social-media_link"[^>]*aria-label="DigiExplorer source code on GitHub"/.test(f), 'GitHub link has a name')
  const l = toHTML(layout(Snabbdom.createElement('div', null, 'body'), { t, page: page('/') }))
  ok(/<main[^>]*>[\s\S]*body[\s\S]*<\/main>/.test(l), 'page body is inside <main>')
}
// the QR scan link and copy buttons only render in the browser; check their source
ok(/className="qrcode-link"[^>]*aria-label=\{t`Scan a QR code`\}/.test(read('client/src/views/search.js')), 'QR link has a name')
ok(/qrcode\.svg`\} alt=""/.test(read('client/src/views/search.js')), 'QR icon is decorative (alt="")')
for (const f of [ 'tx.js', 'block.js', 'addr.js' ]) {
  const src = read('client/src/views/' + f)
  ok(!/<div className="code-button-btn"/.test(src), `${f}: copy control must be a real <button>`)
  ok(/<button type="button" className="code-button-btn" aria-label=\{t`Copy to clipboard`\}/.test(src), `${f}: copy button has a name`)
}
ok(/<img[^>]*alt=\{t`QR code for this address`\}/.test(read('client/src/views/addr.js')), 'address QR image has alt text')

// color contrast: the colors axe flagged are gone from the CSS rules it pointed at
{
  const css = read('www/style.css')
  const rule = sel => { const m = css.match(new RegExp('(^|\\n)' + sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}')); return m ? m[2] : '' }
  ok(/#[0-9a-f]{3,6}/i.test(rule('.highlighted-text')) && !/#0066cc/i.test(rule('.highlighted-text')), 'block heights on dark rows: lighter blue')
  ok(/color:\s*#fff/i.test(rule('.footer_container_content_copyright')), 'footer copyright: white on blue')
}

// ---------------------------------------------------------------------------
// FIRST-TIMER-17: technical labels carry a one-line hint
{
  const tx = { txid: 'aa'.repeat(32), version: 2, locktime: 0, size: 225, weight: 900, fee: 2250
             , status: { confirmed: true, block_height: 10, block_hash: 'bb'.repeat(32), block_time: 1792879991 }
             , vin: [ { txid: 'cc'.repeat(32), vout: 0, is_coinbase: false, sequence: 4294967293, scriptsig: '', scriptsig_asm: '', witness: []
                      , prevout: { scriptpubkey_address: 'DSftST6gv7d1XYSvYhKXNauddAWoVnzGAS', value: 100000, scriptpubkey_type: 'p2pkh', scriptpubkey: '', scriptpubkey_asm: '' } } ]
             , vout: [ { scriptpubkey_address: 'DSftST6gv7d1XYSvYhKXNauddAWoVnzGAS', value: 97750, scriptpubkey_type: 'p2pkh', scriptpubkey: '', scriptpubkey_asm: '' } ] }
  const html = toHTML(txView({ t, tx, tipHeight: 46, spends: {}, openTx: tx.txid, page: page('/tx/' + tx.txid)
    , txAnalysis: { feerate: 10, mempoolDepth: 0, confEstimate: 1, overpaying: 3, privacyAnalysis: [], segwitGains: { potentialBech32Gains: 0.3, potentialP2shGains: 0.2 } }
    , feeEst: { 2: 1 }, mempool: { count: 0, vsize: 0, fee_histogram: [] } }))
  for (const label of [ 'Status', 'Transaction fees', 'Virtual size', 'Weight units', 'Lock time', 'SegWit fee savings', 'Privacy analysis', 'nSequence', 'scriptPubKey (asm)' ]) {
    const esc = label.replace(/[()]/g, '\\$&')
    ok(new RegExp(`<div class="hint" title="[^"]{10,}">${esc}</div>`).test(html), `tx label "${label}" has a hint`)
  }
  ok(!/bitcoind/i.test(html), 'no "bitcoind" wording')
  ok(html.includes('37 Confirmations'), 'confirmations still shown')
  ok(!/bitcoind/.test(read('client/src/views/tx.js')), 'tx.js has no bitcoind wording')
  const list = toHTML(blks([ { id: 'ab', height: 1, timestamp: 1792879991, tx_count: 1, size: 1000, weight: 4000 } ], false, false, { t }))
  for (const label of [ 'DD TXs', 'Size (KB)', 'Weight (KWU)' ])
    ok(new RegExp(`title="[^"]{10,}">${label.replace(/[()]/g, '\\$&')}</div>`).test(list), `block list "${label}" has a hint`)
  const blockSrc = read('client/src/views/block.js')
  for (const label of [ 'Merkle root', 'Bits', 'Difficulty', 'Nonce', 'Weight units', 'Virtual size' ])
    ok(blockSrc.includes(`hintLabel(t, '${label}')`), `block page "${label}" has a hint`)
}

// ---------------------------------------------------------------------------
// FIRST-TIMER-21: clear names for the sister sites
{
  const sn = toHTML(subnav(t, false, 'dashBoard'))
  ok(/href="https:\/\/digibyte\.io\/"[^>]*>DigiByte Stats</.test(sn), '"Stats" is now "DigiByte Stats"')
  const f = toHTML(footer({ t, page: { query: {} } }))
  ok(/href="https:\/\/digihash\.digibyte\.io\/?"[^>]*>DigiHash Pool</.test(f), 'footer links the DigiHash pool')
  ok(/href="https:\/\/digibyte\.io\/?"[^>]*>DigiByte Stats</.test(f), 'footer links DigiByte Stats')
  ok(!f.includes('DigiEsplora') && f.includes('Powered by DigiExplorer'), 'footer uses the site name')
}

// ---------------------------------------------------------------------------
// SLOW-7: the loading view must be replaced, not morphed into the page (layout shift 0.26)
{
  const findKey = v => v && (v.key === 'loading' || (v.children || []).some(findKey))
  ok(findKey(loading({ t, page: page('/tx/abc') })), 'loading view root has key="loading"')
}

// ---------------------------------------------------------------------------
// SLOW-4: no @import chain, no hidden intro, fonts swap in
{
  const css = read('www/style.css'), pug = read('client/index.pug')
  ok(!/^\s*@import\b/m.test(css), 'style.css has no @import (each one is an extra round trip)')
  ok(pug.indexOf("font/inconsolata/index.css") > 0 && pug.indexOf('light-theme_style.css') > 0, 'index links the formerly imported sheets')
  ok(pug.indexOf('light-theme_style.css') < pug.indexOf('href=staticRoot+cssPath'), 'imported sheets load before style.css (same cascade)')
  const faces = css.match(/@font-face\s*\{[^}]*\}/g) || []
  ok(faces.length >= 2 && faces.every(f => /font-display:\s*swap/.test(f)), 'every @font-face uses font-display: swap')
  ok(/Inter[^}]*\.woff2"\) format\("woff2"\)/.test(faces.join('')), 'Inter loads as woff2')
  const woff2 = path.join(ROOT, 'www/font/Inter-latin.woff2')
  ok(fs.existsSync(woff2) && fs.statSync(woff2).size < 150000, 'Inter woff2 subset exists and is small')
  ok(!/\.seo-intro\s*\{[^}]*animation/.test(css), 'SEO intro is not hidden behind a delayed animation')
}

// ---------------------------------------------------------------------------
// SLOW-8: tap targets of at least 44px
{
  const css = read('www/style.css')
  for (const sel of [ '.search-bar .qrcode-link', '.code-button .code-button-btn', '.footer_container_content_row_social-media_link', '.sub-nav a' ]) {
    const body = (css.match(new RegExp('(^|\\n)' + sel.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\{([^}]*)\\}')) || [])[2] || ''
    ok(/min-height:\s*44px/.test(body) || /(^|\s)height:\s*44px/.test(body), `${sel} is at least 44px tall`)
  }
}

searchP.then(() => console.log(`ux-fixes tests passed (${checks} checks)`))
  .catch(e => { console.error(e); process.exit(1) })
