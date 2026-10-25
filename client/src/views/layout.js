import Snabbdom from 'snabbdom-pragma'
import navbar from './navbar'
import footer from './footer'
import subnav from './sub-navbar'

// The search box keeps the query while its /search page is shown (FIRST-TIMER-11)
const searchQuery = page => page && page.pathname == '/search' && page.query && page.query.q || ''

export default (body, opt) =>
  <div className="explorer-container">
    <div className="content-wrap">
      { navbar(opt) }
      {subnav(opt.t, opt.isTouch, opt.activeTab, searchQuery(opt.page))}
      <main>{ body }</main>
    </div>
    { footer(opt) }
  </div>
