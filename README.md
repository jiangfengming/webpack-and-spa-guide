# Webpack 4 和单页应用入门

> webpack 更新到了 4.0，官网还没有更新文档。因此把教程更新一下，方便大家用起 webpack 4。

![webpack](https://github.com/fenivana/webpack-and-spa-guide/raw/master/assets/webpack.png)


## 写在开头

~~先说说为什么要写这篇文章，最初的原因是组里的小朋友们看了 [webpack](https://webpack.js.org/) 文档后，表情都是这样的：摘自 webpack 一篇文档的评论区）~~

![WTF](https://github.com/fenivana/webpack-and-spa-guide/raw/master/assets/wtf.jpg)

~~和这样的：~~

![You Couldn't Handle Me](https://github.com/fenivana/webpack-and-spa-guide/raw/master/assets/couldn't-handle.jpg)

~~是的，即使是外国佬也在吐槽这文档不是人能看的。回想起当年自己啃 webpack 文档的血与泪的往事，觉得有必要整一个教程，可以让大家看完后愉悦地搭建起一个 webpack 打包方案的项目。~~

官网新的 [webpack](https://webpack.js.org/) 文档现在写的很详细了，能看英文的小伙伴可以直接去看官网。

可能会有人问 webpack 到底有什么用，你不能上来就糊我一脸代码让我马上搞，我照着搞了一遍结果根本没什么用，都是骗人的。所以，在说 webpack 之前，我想先谈一下前端打包方案这几年的演进历程，在什么场景下，我们遇到了什么问题，催生出了应对这些问题的工具。了解了需求和目的之后，你就知道什么时候 webpack 可以帮到你。我希望我用完之后很爽，你们用完之后也是。


## 先说说前端打包方案的黑暗历史

在很长的一段前端历史里，是不存在打包这个说法的。那个时候页面基本是纯静态的或者服务端输出的，没有 AJAX，也没有 jQuery。那个时候的 JavaScript 就像个玩具，用处大概就是在侧栏弄个时钟，用 media player 放个 mp3 之类的脚本，代码量不是很多，直接放在 `<script>` 标签里或者弄个 js 文件引一下就行，日子过得很轻松愉快。

随后的几年，人们开始尝试在一个页面里做更多的事情。容器的显示，隐藏，切换。用 css 写的弹层，图片轮播等等。但如果一个页面内不能向服务器请求数据，能做的事情毕竟有限的，代码的量也能维持在页面交互逻辑范围内。这时候很多人开始突破一个页面能做的事情的范围，使用隐藏的 iframe 和 flash 等作为和服务器通信的桥梁，新世界的大门慢慢地被打开，在一个页面内和服务器进行数据交互，意味着以前需要跳转多个页面的事情现在可以用一个页面搞定。但由于 iframe 和 flash 技术过于 tricky 和复杂，并没能得到广泛的推广。

直到 Google 推出 Gmail 的时候（2004 年），人们意识到了一个被忽略的接口，[XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest), 也就是我们俗称的 AJAX, 这是一个使用方便的，兼容性良好的服务器通信接口。从此开始，我们的页面开始玩出各种花来了，前端一下子出现了各种各样的库，[Prototype](http://prototypejs.org/)、[Dojo](https://dojotoolkit.org/)、[MooTools](http://mootools.net/)、[Ext JS](https://www.sencha.com/products/extjs/)、[jQuery](https://jquery.com/)…… 我们开始往页面里插入各种库和插件，我们的 js 文件也就爆炸了。

随着 js 能做的事情越来越多，引用越来越多，文件越来越大，加上当时大约只有 2Mbps 左右的网速，下载速度还不如 3G 网络，对 js 文件的压缩和合并的需求越来越强烈，当然这里面也有把代码混淆了不容易被盗用等其他因素在里面。[JSMin](http://crockford.com/javascript/jsmin)、[YUI Compressor](http://yui.github.io/yuicompressor/)、[Closure Compiler](https://developers.google.com/closure/compiler/)、[UglifyJS](http://lisperator.net/uglifyjs/) 等 js 文件压缩合并工具陆陆续续诞生了。压缩工具是有了，但我们得要执行它，最简单的办法呢，就是 windows 上搞个 bat 脚本，mac / linux 上搞个 bash 脚本，哪几个文件要合并在一块的，哪几个要压缩的，发布的时候运行一下脚本，生成压缩后的文件。

基于合并压缩技术，项目越做越大，问题也越来越多，大概就是以下这些问题：
* 库和插件为了要给他人调用，肯定要找个地方注册，一般就是在 window 下申明一个全局的函数或对象。难保哪天用的两个库在全局用同样的名字，那就冲突了。
* 库和插件如果还依赖其他的库和插件，就要告知使用人，需要先引哪些依赖库，那些依赖库也有自己的依赖库的话，就要先引依赖库的依赖库，以此类推。

恰好就在这个时候（2009 年），随着后端 JavaScript 技术的发展，人们提出了 [CommonJS](http://wiki.commonjs.org/wiki/Modules/1.1.1) 的模块化规范，大概的语法是： 如果 `a.js` 依赖 `b.js` 和 `c.js`， 那么就在 `a.js` 的头部，引入这些依赖文件：

```js
var b = require('./b')
var c = require('./c')
```

那么变量 `b` 和 `c` 会是什么呢？那就是 b.js 和 c.js 导出的东西，比如 b.js 可以这样导出：

```js
exports.square = function(num) {
  return num * num
}
```

然后就可以在 a.js 使用这个 `square` 方法：

```js
var n = b.square(2)
```

如果 c.js 依赖 d.js， 导出的是一个 `Number`， 那么可以这样写：

```js
var d = require('./d')
module.exports = d.PI // 假设 d.PI 的值是 3.14159
```

那么 a.js 中的变量 `c` 就是数字 `3.14159`，具体的语法规范可以查看 Node.js 的 [文档](https://nodejs.org/api/modules.html)。

但是 CommonJS 在浏览器内并不适用。因为 `require()` 的返回是同步的，意味着有多个依赖的话需要一个一个依次下载，堵塞了 js 脚本的执行。所以人们就在 CommonJS 的基础上定义了 [Asynchronous Module Definition (AMD)](https://github.com/amdjs/amdjs-api) 规范(2011 年），使用了异步回调的语法来并行下载多个依赖项，比如作为入口的 a.js 可以这样写：

```js
require(['./b', './c'], function(b, c) {
  var n = b.square(2)
  console.log(c)
})
```

相应的导出语法也是异步回调方式，比如 `c.js` 依赖 `d.js`， 就写成这样：

```js
define(['./d'], function(d) {
  return d.PI
})
```

可以看到，定义一个模块是使用 `define()` 函数，`define()` 和 `require()` 的区别是，`define()` 必须要在回调函数中返回一个值作为导出的东西，`require()` 不需要导出东西，因此回调函数中不需要返回值，也无法作为被依赖项被其他文件导入，因此一般用于入口文件，比如页面中这样加载 `a.js`:

```html
<script src="js/require.js" data-main="js/a"></script>
```

以上是 AMD 规范的基本用法，更详细的就不多说了（反正也淘汰了～），有兴趣的可以看 [这里](http://requirejs.org/docs/api.html)。

js 模块化问题基本解决了，css 和 html 也没闲着。什么 [less](http://lesscss.org/)，[sass](http://sass-lang.com/)，[stylus](http://stylus-lang.com/) 的 css 预处理器横空出世，说能帮我们简化 css 的写法，自动给你加 vendor prefix。html 在这期间也出现了一堆模板语言，什么 [handlebars](http://handlebarsjs.com/)，[ejs](http://www.embeddedjs.com/)，[jade](http://jade-lang.com/)，可以把 ajax 拿到的数据插入到模板中，然后用 innerHTML 显示到页面上。

托 AMD 和 CSS 预处理和模板语言的福，我们的编译脚本也洋洋洒洒写了百来行。命令行脚本有个不好的地方，就是 windows 和 mac/linux 是不通用的，如果有跨平台需求的话，windows 要装个可以执行 bash 脚本的命令行工具，比如 msys（目前最新的是 [msys2](http://msys2.github.io/)），或者使用 php 或 python 等其他语言的脚本来编写，对于非全栈型的前端程序员来说，写 bash / php / python 还是很生涩的。因此我们需要一个简单的打包工具，可以利用各种编译工具，编译 / 压缩 js、css、html、图片等资源。然后 [Grunt](http://gruntjs.com/) 产生了（2012 年），配置文件格式是我们最爱的 js，写法也很简单，社区有非常多的插件支持各种编译、lint、测试工具。一年多后另一个打包工具 [gulp](http://gulpjs.com/) 诞生了，扩展性更强，采用流式处理效率更高。

依托 AMD 模块化编程，SPA(Single-page application) 的实现方式更为简单清晰，一个网页不再是传统的类似 word 文档的页面，而是一个完整的应用程序。SPA 应用有一个总的入口页面，我们通常把它命名为 index.html、app.html、main.html，这个 html 的 `<body>` 一般是空的，或者只有总的布局（layout），比如下图：

![layout](https://github.com/fenivana/webpack-and-spa-guide/raw/master/assets/layout.png)

布局会把 header、nav、footer 的内容填上，但 main 区域是个空的容器。这个作为入口的 html 最主要的工作是加载启动 SPA 的 js 文件，然后由 js 驱动，根据当前浏览器地址进行路由分发，加载对应的 AMD 模块，然后该 AMD 模块执行，渲染对应的 html 到页面指定的容器内（比如图中的 main）。在点击链接等交互时，页面不会跳转，而是由 js 路由加载对应的 AMD 模块，然后该 AMD 模块渲染对应的 html 到容器内。

虽然 AMD 模块让 SPA 更容易地实现，但小问题还是很多的：
* 不是所有的第三方库都是 AMD 规范的，这时候要配置 `shim`，很麻烦。
* 虽然 RequireJS 支持通过插件把 html 作为依赖加载，但 html 里面的 `<img>` 的路径是个问题，需要使用绝对路径并且保持打包后的图片路径和打包前的路径不变，或者使用 html 模板语言把 `src` 写成变量，在运行时生成。
* 不支持动态加载 css，变通的方法是把所有的 css 文件合并压缩成一个文件，在入口的 html 页面一次性加载。
* SPA 项目越做越大，一个应用打包后的 js 文件到了几 MB 的大小。虽然 [r.js](http://requirejs.org/docs/optimization.html) 支持分模块打包，但配置很麻烦，因为模块之间会互相依赖，在配置的时候需要 exclude 那些通用的依赖项，而依赖项要在文件里一个个检查。
* 所有的第三方库都要自己一个个的下载，解压，放到某个目录下，更别提更新有多麻烦了。虽然可以用 [npm](https://www.npmjs.com/) 包管理工具，但 npm 的包都是 CommonJS 规范的，给后端 Node.js 用的，只有部分支持 AMD 规范，而且在 npm 3 之前，这些包有依赖项的话也是不能用的。后来有个 [bower](https://bower.io/) 包管理工具是专门的 web 前端仓库，这里的包一般都支持 AMD 规范。
* AMD 规范定义和引用模块的语法太麻烦，上面介绍的 AMD 语法仅是最简单通用的语法，API 文档里面还有很多变异的写法，特别是当发生循环引用的时候（a 依赖 b，b 依赖 a），需要使用其他的 [语法](http://requirejs.org/docs/api.html#circular) 解决这个问题。而且 npm 上很多前后端通用的库都是 CommonJS 的语法。后来很多人又开始尝试使用 ES6 模块规范，如何引用 ES6 模块又是一个大问题。
* 项目的文件结构不合理，因为 grunt/gulp 是按照文件格式批量处理的，所以一般会把 js、html、css、图片分别放在不同的目录下，所以同一个模块的文件会散落在不同的目录下，开发的时候找文件是个麻烦的事情。code review 时想知道一个文件是哪个模块的也很麻烦，解决办法比如又要在 imgs 目录下建立按模块命名的文件夹，里面再放图片。

到了这里，我们的主角 webpack 登场了（2012 年）（此处应有掌声）。

和 webpack 差不多同期登场的还有 [Browserify](http://browserify.org/)。这里简单介绍一下 Browserify。Browserify 的目的是让前端也能用 CommonJS 的语法 `require('module')` 来加载 js。它会从入口 js 文件开始，把所有的 `require()` 调用的文件打包合并到一个文件，这样就解决了异步加载的问题。那么 Browserify 有什么不足之处导致我不推荐使用它呢? 主要原因有下面几点：
* 最主要的一点，Browserify 不支持把代码打包成多个文件，在有需要的时候加载。这就意味着访问任何一个页面都会全量加载所有文件。
* Browserify 对其他非 js 文件的加载不够完善，因为它主要解决的是 `require()` js 模块的问题，其他文件不是它关心的部分。比如 html 文件里的 img 标签，它只能转成 [Data URI](https://en.wikipedia.org/wiki/Data_URI_scheme) 的形式，而不能替换为打包后的路径。
* 因为上面一点 Browserify 对资源文件的加载支持不够完善，导致打包时一般都要配合 gulp 或 grunt 一块使用，无谓地增加了打包的难度。
* Browserify 只支持 CommonJS 模块规范，不支持 AMD 和 ES6 模块规范，这意味旧的 AMD 模块和将来的 ES6 模块不能使用。

基于以上几点，Browserify 并不是一个理想的选择。那么 webpack 是否解决了以上的几个问题呢? 废话，不然介绍它干嘛。那么下面章节我们用实战的方式来说明 webpack 是怎么解决上述的问题的。


## 上手先搞一个简单的 SPA 应用

一上来步子太大容易扯到蛋，让我们先弄个最简单的 webpack 配置来热一下身。


### 安装 Node.js

webpack 是基于我大 Node.js 的打包工具，上来第一件事自然是先安装 Node.js 了，[传送门 ->](https://nodejs.org/)。


### 初始化一个项目

我们先随便找个地方，建一个文件夹叫 `simple`， 然后在这里面搭项目。完成品在 [examples/simple](https://github.com/fenivana/webpack-and-spa-guide/blob/master/examples/simple) 目录，大家搞的时候可以参照一下。我们先看一下目录结构：

```
├── dist                      打包输出目录，只需部署这个目录到生产环境
├── package.json              项目配置信息
├── node_modules              npm 安装的依赖包都在这里面
├── src                       我们的源代码
│   ├── components            可以复用的模块放在这里面
│   ├── index.html            入口 html
│   ├── index.js              入口 js
│   ├── shared                公共函数库
│   └── views                 页面放这里
└── webpack.config.js         webpack 配置文件
```

打开命令行窗口，`cd` 到刚才建的 simple 目录。然后执行这个命令初始化项目：

```sh
npm init
```

命令行会要你输入一些配置信息，我们这里一路按回车下去，生成一个默认的项目配置文件 `package.json`。


### 给项目加上语法报错和代码规范检查

我们安装 [eslint](http://eslint.org/)， 用来检查语法报错，当我们书写 js 时，有错误的地方会出现提示。

```sh
npm install eslint eslint-config-enough babel-eslint eslint-loader --save-dev
```

`npm install` 可以一条命令同时安装多个包，包之间用空格分隔。包会被安装进 `node_modules` 目录中。

`--save-dev` 会把安装的包和版本号记录到 `package.json` 中的 `devDependencies` 对象中，还有一个 `--save`， 会记录到 `dependencies` 对象中，它们的区别，我们可以先简单的理解为打包工具和测试工具用到的包使用 `--save-dev` 存到 `devDependencies`， 比如 eslint、webpack。浏览器中执行的 js 用到的包存到 `dependencies`， 比如 jQuery 等。那么它们用来干嘛的？

因为有些 npm 包安装是需要编译的，那么导致 windows / mac /linux 上编译出的可执行文件是不同的，也就是无法通用，因此我们在提交代码到 git 上去的时候，一般都会在 `.gitignore` 里指定忽略 node_modules 目录和里面的文件，这样其他人从 git 上拉下来的项目是没有 node_modules 目录的，这时我们需要运行

```sh
npm install
```

它会读取 `package.json` 中的 `devDependencies` 和 `dependencies` 字段，把记录的包的相应版本下载下来。

这里 [eslint-config-enough](https://github.com/fenivana/eslint-config-enough) 是配置文件，它规定了代码规范，要使它生效，我们要在 `package.json` 中添加内容：

```json
{
  "eslintConfig": {
    "extends": "enough",
    "env": {
      "browser": true,
      "node": true
    }
  }
}
```

业界最有名的语法规范是 [airbnb](https://github.com/airbnb/javascript) 出品的，但它规定的太死板了，比如不允许使用 `for-of` 和 `for-in` 等。感兴趣的同学可以参照 [这里](https://www.npmjs.com/package/eslint-config-airbnb) 安装使用。

[babel-eslint](https://github.com/babel/babel-eslint) 是 `eslint-config-enough` 依赖的语法解析库，替代 eslint 默认的解析库以支持还未标准化的语法。比如 [import()](https://github.com/tc39/proposal-dynamic-import)。

[eslint-loader](https://github.com/MoOx/eslint-loader) 用于在 webpack 编译的时候检查代码，如果有错误，webpack 会报错。

项目里安装了 eslint 还没用，我们的 IDE 和编辑器也得要装 eslint 插件支持它。

[Visual Studio Code](https://code.visualstudio.com/) 需要安装 [ESLint 扩展](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

[atom](https://atom.io/) 需要安装 [linter](https://atom.io/packages/linter) 和 [linter-eslint](https://atom.io/packages/linter-eslint) 这两个插件，装好后重启生效。

[WebStorm](https://www.jetbrains.com/webstorm/) 需要在设置中打开 eslint 开关：

![WebStorm ESLint Config](https://github.com/fenivana/webpack-and-spa-guide/raw/master/assets/webstorm-eslint-config.png)


### 写几个页面

我们写一个最简单的 SPA 应用来介绍 SPA 应用的内部工作原理。首先，建立 src/index.html 文件，内容如下：

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
  </head>

  <body>
  </body>
</html>
```

它是一个空白页面，注意这里我们不需要自己写 `<script src="index.js"></script>`， 因为打包后的文件名和路径可能会变，所以我们用 webpack 插件帮我们自动加上。

src/index.js:

```js
// 引入 router
import router from './router'

// 启动 router
router.start()
```

src/router.js:

```js
// 引入页面文件
import foo from './views/foo'
import bar from './views/bar'

const routes = {
  '/foo': foo,
  '/bar': bar
}

// Router 类，用来控制页面根据当前 URL 切换
class Router {
  start() {
    // 点击浏览器后退 / 前进按钮时会触发 window.onpopstate 事件，我们在这时切换到相应页面
    // https://developer.mozilla.org/en-US/docs/Web/Events/popstate
    window.addEventListener('popstate', () => {
      this.load(location.pathname)
    })

    // 打开页面时加载当前页面
    this.load(location.pathname)
  }

  // 前往 path，变更地址栏 URL，并加载相应页面
  go(path) {
    // 变更地址栏 URL
    history.pushState({}, '', path)
    // 加载页面
    this.load(path)
  }

  // 加载 path 路径的页面
  load(path) {
    // 首页
    if (path === '/') path = '/foo'
    // 创建页面实例
    const view = new routes[path]()
    // 调用页面方法，把页面加载到 document.body 中
    view.mount(document.body)
  }
}

// 导出 router 实例
export default new Router()
```

src/views/foo/index.js:

```js
// 引入 router
import router from '../../router'

// 引入 html 模板，会被作为字符串引入
import template from './index.html'

// 引入 css, 会生成 <style> 块插入到 <head> 头中
import './style.css'

// 导出类
export default class {
  mount(container) {
    document.title = 'foo'
    container.innerHTML = template
    container.querySelector('.foo__gobar').addEventListener('click', () => {
      // 调用 router.go 方法加载 /bar 页面
      router.go('/bar')
    })
  }
}
```

src/views/bar/index.js:

```js
// 引入 router
import router from '../../router'

// 引入 html 模板，会被作为字符串引入
import template from './index.html'

// 引入 css, 会生成 <style> 块插入到 <head> 头中
import './style.css'

// 导出类
export default class {
  mount(container) {
    document.title = 'bar'
    container.innerHTML = template
    container.querySelector('.bar__gofoo').addEventListener('click', () => {
      // 调用 router.go 方法加载 /foo 页面
      router.go('/foo')
    })
  }
}
```

借助 webpack 插件，我们可以 `import` html, css 等其他格式的文件，文本类的文件会被储存为变量打包进 js 文件，其他二进制类的文件，比如图片，可以自己配置，小图片作为 [Data URI](https://en.wikipedia.org/wiki/Data_URI_scheme) 打包进 js 文件，大文件打包为单独文件，我们稍后再讲这块。

其他的 src 目录下的文件大家自己浏览，拷贝一份到自己的工作目录，等会打包时会用到。

页面代码这样就差不多搞定了，接下来我们进入 webpack 的安装和配置阶段。现在我们还没有讲 webpack 配置所以页面还无法访问，等会弄好 webpack 配置后再看页面实际效果。


### 安装 webpack 和 Babel

我们把 webpack 和它的插件安装到项目：

```sh
npm install webpack webpack-cli webpack-serve html-webpack-plugin html-loader css-loader style-loader file-loader url-loader --save-dev
```

[webpack](https://github.com/webpack/webpack) 即 webpack 核心库。它提供了很多 [API](https://webpack.js.org/api/node/), 通过 Node.js 脚本中 `require('webpack')` 的方式来使用 webpack。

[webpack-cli](https://github.com/webpack/webpack-cli) 是 webpack 的命令行工具。让我们可以不用写打包脚本，只需配置打包配置文件，然后在命令行输入 `webpack-cli --config webpack.config.js` 来使用 webpack, 简单很多。webpack 4 之前命令行工具是集成在 webpack 包中的，4.0 开始 webpack 包本身不再集成 cli。

[webpack-serve](https://github.com/webpack-contrib/webpack-serve) 是 webpack 提供的用来开发调试的服务器，让你可以用 http://127.0.0.1:8080/ 这样的 url 打开页面来调试，有了它就不用配置 [nginx](https://nginx.org/en/) 了，方便很多。

[html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin), [html-loader](https://github.com/webpack/html-loader), [css-loader](https://github.com/webpack/css-loader), [style-loader](https://github.com/webpack/style-loader) 等看名字就知道是打包 html 文件，css 文件的插件，大家在这里可能会有疑问，`html-webpack-plugin` 和 `html-loader` 有什么区别，`css-loader` 和 `style-loader` 有什么区别，我们等会看配置文件的时候再讲。

[file-loader](https://github.com/webpack/file-loader) 和 [url-loader](https://github.com/webpack/url-loader) 是打包二进制文件的插件，具体也在配置文件章节讲解。

接下来，为了能让不支持 ES6 的浏览器 （比如 IE) 也能照常运行，我们需要安装 [babel](http://babeljs.io/), 它会把我们写的 ES6 源代码转化成 ES5，这样我们源代码写 ES6，打包时生成 ES5。

```sh
npm install babel-core babel-preset-env babel-loader --save-dev
```

这里 `babel-core` 顾名思义是 babel 的核心编译器。[babel-preset-env](https://babeljs.io/docs/plugins/preset-env/) 是一个配置文件，我们可以使用这个配置文件转换 [ES2015](http://exploringjs.com/es6/)/[ES2016](https://leanpub.com/exploring-es2016-es2017/read)/[ES2017](http://www.2ality.com/2016/02/ecmascript-2017.html) 到 ES5，是的，不只 ES6 哦。babel 还有 [其他配置文件](http://babeljs.io/docs/plugins/)。

光安装了 `babel-preset-env`，在打包时是不会生效的，需要在 `package.json` 加入 `babel` 配置：

```json
{
  "babel": {
    "presets": ["env"]
  }
}
```

打包时 babel 会读取 `package.json` 中 `babel` 字段的内容，然后执行相应的转换。

[babel-loader](https://github.com/babel/babel-loader) 是 webpack 的插件，我们下面章节再说。


### 配置 webpack

包都装好了，接下来总算可以进入正题了。我们来创建 webpack 配置文件 `webpack.config.js`，注意这个文件是在 node.js 中运行的，因此不支持 ES6 的 `import` 语法。我们来看文件内容：

```js
const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const history = require('connect-history-api-fallback')
const convert = require('koa-connect')

// 使用 WEBPACK_SERVE 环境变量检测当前是否是在 webpack-server 启动的开发环境中
const dev = Boolean(process.env.WEBPACK_SERVE)

module.exports = {
  /*
  webpack 执行模式
  development：开发环境，它会在配置文件中插入调试相关的选项，比如 moduleId 使用文件路径方便调试
  production：生产环境，webpack 会将代码做压缩等优化
  */
  mode: dev ? 'development' : 'production',

  /*
  配置 source map
  开发模式下使用 cheap-module-eval-source-map, 生成的 source map 能和源码每行对应，方便打断点调试
  生产模式下使用 hidden-source-map, 生成独立的 source map 文件，并且不在 js 文件中插入 source map 路径，用于在 error report 工具中查看 （比如 Sentry)
  */
  devtool: dev ? 'cheap-module-eval-source-map' : 'hidden-source-map',

  // 配置页面入口 js 文件
  entry: './src/index.js',

  // 配置打包输出相关
  output: {
    // 打包输出目录
    path: resolve(__dirname, 'dist'),

    // 入口 js 的打包输出文件名
    filename: 'index.js'
  },

  module: {
    /*
    配置各种类型文件的加载器，称之为 loader
    webpack 当遇到 import ... 时，会调用这里配置的 loader 对引用的文件进行编译
    */
    rules: [
      {
        /*
        使用 babel 编译 ES6 / ES7 / ES8 为 ES5 代码
        使用正则表达式匹配后缀名为 .js 的文件
        */
        test: /\.js$/,

        // 排除 node_modules 目录下的文件，npm 安装的包不需要编译
        exclude: /node_modules/,

        /*
        use 指定该文件的 loader, 值可以是字符串或者数组。
        这里先使用 eslint-loader 处理，返回的结果交给 babel-loader 处理。loader 的处理顺序是从最后一个到第一个。
        eslint-loader 用来检查代码，如果有错误，编译的时候会报错。
        babel-loader 用来编译 js 文件。
        */
        use: ['babel-loader', 'eslint-loader']
      },

      {
        // 匹配 html 文件
        test: /\.html$/,
        /*
        使用 html-loader, 将 html 内容存为 js 字符串，比如当遇到
        import htmlString from './template.html';
        template.html 的文件内容会被转成一个 js 字符串，合并到 js 文件里。
        */
        use: 'html-loader'
      },

      {
        // 匹配 css 文件
        test: /\.css$/,

        /*
        先使用 css-loader 处理，返回的结果交给 style-loader 处理。
        css-loader 将 css 内容存为 js 字符串，并且会把 background, @font-face 等引用的图片，
        字体文件交给指定的 loader 打包，类似上面的 html-loader, 用什么 loader 同样在 loaders 对象中定义，等会下面就会看到。
        */
        use: ['style-loader', 'css-loader']
      },

      {
        /*
        匹配各种格式的图片和字体文件
        上面 html-loader 会把 html 中 <img> 标签的图片解析出来，文件名匹配到这里的 test 的正则表达式，
        css-loader 引用的图片和字体同样会匹配到这里的 test 条件
        */
        test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,

        /*
        使用 url-loader, 它接受一个 limit 参数，单位为字节(byte)

        当文件体积小于 limit 时，url-loader 把文件转为 Data URI 的格式内联到引用的地方
        当文件大于 limit 时，url-loader 会调用 file-loader, 把文件储存到输出目录，并把引用的文件路径改写成输出后的路径

        比如 views/foo/index.html 中
        <img src="smallpic.png">
        会被编译成
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAA...">

        而
        <img src="largepic.png">
        会被编译成
        <img src="/f78661bef717cf2cc2c2e5158f196384.png">
        */
        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000
            }
          }
        ]
      }
    ]
  },

  /*
  配置 webpack 插件
  plugin 和 loader 的区别是，loader 是在 import 时根据不同的文件名，匹配不同的 loader 对这个文件做处理，
  而 plugin, 关注的不是文件的格式，而是在编译的各个阶段，会触发不同的事件，让你可以干预每个编译阶段。
  */
  plugins: [
    /*
    html-webpack-plugin 用来打包入口 html 文件
    entry 配置的入口是 js 文件，webpack 以 js 文件为入口，遇到 import, 用配置的 loader 加载引入文件
    但作为浏览器打开的入口 html, 是引用入口 js 的文件，它在整个编译过程的外面，
    所以，我们需要 html-webpack-plugin 来打包作为入口的 html 文件
    */
    new HtmlWebpackPlugin({
      /*
      template 参数指定入口 html 文件路径，插件会把这个文件交给 webpack 去编译，
      webpack 按照正常流程，找到 loaders 中 test 条件匹配的 loader 来编译，那么这里 html-loader 就是匹配的 loader
      html-loader 编译后产生的字符串，会由 html-webpack-plugin 储存为 html 文件到输出目录，默认文件名为 index.html
      可以通过 filename 参数指定输出的文件名
      html-webpack-plugin 也可以不指定 template 参数，它会使用默认的 html 模板。
      */
      template: './src/index.html',

      /*
      因为和 webpack 4 的兼容性问题，chunksSortMode 参数需要设置为 none
      https://github.com/jantimon/html-webpack-plugin/issues/870
      */
      chunksSortMode: 'none'
    })
  ]
}

/*
配置开发时用的服务器，让你可以用 http://127.0.0.1:8080/ 这样的 url 打开页面来调试
并且带有热更新的功能，打代码时保存一下文件，浏览器会自动刷新。比 nginx 方便很多
如果是修改 css, 甚至不需要刷新页面，直接生效。这让像弹框这种需要点击交互后才会出来的东西调试起来方便很多。

因为 webpack-cli 无法正确识别 serve 选项，使用 webpack-cli 执行打包时会报错。
因此我们在这里判断一下，仅当使用 webpack-serve 时插入 serve 选项。
issue：https://github.com/webpack-contrib/webpack-serve/issues/19
*/
if (dev) {
  module.exports.serve = {
    // 配置监听端口，默认值 8080
    port: 8080,

    // add: 用来给服务器的 koa 实例注入 middleware 增加功能
    add: app => {
      /*
      配置 SPA 入口

      SPA 的入口是一个统一的 html 文件，比如
      http://localhost:8080/foo
      我们要返回给它
      http://localhost:8080/index.html
      这个文件
      */
      app.use(convert(history()))
    }
  }
}
```


### 走一个

配置 OK 了，接下来我们就运行一下吧。我们先试一下开发环境用的 `webpack-serve`:

```sh
./node_modules/.bin/webpack-serve webpack.config.js
```

执行时需要指定配置文件。

上面的命令适用于 Mac / Linux 等 * nix 系统，也适用于 Windows 上的 PowerShell 和 bash/zsh 环境（[Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/install-win10), [Git Bash](https://git-scm.com/downloads)、[Babun](http://babun.github.io/)、[MSYS2](http://msys2.github.io/) 等）。安利一下 Windows 同学使用 [Ubuntu on Windows](https://www.microsoft.com/store/p/ubuntu/9nblggh4msv6)，可以避免很多跨平台的问题，比如设置环境变量。

如果使用 Windows 的 cmd.exe，请执行：

```
node_modules\.bin\webpack-serve webpack.config.js
```

npm 会把包的可执行文件安装到 `./node_modules/.bin/` 目录下，所以我们要在这个目录下执行命令。

命令执行后，控制台显示：

```
｢wdm｣: Compiled successfully。
```

这就代表编译成功了，我们可以在浏览器打开 `http://localhost:8080/` 看看效果。如果有报错，那可能是什么地方没弄对？请自己仔细检查一下～

我们可以随意更改一下 src 目录下的源代码，保存后，浏览器里的页面应该很快会有相应变化。

要退出编译，按 `ctrl+c`。

开发环境编译试过之后，我们试试看编译生产环境的代码，命令是：

```sh
./node_modules/.bin/webpack-cli
```

不需要指定配置文件，默认读取 webpack.config.js

执行脚本的命令有点麻烦，因此，我们可以利用 npm，把命令写在 `package.json` 中：

```json
{
  "scripts": {
    "dev": "webpack-serve webpack.config.js",
    "build": "webpack-cli"
  }
}
```

`package.json` 中的 `scripts` 对象，可以用来写一些脚本命令，命令不需要前缀目录 `./node_modules/.bin/`，npm 会自动寻找该目录下的命令。我们可以执行：

```sh
npm run dev
```

来启动开发环境。

执行

```sh
npm run build
```

来打包生产环境的代码。


## 进阶配置

上面的项目虽然可以跑起来了，但有几个点我们还没有考虑到：
* 设置静态资源的 url 路径前缀
* 各个页面分开打包
* 第三方库和业务代码分开打包
* 输出的 entry 文件加上 hash
* 开发环境关闭 performance.hints
* 配置 favicon
* 开发环境允许其他电脑访问
* 打包时自定义部分参数
* webpack-serve 处理路径带后缀名的文件的特殊规则
* 代码中插入环境变量
* 简化 import 路径
* 优化 babel 编译后的代码性能
* 使用 webpack 自带的 ES6 模块处理功能
* 使用 autoprefixer 自动创建 css 的 vendor prefixes

那么，让我们在上面的配置的基础上继续完善，下面的代码我们只写出改变的部分。代码在 [examples/advanced](https://github.com/fenivana/webpack-and-spa-guide/blob/master/examples/advanced) 目录。


### 设置静态资源的 url 路径前缀

现在我们的资源文件的 url 直接在根目录，比如 `http://127.0.0.1:8080/index.js`， 这样做缓存控制和 CDN 不是很方便，因此我们给资源文件的 url 加一个前缀，比如 `http://127.0.0.1:8080/assets/index.js`. 我们来修改一下 webpack 配置：

```js
{
  output: {
    publicPath: '/assets/'
  }
}
```

`webpack-serve` 也需要修改：

```js
if (dev) {
  module.exports.serve = {
    port: 8080,
    host: '0.0.0.0',
    dev: {
      /*
      指定 webpack-dev-middleware 的 publicpath
      一般情况下与 output.publicPath 保持一致（除非 output.publicPath 使用的是相对路径）
      https://github.com/webpack/webpack-dev-middleware#publicpath
      */
      publicPath: '/assets/'
    },
    add: app => {
      app.use(convert(history({
        index: '/assets/' // index.html 文件在 /assets/ 路径下
      })))
    }
  }
}
```


### 各个页面分开打包

这样浏览器只需加载当前页面所需的代码。

webpack 可以使用异步加载文件的方式引用模块，我们使用 [async](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)/
[await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await) 和 [dynamic import](https://github.com/tc39/proposal-dynamic-import) 来实现：

src/router.js:

```js
// 将 async/await 转换成 ES5 代码后需要这个运行时库来支持
import 'regenerator-runtime/runtime'

const routes = {
  // import() 返回 promise
  '/foo': () => import('./views/foo'),
  '/bar.do': () => import('./views/bar.do')
}

class Router {
  // ...

  // 加载 path 路径的页面
  // 使用 async/await 语法
  async load(path) {
    // 首页
    if (path === '/') path = '/foo'

    // 动态加载页面
    const View = (await routes[path]()).default

    // 创建页面实例
    const view = new View()

    // 调用页面方法，把页面加载到 document.body 中
    view.mount(document.body)
  }
}
```

这样我们就不需要在开头把所有页面文件都 import 进来了。

[regenerator-runtime](https://github.com/facebook/regenerator/tree/master/packages/regenerator-runtime) 是 [regenerator](https://github.com/facebook/regenerator)
的运行时库。Babel 通过插件 [transform-regenerator](https://babeljs.io/docs/plugins/transform-regenerator) 使用 `regenerator` 将 [generator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function*) 函数和 async/await
语法转换成 ES5 语法后，需要运行时库才能正确执行。

另外因为 `import()` 还没有正式进入标准，需要使用 [syntax-dynamic-import](https://babeljs.io/docs/plugins/syntax-dynamic-import/) 来解析此语法。
我们可以安装 [babel-preset-stage-2](https://babeljs.io/docs/plugins/preset-stage-2/)，它包含了 `import()` 和其他 stage 2 的语法支持。

```sh
npm install regenerator-runtime babel-preset-stage-2 --save-dev
```

`package.json` 改一下：

```json
{
  "babel": {
    "presets": [
      "env",
      "stage-2"
    ]
  }
}
```

然后修改 webpack 配置：

```js
{
  output: {
    /*
    代码中引用的文件（js、css、图片等）会根据配置合并为一个或多个包，我们称一个包为 chunk。
    每个 chunk 包含多个 modules。无论是否是 js，webpack 都将引入的文件视为一个 module。
    chunkFilename 用来配置这个 chunk 输出的文件名。

    [chunkhash]：这个 chunk 的 hash 值，文件发生变化时该值也会变。使用 [chunkhash] 作为文件名可以防止浏览器读取旧的缓存文件。

    还有一个占位符 [id]，编译时每个 chunk 会有一个id。
    我们在这里不使用它，因为这个 id 是个递增的数字，增加或减少一个chunk，都可能导致其他 chunk 的 id 发生改变，导致缓存失效。
    */
    chunkFilename: '[chunkhash].js',
  }
}
```


### 第三方库和业务代码分开打包

这样更新业务代码时可以借助浏览器缓存，用户不需要重新下载没有发生变化的第三方库。
Webpack 4 最大的改进便是自动拆分 chunk, 如果同时满足下列条件，chunk 就会被拆分：
* 新的 chunk 能被复用，或者模块是来自 node_modules 目录
* 新的 chunk 大于 30Kb(min+gz 压缩前）
* 按需加载 chunk 的并发请求数量小于等于 5 个
* 页面初始加载时的并发请求数量小于等于 3 个

一般情况只需配置这几个参数即可：

```js
{
  plugins: [
    // ...

    /*
    使用文件路径的 hash 作为 moduleId。
    虽然我们使用 [chunkhash] 作为 chunk 的输出名，但仍然不够。
    因为 chunk 内部的每个 module 都有一个 id，webpack 默认使用递增的数字作为 moduleId。
    如果引入了一个新文件或删掉一个文件，可能会导致其他文件的 moduleId 也发生改变，
    那么受影响的 module 所在的 chunk 的 [chunkhash] 就会发生改变，导致缓存失效。
    因此使用文件路径的 hash 作为 moduleId 来避免这个问题。
    */
    new webpack.HashedModuleIdsPlugin()
  ],

  optimization: {
    /*
    上面提到 chunkFilename 指定了 chunk 打包输出的名字，那么文件名存在哪里了呢？
    它就存在引用它的文件中。这意味着一个 chunk 文件名发生改变，会导致引用这个 chunk 文件也发生改变。

    runtimeChunk 设置为 true, webpack 就会把 chunk 文件名全部存到一个单独的 chunk 中，
    这样更新一个文件只会影响到它所在的 chunk 和 runtimeChunk，避免了引用这个 chunk 的文件也发生改变。
    */
    runtimeChunk: true,

    splitChunks: {
      /*
      默认 entry 的 chunk 不会被拆分
      因为我们使用了 html-webpack-plugin 来动态插入 <script> 标签，entry 被拆成多个 chunk 也能自动被插入到 html 中，
      所以我们可以配置成 all, 把 entry chunk 也拆分了
      */
      chunks: 'all'
    }
  }
}
```

webpack 4 支持更多的手动优化，详见： https://gist.github.com/sokra/1522d586b8e5c0f5072d7565c2bee693

但正如 webpack 文档中所说，默认配置已经足够优化，在没有测试的情况下不要盲目手动优化。


### 输出的 entry 文件加上 hash

上面我们提到了 `chunkFilename` 使用 `[chunkhash]` 防止浏览器读取错误缓存，那么 entry 同样需要加上 hash。
但使用 `webpack-serve` 启动开发环境时，entry 文件是没有 `[chunkhash]` 的，用了会报错。
因此我们只在执行 `webpack-cli` 时使用 `[chunkhash]`。

```js
{
  output: {
    filename: dev ? '[name].js' : '[chunkhash].js'
  }
}
```

这里我们使用了 `[name]` 占位符。解释它之前我们先了解一下 `entry` 的完整定义:

```js
{
  entry: {
    NAME: [FILE1, FILE2, ...]
  }
}
```

我们可以定义多个 entry 文件，比如你的项目有多个 html 入口文件，每个 html 对应一个或多个 entry 文件。
然后每个 entry 可以定义由多个 module 组成，这些 module 会依次执行。
在 webpack 4 之前，这是很有用的功能，比如之前提到的第三方库和业务代码分开打包，在以前，我们需要这么配置：

```js
{
  entry {
    main: './src/index.js',
    vendor: ['jquery', 'lodash']
  }
}
```

entry 引用文件的规则和 `import` 是一样的，会寻找 `node_modules` 里的包。然后结合 `CommonsChunkPlugin` 把 vendor 定义的 module 从业务代码分离出来打包成一个单独的 chunk。
如果 entry 是一个 module，我们可以不使用数组的形式。

在 simple 项目中，我们配置了 `entry: './src/index.js'`，这是最简单的形式，转换成完整的写法就是：

```js
{
  entry: {
    main: ['./src/index.js']
  }
}
```

webpack 会给这个 entry 指定名字为 `main`。

看到这应该知道 `[name]` 的意思了吧？它就是 entry 的名字。


有人可能注意到官网文档中还有一个 `[hash]` 占位符，这个 hash 是整个编译过程产生的一个总的 hash 值，而不是单个文件的 hash 值，项目中任何一个文件的改动，都会造成这个 hash 值的改变。`[hash]` 占位符是始终存在的，但我们不希望修改一个文件导致所有输出的文件 hash 都改变，这样就无法利用浏览器缓存了。因此这个 `[hash]` 意义不大。


### 开发环境关闭 performance.hints

我们注意到运行开发环境是命令行会报一段 warning：

```
WARNING in asset size limit: The following asset(s) exceed the recommended size limit (250 kB).
This can impact web performance.
```

这是说建议每个输出的 js 文件的大小不要超过 250k。但开发环境因为包含了 sourcemap 并且代码未压缩所以一般都会超过这个大小，所以我们可以在开发环境把这个 warning 关闭。

webpack 配置中加入：

```js
{
  performance: {
    hints: dev ? false : 'warning'
  }
}
```


### 配置 favicon

在 src 目录中放一张 favicon.png，然后 `src/index.html` 的 `<head>` 中插入：

```html
<link rel="icon" type="image/png" href="favicon.png">
```

修改 webpack 配置：

```js
{
  module: {
    rules: [
      {
        test: /\.html$/,
        use: [
          {
            loader: 'html-loader',
            options: {
              /*
              html-loader 接受 attrs 参数，表示什么标签的什么属性需要调用 webpack 的 loader 进行打包。
              比如 <img> 标签的 src 属性，webpack 会把 <img> 引用的图片打包，然后 src 的属性值替换为打包后的路径。
              使用什么 loader 代码，同样是在 module.rules 定义中使用匹配的规则。

              如果 html-loader 不指定 attrs 参数，默认值是 img:src, 意味着会默认打包 <img> 标签的图片。
              这里我们加上 <link> 标签的 href 属性，用来打包入口 index.html 引入的 favicon.png 文件。
              */
              attrs: ['img:src', 'link:href']
            }
          }
        ]
      },

      {
        /*
        匹配 favicon.png
        上面的 html-loader 会把入口 index.html 引用的 favicon.png 图标文件解析出来进行打包
        打包规则就按照这里指定的 loader 执行
        */
        test: /favicon\.png$/,

        use: [
          {
            // 使用 file-loader
            loader: 'file-loader',
            options: {
              /*
              name：指定文件输出名
              [hash] 为源文件的hash值，[ext] 为后缀。
              */
              name: '[hash].[ext]'
            }
          }
        ]
      },

      // 图片文件的加载配置增加一个 exclude 参数
      {
        test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,

        // 排除 favicon.png, 因为它已经由上面的 loader 处理了。如果不排除掉，它会被这个 loader 再处理一遍
        exclude: /favicon\.png$/,

        use: [
          {
            loader: 'url-loader',
            options: {
              limit: 10000
            }
          }
        ]
      }
    ]
  }
}
```

其实 html-webpack-plugin 接受一个 `favicon` 参数，可以指定 favicon 文件路径，会自动打包插入到 html 文件中。但它有个 [bug](https://github.com/ampedandwired/html-webpack-plugin/issues/364)，打包后的文件名路径不带 hash，就算有 hash，它也是 [hash]，而不是 [chunkhash]。导致修改代码也会改变 favicon 打包输出的文件名。issue 中提到的 favicons-webpack-plugin 倒是可以用，但它依赖 PhantomJS, 非常大。


### 开发环境允许其他电脑访问

```js
const internalIp = require('internal-ip')

module.exports.serve = {
  host: '0.0.0.0',
  hot: {
    host: {
      client: internalIp.v4.sync(),
      server: '0.0.0.0'
    }
  },
  
  // ...
}
```


### 打包时自定义部分参数

在多人开发时，每个人可能需要有自己的配置，比如说 webpack-serve 监听的端口号，如果写死在 webpack 配置里，而那个端口号在某个同学的电脑上被其他进程占用了，简单粗暴的修改 `webpack.config.js` 会导致提交代码后其他同学的端口也被改掉。

还有一点就是开发环境、测试环境、生产环境的部分 webpack 配置是不同的，比如 `publicPath` 在生产环境可能要配置一个 CDN 地址。

我们在根目录建立一个文件夹 `config`，里面创建 3 个配置文件：

* default.js: 生产环境

```js
module.exports = {
  publicPath: 'http://cdn.example.com/assets/'
}
```

* dev.js: 默认开发环境

```js
module.exports = {
  publicPath: '/assets/',

  serve: {
    port: 8090
  }
}
```

* local.js: 个人本地环境，在 dev.js 基础上修改部分参数。

```js
const config = require('./dev')
config.serve.port = 8070
module.exports = config
```

`package.json` 修改 `scripts`:

```json
{
  "scripts": {
    "local": "npm run webpack-serve --config=local",
    "dev": "npm run webpack-serve --config=dev",
    "webpack-serve": "webpack-serve webpack.config.js",
    "build": "webpack-cli"
  }
}
```

webpack 配置修改：

```js
// ...
const url = require('url')

const config = require('./config/' + (process.env.npm_config_config || 'default'))

module.exports = {
  // ...
  
  output: {
    // ...
    publicPath: config.publicPath
  }
  
  // ...
}

if (dev) {
  module.exports.serve = {
    host: '0.0.0.0',
    port: config.serve.port,
    dev: {
      publicPath: config.publicPath
    },
    add: app => {
      app.use(convert(history({
        index: url.parse(config.publicPath).pathname
      })))
    }
  }
}
```

这里的关键是 `npm run` 传进来的自定义参数可以通过 `process.env.npm_config_*` 获得。参数中如果有 `-` 会被转成 `_`。

还有一点，我们不需要把自己个人用的配置文件提交到 git，所以我们在 `.gitignore` 中加入：

```
config/*
!config/default.js
!config/dev.js
```

把 `config` 目录排除掉，但是保留生产环境和 dev 默认配置文件。

可能有同学注意到了 `webpack-cli` 可以通过 [--env](https://webpack.js.org/api/cli/#environment-options) 的方式从命令行传参给脚本，遗憾的是 `webpack-cli` [不支持](https://github.com/webpack-contrib/webpack-serve#webpack-function-configs)。


### webpack-serve 处理带后缀名的文件的特殊规则

当处理带后缀名的请求时，比如 http://localhost:8080/bar.do ，`connect-history-api-fallback` 会认为它应该是一个实际存在的文件，就算找不到该文件，也不会 fallback 到 index.html，而是返回 404。但在 SPA 应用中这不是我们希望的。

幸好有一个配置选项 `disableDotRule: true` 可以禁用这个规则，使带后缀的文件当不存在时也能 fallback 到 index.html

```js
module.exports.serve = {
  // ...
  add: app => {
    app.use(convert(history({
      // ...
      disableDotRule: true,
      htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'] // 需要配合 disableDotRule 一起使用
    })))
  }
}
```


### 代码中插入环境变量

在业务代码中，有些变量在开发环境和生产环境是不同的，比如域名、后台 API 地址等。还有开发环境可能需要打印调试信息等。

我们可以使用 [DefinePlugin](https://webpack.js.org/plugins/define-plugin/) 插件在打包时往代码中插入需要的环境变量。

```js
// ...
const pkgInfo = require('./package.json')

module.exports = {
  // ...
  plugins: [
    new webpack.DefinePlugin({
      DEBUG: dev,
      VERSION: JSON.stringify(pkgInfo.version),
      CONFIG: JSON.stringify(config.runtimeConfig)
    }),
    // ...
  ]
}
```

DefinePlugin 插件的原理很简单，如果我们在代码中写：

```js
console.log(DEBUG)
```

它会做类似这样的处理：

```js
'console.log(DEBUG)'.replace('DEBUG', true)
```

最后生成：

```js
console.log(true)
```

这里有一点需要注意，像这里的 `VERSION`， 如果我们不对 `pkgInfo.version` 做 `JSON.stringify()`，

```js
console.log(VERSION)
```

然后做替换操作：

```js
'console.log(VERSION)'.replace('VERSION', '1.0.0')
```

最后生成：

```js
console.log(1.0.0)
```

这样语法就错误了。所以，我们需要 `JSON.stringify(pkgInfo.version)` 转一下变成 `'"1.0.0"'`，替换的时候才会带引号。

还有一点，webpack 打包压缩的时候，会把代码进行优化，比如：

```js
if (DEBUG) {
  console.log('debug mode')
} else {
  console.log('production mode')
}
```

会被编译成：

```js
if (false) {
  console.log('debug mode')
} else {
  console.log('production mode')
}
```

然后压缩优化为：

```js
console.log('production mode')
```


### 简化 import 路径

文件 a 引入文件 b 时，b 的路径是相对于 a 文件所在目录的。如果 a 和 b 在不同的目录，藏得又深，写起来就会很麻烦：

```js
import b from '../../../components/b'
```

为了方便，我们可以定义一个路径别名（alias）：

```js
resolve: {
  alias: {
    '~': resolve(__dirname, 'src')
  }
}
```

这样，我们可以以 `src` 目录为基础路径来 `import` 文件：

```js
import b from '~/components/b'
```

html 中的 `<img>` 标签没法使用这个别名功能，但 `html-loader` 有一个 `root` 参数，可以使 `/` 开头的文件相对于 `root` 目录解析。

```js
{
  test: /\.html$/,
  use: [
    {
      loader: 'html-loader',
      options: {
        root: resolve(__dirname, 'src'),
        attrs: ['img:src', 'link:href']
      }
    }
  ]
}
```

那么，`<img src="/favicon.png">` 就能顺利指向到 src 目录下的 favicon.png 文件，不需要关心当前文件和目标文件的相对路径。

PS: 在调试 `<img>` 标签的时候遇到一个坑，`html-loader` 会解析 `<!-- -->` 注释中的内容，之前在注释中写的

```html
<!--
大于 10kb 的图片，图片会被储存到输出目录，src 会被替换为打包后的路径
<img src="/assets/f78661bef717cf2cc2c2e5158f196384.png">
-->
```

之前因为没有加 `root` 参数，所以 `/` 开头的文件名不会被解析，加了 `root` 导致编译时报错，找不到该文件。大家记住这一点。


### 优化 babel 编译后的代码性能

babel 编译后的代码一般会造成性能损失，babel 提供了一个 [loose](http://babeljs.io/docs/plugins/preset-env/#optionsloose) 选项，使编译后的代码不需要完全遵循 ES6 规定，简化编译后的代码，提高代码执行效率：

package.json:

```json
{
  "babel": {
    "presets": [
      [
        "env",
        {
          "loose": true
        }
      ],
      "stage-2"
    ]
  }
}
```

但这么做会有兼容性的风险，可能会导致 ES6 源码理应的执行结果和编译后的 ES5 代码的实际结果并不一致。如果代码没有遇到实际的效率瓶颈，官方 [不建议](http://www.2ality.com/2015/12/babel6-loose-mode.html) 使用 `loose` 模式。


### 使用 webpack 自带的 ES6 模块处理功能

我们目前的配置，babel 会把 ES6 模块定义转为 CommonJS 定义，但 webpack 自己可以处理 `import` 和 `export`， 而且 webpack 处理 `import` 时会做代码优化，把没用到的部分代码删除掉。因此我们通过 babel 提供的 `modules: false` 选项把 ES6 模块转为 CommonJS 模块的功能给关闭掉。

package.json:

```json
{
  "babel": {
    "presets": [
      [
        "env",
        {
          "loose": true,
          "modules": false
        }
      ],
      "stage-2"
    ]
  }
}
```


### 使用 autoprefixer 自动创建 css 的 vendor prefixes

css 有一个很麻烦的问题就是比较新的 css 属性在各个浏览器里是要加前缀的，我们可以使用 [autoprefixer](https://github.com/postcss/autoprefixer) 工具自动创建这些浏览器规则，那么我们的 css 中只需要写：

```css
:fullscreen a {
    display: flex
}
```

autoprefixer 会编译成：

```css
:-webkit-full-screen a {
    display: -webkit-box;
    display: flex
}
:-moz-full-screen a {
    display: flex
}
:-ms-fullscreen a {
    display: -ms-flexbox;
    display: flex
}
:fullscreen a {
    display: -webkit-box;
    display: -ms-flexbox;
    display: flex
}
```

首先，我们用 npm 安装它：

```sh
npm install postcss-loader autoprefixer --save-dev
```

autoprefixer 是 [postcss](http://postcss.org/) 的一个插件，所以我们也要安装 postcss 的 webpack [loader](https://github.com/postcss/postcss-loader)。

修改一下 webpack 的 css rule：

```js
{
  test: /\.css$/,
  use: ['style-loader', 'css-loader', 'postcss-loader']
}
```

然后创建文件 `postcss.config.js`:

```js
module.exports = {
  plugins: [
    require('autoprefixer')()
  ]
}
```


## 使用 webpack 打包多页面应用（Multiple-Page Application）

多页面网站同样可以用 webpack 来打包，以便使用 npm 包，`import()`，`code splitting` 等好处。

MPA 意味着并没不是一个单一的 html 入口和 js 入口，而是每个页面对应一个 html 和多个 js。那么我们可以把项目结构设计为：

```
├── dist
├── package.json
├── node_modules
├── src
│   ├── components
│   ├── shared
|   ├── favicon.png
│   └── pages                 页面放这里
|       ├── foo               编译后生成 http://localhost:8080/foo.html
|       |    ├── index.html
|       |    ├── index.js
|       |    ├── style.css
|       |    └── pic.png
|       └── bar                        http://localhost:8080/bar.html
|           ├── index.html
|           ├── index.js
|           ├── style.css
|           └── baz                    http://localhost:8080/bar/baz.html
|               ├── index.html
|               ├── index.js
|               └── style.css
└── webpack.config.js
```

这里每个页面的 `index.html` 是个完整的从 `<!DOCTYPE html>` 开头到 `</html>` 结束的页面，这些文件都要用 `html-webpack-plugin` 处理。`index.js` 是每个页面的业务逻辑，作为每个页面的入口 js 配置到 `entry` 中。这里我们需要用 `glob` 库来把这些文件都筛选出来批量操作。为了使用 webpack 4 的 `optimization.splitChunks` 和 `optimization.runtimeChunk` 功能，我写了 [html-webpack-include-sibling-chunks-plugin](https://github.com/fenivana/html-webpack-include-sibling-chunks-plugin) 插件来配合使用。还要装几个插件把 css 压缩并放到 `<head>` 中。

```sh
npm install glob html-webpack-include-sibling-chunks-plugin uglifyjs-webpack-plugin mini-css-extract-plugin optimize-css-assets-webpack-plugin --save-dev
```

`webpack.config.js` 修改的地方：

```js
// ...
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const HtmlWebpackIncludeSiblingChunksPlugin = require('html-webpack-include-sibling-chunks-plugin')
const glob = require('glob')

const dev = Boolean(process.env.WEBPACK_SERVE)
const config = require('./config/' + (process.env.npm_config_config || 'default'))

const entries = glob.sync('./src/**/index.js')
const entry = {}
const htmlPlugins = []
for (const path of entries) {
  const template = path.replace('index.js', 'index.html')
  const chunkName = path.slice('./src/pages/'.length, -'/index.js'.length)
  entry[chunkName] = dev ? [path, template] : path
  htmlPlugins.push(new HtmlWebpackPlugin({
    template,
    filename: chunkName + '.html',
    chunksSortMode: 'none',
    chunks: [chunkName]
  }))
}

module.exports = {
  entry,

  output: {
    path: resolve(__dirname, 'dist'),
    // 我们不定义 publicPath，否则访问 html 时需要带上 publicPath 前缀
    filename: dev ? '[name].js' : '[chunkhash].js',
    chunkFilename: '[chunkhash].js'
  },

  optimization: {
    runtimeChunk: true,
    splitChunks: {
      chunks: 'all'
    },
    minimizer: dev ? [] : [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true
      }),
      new OptimizeCSSAssetsPlugin()
    ]
  },

  module: {
    rules: [
      // ...
      
      {
        test: /\.css$/,
        use: [dev ? 'style-loader' : MiniCssExtractPlugin.loader, 'css-loader', 'postcss-loader']
      },
      
      // ...
    ]
  },

  plugins: [
    // ...
    
    /*
    这里不使用 [chunkhash]
    因为从同一个 chunk 抽离出来的 css 共享同一个 [chunkhash]
    [contenthash] 你可以简单理解为 moduleId + content 生成的 hash
    因此一个 chunk 中的多个 module 有自己的 [contenthash]
    */
    new MiniCssExtractPlugin({
      filename: '[contenthash].css',
      chunkFilename: '[contenthash].css'
    }),

    // 必须放在html-webpack-plugin前面
    new HtmlWebpackIncludeSiblingChunksPlugin(),

    ...htmlPlugins
  ],

  // ...
}
```

`entry` 和 `htmlPlugins` 会通过遍历 pages 目录生成，比如：

entry:

```js
{
  'bar/baz': './src/pages/bar/baz/index.js',
  bar: './src/pages/bar/index.js',
  foo: './src/pages/foo/index.js'
}
```

在开发环境中，为了能够修改 html 文件后网页能够自动刷新，我们还需要把 html 文件也加入 entry 中，比如：

```js
{
  foo: ['./src/pages/foo/index.js', './src/pages/foo/index.html']
}
```

这样，当 foo 页面的 index.js 或 index.html 文件改动时，都会触发浏览器刷新该页面。虽然把 html 加入 entry 很奇怪，但放心，不会导致错误。记得不要在生产环境这么做，不然导致 chunk 文件包含了无用的 html 片段。

htmlPlugins:

```js
[
  new HtmlWebpackPlugin({
    template: './src/pages/bar/baz/index.html',
    filename: 'bar/baz.html',
    chunksSortMode: 'none',
    chunks: ['bar/baz']
  },

  new HtmlWebpackPlugin({
    template: './src/pages/bar/index.html',
    filename: 'bar.html',
    chunksSortMode: 'none',
    chunks: ['bar']
  },

  new HtmlWebpackPlugin({
    template: './src/pages/foo/index.html',
    filename: 'foo.html',
    chunksSortMode: 'none',
    chunks: ['foo']
  }
]
```

代码在 [examples/mpa](https://github.com/fenivana/webpack-and-spa-guide/blob/master/examples/mpa) 目录。


## 总结
通过这篇文章，我想大家应该学会了 webpack 的正确打开姿势。虽然我没有提及如何用 webpack 来编译 [React](https://facebook.github.io/react/) 和 [vue.js](http://vuejs.org/), 但大家可以想到，无非是安装一些 loader 和 plugin 来处理 [jsx](https://babeljs.io/docs/plugins/preset-react/) 和 [vue](http://vue-loader.vuejs.org/) 格式的文件，那时难度就不在于 webpack 了，而是代码架构组织的问题了。具体的大家自己去摸索一下。


## 版权许可
<a rel="license" href="http://creativecommons.org/licenses/by-nc/4.0/"><img alt="知识共享许可协议" style="border-width:0" src="https://i.creativecommons.org/l/by-nc/4.0/88x31.png" /></a><br/>本作品采用 <a rel="license" href="http://creativecommons.org/licenses/by-nc/4.0/">知识共享署名 - 非商业性使用 4.0 国际许可协议</a> 进行许可。
