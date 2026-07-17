import assert from 'assert'
import {
  formatDigiDollarAmount,
  formatOraclePrice,
  getBlockDigiDollarTypes,
  getDigiDollarLabel,
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
  getDigiDollarLabel({ digidollar: { tx_marker: true, tx_type: 'redeem' } }),
  'DigiDollar Burn'
)
assert.strictEqual(
  getDigiDollarLabel({ digidollar: { oracle_bundles: [{ valid: true }] } }),
  'DigiDollar Oracle'
)
assert.strictEqual(getDigiDollarLabel({}), null)

assert.deepStrictEqual(
  getBlockDigiDollarTypes([
    { digidollar: { tx_type: 'mint' } },
    { digidollar: { tx_type: 'transfer' } },
    { digidollar: { tx_type: 'mint' } },
    { digidollar: { tx_type: 'burn' } },
    {}
  ]),
  ['mint', 'transfer', 'burn']
)
