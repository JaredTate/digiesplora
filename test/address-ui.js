// Unit + fuzz tests for the DigiByte address check and the address balance (run with babel-node, see `npm test`)
// WEIRD-INPUT-1/8: Bitcoin and other non-DigiByte addresses must be rejected before any API call.
// FIRST-TIMER-8: the address page must show a clear "Balance".
import assert from 'assert'
import crypto from 'crypto'
import toHTML from 'snabbdom-to-html'
import bs58check from '../client/node_modules/bs58check'
import { isDigiByteAddress, sha256, MAINNET, TESTNET, NOT_DGB_ADDRESS } from '../client/src/lib/dgb-address'
import { friendlyError } from '../client/src/views/error'
import { formatBalance } from '../client/src/views/util'
import addrView from '../client/src/views/addr'
import l10n from '../client/src/l10n'
import searchDriver from '../client/src/driver/search'
import { Observable as O } from '../client/src/rxjs'

// --- sha256 (used for the base58 checksum) matches node's crypto
for (const len of [ 0, 1, 55, 56, 63, 64, 65, 200 ]) {
  const buf = crypto.randomBytes(len)
  assert.strictEqual(Buffer.from(sha256(buf)).toString('hex'), crypto.createHash('sha256').update(buf).digest('hex'), `sha256 of ${len} bytes`)
}

// --- Valid DigiByte mainnet addresses
const MAINNET_VALID = [
  'D8XmYRog5MvgyfEBAv2xMVhBmXcuaVjuVh', // P2PKH
  'SQgg31eBWKDbxxq2ym2UMdg9YB834eWHrw', // P2SH
  'dgb1qy5epvfs535a96tygn945a3a85lauh3ddu9v63y', // P2WPKH
  'DGB1QY5EPVFS535A96TYGN945A3A85LAUH3DDU9V63Y', // P2WPKH, upper case
  'dgb1qqqqsyqcyq5rqwzqfpg9scrgwpugpzysnzs23v9ccrydpk8qarc0slf0s5p', // P2WSH
  'dgb1pzyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zygs8lgkx2', // P2TR
  'DD1NQeCkofg1AyWvCWdki4N44Dihox91Xw8aYSotx7bb2cNaf6Aa', // DigiDollar P2TR
  'DSftST6gv7d1XYSvYhKXNauddAWoVnzGAS', 'DK8ZTp89aahJpmnwdZ8LNsAUNoGA6qS43G', 'DRGNhTiYdetetvRo3qnUFpo3PYUrVYPHZP',
  'dgb1qk9z8n53s0w2z42f8g0swerszz8s6wtprcvmyvu',
]
MAINNET_VALID.forEach(a => assert.strictEqual(isDigiByteAddress(a), true, `${a} should be valid`))

// --- Rejected on mainnet: Bitcoin, Litecoin, testnet, bad checksums, garbage
const MAINNET_INVALID = [
  '1NXnuCA3chiizYGKp7Kxppk2k2nWBHe6jv', '14Pg1As2mx2QSf3aSL3PojXatPtcFsaiR7', '355gviMUKrLnXpk1ZRhzEMtX2vBKivHL7r',
  '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
  'bc1qy5epvfs535a96tygn945a3a85lauh3ddt7gzf2', 'bc1qk9z8n53s0w2z42f8g0swerszz8s6wtpr0hlu5j',
  'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq', 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx',
  'LNcdGPArrcGThTjjcU2h5kbM6cFtK5TvMF', 'MBHqEbmSGyCDLL1ufJhL418vMcmmjczBfq', 'ltc1qy5epvfs535a96tygn945a3a85lauh3dd0zjx36',
  'skyg4rRLEgQoVGcVXC1YuXpiBxMTk4cxqU', 'yPi7rNbNBCu4wLZhs4g1hHdj11xfkR9qsS', 'dgbt1qy5epvfs535a96tygn945a3a85lauh3ddf0xzvf',
  'dgbrt1qy5epvfs535a96tygn945a3a85lauh3ddd7l8jt', 'TD1SEk6vVsZqujJRrJoVQqrATFK23u7YSWWSo9wc87ub6f4ncZQH',
  'D8XmYRog5MvgyfEBAv2xMVhBmXcuaVjuVj', 'dgb1qk9z8n53s0w2z42f8g0swerszz8s6wtprcvmyvv',
  'dgb1pzyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zygsjrc6rg', // v1 with bech32 (not bech32m) checksum
  'dgb1qy5epvfs535a96tygn945a3a85lauh3ddfeuk5x', // v0 with bech32m checksum
  'dgb1Qy5epvfs535a96tygn945a3a85lauh3ddu9v63y', // mixed case
  '3kPq9w73WY2Hm6weCJuZ2ULypFBshUXfT', // D version byte, 19-byte payload
  '', 'hello', '<img src=x>', 'dgb1', '99999999999999999999', null, undefined, 123, {}, [],
]
MAINNET_INVALID.forEach(a => assert.strictEqual(isDigiByteAddress(a), false, `${a} must be rejected`))

