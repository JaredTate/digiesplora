import run from '@cycle/rxjs-run'
import { makeHTTPDriver } from '@cycle/http'
import { makeDOMDriver } from '@cycle/dom'
import { makeHistoryDriver, captureClicks } from '@cycle/history'
import makeRouteDriver from './driver/route'
import makeSearchDriver from './driver/search'
import makeScanDriver from './driver/instascan'

import { Observable as O } from './rxjs'

import main from './app'
import { applyMeta } from './lib/seo'

const apiBase = (process.env.API_URL || '/api').replace(/\/+$/, '')
    , webBase = process.env.BASE_HREF || '/'

// Sets <title>, description, canonical, og:url, robots and page JSON-LD for each route
const titleDriver = meta$ => O.from(meta$).subscribe(meta => applyMeta(document, meta))

const blindingDriver = process.env.IS_ELEMENTS
  ? require('./driver/blinding')
  : _ => O.empty()

let storageDriver
try {
  localStorage // this will fail if localStorage/cookies is blocked
  storageDriver = require('@cycle/storage').default
} catch (e) {
  // dummy storage driver. writes are ignored, reads always return null
  storageDriver = _ => ({ local: { getItem: key => O.of(null) } })
}

run(main, {
  DOM: makeDOMDriver('#explorer')
, HTTP: makeHTTPDriver()
, route: makeRouteDriver(captureClicks(makeHistoryDriver({ basename: webBase })))
, storage: storageDriver
, search: makeSearchDriver(apiBase)
, title: titleDriver
, scanner: makeScanDriver()
, blinding: blindingDriver
})
