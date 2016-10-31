import template from './index.html';
import './style.css';

export default class {
  mount(container) {
    container.innerHTML = template;
  }
}
