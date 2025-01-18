import Snabbdom from 'snabbdom-pragma'
import menu from './navbar-menu'

export default S =>
  <nav className="container nav-container">
    <a className="navbar-brand" href="."></a>
    <div className="site-title">
      <h1>DigiExplorer</h1>
      <h2>DigiByte Block Explorer</h2>
    </div>
    { menu(S) }
  </nav>

