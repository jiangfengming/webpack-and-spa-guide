/* eslint no-console: "off" */

import template from './index.html'
import './style.css'

export default class {
  mount(container) {
    document.title = 'foo'

    console.log(DEBUG)
    console.log(VERSION)
    console.log(CONFIG)

    container.innerHTML = `
      <pre>
      DEBUG: ${DEBUG}
      VERSION: ${VERSION}
      CONFIG: ${JSON.stringify(CONFIG, null, 2)}
      </pre>
      ${template}
    `
  }
}
