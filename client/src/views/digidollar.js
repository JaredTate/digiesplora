import Snabbdom from 'snabbdom-pragma'
import { formatTime } from './util'

const titleCase = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''
const displayType = type => type == 'redeem' ? 'burn' : type
const typeOrder = ['mint', 'transfer', 'burn']

export const formatDigiDollarAmount = cents => {
  const sign = cents < 0 ? '-' : ''
      , abs = Math.abs(cents || 0)
      , whole = Math.floor(abs / 100)
      , frac = String(abs % 100).padStart(2, '0')
  return `${sign}$${whole}.${frac} DD`
}

export const formatOraclePrice = microUsd =>
  `$${((microUsd || 0) / 1000000).toFixed(6)}/DGB`

export const getDigiDollarLabel = tx => {
  const info = tx && tx.digidollar
  if (!info) return null
  if (info.tx_type) return `DigiDollar ${titleCase(displayType(info.tx_type))}`
  if (info.oracle_bundles && info.oracle_bundles.length) return 'DigiDollar Oracle'
  if (info.metadata && info.metadata.length) return 'DigiDollar'
  return null
}

const getDigiDollarClass = tx => {
  const info = tx && tx.digidollar
  if (!info) return ''

  if (info.tx_type) return displayType(info.tx_type)
  if (info.oracle_bundles && info.oracle_bundles.length) return 'oracle'

  const parsed = firstParsed(info)
  return parsed && parsed.tx_type ? displayType(parsed.tx_type) : ''
}

export const digidollarBadge = tx => {
  const label = getDigiDollarLabel(tx)
      , kind = getDigiDollarClass(tx)
  return label && <span className={`digidollar-badge ${kind}`}>
    <span className="digidollar-mark">DD</span>
    <span>{label.replace(/^DigiDollar /, '')}</span>
  </span>
}

export const getBlockDigiDollarTypes = txs => {
  const seen = new Set()

  ;(txs || []).forEach(tx => {
    const info = tx && tx.digidollar
    if (!info) return

    const types = [info.tx_type].concat((info.metadata || []).map(meta => meta.tx_type))
    types.forEach(type => {
      const typeName = displayType(type)
      if (typeOrder.includes(typeName)) seen.add(typeName)
    })
  })

  return typeOrder.filter(type => seen.has(type))
}

export const digidollarBlockFlag = txs => {
  const types = getBlockDigiDollarTypes(txs)
  return types.length && <div className="digidollar-block-flag">
    <strong>DigiDollar activity</strong>
    {types.map(type => <span className={`digidollar-badge compact ${type}`}>
      <span className="digidollar-mark">DD</span>
      <span>{titleCase(type)}</span>
    </span>)}
  </div>
}

const firstParsed = info =>
  (info.metadata && info.metadata.find(m => m.valid)) ||
  (info.oracle_bundles && info.oracle_bundles.find(o => o.valid))

export const digidollarTxRows = tx => {
  const info = tx && tx.digidollar
  if (!info) return null

  const parsed = firstParsed(info)
      , rows = [
        <div>
          <div>DigiDollar</div>
          <div>{getDigiDollarLabel(tx) || 'Detected'}</div>
        </div>
      ]

  if (parsed && parsed.amount_cents != null) rows.push(
    <div>
      <div>DD amount</div>
      <div>{formatDigiDollarAmount(parsed.amount_cents)}</div>
    </div>
  )

  if (parsed && parsed.price_micro_usd != null) rows.push(
    <div>
      <div>Oracle price</div>
      <div>{formatOraclePrice(parsed.price_micro_usd)}</div>
    </div>
  )

  if (parsed && parsed.epoch != null) rows.push(
    <div>
      <div>Oracle epoch</div>
      <div>{parsed.epoch}</div>
    </div>
  )

  return rows
}

const row = (label, value, className='') =>
  value == null ? null :
  <div className="vout-body-row digidollar-row">
    <div>{label}</div>
    <div className={className}>{value}</div>
  </div>

export const digidollarOutputRows = vout => {
  const info = vout && vout.digidollar
  if (!info) return null

  const status = info.valid ? titleCase(info.kind.replace(/_/g, ' ')) : `Invalid ${info.kind.replace(/_/g, ' ')}`
      , rows = [
        row('DigiDollar data', status),
        !info.valid && row('DigiDollar error', info.error, 'mono')
      ]

  if (info.amount_cents != null) rows.push(row('DD amount', formatDigiDollarAmount(info.amount_cents)))
  if (info.amounts_cents) rows.push(row('DD outputs', info.amounts_cents.map(formatDigiDollarAmount).join(', ')))
  rows.push(row('Lock height', info.lock_height))
  rows.push(row('Lock tier', info.lock_tier))
  rows.push(row('Owner x-only pubkey', info.owner_xonly_pubkey, 'mono digidollar-long'))

  if (info.price_micro_usd != null) rows.push(row('Oracle price', formatOraclePrice(info.price_micro_usd)))
  rows.push(row('Oracle epoch', info.epoch))
  rows.push(row('Oracle timestamp', info.timestamp != null ? formatTime(info.timestamp) : null))
  rows.push(row('Oracle signers', info.participant_count))
  rows.push(row('Oracle bitmap', info.participation_bitmap, 'mono digidollar-long'))
  rows.push(row('Aggregate signature', info.aggregate_sig, 'mono digidollar-long'))

  return rows
}
