# Single-Page Application 和 Webpack 4 入门

> webpack 更新到了4.0, 官网还没有更新文档. 因此把教程更新一下, 方便大家用起webpack 4.

![webpack](assets/webpack.png)

## 写在开头
~~先说说为什么要写这篇文章, 最初的原因是组里的小朋友们看了[webpack](https://webpack.js.org/)文档后, 表情都是这样的: 摘自webpack一篇文档的评论区)~~

![WTF](assets/wtf.jpg)

~~和这样的:~~

![You Couldn't Handle Me](assets/couldn't-handle.jpg)

~~是的, 即使是外国佬也在吐槽这文档不是人能看的. 回想起当年自己啃webpack文档的血与泪的往事, 觉得有必要整一个教程, 可以让大家看完后愉悦地搭建起一个webpack打包方案的项目.~~


官网新的[webpack](https://webpack.js.org/)文档现在写的很详细了，能看英文的小伙伴可以直接去看官网.～


可能会有人问webpack到底有什么用, 你不能上来就糊我一脸代码让我马上搞, 我照着搞了一遍结果根本没什么naizi用, 都是骗人的. 所以, 在说webpack之前, 我想先谈一下前端打包方案这几年的演进历程, 在什么场景下, 我们遇到了什么问题, 催生出了应对这些问题的工具. 了解了需求和目的之后, 你就知道什么时候webpack可以帮到你. 我希望我用完之后很爽, 你们用完之后也是.

## 先说说前端打包方案的黑暗历史
在很长的一段前端历史里, 是不存在打包这个说法的. 那个时候页面基本是纯静态的或者服务端输出的, 没有AJAX, 也没有jQuery. 那个时候的JavaScript就像个玩具, 用处大概就是在侧栏弄个时钟, 用media player放个mp3之类的脚本, 代码量不是很多, 直接放在`<script>`标签里或者弄个js文件引一下就行, 日子过得很轻松愉快.

随后的几年, 人们开始尝试在一个页面里做更多的事情. 容器的显示, 隐藏, 切换. 用css写的弹层, 图片轮播等等. 但如果一个页面内不能向服务器请求数据, 能做的事情毕竟有限的, 代码的量也能维持在页面交互逻辑范围内. 这时候很多人开始突破一个页面能做的事情的范围, 使用隐藏的iframe和flash等作为和服务器通信的桥梁, 新世界的大门慢慢地被打开, 在一个页面内和服务器进行数据交互, 意味着以前需要跳转多个页面的事情现在可以用一个页面搞定. 但由于iframe和flash技术过于tricky和复杂, 并没能得到广泛的推广.

直到Google推出Gmail的时候(2004年), 人们意识到了一个被忽略的接口, [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest), 也就是我们俗称的AJAX, 这是一个使用方便的, 兼容性良好的服务器通信接口. 从此开始, 我们的页面开始玩出各种花来了, 前端一下子出现了各种各样的库, [Prototype](http://prototypejs.org/), [Dojo](https://dojotoolkit.org/), [MooTools](http://mootools.net/), [Ext JS](https://www.sencha.com/products/extjs/), [jQuery](https://jquery.com/)... 我们开始往页面里插入各种库和插件, 我们的js文件也就爆炸了...

随着js能做的事情越来越多, 引用越来越多, 文件越来越大, 加上当时大约只有2Mbps左右的网速, 下载速度还不如3G网络, 对js文件的压缩和合并的需求越来越强烈, 当然这里面也有把代码混淆了不容易被盗用等其他因素在里面. [JSMin](http://crockford.com/javascript/jsmin), [YUI Compressor](http://yui.github.io/yuicompressor/), [Closure Compiler](https://developers.google.com/closure/compiler/), [UglifyJS](http://lisperator.net/uglifyjs/) 等js文件压缩合并工具陆陆续续诞生了. 压缩工具是有了, 但我们得要执行它, 最简单的办法呢, 就是windows上搞个bat脚本, mac/linux上搞个bash脚本, 哪几个文件要合并在一块的, 哪几个要压缩的, 发布的时候运行一下脚本, 生成压缩后的文件.

基于合并压缩技术, 项目越做越大, 问题也越来越多, 大概就是以下这些问题:
* 库和插件为了要给他人调用, 肯定要找个地方注册, 一般就是在window下申明一个全局的函数或对象. 难保哪天用的两个库在全局用同样的名字, 那就冲突了.
* 库和插件如果还依赖其他的库和插件, 就要告知使用人, 需要先引哪些依赖库, 那些依赖库也有自己的依赖库的话, 就要先引依赖库的依赖库, 以此类推...

恰好就在这个时候(2009年), 随着后端JavaScript技术的发展, 人们提出了[CommonJS](http://wiki.commonjs.org/wiki/Modules/1.1.1)的模块化规范, 大概的语法是: 如果`a.js`依赖`b.js`和`c.js`, 那么就在`a.js`的头部, 引入这些依赖文件:

```js
var b = require('./b')
var c = require('./c')
```

那么变量`b`和`c`会是什么呢? 那就是`b.js`和`c.js`导出的东西, 比如`b.js`可以这样导出:

```js
exports.square = function(num) {
  return num * num
}
```

然后就可以在`a.js`使用这个`square`方法:

```js
var n = b.square(2)
```

如果`c.js`依赖`d.js`, 导出的是一个`Number`, 那么可以这样写:

```js
var d = require('./d')
module.exports = d.PI // 假设d.PI的值是3.14159
```

那么`a.js`中的变量`c`就是数字`3.14159`, 具体的语法规范可以查看Node.js的[文档](https://nodejs.org/api/modules.html).


但是CommonJS在浏览器内并不适用. 因为`require()`的返回是同步的, 意味着有多个依赖的话需要一个一个依次下载, 堵塞了js脚本的执行. 所以人们就在CommonJS的基础上定义了[Asynchronous Module Definition (AMD)](https://github.com/amdjs/amdjs-api)规范(2011年), 使用了异步回调的语法来并行下载多个依赖项, 比如作为入口的`a.js`可以这样写:

```js
require(['./b', './c'], function(b, c) {
  var n = b.square(2)
  console.log(c) // 3.14159
})
```

相应的导出语法也是异步回调方式, 比如`c.js`依赖`d.js`, 就写成这样:

```js
define(['./d'], function(d) {
  return d.PI
})
```

可以看到, 定义一个模块是使用`define()`函数, `define()`和`require()`的区别是, `define()`必须要在回调函数中返回一个值作为导出的东西, `require()`不需要导出东西, 因此回调函数中不需要返回值, 也无法作为被依赖项被其他文件导入, 因此一般用于入口文件, 比如页面中这样加载`a.js`:

```html
<script src="js/require.js" data-main="js/a"></script>
```

以上是AMD规范的基本用法, 更详细的就不多说了(反正也淘汰了~), 有兴趣的可以看[这里](http://requirejs.org/docs/api.html).

js模块化问题基本解决了, css和html也没闲着. 什么[less](http://lesscss.org/), [sass](http://sass-lang.com/), [stylus](http://stylus-lang.com/)的css预处理器横空出世, 说能帮我们简化css的写法, 自动给你加vendor prefix. html在这期间也出现了一堆模板语言, 什么[handlebars](http://handlebarsjs.com/), [ejs](http://www.embeddedjs.com/), [jade](http://jade-lang.com/), 可以把ajax拿到的数据插入到模板中, 然后用innerHTML显示到页面上.

托AMD和CSS预处理和模板语言的福, 我们的编译脚本也洋洋洒洒写了百来行. 命令行脚本有个不好的地方, 就是windows和mac/linux是不通用的, 如果有跨平台需求的话, windows要装个可以执行bash脚本的命令行工具, 比如msys(目前最新的是[msys2](http://msys2.github.io/)), 或者使用php或python等其他语言的脚本来编写, 对于非全栈型的前端程序员来说, 写bash/php/python还是很生涩的. 因此我们需要一个简单的打包工具, 可以利用各种编译工具, 编译/压缩js, css, html, 图片等资源. 然后[Grunt](http://gruntjs.com/)产生了(2012年), 配置文件格式是我们最爱的js, 写法也很简单, 社区有非常多的插件支持各种编译, lint, 测试工具. 一年多后另一个打包工具[gulp](http://gulpjs.com/)诞生了, 扩展性更强, 采用流式处理效率更高.

依托AMD模块化编程, SPA(Single-page application)的实现方式更为简单清晰, 一个网页不再是传统的类似word文档的页面, 而是一个完整的应用程序. SPA应用有一个总的入口页面, 我们通常把它命名为`index.html`, `app.html`, `main.html`, 这个html的`<body>`一般是空的, 或者只有总的布局(layout), 比如下图:

![layout](assets/layout.png)

布局会把header, nav, footer的内容填上, 但main区域是个空的容器. 这个作为入口的html最主要的工作是加载启动SPA的js文件, 然后由js驱动, 根据当前浏览器地址进行路由分发, 加载对应的AMD模块, 然后该AMD模块执行, 渲染对应的html到页面指定的容器内(比如图中的main). 在点击链接等交互时, 页面不会跳转, 而是由js路由加载对应的AMD模块, 然后该AMD模块渲染对应的html到容器内.

虽然AMD模块让SPA更容易地实现, 但小问题还是很多的:
* 不是所有的第三方库都是AMD规范的, 这时候要配置`shim`, 很麻烦.
* 虽然RequireJS支持通过插件把html作为依赖加载, 但html里面的`<img>`的路径是个问题, 需要使用绝对路径并且保持打包后的图片路径和打包前的路径不变, 或者使用html模板语言把`src`写成变量, 在运行时生成.
* 不支持动态加载css, 变通的方法是把所有的css文件合并压缩成一个文件, 在入口的html页面一次性加载.
* SPA项目越做越大, 一个应用打包后的js文件到了几MB的大小. 虽然`r.js`支持分模块打包, 但配置很麻烦, 因为模块之间会互相依赖, 在配置的时候需要exclude那些通用的依赖项, 而依赖项要在文件里一个个检查.
* 所有的第三方库都要自己一个个的下载, 解压, 放到某个目录下, 更别提更新有多麻烦了. 虽然可以用[npm](https://www.npmjs.com/)包管理工具, 但npm的包都是CommonJS规范的, 给后端Node.js用的, 只有部分支持AMD规范, 而且在npm3.0之前, 这些包有依赖项的话也是不能用的. 后来有个[bower](https://bower.io/)包管理工具是专门的web前端仓库, 这里的包一般都支持AMD规范.
* AMD规范定义和引用模块的语法太麻烦, 上面介绍的AMD语法仅是最简单通用的语法, API文档里面还有很多变异的写法, 特别是当发生循环引用的时候(a依赖b, b依赖a), 需要使用其他的[语法](http://requirejs.org/docs/api.html#circular)解决这个问题. 而且npm上很多前后端通用的库都是CommonJS的语法. 后来很多人又开始尝试使用ES6模块规范, 如何引用ES6模块又是一个大问题.
* 项目的文件结构不合理, 因为grunt/gulp是按照文件格式批量处理的, 所以一般会把js, html, css, 图片分别放在不同的目录下, 所以同一个模块的文件会散落在不同的目录下, 开发的时候找文件是个麻烦的事情. code review时想知道一个文件是哪个模块的也很麻烦, 解决办法比如又要在imgs目录下建立按模块命名的文件夹, 里面再放图片.

到了这里, 我们的主角webpack登场了(2012年)(此处应有掌声).

和webpack差不多同期登场的还有[Browserify](http://browserify.org/). 这里简单介绍一下Browserify, Browserify的目的是让前端也能用CommonJS的语法`require('module')`来加载js. 它会从入口js文件开始, 把所有的`require()`调用的文件打包合并到一个文件, 这样就解决了异步加载的问题. 那么Browserify有什么不足之处导致我不推荐使用它呢? 主要原因有下面几点:
* 最主要的一点, Browserify不支持把代码打包成多个文件, 在有需要的时候加载. 这就意味着访问任何一个页面都会全量加载所有文件.
* Browserify对其他非js文件的加载不够完善, 因为它主要解决的是`require()`js模块的问题, 其他文件不是它关心的部分. 比如html文件里的img标签, 它只能转成[Data URI](https://en.wikipedia.org/wiki/Data_URI_scheme)的形式, 而不能替换为打包后的路径.
* 因为上面一点Browserify对资源文件的加载支持不够完善, 导致打包时一般都要配合gulp或grunt一块使用, 无谓地增加了打包的难度.
* Browserify只支持CommonJS模块规范, 不支持AMD和ES6模块规范, 这意味旧的AMD模块和将来的ES6模块不能使用.

基于以上几点, Browserify并不是一个理想的选择. 那么webpack是否解决了以上的几个问题呢? 废话, 不然介绍它干嘛. 那么下面章节我们用实战的方式来说明webpack是怎么解决上述的问题的.

## 上手先搞一个简单的SPA应用
一上来步子太大容易扯到蛋, 让我们先弄个最简单的webpack配置来热一下身.

### 安装Node.js
webpack是基于我大Node.js的打包工具, 上来第一件事自然是先安装Node.js了, [传送门->](https://nodejs.org/).

### 初始化一个项目
我们先随便找个地方, 建一个文件夹叫`simple`, 然后在这里面搭项目. 完成品在[examples/simple](examples/simple)目录, 大家搞的时候可以参照一下. 我们先看一下目录结构:

```
├── dist                      打包输出目录, 只需部署这个目录到生产环境
├── package.json              项目配置信息
├── node_modules              npm安装的依赖包都在这里面
├── src                       我们的源代码
│   ├── components            可以复用的模块放在这里面
│   ├── index.html            入口html
│   ├── index.js              入口js
│   ├── shared                公共函数库
│   └── views                 页面放这里
└── webpack.config.js         webpack配置文件
```

打开命令行窗口, `cd`到刚才建的`simple`目录. 然后执行这个命令初始化项目:

```sh
npm init
```

命令行会要你输入一些配置信息, 我们这里一路按回车下去, 生成一个默认的项目配置文件`package.json`.

### 给项目加上语法报错和代码规范检查
我们安装[eslint](http://eslint.org/), 用来检查语法报错, 当我们书写js时, 有错误的地方会出现提示.

```sh
npm install eslint eslint-config-enough eslint-loader --save-dev
```

`npm install`可以一条命令同时安装多个包, 包之间用空格分隔. 包会被安装进`node_modules`目录中.

`--save-dev`会把安装的包和版本号记录到`package.json`中的`devDependencies`对象中, 还有一个`--save`, 会记录到`dependencies`对象中, 它们的区别, 我们可以先简单的理解为打包工具和测试工具用到的包使用`--save-dev`存到`devDependencies`, 比如eslint, webpack. 浏览器中执行的js用到的包存到`dependencies`, 比如jQuery等. 那么它们用来干嘛的?

因为有些npm包安装是需要编译的, 那么导致windows/mac/linux上编译出的可执行文件是不同的, 也就是无法通用, 因此我们在提交代码到git上去的时候, 一般都会在`.gitignore`里指定忽略node_modules目录和里面的文件, 这样其他人从git上拉下来的项目是没有node_modules目录的, 这时我们需要运行

```sh
npm install
```

它会读取`package.json`中的`devDependencies`和`dependencies`字段, 把记录的包的相应版本下载下来.

这里[eslint-config-enough](https://github.com/fenivana/eslint-config-enough)是配置文件, 它规定了代码规范, 要使它生效, 我们要在`package.json`中添加内容:

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

业界最有名的语法规范是[airbnb](https://github.com/airbnb/javascript)出品的, 但它规定的太死板了, 比如不允许使用`for-of`和`for-in`等. 感兴趣的同学可以参照[这里](https://www.npmjs.com/package/eslint-config-airbnb)安装使用.

[eslint-loader](https://github.com/MoOx/eslint-loader)用于在webpack编译的时候检查代码, 如果有错误, webpack会报错.

项目里安装了eslint还没用, 我们的IDE和编辑器也得要装eslint插件支持它.

[Visual Studio Code](https://code.visualstudio.com/)需要安装[ESLint扩展](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)

[atom](https://atom.io/)需要安装[linter](https://atom.io/packages/linter)和[linter-eslint](https://atom.io/packages/linter-eslint)这两个插件, 装好后重启生效.

[WebStorm](https://www.jetbrains.com/webstorm/)需要在设置中打开eslint开关:

![WebStorm ESLint Config](assets/webstorm-eslint-config.png)


### 写几个页面
我们写一个最简单的SPA应用来介绍SPA应用的内部工作原理. 首先, 建立`src/index.html`文件, 内容如下:

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

它是一个空白页面, 注意这里我们不需要自己写`<script src="index.js"></script>`, 因为打包后的文件名和路径可能会变, 所以我们用webpack插件帮我们自动加上.

src/index.js:

```js
// 引入router
import router from './router'

// 启动router
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

// Router类, 用来控制页面根据当前URL切换
class Router {
  start() {
    // 点击浏览器后退/前进按钮时会触发window.onpopstate事件, 我们在这时切换到相应页面
    // https://developer.mozilla.org/en-US/docs/Web/Events/popstate
    window.addEventListener('popstate', () => {
      this.load(location.pathname)
    })

    // 打开页面时加载当前页面
    this.load(location.pathname)
  }

  // 前往path, 变更地址栏URL, 并加载相应页面
  go(path) {
    // 变更地址栏URL
    history.pushState({}, '', path)
    // 加载页面
    this.load(path)
  }

  // 加载path路径的页面
  load(path) {
    // 首页
    if (path === '/') path = '/foo'
    // 创建页面实例
    const view = new routes[path]()
    // 调用页面方法, 把页面加载到document.body中
    view.mount(document.body)
  }
}

// 导出router实例
export default new Router()
```

src/views/foo/index.js:

```js
// 引入router
import router from '../../router'

// 引入html模板, 会被作为字符串引入
import template from './index.html'

// 引入css, 会生成<style>块插入到<head>头中
import './style.css'

// 导出类
export default class {
  mount(container) {
    document.title = 'foo'
    container.innerHTML = template
    container.querySelector('.foo__gobar').addEventListener('click', () => {
      // 调用router.go方法加载 /bar 页面
      router.go('/bar')
    })
  }
}
```

src/views/bar/index.js:

```js
// 引入router
import router from '../../router'

// 引入html模板, 会被作为字符串引入
import template from './index.html'

// 引入css, 会生成<style>块插入到<head>头中
import './style.css'

// 导出类
export default class {
  mount(container) {
    document.title = 'bar'
    container.innerHTML = template
    container.querySelector('.bar__gofoo').addEventListener('click', () => {
      // 调用router.go方法加载 /foo 页面
      router.go('/foo')
    })
  }
}
```

借助webpack插件, 我们可以`import` html, css等其他格式的文件, 文本类的文件会被储存为变量打包进js文件, 其他二进制类的文件, 比如图片, 可以自己配置, 小图片作为[Data URI](https://en.wikipedia.org/wiki/Data_URI_scheme)打包进js文件, 大文件打包为单独文件, 我们稍后再讲这块.

其他的`src`目录下的文件大家自己浏览, 拷贝一份到自己的工作目录, 等会打包时会用到.

页面代码这样就差不多搞定了, 接下来我们进入webpack的安装和配置阶段. 现在我们还没有讲webpack配置所以页面还无法访问, 等会弄好webpack配置后再看页面实际效果.

### 安装webpack和Babel
我们把webpack和它的插件安装到项目:

```sh
npm install webpack webpack-cli webpack-serve html-webpack-plugin html-loader css-loader style-loader file-loader url-loader --save-dev
```
[webpack](https://github.com/webpack/webpack)即webpack核心库. 它提供了很多[API](https://webpack.js.org/api/node/), 通过Node.js脚本中`require('webpack')`的方式来使用webpack.
[webpack-cli](https://github.com/webpack/webpack-cli)是webpack的命令行工具. 让我们可以不用写打包脚本, 只需配置打包配置文件, 然后在命令行输入`webpack-cli --config webpack.config.js`来使用webpack, 简单很多. webpack 4之前命令行工具是集成在webpack包中的, 4.0开始webpack包本身不再集成cli.  
[webpack-serve](https://github.com/webpack-contrib/webpack-serve)是webpack提供的用来开发调试的服务器, 让你可以用 http://127.0.0.1:8080/ 这样的url打开页面来调试, 有了它就不用配置[nginx](https://nginx.org/en/)了, 方便很多.  
[html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin), [html-loader](https://github.com/webpack/html-loader), [css-loader](https://github.com/webpack/css-loader), [style-loader](https://github.com/webpack/style-loader)等看名字就知道是打包html文件, css文件的插件, 大家在这里可能会有疑问, `html-webpack-plugin`和`html-loader`有什么区别, `css-loader`和`style-loader`有什么区别, 我们等会看配置文件的时候再讲.  
[file-loader](https://github.com/webpack/file-loader)和[url-loader](https://github.com/webpack/url-loader)是打包二进制文件的插件, 具体也在配置文件章节讲解.

接下来, 为了能让不支持ES6的浏览器(比如IE)也能照常运行, 我们需要安装[babel](http://babeljs.io/), 它会把我们写的ES6源代码转化成ES5, 这样我们源代码写ES6, 打包时生成ES5.

```sh
npm install babel-core babel-preset-env babel-loader --save-dev
```

这里`babel-core`顾名思义是babel的核心编译器. [babel-preset-env](https://babeljs.io/docs/plugins/preset-env/)是一个配置文件, 我们可以使用这个配置文件转换[ES2015](http://exploringjs.com/es6/)/[ES2016](https://leanpub.com/exploring-es2016-es2017/read)/[ES2017](http://www.2ality.com/2016/02/ecmascript-2017.html)到ES5, 是的, 不只ES6哦. babel还有[其他配置文件](http://babeljs.io/docs/plugins/).  

光安装了`babel-preset-env`, 在打包时是不会生效的, 需要在`package.json`加入`babel`配置:

```json
{
  "babel": {
    "presets": ["env"]
  }
}
```

打包时babel会读取`package.json`中`babel`字段的内容, 然后执行相应的转换.  

[babel-loader](https://github.com/babel/babel-loader)是webpack的插件, 我们下面章节再说.


### 配置webpack
包都装好了, 接下来总算可以进入正题了. 我们来创建webpack配置文件`webpack.config.js`, 注意这个文件是在node.js中运行的, 因此不支持ES6的`import`语法. 我们来看文件内容:

```js
const { resolve } = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const history = require('connect-history-api-fallback')
const convert = require('koa-connect')

// 使用WEBPACK_SERVE环境变量检测当前是否是在webpack-server启动的开发环境中
const dev = Boolean(process.env.WEBPACK_SERVE)

module.exports = {
  /*
  webpack执行模式
  development: 开发环境, 它会在配置文件中插入调试相关的选项, 比如moduleId使用文件路径方便调试
  production: 生产环境, webpack会将代码做压缩等优化
  */
  mode: dev ? 'development' : 'production',

  /*
  配置source map
  开发模式下使用cheap-module-eval-source-map, 生成的source map能和源码每行对应, 方便打断点调试
  生产模式下使用hidden-source-map, 生成独立的source map文件, 并且不在js文件中插入source map路径, 用于在error report工具中查看 (比如Sentry)
  */
  devtool: dev ? 'cheap-module-eval-source-map' : 'hidden-source-map',

  // 配置页面入口js文件
  entry: './src/index.js',

  // 配置打包输出相关
  output: {
    // 打包输出目录
    path: resolve(__dirname, 'dist'),

    // 入口js的打包输出文件名
    filename: 'index.js'
  },

  module: {
    /*
    配置各种类型文件的加载器, 称之为loader
    webpack当遇到import ... 时, 会调用这里配置的loader对引用的文件进行编译
    */
    rules: [
      {
        /*
        使用babel编译ES6/ES7/ES8为ES5代码
        使用正则表达式匹配后缀名为.js的文件
        */
        test: /\.js$/,

        // 排除node_modules目录下的文件, npm安装的包不需要编译
        exclude: /node_modules/,

        /*
        use指定该文件的loader, 值可以是字符串或者数组.
        这里先使用eslint-loader处理, 返回的结果交给babel-loader处理. loader的处理顺序是从最后一个到第一个.
        eslint-loader用来检查代码, 如果有错误, 编译的时候会报错.
        babel-loader用来编译js文件.
        */
        use: ['babel-loader', 'eslint-loader']
      },

      {
        // 匹配.html文件
        test: /\.html$/,
        /*
        使用html-loader, 将html内容存为js字符串, 比如当遇到
        import htmlString from './template.html';
        template.html的文件内容会被转成一个js字符串, 合并到js文件里.
        */
        use: 'html-loader'
      },

      {
        // 匹配.css文件
        test: /\.css$/,

        /*
        先使用css-loader处理, 返回的结果交给style-loader处理.
        css-loader将css内容存为js字符串, 并且会把background, @font-face等引用的图片,
        字体文件交给指定的loader打包, 类似上面的html-loader, 用什么loader同样在loaders对象中定义, 等会下面就会看到.
        */
        use: ['style-loader', 'css-loader']
      },

      {
        /*
        匹配各种格式的图片和字体文件
        上面html-loader会把html中<img>标签的图片解析出来, 文件名匹配到这里的test的正则表达式,
        css-loader引用的图片和字体同样会匹配到这里的test条件
        */
        test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,

        /*
        使用url-loader, 它接受一个limit参数, 单位为字节(byte)

        当文件体积小于limit时, url-loader把文件转为Data URI的格式内联到引用的地方
        当文件大于limit时, url-loader会调用file-loader, 把文件储存到输出目录, 并把引用的文件路径改写成输出后的路径

        比如 views/foo/index.html中
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
  配置webpack插件
  plugin和loader的区别是, loader是在import时根据不同的文件名, 匹配不同的loader对这个文件做处理,
  而plugin, 关注的不是文件的格式, 而是在编译的各个阶段, 会触发不同的事件, 让你可以干预每个编译阶段.
  */
  plugins: [
    /*
    html-webpack-plugin用来打包入口html文件
    entry配置的入口是js文件, webpack以js文件为入口, 遇到import, 用配置的loader加载引入文件
    但作为浏览器打开的入口html, 是引用入口js的文件, 它在整个编译过程的外面,
    所以, 我们需要html-webpack-plugin来打包作为入口的html文件
    */
    new HtmlWebpackPlugin({
      /*
      template参数指定入口html文件路径, 插件会把这个文件交给webpack去编译,
      webpack按照正常流程, 找到loaders中test条件匹配的loader来编译, 那么这里html-loader就是匹配的loader
      html-loader编译后产生的字符串, 会由html-webpack-plugin储存为html文件到输出目录, 默认文件名为index.html
      可以通过filename参数指定输出的文件名
      html-webpack-plugin也可以不指定template参数, 它会使用默认的html模板.
      */
      template: './src/index.html',

      /*
      因为和webpack 4的兼容性问题, chunksSortMode参数需要设置为none
      https://github.com/jantimon/html-webpack-plugin/issues/870
      */
      chunksSortMode: 'none'
    })
  ]
}

/*
配置开发时用的服务器, 让你可以用 http://127.0.0.1:8080/ 这样的url打开页面来调试
并且带有热更新的功能, 打代码时保存一下文件, 浏览器会自动刷新. 比nginx方便很多
如果是修改css, 甚至不需要刷新页面, 直接生效. 这让像弹框这种需要点击交互后才会出来的东西调试起来方便很多.

因为webpack-cli无法正确识别serve选项, 使用webpack-cli执行打包时会报错.
因此我们在这里判断一下, 仅当使用webpack-serve时插入serve选项.
issue: https://github.com/webpack-contrib/webpack-serve/issues/19
*/
if (dev) {
  module.exports.serve = {
    // 配置监听端口, 默认值8080
    port: 8080,

    // add: 用来给服务器的koa实例注入middleware增加功能
    add: app => {
      /*
      配置SPA入口

      SPA的入口是一个统一的html文件, 比如
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
配置OK了, 接下来我们就运行一下吧. 我们先试一下开发环境用的`webpack-serve`:

```sh
./node_modules/.bin/webpack-serve webpack.config.js
```
执行时需要指定配置文件.

上面的命令适用于Mac/Linux等*nix系统, 也适用于Windows上的PowerShell和bash/zsh环境([Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/install-win10), [Git Bash](https://git-scm.com/downloads), [Babun](http://babun.github.io/), [MSYS2](http://msys2.github.io/)等). 安利一下Windows同学使用[Ubuntu on Windows](https://www.microsoft.com/store/p/ubuntu/9nblggh4msv6), 可以避免很多跨平台的问题, 比如设置环境变量.

如果使用Windows的cmd.exe, 请执行:

```
node_modules\.bin\webpack-serve webpack.config.js
```


npm会把包的可执行文件安装到`./node_modules/.bin/`目录下, 所以我们要在这个目录下执行命令.

命令执行后, 控制台显示

```
｢wdm｣: Compiled successfully.
```

这就代表编译成功了, 我们可以在浏览器打开 `http://localhost:8080/` 看看效果. 如果有报错, 那可能是什么地方没弄对? 请自己仔细检查一下~

我们可以随意更改一下src目录下的源代码, 保存后, 浏览器里的页面应该很快会有相应变化.

要退出编译, 按`ctrl+c`.

开发环境编译试过之后, 我们试试看编译生产环境的代码, 命令是:

```sh
./node_modules/.bin/webpack-cli
```
不需要制定配置文件, 默认读取webpack.config.js

执行脚本的命令有点麻烦, 因此, 我们可以利用npm, 把命令写在`package.json`中:

```json
{
  "scripts": {
    "dev": "webpack-serve webpack.config.js",
    "build": "webpack-cli"
  }
}
```

`package.json`中的`scripts`对象, 可以用来写一些脚本命令, 命令不需要前缀目录`./node_modules/.bin/`, npm会自动寻找该目录下的命令. 我们可以执行:

```sh
npm run dev
```

来启动开发环境.

执行

```sh
npm run build
```

来打包生产环境的代码.


## 进阶配置
上面的项目虽然可以跑起来了, 但有几个点我们还没有考虑到:
* 设置静态资源的url路径前缀
* 各个页面分开打包
* 输出的entry文件加上hash
* 第三方库和业务代码分开打包
* 开发环境关闭performance.hints
* 配置favicon
* 开发环境允许其他电脑访问
* 打包时自定义部分参数
* webpack-serve处理路径带后缀名的文件的特殊规则
* 代码中插入环境变量
* 简化import路径
* 优化babel编译后的代码性能
* 使用webpack自带的ES6模块处理功能
* 使用autoprefixer自动创建css的vendor prefixes

那么, 让我们在上面的配置的基础上继续完善, 下面的代码我们只写出改变的部分. 代码在[examples/advanced](examples/advanced)目录.


### 设置静态资源的url路径前缀
现在我们的资源文件的url直接在根目录, 比如`http://127.0.0.1:8080/index.js`, 这样做缓存控制和CDN不是很方便, 因此我们给资源文件的url加一个前缀, 比如 `http://127.0.0.1:8080/assets/index.js`. 我们来修改一下webpack配置:

```js
{
  output: {
    publicPath: '/assets/'
  }
}
```

`webpack-serve`也需要修改:
```js
if (dev) {
  module.exports.serve = {
    port: 8080,
    host: '0.0.0.0',
    dev: {
      /*
      指定webpack-dev-middleware的publicpath
      一般情况下与output.publicPath保持一致 (除非output.publicPath使用的是相对路径)
      https://github.com/webpack/webpack-dev-middleware#publicpath
      */
      publicPath: '/assets/'
    },
    add: app => {
      app.use(convert(history({
        index: '/assets/' // index.html文件在/assets/路径下
      })))
    }
  }
}
```


### 各个页面分开打包
这样浏览器只需加载当前页面所需的代码.

webpack可以使用异步加载文件的方式引用模块, 我们使用[async](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function)/
[await](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await)和[dynamic import](https://github.com/tc39/proposal-dynamic-import)来实现:

`src/router.js`:

```js
// 将async/await转换成ES5代码后需要这个运行时库来支持
import 'regenerator-runtime/runtime'

const routes = {
  // import()返回promise
  '/foo': () => import('./views/foo'),
  '/bar.do': () => import('./views/bar.do')
}

class Router {
  // ...

  // 加载path路径的页面
  // 使用async/await语法
  async load(path) {
    // 首页
    if (path === '/') path = '/foo'

    // 动态加载页面
    const View = (await routes[path]()).default

    // 创建页面实例
    const view = new View()

    // 调用页面方法, 把页面加载到document.body中
    view.mount(document.body)
  }
}
```

这样我们就不需要在开头把所有页面文件都import进来了.

因为`import()`还没有正式进入标准, 需要使用[babel-preset-stage-2](https://babeljs.io/docs/plugins/preset-stage-2/)来支持:

```sh
npm install babel-preset-stage-2 --save-dev
```

`package.json`改一下:

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

然后修改webpack配置:

```js
{
  output: {
    /*
    import()加载的文件会被分开打包, 我们称这个包为chunk, chunkFilename用来配置这个chunk输出的文件名.

    [chunkhash]: 这个chunk的hash值, 文件发生变化时该值也会变. 使用[chunkhash]作为文件名可以防止浏览器读取旧的缓存文件.

    还有一个占位符[id], 编译时每个chunk会有一个id. 我们在这里不使用它, 因为这个id是个递增的数字, 引入一个新的异步加载的文件或删掉一个, 都会导致其他文件的id发生改变, 导致缓存失效.
    */
    chunkFilename: '[chunkhash].js',
  }
}
```


### 输出的entry文件加上hash
上面我们提到了`chunkFilename`使用`[chunkhash]`防止浏览器读取错误缓存, 那么entry同样需要加上hash.
但使用`webpack-serve`启动开发环境时, entry文件是没有`[chunkhash]`的, 用了会报错.
因此我们只在执行`webpack-cli`时加上`[chunkhash]`

```js
{
  output: {
    /*
    entry字段配置的入口js的打包输出文件名
    [name]作为占位符, 在输出时会被替换为entry里定义的属性名, 比如这里会被替换为"index"
    [chunkhash]是打包后输出文件的hash值的占位符, 把[chunkhash]加入文件名可以防止浏览器使用缓存的过期内容,
    这里, webpack会生成以下代码插入到index.html中:
    <script type="text/javascript" src="/assets/index.d835352892e6aac768bf.js"></script>
    这里/assets/目录前缀是output.publicPath配置的

    这里是由于使用webpack-serve启动开发环境时, 是没有[chunkhash]的, 用了会报错
    因此我们不得已在使用webpack-serve启动项目时, 不在文件名中加入[chunkhash]
    */
    filename: dev ? '[name].js' : '[name].[chunkhash].js',
  }
}
```

有人可能注意到官网文档中还有一个[hash]占位符, 这个hash是整个编译过程产生的一个总的hash值, 而不是单个文件的hash值, 项目中任何一个文件的改动, 都会造成这个hash值的改变. [hash]占位符是始终存在的, 但我们不希望修改一个文件导致所有输出的文件hash都改变, 这样就无法利用浏览器缓存了. 因此这个[hash]意义不大.


### 第三方库和业务代码分开打包
这样更新业务代码时可以借助浏览器缓存, 用户不需要重新下载没有发生变化的第三方库.
Webpack 4最大的改进便是自动拆分chunk, 如果同时满足下列条件，chunk就会被拆分:
* 新的chunk能被复用, 或者模块是来自node_modules目录
* 新的chunk大于30Kb(min+gz压缩前)
* 按需加载chunk的并发请求数量小于等于5个
* 页面初始加载时的并发请求数量小于等于3个

一般情况只需配置这两个参数即可:

```js
{
  plugins: [
    // ...

    /*
    使用文件路径的hash作为moduleId
    webpack默认使用递增的数字作为moduleId, 如果引入了一个新文件或删掉一个文件, 会导致其他的文件的moduleId也发生改变,
    这样未发生改变的文件在打包后会生成新的[chunkhash], 导致缓存失效
    */
    new webpack.HashedModuleIdsPlugin()
  ],

  optimization: {
    /*
    还记得那个chunkFilename参数吗? 这个参数指定了chunk的打包输出的名字,
    我们设置为 [chunkhash].js 的格式. 那么打包时这个文件名存在哪里的呢?
    它就存在引用它的文件中. 这就意味着被引用的文件发生改变, 会导致引用的它文件也发生改变.

    runtimeChunk设置为true, webpack就会把chunk文件名全部存到一个单独的chunk中,
    这样更新一个文件只会影响到它所在的chunk和runtimeChunk, 避免了引用这个chunk的文件也发生改变.
    */
    runtimeChunk: true,

    splitChunks: {
      /*
      默认entry的chunk不会被拆分
      因为我们使用了html-webpack-plugin来动态插入<script>标签, entry被拆成多个chunk也能自动被插入到html中,
      所以我们可以配置成all, 把entry chunk也拆分了
      */
      chunks: 'all'
    }
  }
}
```

webpack 4支持更多的手动优化, 详见: https://gist.github.com/sokra/1522d586b8e5c0f5072d7565c2bee693

但正如webpack文档中所说, 默认配置已经足够优化, 在没有测试的情况下不要盲目手动优化.


### 开发环境关闭performance.hints
我们注意到运行开发环境是命令行会报一段warning:

```
WARNING in asset size limit: The following asset(s) exceed the recommended size limit (250 kB).
This can impact web performance.
...
```

这是说建议每个输出的js文件的大小不要超过250k. 但开发环境因为包含了sourcemap并且代码未压缩所以一般都会超过这个大小, 所以我们可以在开发环境把这个warning关闭.

webpack配置中加入:

```js
{
  performance: {
    hints: dev ? false : 'warning'
  }
}
```


### 配置favicon
在src目录中放一张favicon.png, 然后`src/index.html`的`<head>`中插入:

```html
<link rel="icon" type="image/png" href="favicon.png">
```

修改webpack配置:

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
              html-loader接受attrs参数, 表示什么标签的什么属性需要调用webpack的loader进行打包.
              比如<img>标签的src属性, webpack会把<img>引用的图片打包, 然后src的属性值替换为打包后的路径.
              使用什么loader代码, 同样是在module.rules定义中使用匹配的规则.

              如果html-loader不指定attrs参数, 默认值是img:src, 意味着会默认打包<img>标签的图片.
              这里我们加上<link>标签的href属性, 用来打包入口index.html引入的favicon.png文件.
              */
              attrs: ['img:src', 'link:href']
            }
          }
        ]
      },

      {
        /*
        匹配favicon.png
        上面的html-loader会把入口index.html引用的favicon.png图标文件解析出来进行打包
        打包规则就按照这里指定的loader执行
        */
        test: /favicon\.png$/,

        use: [
          {
            // 使用file-loader
            loader: 'file-loader',
            options: {
              /*
              name: 指定文件输出名
              [name]是源文件名, 不包含后缀. [ext]为后缀. [hash]为源文件的hash值,
              我们加上[hash]防止浏览器读取过期的缓存文件.
              */
              name: '[name].[hash].[ext]'
            }
          }
        ]
      },

      // 图片文件的加载配置增加一个exclude参数
      {
        test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,

        // 排除favicon.png, 因为它已经由上面的loader处理了. 如果不排除掉, 它会被这个loader再处理一遍
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

其实html-webpack-plugin接受一个`favicon`参数, 可以指定favicon文件路径, 会自动打包插入到html文件中. 但它有个[bug](https://github.com/ampedandwired/html-webpack-plugin/issues/364), 打包后的文件名路径不带hash, 就算有hash, 它也是[hash], 而不是[chunkhash], 导致修改代码也会改变favicon打包输出的文件名. issue中提到的favicons-webpack-plugin倒是可以用, 但它依赖PhantomJS, 非常大.


### 开发环境允许其他电脑访问

```js
module.exports.serve = {
  host: '0.0.0.0'
  // ...
}
```


### 打包时自定义部分参数
在多人开发时, 每个人可能需要有自己的配置, 比如说webpack-serve监听的端口号, 如果写死在webpack配置里, 而那个端口号在某个同学的电脑上被其他进程占用了, 简单粗暴的修改`webpack.config.js`会导致提交代码后其他同学的端口也被改掉.

还有一点就是开发环境/测试环境/生产环境的部分webpack配置是不同的, 比如`publicPath`在生产环境可能要配置一个CDN地址.

我们在根目录建立一个文件夹`config`, 里面创建3个配置文件:
* `default.js`: 生产环境

```js
module.exports = {
  publicPath: 'http://cdn.example.com/assets/'
}
```

* `dev.js`: 默认开发环境

```js
module.exports = {
  publicPath: '/assets/',

  serve: {
    port: 8090
  }
}
```

* `local.js`: 个人本地环境, 在dev.js基础上修改部分参数.

```js
const config = require('./dev')
config.serve.port = 8070
module.exports = config
```

`package.json`修改`scripts`:

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

webpack配置修改:

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

这里的关键是`npm run`传进来的自定义参数可以通过`process.env.npm_config_*`获得. 参数中如果有`-`会被转成`_`

还有一点, 我们不需要把自己个人用的配置文件提交到git, 所以我们在.gitignore中加入:

```
config/*
!config/default.js
!config/dev.js
```

把`config`目录排除掉, 但是保留生产环境和dev默认配置文件.

可能有同学注意到了`webpack-cli`可以通过[--env](https://webpack.js.org/api/cli/#environment-options)的方式从命令行传参给脚本,
遗憾的是`webpack-cli`[不支持](https://github.com/webpack-contrib/webpack-serve#webpack-function-configs).

### webpack-serve处理带后缀名的文件的特殊规则
当处理带后缀名的请求时, 比如 http://localhost:8080/bar.do , `connect-history-api-fallback`会认为它应该是一个实际存在的文件, 就算找不到该文件,
也不会fallback到index.html, 而是返回404. 但在SPA应用中这不是我们希望的.
幸好有一个配置选项`disableDotRule: true`可以禁用这个规则, 使带后缀的文件当不存在时也能fallback到index.html

```js
module.exports.serve = {
  // ...
  add: app => {
    app.use(convert(history({
      // ...
      disableDotRule: true,
      htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'] // 需要配合disableDotRule一起使用
    })))
  }
}
```

### 代码中插入环境变量
在业务代码中, 有些变量在开发环境和生产环境是不同的, 比如域名, 后台API地址等. 还有开发环境可能需要打印调试信息等.

我们可以使用[DefinePlugin](https://webpack.js.org/plugins/define-plugin/)插件在打包时往代码中插入需要的环境变量

```js
// ...
const pkgInfo = require('./package.json')

module.exports = {
  // ...
  plugins: [
    // ...
    new webpack.DefinePlugin({
      DEBUG: dev,
      VERSION: JSON.stringify(pkgInfo.version),
      CONFIG: JSON.stringify(config.runtimeConfig)
    })
  ]
}
```

DefinePlugin插件的原理很简单, 如果我们在代码中写:

```js
console.log(DEBUG)
```

它会做类似这样的处理:

```js
'console.log(DEBUG)'.replace('DEBUG', true)
```

最后生成:

```js
console.log(true)
```

这里有一点需要注意, 像这里的`VERSION`, 如果我们不对`pkgInfo.version`做`JSON.stringify()`,

```js
console.log(VERSION)
```

然后做替换操作:

```js
'console.log(VERSION)'.replace('VERSION', '1.0.0')
```

最后生成:

```js
console.log(1.0.0)
```

这样语法就错误了. 所以, 我们需要`JSON.stringify(pkgInfo.version)`转一下变成`'"1.0.0"'`, 替换的时候才会带引号.

还有一点, webpack打包压缩的时候, 会把代码进行优化, 比如:

```js
if (DEBUG) {
  console.log('debug mode')
} else {
  console.log('production mode')
}
```

会被编译成:

```js
if (false) {
  console.log('debug mode')
} else {
  console.log('production mode')
}
```

然后压缩优化为:

```js
console.log('production mode')
```


### 简化import路径
文件a引入文件b时, b的路径是相对于a文件所在目录的. 如果a和b在不同的目录, 藏得又深, 写起来就会很麻烦:

```js
import b from '../../../components/b'
```

为了方便, 我们可以定义一个路径别名(alias):

```js
resolve: {
  alias: {
    '~': resolve(__dirname, 'src')
  }
}
```

这样, 我们可以以`src`目录为基础路径来`import`文件:

```js
import b from '~/components/b'
```

html中的`<img>`标签没法使用这个别名功能, 但`html-loader`有一个`root`参数, 可以使`/`开头的文件相对于`root`目录解析.

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

那么, `<img src="/favicon.png">`就能顺利指向到src目录下的favicon.png文件, 不需要关心当前文件和目标文件的相对路径.

PS: 在调试`<img>`标签的时候遇到一个坑, `html-loader`会解析`<!-- -->`注释中的内容, 之前在注释中写的

```html
<!--
大于10kb的图片, 图片会被储存到输出目录, src会被替换为打包后的路径
<img src="/assets/f78661bef717cf2cc2c2e5158f196384.png">
-->
```

之前因为没有加`root`参数, 所以`/`开头的文件名不会被解析, 加了`root`导致编译时报错, 找不到该文件. 大家记住这一点.


### 优化babel编译后的代码性能
babel编译后的代码一般会造成性能损失, babel提供了一个[loose](http://babeljs.io/docs/plugins/preset-env/#optionsloose)选项, 使编译后的代码不需要完全遵循ES6规定, 简化编译后的代码, 提高代码执行效率:

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

但这么做会有兼容性的风险, 可能会导致ES6源码理应的执行结果和编译后的ES5代码的实际结果并不一致. 如果代码没有遇到实际的效率瓶颈, 官方[不建议](http://www.2ality.com/2015/12/babel6-loose-mode.html)使用`loose`模式.


### 使用webpack自带的ES6模块处理功能
我们目前的配置, babel会把ES6模块定义转为CommonJS定义, 但webpack自己可以处理`import`和`export`, 而且webpack处理`import`时会做代码优化, 把没用到的部分代码删除掉. 因此我们通过babel提供的`modules: false`选项把ES6模块转为CommonJS模块的功能给关闭掉.

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

### 使用autoprefixer自动创建css的vendor prefixes
css有一个很麻烦的问题就是比较新的css属性在各个浏览器里是要加前缀的, 我们可以使用[autoprefixer](https://github.com/postcss/autoprefixer)工具自动创建这些浏览器规则, 那么我们的css中只需要写:

```css
:fullscreen a {
    display: flex
}
```

autoprefixer会编译成:

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

首先, 我们用npm安装它:

```sh
npm install postcss-loader autoprefixer --save-dev
```

autoprefixer是[postcss](http://postcss.org/)的一个插件, 所以我们也要安装postcss的webpack [loader](https://github.com/postcss/postcss-loader).

修改一下webpack的css rule:

```js
{
  test: /\.css$/,
  use: ['style-loader', 'css-loader', 'postcss-loader']
}
```

然后创建文件`postcss.config.js`:

```js
module.exports = {
  plugins: [
    require('autoprefixer')()
  ]
}
```


## 使用webpack打包多页面应用(Multiple-Page Application)
多页面网站同样可以用webpack来打包，以便使用npm包, `import()`, `code splitting`等好处.

MPA意味着并没不是一个单一的html入口和js入口, 而是每个页面对应一个html和多个js. 那么我们可以把项目结构设计为:

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
|       └── bar               http://localhost:8080/bar.html
|           ├── index.html
|           ├── index.js
|           ├── style.css
|           └── baz           http://localhost:8080/bar/baz.html
|               ├── index.html
|               ├── index.js
|               └── style.css
└── webpack.config.js
```

这里每个页面的`index.html`是个完整的从`<!DOCTYPE html>`开头到`</html>`结束的页面, 这些文件都要用`html-webpack-plugin`处理. `index.js`是每个页面的业务逻辑, 作为每个页面的入口js配置到`entry`中. 这里我们需要用`glob`库来把这些文件都筛选出来批量操作. 为了使用webpack 4的`optimization.splitChunks`和`optimization.runtimeChunk`功能, 我写了[html-webpack-include-sibling-chunks-plugin](https://github.com/fenivana/html-webpack-include-sibling-chunks-plugin)插件来配合使用.

```sh
npm install glob html-webpack-include-sibling-chunks-plugin --save-dev
```

`webpack.config.js`修改的地方:

```js
// ...
const HtmlWebpackIncludeSiblingChunksPlugin = require('html-webpack-include-sibling-chunks-plugin')
const glob = require('glob')

const entries = glob.sync('./src/**/index.js')
const entry = {}
const htmlPlugins = []
for (const path of entries) {
  const chunkName = path.slice('./src/pages/'.length, -'/index.js'.length)
  entry[chunkName] = path
  htmlPlugins.push(new HtmlWebpackPlugin({
    template: path.replace('index.js', 'index.html'),
    filename: chunkName + '.html',
    chunksSortMode: 'none',
    chunks: [chunkName]
  }))
}

module.exports = {
  entry,

  plugins: [
    ...htmlPlugins,
    new HtmlWebpackIncludeSiblingChunksPlugin(),
    // ...
  ],

  // ...
}
```

在mpa应用中, 我们不定义`publicPath`, 否则访问html时需要带上`publicPath`前缀.

代码在[examples/mpa](examples/mpa)目录.


## 总结
通过这篇文章, 我想大家应该学会了webpack的正确打开姿势. 虽然我没有提及如何用webpack来编译[React](https://facebook.github.io/react/)和[vue.js](http://vuejs.org/), 但大家可以想到, 无非是安装一些loader和plugin来处理[jsx](https://babeljs.io/docs/plugins/preset-react/)和[vue](http://vue-loader.vuejs.org/)格式的文件, 那时难度就不在于webpack了, 而是代码架构组织的问题了. 具体的大家自己去摸索一下.


## 版权许可
<a rel="license" href="http://creativecommons.org/licenses/by-nc/4.0/"><img alt="知识共享许可协议" style="border-width:0" src="https://i.creativecommons.org/l/by-nc/4.0/88x31.png" /></a><br />本作品采用<a rel="license" href="http://creativecommons.org/licenses/by-nc/4.0/">知识共享署名-非商业性使用 4.0 国际许可协议</a>进行许可.
