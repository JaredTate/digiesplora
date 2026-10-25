import Snabbdom from 'snabbdom-pragma'

const staticRoot = process.env.STATIC_ROOT || ''
const hasCam = process.browser && navigator.mediaDevices && navigator.mediaDevices.getUserMedia

// `query` keeps the searched text in the box, e.g. after "No results found" (FIRST-TIMER-11).
// The placeholder is short so it fits a phone; the full hint is the title (FIRST-TIMER-22).
export default ({ t, klass, autofocus, query }) =>
  <form className="search" action={process.browser?undefined:"search"}>
    <div className={`search-bar${klass?` ${klass}` : ''}`}>
      <input
        className="form-control search-bar-input"
        type="search"
        name="q"
        placeholder={t`Block, tx ID or address`}
        title={t`Search for a block height, block hash, transaction ID or DigiByte address`}
        aria-label={t`Search`}
        autofocus={!!autofocus}
        required
        autocomplete="off"
        { ...(query ? { value: query } : {}) }
      />
      { hasCam ? <a className="qrcode-link" href="scan-qr" aria-label={t`Scan a QR code`}><img src={`${staticRoot}img/icons/qrcode.svg`} alt=""/></a>: "" }
      <button className="search-bar-submit" type="image" aria-label={t`Search`}></button>
    </div>
  </form>
