import template from './index.html'
import './style.css'

export default class {
  mount(container) {
    document.title = 'baz'
    container.innerHTML = template
  }
}
