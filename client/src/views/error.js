import Snabbdom from 'snabbdom-pragma'
import layout from './layout'
import { NOT_DGB_ADDRESS } from '../lib/dgb-address'

const NO_BLOCK = 'No block at that height.'
    , NO_HASH  = 'No block or transaction with that hash.'

// Short, friendly text for raw API errors (WEIRD-INPUT-8). Unknown messages pass through.
// A message can depend on the page: "Block not found" on /block/<hash> is about a hash, not a height.
const isHashPage = page => !!page && /^\/(block|tx)\//.test(page.pathname || '')
const friendlyMessages = [
  [ /^invalid address/i, NOT_DGB_ADDRESS ]
, [ /^Invalid number$/, NO_BLOCK ]
, [ /^Block not found$/, page => isHashPage(page) ? NO_HASH : NO_BLOCK ]
, [ /^Transaction not found$/, NO_HASH ]
, [ /^Invalid hex string$/, 'This is not a valid block hash or transaction ID.' ]
, [ /^No results found$/, 'No results found. Search for a block height, block hash, transaction ID or DigiByte address.' ]
]

const formatError = err =>
  (err.message && err.message.startsWith('Request has been terminated'))
? 'We encountered an error. Please try again later.'
: (err.status && err.status === 502)
? 'DigiExplorer is currently unavailable, please try again later.'
: (err.message || err.toString())

export const friendlyError = (err, page) => {
  const msg = String(formatError(err)).trim()
      , found = friendlyMessages.find(([ re ]) => re.test(msg))
  return !found ? msg : typeof found[1] == 'function' ? found[1](page) : found[1]
}

export const error = ({ t, error, ...S }) => layout(<div>
    <div className="container text-center"><h1>{ t(friendlyError(error, S.page)) }</h1></div>
  </div>
, { t, ...S })

export const notFound = S => error({ ...S, error: 'Page Not Found' })
