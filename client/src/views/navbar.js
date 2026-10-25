import Snabbdom from 'snabbdom-pragma'
import menu from './navbar-menu'

// Views that render their own <h1>. On every other view the site name is the page's one <h1>.
const ownHeading = [ 'block', 'tx', 'addr', 'mempool', 'pushtx', 'error', 'notFound', 'asset' ]

export default S =>
  <nav className="container nav-container">
    <a className="navbar-brand" href="." aria-label="DigiExplorer home"></a>
    <div className="site-title">
      { ownHeading.includes(S.view)
        ? <div className="site-title-name">DigiExplorer</div>
        : <h1 className="site-title-name">DigiExplorer</h1> }
      <div className="site-title-tagline">DigiByte Block Explorer</div>
    </div>
    { menu(S) }
  </nav>