// --- Testnet parameters accept only testnet addresses
;[ 'skyg4rRLEgQoVGcVXC1YuXpiBxMTk4cxqU', 'yPi7rNbNBCu4wLZhs4g1hHdj11xfkR9qsS', 'dgbt1qy5epvfs535a96tygn945a3a85lauh3ddf0xzvf'
 , 'dgbt1pzyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zygsv89e8p', 'TD1SEk6vVsZqujJRrJoVQqrATFK23u7YSWWSo9wc87ub6f4ncZQH'
 ].forEach(a => assert.strictEqual(isDigiByteAddress(a, TESTNET), true, `${a} should be valid on testnet`))
;[ 'D8XmYRog5MvgyfEBAv2xMVhBmXcuaVjuVh', 'dgb1qy5epvfs535a96tygn945a3a85lauh3ddu9v63y', 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx'
 ].forEach(a => assert.strictEqual(isDigiByteAddress(a, TESTNET), false, `${a} must be rejected on testnet`))

// --- Fuzz: ~200 seeded cases. Never throws; only valid DigiByte encodings pass.
{
  let seed = 0x5eed1234
  const rnd = () => (seed = (seed * 1103515245 + 12345) >>> 0) / 0x100000000
      , pick = arr => arr[Math.floor(rnd() * arr.length)]
      , bytes = n => Buffer.from(Array.from({ length: n }, () => Math.floor(rnd() * 256)))
      , B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
      , BECH = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'
      , check = (s, expected, why) => {
          let got
          assert.doesNotThrow(() => { got = isDigiByteAddress(s) }, `threw on ${JSON.stringify(s)}`)
          assert.strictEqual(got, expected, `${why}: ${JSON.stringify(s)}`)
        }
  let cases = 0

  // 1. random strings (ASCII, unicode, control chars): never valid
  for (let i = 0; i < 50; i++, cases++) {
    const s = Array.from({ length: Math.floor(rnd() * 100) }, () => String.fromCharCode(Math.floor(rnd() * (rnd() < 0.8 ? 128 : 0x3000)))).join('')
    check(s, false, 'random string')
  }
  // 2. base58check with a random version byte: valid only for DigiByte P2PKH (30) and P2SH (63)
  for (let i = 0; i < 50; i++, cases++) {
    const version = pick([ 0, 5, 30, 63, 48, 50, 111, 196, 126, 140 ])
        , len = pick([ 20, 20, 20, 19, 21 ])
    check(bs58check.encode(Buffer.concat([ Buffer.from([ version ]), bytes(len) ])), len == 20 && (version == 30 || version == 63), `version ${version}, ${len} bytes`)
  }
  // 3. one character changed in a valid base58 address: the oracle is bs58check
  for (let i = 0; i < 50; i++, cases++) {
    const a = pick(MAINNET_VALID.filter(a => /^[DS]/.test(a) && a.length < 40)), pos = Math.floor(rnd() * a.length)
        , s = a.slice(0, pos) + pick(B58) + a.slice(pos + 1)
        , raw = bs58check.decodeUnsafe(s)
    check(s, !!raw && raw.length == 21 && (raw[0] == 30 || raw[0] == 63), 'mutated base58')
  }
  // 4. one character changed in a valid dgb1 address: bech32 always detects this
  for (let i = 0; i < 50; i++, cases++) {
    const a = pick(MAINNET_VALID.filter(a => a.startsWith('dgb1'))), pos = 4 + Math.floor(rnd() * (a.length - 4))
        , c = pick(BECH.replace(a[pos], ''))
    check(a.slice(0, pos) + c + a.slice(pos + 1), false, 'mutated bech32')
  }
  assert.ok(cases >= 200)
}

