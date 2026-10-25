import Snabbdom from 'snabbdom-pragma'

const staticRoot = process.env.STATIC_ROOT || ''
// Names for the icon-only footer links (FIRST-TIMER-19: links need an accessible name)
const linkNames = { 'https://github.com/JaredTate/digiesplora': 'DigiExplorer source code on GitHub' }
// The sister sites, named the same way everywhere (FIRST-TIMER-21)
const siteLinks = [ [ 'https://digibyte.io/', 'DigiByte Stats' ], [ 'https://digihash.digibyte.io/', 'DigiHash Pool' ], [ 'https://digibyte.org/', 'DigiByte.org' ] ]
const links = process.env.FOOTER_LINKS ? JSON.parse(process.env.FOOTER_LINKS) : { [staticRoot+'img/github_blue.png']: 'https://github.com/JaredTate/digiesplora' }


export default ({ t, page }) =>
  <footer className="footer">
    <div className="container">
      <div className="footer_container_content">
        <div className="language">
          <form method="get">
            { !process.browser && Object.entries(page.query).map(([k, v]) =>
              k != 'lang' && <input type="hidden" name={k} value={v} />
            ) }
            <select className="language-selector font-h4" name="lang" aria-label="Language">
              { Object.entries(t.langs).map(([ lang_id, lang_t ]) =>
                <option value={lang_id} attrs={lang_id == t.lang_id ? { selected: true } : {}}>{lang_t`lang_name`}</option>
              ) }
            </select>
            { !process.browser && <input type="submit" className="language-submit" value={t`Go`} /> }
          </form>
        </div>
        <div className="footer_container_content_row">

          <div className="footer_container_content_row_social-media_container">
            { Object.entries(links).map(([ imgSrc, url ]) =>
                <a className="footer_container_content_row_social-media_link" href={url} target="_blank" rel="noopener noreferrer" aria-label={linkNames[url] || url}>
                  <img className="footer_container_content_row_social-media_item" alt="" src={imgSrc} />
                </a>
            ) }
          </div>

          { (process.env.ONION_V3) &&
            <div className="footer_container_content_row_onion_container">
              <div className="footer_container_content_row_onion_icon"></div>
              <div className="footer_container_content_row_onion_link-container">
                { process.env.ONION_V3 && <a className="footer_container_content_row_onion_link font-p4" href={ process.env.ONION_V3 } target="_blank">Onion V3</a> }
              </div>
            </div>
          }

        </div>
        <div className="footer_container_content_sites font-p3">
          { siteLinks.map(([ url, name ]) => <a href={url} target="_blank" rel="noopener noreferrer">{name}</a>) }
        </div>
        <div className="footer_container_content_copyright font-p3">
          <div>
          { process.env.TERMS && <span><a href={ process.env.TERMS } target="_blank">Terms &amp; </a></span> }
          { process.env.PRIVACY && <span><a href={ process.env.PRIVACY } target="_blank">Privacy</a></span> }
          </div>
          <div>{ process.env.SITE_FOOTER || t`Copyright © ${new Date().getFullYear()} DigiByte Developers. Released under MIT license. All rights reserved. Powered by DigiExplorer` }</div>
        </div>
      </div>
    </div>
  </footer>
