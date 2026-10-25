import Snabbdom from 'snabbdom-pragma'
import layout from './layout'


// key="loading": the page that follows replaces this view instead of morphing the spinner
// into its content, which the browser counted as a big layout shift (SLOW-7, CLS 0.26)
export default ({ t, ...S }) => layout(<div key="loading">
    <div className="spinner">
          <div className="ring"></div>
          <div className="loading">{t`Loading`}</div>
      </div>
    </div>, { t, ...S })