// --- Friendly error messages (WEIRD-INPUT-8): no raw backend text
assert.strictEqual(friendlyError('invalid address: Fallback parse error: base58 error'), NOT_DGB_ADDRESS)
assert.strictEqual(friendlyError({ status: 400, message: 'invalid address: not a DigiByte address' }), NOT_DGB_ADDRESS)
assert.strictEqual(friendlyError({ status: 400, message: 'Invalid number' }), 'No block at that height.')
assert.strictEqual(friendlyError({ status: 404, message: 'Block not found' }), 'No block at that height.')
assert.strictEqual(friendlyError({ status: 400, message: 'Invalid hex string' }), 'This is not a valid block hash or transaction ID.')
assert.ok(friendlyError('No results found').startsWith('No results found.'))
assert.strictEqual(friendlyError('Page Not Found'), 'Page Not Found')
assert.strictEqual(NOT_DGB_ADDRESS, 'This is not a DigiByte address. DigiByte addresses start with D, S or dgb1.')

// --- Balance formatter (FIRST-TIMER-8): sats -> DGB with 8 decimals
assert.strictEqual(formatBalance(0), '0.00000000 DGB')
assert.strictEqual(formatBalance(1), '0.00000001 DGB')
assert.strictEqual(formatBalance(9977000000), '99.77000000 DGB')
assert.strictEqual(formatBalance(10203281024), '102.03281024 DGB')
assert.strictEqual(formatBalance(2100000000000000000), '21000000000.00000000 DGB') // max supply
assert.strictEqual(formatBalance(9007199254740991), '90071992.54740991 DGB')
assert.strictEqual(formatBalance(null), '0.00000000 DGB')

// --- Address page shows "Balance" (confirmed + unconfirmed) at the top of the stats
{
  const stats = (funded, spent, txs) => ({ funded_txo_count: 1, funded_txo_sum: funded, spent_txo_count: 0, spent_txo_sum: spent, tx_count: txs })
      , render = (chain, mempool) => toHTML(addrView({
          t: l10n.en, page: { query: {}, pathname: '/address/DRGNhTiYdetetvRo3qnUFpo3PYUrVYPHZP' }
        , addr: { address: 'DRGNhTiYdetetvRo3qnUFpo3PYUrVYPHZP', display_addr: 'DRGNhTiYdetetvRo3qnUFpo3PYUrVYPHZP', chain_stats: chain, mempool_stats: mempool }
        , goAddr: { addr: 'DRGNhTiYdetetvRo3qnUFpo3PYUrVYPHZP', last_txids: [], est_chain_seen_count: 0 }
        , addrTxs: [], spends: {}, tipHeight: 1
        }))
  let html = render(stats(119862600000, 109885600000, 46), stats(0, 0, 0))
  assert.ok(/Balance<\/div><div[^>]*><strong>99\.77000000 DGB/.test(html), 'address page must show the confirmed balance')
  assert.ok(html.indexOf('Balance') < html.indexOf('Confirmed tx count'), 'Balance must be the first stat')
  assert.ok(html.includes('Confirmed unspent'), 'existing details stay')

  html = render(stats(119862600000, 109885600000, 46), stats(100000000, 0, 1))
  assert.ok(/Balance<\/div><div[^>]*><strong>100\.77000000 DGB/.test(html), 'balance must include unconfirmed funds')
  assert.ok(html.includes('1.00000000 DGB unconfirmed'), 'unconfirmed part is shown')
}

// --- Search box: Bitcoin addresses and huge numbers get a message without any API call
// (the API base points nowhere, so any request would turn into "No results found")
;(async () => {
  const search = q => searchDriver('http://127.0.0.1:9')(O.of(q)).toPromise()
  assert.deepStrictEqual(await search('1NXnuCA3chiizYGKp7Kxppk2k2nWBHe6jv'), { error: NOT_DGB_ADDRESS })
  assert.deepStrictEqual(await search(' bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq '), { error: NOT_DGB_ADDRESS })
  assert.deepStrictEqual(await search('bitcoin:3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy'), { error: NOT_DGB_ADDRESS })
  assert.deepStrictEqual(await search('99999999999999999999'), { error: 'No block at that height.' })
  assert.deepStrictEqual(await search('123'), { pathname: '/block-height/123' })
  console.log('address-ui tests passed')
})().catch(e => { console.error(e); process.exit(1) })
