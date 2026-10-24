// Unit tests for small client helpers (run with babel-node, see `npm test`)
import assert from 'assert'
import { Subject } from '../client/node_modules/rxjs' // same copy the client code uses
import { addressURI, onNewTipWhileViewing } from '../client/src/util'
import { stripUri } from '../client/src/driver/search'

// B16: address QR codes must use the DigiByte URI scheme
assert.strictEqual(addressURI('D5LX3NoqDLQHRZi67nT45PDqr945huj4Kt'), 'digibyte:D5LX3NoqDLQHRZi67nT45PDqr945huj4Kt')
// ... and the search box must accept scanned/pasted digibyte: URIs
assert.strictEqual(stripUri('digibyte:D5LX3NoqDLQHRZi67nT45PDqr945huj4Kt?amount=1'), 'D5LX3NoqDLQHRZi67nT45PDqr945huj4Kt')
assert.strictEqual(stripUri('DIGIBYTE:DGB1QXYZ'), 'DGB1QXYZ')

// B5: the home page must re-fetch the latest blocks when the tip height changes while it is shown
{
  const tip$ = new Subject(), view$ = new Subject(), fired = []
  onNewTipWhileViewing('dashBoard', tip$, view$).subscribe(([ tip ]) => fired.push(tip))
  view$.next('dashBoard')
  tip$.next(100) // first tip value: the page just fetched its blocks, no refresh needed
  tip$.next(100) // unchanged tip: no refresh
  tip$.next(101) // new block: refresh
  view$.next('block')
  tip$.next(102) // new block on another page: no refresh
  view$.next('dashBoard')
  tip$.next(103) // back on the dashboard: refresh
  assert.deepStrictEqual(fired, [ 101, 103 ])
}

console.log('client-ui tests passed')
