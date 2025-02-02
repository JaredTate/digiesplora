import Snabbdom from 'snabbdom-pragma'
import navToggle from './nav-toggle'


const items  = process.env.MENU_ITEMS && JSON.parse(process.env.MENU_ITEMS)
    , active = process.env.MENU_ACTIVE

const staticRoot = process.env.STATIC_ROOT || ''

export default ({ t, theme, page }) =>

<div className="main-nav-container">
  <ul className="main-nav">
    { items && Object.entries(items).map(([ name, url ]) =>
        <li id={name.replace(/ /g, '')} className={`nav-item ${name == active ? 'active' : ''}`}>
          <a className="nav-link font-h4" href={url} rel="external">
            <span><img className="menu-logo" alt="" src={`${staticRoot}img/icons/${name.replace(/ /g, '')}-menu-logo.svg`} /></span>
            <span>{t(name)}</span>
          </a>
        </li>
    ) }
    <li className="nav-item">
      <a className="nav-link font-h4" href="https://digibyte.org/" target="_blank" rel="noopener noreferrer">
        <span><img className="menu-logo" alt="" src={`${staticRoot}img/icons/stats-menu-logo.svg`} /></span>
        <span>DigiByte.org</span>
      </a>
    </li>
  </ul>
  { process.env.NAVBAR_HTML ? navToggle(t, theme, page) : "" }
</div>