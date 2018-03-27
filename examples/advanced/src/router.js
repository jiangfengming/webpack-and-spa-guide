// 将async/await转换成ES5代码后需要这个运行时库来支持
import 'regenerator-runtime/runtime'

const routes = {
  // import()返回promise
  '/foo': () => import('./views/foo'),
  '/bar.do': () => import('./views/bar.do')
}

class Router {
  start() {
    window.addEventListener('popstate', () => {
      this.load(location.pathname)
    })

    this.load(location.pathname)
  }

  go(path) {
    history.pushState({}, '', path)
    this.load(path)
  }

  // 加载path路径的页面
  // 使用async/await语法
  async load(path) {
    if (path === '/') path = '/foo'
    // 动态加载页面
    const View = (await routes[path]()).default
    const view = new View()
    view.mount(document.body)
  }
}

export default new Router()
