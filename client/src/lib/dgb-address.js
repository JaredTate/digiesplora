// DigiByte address check (format and checksum), with no dependencies.
// Prefixes come from DigiByte Core v9.26.7 (chainparams.cpp, base58.cpp).
// Bitcoin, Litecoin and other addresses are rejected, even when they hold the same hash.

export const MAINNET = { pubkey: 30, script: 63, digidollar: [ 0x52, 0x85 ], hrp: 'dgb' }   // D..., S..., DD..., dgb1...
export const TESTNET = { pubkey: 126, script: 140, digidollar: [ 0xb1, 0x29 ], hrp: 'dgbt' } // s..., y..., TD..., dgbt1...

export const NOT_DGB_ADDRESS = 'This is not a DigiByte address. DigiByte addresses start with D, S or dgb1.'

// --- SHA-256 (for the base58 checksum)

const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]
const rotr = (x, n) => (x >>> n) | (x << (32 - n))

export const sha256 = bytes => {
  const len = bytes.length, total = Math.ceil((len + 9) / 64) * 64, msg = new Uint8Array(total)
  msg.set(bytes)
  msg[len] = 0x80
  const bits = len * 8
  for (let i = 0; i < 4; i++) msg[total - 1 - i] = (bits >>> (8 * i)) & 0xff
  msg[total - 5] = Math.floor(bits / 0x100000000) & 0xff

  const H = [ 0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19 ]
      , W = new Array(64)
  for (let off = 0; off < total; off += 64) {
    for (let i = 0; i < 16; i++) W[i] = (msg[off+4*i] << 24) | (msg[off+4*i+1] << 16) | (msg[off+4*i+2] << 8) | msg[off+4*i+3]
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(W[i-15], 7) ^ rotr(W[i-15], 18) ^ (W[i-15] >>> 3)
          , s1 = rotr(W[i-2], 17) ^ rotr(W[i-2], 19) ^ (W[i-2] >>> 10)
      W[i] = (W[i-16] + s0 + W[i-7] + s1) | 0
    }
    let [ a, b, c, d, e, f, g, h ] = H
    for (let i = 0; i < 64; i++) {
      const t1 = (h + (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) + ((e & f) ^ (~e & g)) + K[i] + W[i]) | 0
          , t2 = ((rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) + ((a & b) ^ (a & c) ^ (b & c))) | 0
      h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0
    }
    ;[ a, b, c, d, e, f, g, h ].forEach((v, i) => H[i] = (H[i] + v) | 0)
  }
  const out = new Uint8Array(32)
  H.forEach((v, i) => { out[4*i] = v >>> 24; out[4*i+1] = (v >>> 16) & 0xff; out[4*i+2] = (v >>> 8) & 0xff; out[4*i+3] = v & 0xff })
  return out
}

// --- Base58Check

const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

// returns the payload (without the 4-byte checksum), or null
const base58check = str => {
  if (str.length > 60) return null
  const out = [] // little-endian bytes
  for (const ch of str) {
    let carry = B58.indexOf(ch)
    if (carry < 0) return null
    for (let i = 0; i < out.length; i++) {
      carry += out[i] * 58
      out[i] = carry & 0xff
      carry >>= 8
    }
    while (carry) { out.push(carry & 0xff); carry >>= 8 }
  }
  for (let i = 0; i < str.length && str[i] == '1'; i++) out.push(0)
  const bytes = out.reverse()
  if (bytes.length < 5) return null
  const payload = bytes.slice(0, -4), check = sha256(sha256(payload))
  return bytes.slice(-4).every((b, i) => b == check[i]) ? payload : null
}

// --- Bech32 / Bech32m (BIP173, BIP350)

const BECH32 = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l'
    , GEN = [ 0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3 ]

const polymod = values => values.reduce((chk, v) => {
  const top = chk >>> 25
  chk = ((chk & 0x1ffffff) << 5) ^ v
  GEN.forEach((g, i) => { if ((top >>> i) & 1) chk ^= g })
  return chk
}, 1)

// returns { version, program } for a valid segwit address with this hrp, or null
const segwit = (str, hrp) => {
  if (str.length > 90 || (str != str.toLowerCase() && str != str.toUpperCase())) return null
  str = str.toLowerCase()
  const sep = str.lastIndexOf('1')
  if (str.slice(0, sep) != hrp || str.length - sep - 1 < 6) return null
  const data = []
  for (const ch of str.slice(sep + 1)) {
    const v = BECH32.indexOf(ch)
    if (v < 0) return null
    data.push(v)
  }
  const expand = [ ...hrp ].map(c => c.charCodeAt(0) >> 5).concat([ 0 ], [ ...hrp ].map(c => c.charCodeAt(0) & 31))
      , chk = polymod(expand.concat(data)) >>> 0
      , version = data[0]
  // witness v0 uses bech32 (constant 1), v1+ use bech32m
  if (data.length < 7 || version > 16 || chk !== (version == 0 ? 1 : 0x2bc830a3)) return null

  // convert 5-bit groups to bytes
  let acc = 0, bits = 0
  const program = []
  for (const v of data.slice(1, -6)) {
    acc = (acc << 5) | v; bits += 5
    if (bits >= 8) { bits -= 8; program.push((acc >> bits) & 0xff) }
  }
  if (bits >= 5 || (acc & ((1 << bits) - 1))) return null
  if (program.length < 2 || program.length > 40) return null
  if (version == 0 && program.length != 20 && program.length != 32) return null
  return { version, program }
}

// --- Public check

export const isDigiByteAddress = (str, net = MAINNET) => {
  if (typeof str != 'string' || !str.length) return false
  if (str.toLowerCase().startsWith(net.hrp + '1')) return !!segwit(str, net.hrp)
  const raw = base58check(str)
  if (!raw) return false
  if (raw.length == 34) return raw[0] == net.digidollar[0] && raw[1] == net.digidollar[1]
  return raw.length == 21 && (raw[0] == net.pubkey || raw[0] == net.script)
}

// In the Elements/Liquid flavours there is no DigiByte check
export const isValidSearchAddress = process.env.IS_ELEMENTS ? (_ => true) : (str => isDigiByteAddress(str))
