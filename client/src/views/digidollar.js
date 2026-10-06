import Snabbdom from 'snabbdom-pragma'
import { formatTime } from './util'

const titleCase = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''
const displayType = type => type == 'redeem' ? 'burn' : type
const typeOrder = ['mint', 'transfer', 'burn', 'oracle']

export const formatDigiDollarAmount = cents => {
  const sign = cents < 0 ? '-' : ''
      , abs = Math.abs(cents || 0)
      , whole = Math.floor(abs / 100)
      , frac = String(abs % 100).padStart(2, '0')
  return `${sign}$${whole}.${frac} DD`
}

export const formatOraclePrice = microUsd =>
  `$${((microUsd || 0) / 1000000).toFixed(6)}/DGB`

const formatDigiDollarBadgeAmount = cents =>
  formatDigiDollarAmount(cents).replace(/ DD$/, '')

export const getDigiDollarLabel = tx => {
  const info = tx && tx.digidollar
  if (!info) return null
  if (info.tx_type) return `DigiDollar ${titleCase(displayType(info.tx_type))}`
  if (info.oracle_bundles && info.oracle_bundles.length) return 'DigiDollar Oracle'
  if (info.metadata && info.metadata.length) return 'DigiDollar'
  return null
}

const typeBadge = (type, label=titleCase(type), extraClass='') =>
  <span className={`digidollar-badge ${extraClass} ${type}`}>
    <span className="digidollar-mark">DD</span>
    <span>{label}</span>
  </span>

const getDigiDollarClass = tx => {
  const info = tx && tx.digidollar
  if (!info) return ''

  if (info.tx_type) return displayType(info.tx_type)
  if (info.oracle_bundles && info.oracle_bundles.length) return 'oracle'

  const parsed = firstParsed(info)
  return parsed && parsed.tx_type ? displayType(parsed.tx_type) : ''
}

export const getDigiDollarAmountCents = tx => {
  const info = tx && tx.digidollar
  if (!info) return null

  const amounts = (info.metadata || [])
    .filter(meta => meta.valid && meta.amount_cents != null)
    .map(meta => meta.amount_cents)

  if (amounts.length) return amounts.reduce((sum, amount) => sum + amount, 0)

  const parsed = firstParsed(info)
  return parsed && parsed.amount_cents != null ? parsed.amount_cents : null
}

export const getDigiDollarBadgeLabel = tx => {
  const label = getDigiDollarLabel(tx)
      , amount = getDigiDollarAmountCents(tx)

  if (!label) return null

  const shortLabel = label.replace(/^DigiDollar /, '')
  return amount != null ? `${shortLabel} ${formatDigiDollarBadgeAmount(amount)}` : shortLabel
}

export const digidollarBadge = (tx, extraClass='') => {
  const label = getDigiDollarBadgeLabel(tx)
      , kind = getDigiDollarClass(tx)
  return label && typeBadge(kind, label, extraClass)
}

export const digidollarTxTitleFlag = tx => {
  const badge = digidollarBadge(tx, 'title')
  return badge && <span className="digidollar-title-group">
    <span className="digidollar-title-separator">-</span>
    {badge}
  </span>
}

export const getBlockDigiDollarTypes = txs => {
  const seen = new Set()

  ;(txs || []).forEach(tx => {
    const info = tx && tx.digidollar
    if (!info) return

    const types = [info.tx_type].concat((info.metadata || []).map(meta => meta.tx_type))
    if (info.oracle_bundles && info.oracle_bundles.length) types.push('oracle')

    types.forEach(type => {
      const typeName = displayType(type)
      if (typeOrder.includes(typeName)) seen.add(typeName)
    })
  })

  return typeOrder.filter(type => seen.has(type))
}

export const getBlockDigiDollarSummary = txs => {
  const summary = {}
      , add = (type, amount) => {
        const typeName = displayType(type)
        if (!typeOrder.includes(typeName)) return
        if (amount != null) summary[typeName] = (summary[typeName] || 0) + amount
        else if (!(typeName in summary)) summary[typeName] = null
      }

  ;(txs || []).forEach(tx => {
    const info = tx && tx.digidollar
    if (!info) return

    const metadata = (info.metadata || []).filter(meta => meta.valid && meta.tx_type)
    if (metadata.length) metadata.forEach(meta => add(meta.tx_type, meta.amount_cents))
    else if (info.tx_type) add(info.tx_type, null)

    if (info.oracle_bundles && info.oracle_bundles.length) add('oracle', null)
  })

  return typeOrder
    .filter(type => type in summary)
    .map(type => ({ type, amount_cents: summary[type] }))
}

export const digidollarBlockTitleFlag = txs => {
  const summary = getBlockDigiDollarSummary(txs)
  return summary.length && <span className="digidollar-title-group block-dd-activity">
    <span className="digidollar-title-separator">-</span>
    {typeBadge('activity', 'Activity', 'title')}
    {summary.map(({ type, amount_cents }) =>
      typeBadge(
        type,
        amount_cents != null ? `${titleCase(type)} ${formatDigiDollarBadgeAmount(amount_cents)}` : titleCase(type),
        'title compact'
      )
    )}
  </span>
}

export const getBlockDigiDollarTxCount = block =>
  block && block.digidollar_tx_count ? block.digidollar_tx_count : 0

export const digidollarBlockTxCount = block => {
  const count = getBlockDigiDollarTxCount(block)
  return count > 0
    ? <span className="digidollar-block-count">{count}</span>
    : <span className="digidollar-block-count empty">0</span>
}

const firstParsed = info =>
  (info.metadata && info.metadata.find(m => m.valid)) ||
  (info.oracle_bundles && info.oracle_bundles.find(o => o.valid))

export const getDigiDollarOutputSummary = vout => {
  const info = vout && vout.digidollar
  if (!info) return null

  if (info.amount_cents != null) return {
    type: displayType(info.tx_type) || 'activity',
    label: `DD amount ${formatDigiDollarBadgeAmount(info.amount_cents)}`
  }

  if (info.price_micro_usd != null) return {
    type: 'oracle',
    label: `Oracle price ${formatOraclePrice(info.price_micro_usd)}`
  }

  return null
}

export const digidollarOutputSummary = vout => {
  const summary = getDigiDollarOutputSummary(vout)
  return summary && <span className={`digidollar-output-summary ${summary.type}`}>{summary.label}</span>
}

export const getDigiDollarOutputAddress = vout => {
  const info = vout && vout.digidollar
  return info && info.valid && info.dd_address ? info.dd_address : null
}

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
  rows.push(row('DD address', info.dd_address && <a href={`address/${info.dd_address}`}>{info.dd_address}</a>, 'mono digidollar-long'))
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
