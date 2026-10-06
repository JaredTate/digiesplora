import assert from 'assert'
import {
  formatDigiDollarAmount,
  formatOraclePrice,
  getBlockDigiDollarSummary,
  getBlockDigiDollarTypes,
  getBlockDigiDollarTxCount,
  getDigiDollarBadgeLabel,
  getDigiDollarLabel,
  getDigiDollarOutputAddress,
  getDigiDollarOutputSummary,
} from '../client/src/views/digidollar'

assert.strictEqual(formatDigiDollarAmount(0), '$0.00 DD')
assert.strictEqual(formatDigiDollarAmount(12345), '$123.45 DD')
assert.strictEqual(formatDigiDollarAmount(5), '$0.05 DD')
assert.strictEqual(formatOraclePrice(3283), '$0.003283/DGB')

assert.strictEqual(
  getDigiDollarLabel({ digidollar: { tx_marker: true, tx_type: 'mint' } }),
  'DigiDollar Mint'
)
assert.strictEqual(
  getDigiDollarLabel({ digidollar: { tx_marker: true, tx_type: 'redeem' } }),
  'DigiDollar Burn'
)
assert.strictEqual(
  getDigiDollarLabel({ digidollar: { oracle_bundles: [{ valid: true }] } }),
  'DigiDollar Oracle'
)
assert.strictEqual(getDigiDollarLabel({}), null)
assert.strictEqual(
  getDigiDollarBadgeLabel({
    digidollar: {
      tx_type: 'mint',
      metadata: [{ valid: true, tx_type: 'mint', amount_cents: 10000 }]
    }
  }),
  'Mint $100.00'
)
assert.strictEqual(
  getDigiDollarBadgeLabel({
    digidollar: {
      tx_type: 'transfer',
      metadata: [{ valid: true, tx_type: 'transfer', amount_cents: 12345 }]
    }
  }),
  'Transfer $123.45'
)
assert.strictEqual(
  getDigiDollarBadgeLabel({ digidollar: { oracle_bundles: [{ valid: true }] } }),
  'Oracle'
)

assert.deepStrictEqual(
  getBlockDigiDollarTypes([
    { digidollar: { tx_type: 'mint' } },
    { digidollar: { tx_type: 'transfer' } },
    { digidollar: { tx_type: 'mint' } },
    { digidollar: { tx_type: 'burn' } },
    { digidollar: { oracle_bundles: [{ valid: true }] } },
    {}
  ]),
  ['mint', 'transfer', 'burn', 'oracle']
)

assert.deepStrictEqual(
  getBlockDigiDollarSummary([
    { digidollar: { tx_type: 'mint', metadata: [{ valid: true, tx_type: 'mint', amount_cents: 10000 }] } },
    { digidollar: { tx_type: 'mint', metadata: [{ valid: true, tx_type: 'mint', amount_cents: 2500 }] } },
    { digidollar: { tx_type: 'transfer', metadata: [{ valid: true, tx_type: 'transfer', amount_cents: 5000 }] } },
    { digidollar: { oracle_bundles: [{ valid: true }] } }
  ]),
  [
    { type: 'mint', amount_cents: 12500 },
    { type: 'transfer', amount_cents: 5000 },
    { type: 'oracle', amount_cents: null }
  ]
)
assert.strictEqual(getBlockDigiDollarTxCount({ digidollar_tx_count: 2 }), 2)
assert.strictEqual(getBlockDigiDollarTxCount({}), 0)

assert.deepStrictEqual(
  getDigiDollarOutputSummary({
    digidollar: { valid: true, tx_type: 'mint', amount_cents: 10000 }
  }),
  { type: 'mint', label: 'DD amount $100.00' }
)
assert.deepStrictEqual(
  getDigiDollarOutputSummary({
    digidollar: { valid: true, tx_type: 'transfer', amount_cents: 12345 }
  }),
  { type: 'transfer', label: 'DD amount $123.45' }
)
assert.deepStrictEqual(
  getDigiDollarOutputSummary({
    digidollar: { valid: true, kind: 'oracle_v03_bundle', price_micro_usd: 3283 }
  }),
  { type: 'oracle', label: 'Oracle price $0.003283/DGB' }
)
assert.strictEqual(
  getDigiDollarOutputAddress({
    digidollar: {
      valid: true,
      kind: 'token_output',
      dd_address: 'DD1NQeCkofg1AyWvCWdki4N44Dihox91Xw8aYSotx7bb2cNaf6Aa'
    }
  }),
  'DD1NQeCkofg1AyWvCWdki4N44Dihox91Xw8aYSotx7bb2cNaf6Aa'
)
assert.strictEqual(getDigiDollarOutputAddress({ digidollar: { valid: false } }), null)
