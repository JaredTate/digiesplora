import Snabbdom from 'snabbdom-pragma'
import layout from './layout'
import { NOT_DGB_ADDRESS } from '../lib/dgb-address'

const NO_BLOCK = 'No block at that height.'

// Short, friendly text for raw API errors (WEIRD-INPUT-8). Unknown messages pass through.
const friendlyMessages = [
  [ /^invalid address/i, NOT_DGB_ADDRESS ]
, [ /^Invalid number$/, NO_BLOCK ]
, [ /^Block not found$/, NO_BLOCK ]
, [ /^Invalid hex string$/, 'This is not a valid block hash or transaction ID.' ]
, [ /^No results found$/, 'No results found. Search for a block height, block hash, transaction ID or DigiByte address.' ]
]

const formatError = err =>
  (err.message && err.message.startsWith('Request has been terminated'))
? 'We encountered an error. Please try again later.'
: (err.status && err.status === 502)
? 'Esplora is currently unavailable, please try again later.'
: (err.message || err.toString())

export const friendlyError = err => {
  const msg = String(formatError(err)).trim()
      , found = friendlyMessages.find(([ re ]) => re.test(msg))
  return found ? found[1] : msg
}

export const error = ({ t, error, ...S }) => layout(<div>
    <div className="container text-center"><h1>{ t(friendlyError(error)) }</h1></div>
  </div>
, { t, ...S })

export const notFound = S => error({ ...S, error: 'Page Not Found' })
