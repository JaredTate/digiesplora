// Unit tests for small client helpers (run with babel-node, see `npm test`)
import assert from 'assert'
import { addressURI } from '../client/src/util'
import { stripUri } from '../client/src/driver/search'

// B16: address QR codes must use the DigiByte URI scheme
assert.strictEqual(addressURI('D5LX3NoqDLQHRZi67nT45PDqr945huj4Kt'), 'digibyte:D5LX3NoqDLQHRZi67nT45PDqr945huj4Kt')
// ... and the search box must accept scanned/pasted digibyte: URIs
assert.strictEqual(stripUri('digibyte:D5LX3NoqDLQHRZi67nT45PDqr945huj4Kt?amount=1'), 'D5LX3NoqDLQHRZi67nT45PDqr945huj4Kt')
assert.strictEqual(stripUri('DIGIBYTE:DGB1QXYZ'), 'DGB1QXYZ')

console.log('client-ui tests passed')
