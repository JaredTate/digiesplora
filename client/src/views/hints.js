import Snabbdom from 'snabbdom-pragma'

// One-line plain-English hints for technical labels, shown as a tooltip (FIRST-TIMER-17)
const SIZE_HINT = 'Size used to set the fee. SegWit data counts one quarter (vB = virtual bytes).'
    , WEIGHT_HINT = 'Another size measure. Block limits use weight: 1 virtual byte = 4 weight units (WU).'
    , TIME_HINT = 'Time set by the miner, in UTC. It can be a little off, so block times are not always in order.'
    , SCRIPT_PUB_HINT = 'The locking script: the rule that must be met to spend this output.'
    , SCRIPT_SIG_HINT = 'The unlocking data that proves the right to spend this input.'

export const HINTS = {
  'Status': 'Each new block adds one confirmation. More confirmations make a transaction harder to reverse.'
, 'Transaction fees': 'Fee paid to the miner. sat/vB = satoshis (0.00000001 DGB) per virtual byte of size.'
, 'Block timestamp': TIME_HINT
, 'Timestamp': TIME_HINT
, 'Timestamp (UTC)': TIME_HINT
, 'Virtual size': SIZE_HINT
, 'Weight units': WEIGHT_HINT
, 'Lock time': 'Earliest block height or time at which this transaction can be mined. 0 means no limit.'
, 'Replace by fee': 'The sender can replace this unconfirmed transaction with one that pays a higher fee.'
, 'SegWit fee savings': 'Fees saved, or that could be saved, by using SegWit (dgb1...) addresses.'
, 'Privacy analysis': 'Simple checks for patterns that can link addresses to one owner. They are guesses, not proof.'
, 'nSequence': 'Input sequence number, used for replace-by-fee and time locks. Most people can ignore it.'
, 'scriptPubKey (asm)': SCRIPT_PUB_HINT
, 'scriptPubKey (hex)': SCRIPT_PUB_HINT
, 'scriptSig (asm)': SCRIPT_SIG_HINT
, 'scriptSig (hex)': SCRIPT_SIG_HINT
, 'Witness': 'SegWit unlocking data (signatures) for this input.'
, 'Merkle root': 'A fingerprint of all transactions in this block.'
, 'Bits': 'The mining target in compact form. A lower target is harder to hit.'
, 'Difficulty': 'How hard it was to find this block with its mining algorithm.'
, 'Nonce': 'The number the miner changed until the block met the target.'
, 'DD TXs': 'Number of DigiDollar transactions in the block.'
, 'Size (KB)': 'Block size in kilobytes.'
, 'Weight (KWU)': 'Block weight in thousands of weight units. Block limits use weight.'
}

// A label with a dotted underline and a tooltip; plain text when there is no hint
export const hintLabel = (t, label, className) => HINTS[label]
  ? <div className={`hint${className ? ' ' + className : ''}`} title={t(HINTS[label])}>{t(label)}</div>
  : <div className={className || ''}>{t(label)}</div>
