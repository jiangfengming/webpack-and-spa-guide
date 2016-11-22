# webpack 2 打包实战

![webpack](assets/webpack.png)

## 写在开头
先说说为什么要写这篇文章, 最初的原因是组里的小朋友们看了[webpack](http://webpack.github.io/)文档后,
表情都是这样的: (摘自webpack[一篇文档](http://webpack.github.io/docs/usage.html)的评论区)

![WTF](assets/wtf.jpg)

和这样的:

![You Couldn't Handle Me](assets/couldn't-handle.jpg)

是的, 即使是外国佬也在吐槽这文档不是人能看的. 回想起当年自己啃webpack文档的血与泪的往事,
觉得有必要整一个教程, 可以让大家看完后愉悦地搭建起一个webpack打包方案的项目.

可能会有人问webpack到底有什么用, 你不能上来就糊我一脸代码让我马上搞, 我照着搞了一遍结果根本没什么naizi用,
都是骗人的. 所以, 在说webpack之前, 我想先谈一下前端打包方案这几年的演进历程, 在什么场景下,
我们遇到了什么问题, 催生出了应对这些问题的工具. 了解了需求和目的之后, 你就知道什么时候webpack可以帮到你.
我希望我用完之后很爽，你们用完之后也是.

## 先说说前端打包方案的黑暗历史
在很长的一段前端历史里, 是不存在打包这个说法的. 那个时候页面基本是纯静态的或者服务端输出的,
没有AJAX, 也没有jQuery. 那个时候的JavaScript就像个玩具, 用处大概就是在侧栏弄个时钟,
用media player放个mp3之类的脚本, 代码量不是很多, 直接放在`<script>`标签里或者弄个js文件引一下就行,
日子过得很轻松愉快.

随后的几年, 人们开始尝试在一个页面里做更多的事情. 容器的显示, 隐藏, 切换. 用css写的弹层,
图片轮播等等. 但如果一个页面内不能向服务器请求数据, 能做的事情毕竟有限的, 代码的量也能维持在页面交互逻辑范围内.
这时候很多人开始突破一个页面能做的事情的范围, 使用隐藏的iframe和flash等作为和服务器通信的桥梁,
新世界的大门慢慢地被打开, 在一个页面内和服务器进行数据交互, 意味着以前需要跳转多个页面的事情现在可以用一个页面搞定.
但由于iframe和flash技术过于tricky和复杂, 并没能得到广泛的推广.

直到Google推出Gmail的时候(2004年), 人们意识到了一个被忽略的接口, [XMLHttpRequest](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest),
也就是我们俗称的AJAX, 这是一个使用方便的, 兼容性良好的服务器通信接口. 从此开始,
我们的页面开始玩出各种花来了, 前端一下子出现了各种各样的库, [Prototype](http://prototypejs.org/), [Dojo](https://dojotoolkit.org/), [MooTools](http://mootools.net/), [Ext JS](https://www.sencha.com/products/extjs/), [jQuery](https://jquery.com/)...
我们开始往页面里插入各种库和插件, 我们的js文件也就爆炸了...

随着js能做的事情越来越多, 引用越来越多, 文件越来越大, 加上当时大约只有2Mbps左右的网速, 下载速度还不如3G网络,
对js文件的压缩和合并的需求越来越强烈, 当然这里面也有把代码混淆了不容易被盗用等其他因素在里面. [JSMin](http://crockford.com/javascript/jsmin), [YUI Compressor](http://yui.github.io/yuicompressor/), [Closure Compiler](https://developers.google.com/closure/compiler/), [UglifyJS](http://lisperator.net/uglifyjs/)
等js文件压缩合并工具陆陆续续诞生了. 压缩工具是有了, 但我们得要执行它, 最简单的办法呢, 就是windows上搞个bat脚本,
mac/linux上搞个bash脚本, 哪几个文件要合并在一块的, 哪几个要压缩的, 发布的时候运行一下脚本,
生成压缩后的文件.

基于合并压缩技术, 项目越做越大, 问题也越来越多, 大概就是以下这些问题:
* 库和插件为了要给他人调用, 肯定要找个地方注册, 一般就是在window下申明一个全局的函数或对象.
  难保哪天用的两个库在全局用同样的名字, 那就冲突了.
* 库和插件如果还依赖其他的库和插件, 就要告知使用人, 需要先引哪些依赖库, 那些依赖库也有自己的依赖库的话,
  就要先引依赖库的依赖库, 以此类推...

恰好就在这个时候(2009年), 随着后端JavaScript技术的发展, 人们提出了[CommonJS](http://wiki.commonjs.org/wiki/Modules/1.1.1)的模块化规范, 大概的语法是: 如果`a.js`依赖`b.js`和`c.js`, 那么就在`a.js`的头部, 引入这些依赖文件:
```js
var b = require('./b');
var c = require('./c');
```
那么变量`b`和`c`会是什么呢? 那就是`b.js`和`c.js`导出的东西, 比如`b.js`可以这样导出:
```js
exports.square = function(num) {
  return num * num;
};
```
然后就可以在`a.js`使用这个`square`方法:
```js
var n = b.square(2);
```
如果`c.js`依赖`d.js`, 导出的是一个`Number`, 那么可以这样写:
```js
var d = require('./d');
module.exports = d.PI; // 假设d.PI的值是3.14159
```
那么`a.js`中的变量`c`就是数字`3.14159`;
具体的语法规范可以查看Node.js的[文档](https://nodejs.org/dist/latest-v6.x/docs/api/modules.html).


但是CommonJS在浏览器内并不适用. 因为`require()`的返回是同步的, 意味着有多个依赖的话需要一个一个依次下载,
堵塞了js脚本的执行. 所以人们就在CommonJS的基础上定义了[Asynchronous Module Definition (AMD)](https://github.com/amdjs/amdjs-api)规范(2011年), 使用了异步回调的语法来并行下载多个依赖项,
比如作为入口的`a.js`可以这样写:
```js
require(['./b', './c'], function(b, c) {
  var n = b.square(2);
  console.log(c); // 3.14159
});
```
相应的导出语法也是异步回调方式, 比如`c.js`依赖`d.js`, 就写成这样:
```js
define(['./d'], function(d) {
  return d.PI;
});
```
可以看到, 定义一个模块是使用`define()`函数, `define()`和`require()`的区别是,
`define()`必须要在回调函数中返回一个值作为导出的东西, `require()`不需要导出东西,
因此回调函数中不需要返回值, 也无法作为被依赖项被其他文件导入, 因此一般用于入口文件, 比如页面中这样加载`a.js`:
```html
<script src="js/require.js" data-main="js/a"></script>
```
以上是AMD规范的基本用法, 更详细的就不多说了(反正也淘汰了~), 有兴趣的可以看[这里](http://requirejs.org/docs/api.html).

js模块化问题基本解决了, css和html也没闲着. 什么[less](http://lesscss.org/),
[sass](http://sass-lang.com/), [stylus](http://stylus-lang.com/)的css预处理器横空出世,
说能帮我们简化css的写法, 自动给你加vendor prefix. html在这期间也出现了一堆模板语言,
什么[handlebars](http://handlebarsjs.com/), [ejs](http://www.embeddedjs.com/),
[jade](http://jade-lang.com/), 可以把ajax拿到的数据插入到模板中, 然后用innerHTML显示到页面上.

托AMD和CSS预处理和模板语言的福, 我们的编译脚本也洋洋洒洒写了百来行. 命令行脚本有个不好的地方,
就是windows和mac/linux是不通用的, 如果有跨平台需求的话, windows要装个可以执行bash脚本的命令行工具,
比如msys(目前最新的是[msys2](http://msys2.github.io/)), 或者使用php或python等其他语言的脚本来编写,
对于非全栈型的前端程序员来说, 写bash/php/python还是很生涩的. 因此我们需要一个简单的打包工具,
可以利用各种编译工具, 编译/压缩js, css, html, 图片等资源. 然后[Grunt](http://gruntjs.com/)产生了(2012年),
配置文件格式是我们最爱的js, 写法也很简单, 社区有非常多的插件支持各种编译, lint, 测试工具.
一年多后另一个打包工具[gulp](http://gulpjs.com/)诞生了, 扩展性更强, 采用流式处理效率更高.

依托AMD模块化编程, SPA(Single-page application)的实现方式更为简单清晰, 一个网页不再是传统的类似word文档的页面,
而是一个完整的应用程序. SPA应用有一个总的入口页面, 我们通常把它命名为`index.html`,
`app.html`, `main.html`, 这个html的`<body>`一般是空的, 或者只有总的布局(layout), 比如下图:

![layout](assets/layout.png)

布局会把header, nav, footer的内容填上, 但main区域是个空的容器. 这个作为入口的html最主要的工作是加载启动SPA的js文件,
然后由js驱动, 根据当前浏览器地址进行路由分发, 加载对应的AMD模块, 然后该AMD模块执行, 渲染对应的html到页面指定的容器内(比如图中的main).
在点击链接等交互时, 页面不会跳转, 而是由js路由加载对应的AMD模块, 然后该AMD模块渲染对应的html到容器内.

虽然AMD模块让SPA更容易地实现, 但小问题还是很多的:
* 不是所有的第三方库都是AMD规范的, 这时候要配置`shim`, 很麻烦.
* 虽然RequireJS支持插件的形式通过把html作为依赖加载, 但html里面的`<img>`的路径是个问题,
  需要使用绝对路径并且保持打包后的图片路径和打包前的路径不变, 或者使用html模板语言把`src`写成变量,
  在运行时生成.
* 不支持动态加载css, 变通的方法是把所有的css文件合并压缩成一个文件, 在入口的html页面一次性加载.
* SPA项目越做越大, 一个应用打包后的js文件到了几MB的大小. 虽然`r.js`支持分模块打包, 但配置很麻烦,
  因为模块之间会互相依赖, 在配置的时候需要exclude那些通用的依赖项, 而依赖项要在文件里一个个检查.
* 所有的第三方库都要自己一个个的下载, 解压, 放到某个目录下, 更别提更新有多麻烦了.
  虽然可以用[npm](https://www.npmjs.com/)包管理工具, 但npm的包都是CommonJS规范的,
  给后端Node.js用的, 只有部分支持AMD规范, 而且在npm3.0之前, 这些包有依赖项的话也是不能用的.
  后来有个[bower](https://bower.io/)包管理工具是专门的web前端仓库, 这里的包一般都支持AMD规范.
* AMD规范定义和引用模块的语法太麻烦, 上面介绍的AMD语法仅是最简单通用的语法, API文档里面还有很多变异的写法,
  特别是当发生循环引用的时候(a依赖b, b依赖a), 需要使用其他的[语法](http://requirejs.org/docs/api.html#circular)解决这个问题.
  而且npm上很多前后端通用的库都是CommonJS的语法. 后来很多人又开始尝试使用ES6模块规范, 如何引用ES6模块又是一个大问题.
* 项目的文件结构不合理, 因为grunt/gulp是按照文件格式批量处理的, 所以一般会把js, html, css,
  图片分别放在不同的目录下, 所以同一个模块的文件会散落在不同的目录下, 开发的时候找文件是个麻烦的事情.
  code review时想知道一个文件是哪个模块的也很麻烦, 解决办法比如又要在imgs目录下建立按模块命名的文件夹,
  里面再放图片.

到了这里, 我们的主角webpack登场了(2012年)(此处应有掌声).

和webpack差不多同期登场的还有[Browserify](http://browserify.org/). 这里简单介绍一下Browserify,
Browserify的目的是让前端也能用CommonJS的语法`require('module')`来加载js. 它会从入口js文件开始,
把所有的`require()`调用的文件打包合并到一个文件, 这样就解决了异步加载的问题.
那么Browserify有什么不足之处导致我不推荐使用它呢? 主要原因有下面几点:
* 最主要的一点, Browserify不支持把代码打包成多个文件, 在有需要的时候加载.
  这就意味着访问任何一个页面都会全量加载所有文件.
* Browserify对其他非js文件的加载不够完善, 因为它主要解决的是`require()`js模块的问题,
  其他文件不是它关心的部分. 比如html文件里的img标签, 它只能转成[Data URI](https://en.wikipedia.org/wiki/Data_URI_scheme)的形式, 而不能替换为打包后的路径.
* 因为上面一点Browserify对资源文件的加载支持不够完善, 导致打包时一般都要配合gulp或grunt一块使用,
  无谓地增加了打包的难度.
* Browserify只支持CommonJS模块规范, 不支持AMD和ES6模块规范, 这意味旧的AMD模块和将来的ES6模块不能使用.

基于以上几点, Browserify并不是一个理想的选择. 那么webpack是否解决了以上的几个问题呢? 废话,
不然介绍它干嘛. 那么下面章节我们用实战的方式来说明webpack是怎么解决上述的问题的.

## 上手先搞一个简单的SPA应用
一上来步子太大容易扯到蛋, 让我们先弄个最简单的webpack配置来热一下身.

### 安装Node.js
webpack是基于我大Node.js的打包工具, 上来第一件事自然是先安装Node.js了, [传送门->](https://nodejs.org/).

### 初始化一个项目
我们先随便找个地方, 建一个文件夹叫`simple`, 然后在这里面搭项目. 完成品在[examples/simple](examples/simple)目录,
大家搞的时候可以参照一下. 我们先看一下目录结构:
```
├── dist                      打包输出目录, 只需部署这个目录到生产环境
├── package.json              项目配置信息
├── node_modules              npm安装的依赖包都在这里面
├── src                       我们的源代码
│   ├── components            可以复用的模块放在这里面
│   ├── index.html            入口html
│   ├── index.js              入口js
│   ├── libs                  不在npm和git上的库扔这里
│   └── views                 页面放这里
└── webpack.config.babel.js   webpack配置文件
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

`--save-dev`会把安装的包和版本号记录到`package.json`中的`devDependencies`对象中,
还有一个`--save`, 会记录到`dependencies`对象中, 它们的区别, 我们可以先简单的理解为打包工具和测试工具用到的包使用`--save-dev`存到`devDependencies`, 比如eslint, webpack. 浏览器中执行的js用到的包存到`dependencies`, 比如jQuery等.
那么它们用来干嘛的?
因为有些npm包安装是需要编译的, 那么导致windows/mac/linux上编译出的二进制是不同的, 也就是无法通用,
因此我们在提交代码到git上去的时候, 一般都会在`.gitignore`里指定忽略node_modules目录和里面的文件,
这样其他人从git上拉下来的项目是没有node_modules目录的, 这时我们需要运行
```sh
npm install
```
它会读取`package.json`中的`devDependencies`和`dependencies`字段, 把记录的包的相应版本下载下来.


这里[eslint-config-enough](https://github.com/fenivana/eslint-config-enough)是配置文件,
它规定了代码规范, 要使它生效, 我们要在`package.json`中添加内容:
```json
{
  "name": "simple",
  "version": "1.0.0",

  "eslintConfig": {
    "extends": "enough",
    "env": {
      "browser": true,
      "commonjs": true
    }
  }
}

```
业界最有名的语法规范是[airbnb](https://github.com/airbnb/javascript)出品的, 但它规定的太死板了,
比如不允许使用`for-of`和`for-in`等. 感兴趣的同学可以参照[这里](https://www.npmjs.com/package/eslint-config-airbnb)安装使用.

项目里安装了eslint还没用, 我们的IDE和编辑器也得要装eslint插件支持它. [atom](https://atom.io/)需要安装[linter](https://atom.io/packages/linter)和[linter-eslint](https://atom.io/packages/linter-eslint)这两个插件,
装好后重启生效. [WebStorm](https://www.jetbrains.com/webstorm/)需要在设置中打开eslint开关:

![WebStorm ESLint Config](assets/webstorm-eslint-config.png)

[eslint-loader](https://github.com/MoOx/eslint-loader)用于在webpack编译的时候检查代码,
如果有错误, webpack会报错.

### 写几个页面
我们写一个最简单的SPA应用来介绍SPA应用的内部工作原理.
首先, 建立`src/index.html`文件, 内容如下:
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width">
    <meta name="format-detection" content="telephone=no">
  </head>

  <body>
  </body>
</html>
```
它是一个空白页面, 注意这里我们不需要自己写`<script src="index.js"></script>`, 因为打包后的文件名和路径可能会变,
所以我们用webpack插件帮我们自动加上.

然后重点是`src/index.js`:
```js
// 引入作为全局对象储存空间的global.js, js文件可以省略后缀
import global from './global';

// Router类, 用来控制页面根据当前URL切换
class Router {
  start() {
    // 点击浏览器后退/前进按钮时会触发window.onpopstate事件, 我们在这时切换到相应页面
    // https://developer.mozilla.org/en-US/docs/Web/Events/popstate
    window.addEventListener('popstate', () => {
      this.load(location.pathname);
    });

    // 打开页面时加载当前页面
    this.load(location.pathname);
  }

  // 前往path, 会变更地址栏URL, 并加载相应页面
  go(path) {
    // 变更地址栏URL
    history.pushState({}, '', path);
    // 加载页面
    this.load(path);
  }

  // 加载path路径的页面
  load(path) {
    // 使用System.import将加载的js文件分开打包, 这样实现了仅加载访问的页面
    // https://gist.github.com/sokra/27b24881210b56bbaff7#code-splitting-with-es6
    // http://webpack.github.io/docs/code-splitting.html
    System.import('./views' + path + '/index.js').then(module => {
      // 加载的js文件通过 export default ... 导出的东西会被赋值为module.default
      const View = module.default;
      // 创建页面实例
      const view = new View();
      // 调用页面方法, 把页面加载到document.body中
      view.mount(document.body);
    });
  }
}

// new一个路由对象, 赋值为global.router, 这样我们在其他js文件中可以引用到
global.router = new Router();
// 启动
global.router.start();
```
[window.onpopstate](https://developer.mozilla.org/en-US/docs/Web/Events/popstate)和[System.import()](https://gist.github.com/sokra/27b24881210b56bbaff7#code-splitting-with-es6)构成了SPA路由控制的核心.

现在我们还没有讲webpack配置所以页面还无法访问, 我们先从理论上讲解一下, 等会弄好webpack配置后再实际看页面效果.
当我们访问 `http://localhost:8010/foo` 的时候, 路由会加载 `./views/foo/index.js`文件, 我们来看看这个文件:
```js
// 引入全局对象
import global from '../../global';

// 引入html模板, 会被作为字符串引入
import template from './index.html';

// 引入css, 会生成<style>块插入到<head>头中
import './style.css';

// 导出类
export default class {
  mount(container) {
    document.title = 'foo';
    container.innerHTML = template;
    container.querySelector('.foo__gobar').addEventListener('click', () => {
      // 调用router.go方法加载 /bar 页面
      global.router.go('/bar');
    });
  }
}
```
借助webpack插件, 我们可以`import` html, css等其他格式的文件, 文本类的文件会被储存为变量打包进js文件,
其他二进制类的文件, 比如图片, 可以自己配置, 小图片作为[Data URI](https://en.wikipedia.org/wiki/Data_URI_scheme)打包进js文件,
大文件打包为单独文件, 我们稍后再讲这块.

其他的`src`目录下的文件大家自己浏览, 拷贝一份到自己的工作目录, 等会打包时会用到.

页面代码这样就差不多搞定了, 接下来我们进入webpack的安装和配置阶段.


### 安装webpack和Babel
我们把webpack和它的插件安装到项目:
```sh
npm install webpack@2.1.0-beta.26 webpack-dev-server@2.1.0-beta.9 html-webpack-plugin html-loader css-loader style-loader file-loader url-loader --save-dev
```
这里, 我们用`@2.1.0-beta.26`指定了webpack版本号,
因为2还在beta, 不指定的话默认会装1. 因为2基本没问题了, 所以就没必要教大家用1了.
那么怎么知道最新的beta版本是哪个呢? 执行下面命令查看:
```sh
npm show webpack versions --json
```
最后一个就是了.

[webpack-dev-server](https://webpack.github.io/docs/webpack-dev-server.html)是webpack提供的用来开发调试的服务器, 让你可以用 http://127.0.0.1:8080/ 这样的url打开页面来调试,
有了它就不用配置[nginx](https://nginx.org/en/)了, 方便很多.

[html-webpack-plugin](https://github.com/ampedandwired/html-webpack-plugin),
[html-loader](https://github.com/webpack/html-loader),
[css-loader](https://github.com/webpack/css-loader),
[style-loader](https://github.com/webpack/style-loader)等看名字就知道是打包html文件, css文件的插件,
大家在这里可能会有疑问, `html-webpack-plugin`和`html-loader`有什么区别, `css-loader`和`style-loader`有什么区别,
我们等会看配置文件的时候再讲.

[file-loader](https://github.com/webpack/file-loader)和[url-loader](https://github.com/webpack/url-loader)是打包二进制文件的插件, 具体也在配置文件章节讲解.

接下来, 为了能让不支持ES6的浏览器(比如IE)也能照常运行, 我们需要安装[babel](http://babeljs.io/),
它会把我们写的ES6源代码转化成ES5, 这样我们源代码写ES6, 打包时生成ES5.
```sh
npm install babel-core babel-preset-latest babel-loader --save-dev
```
这里`babel-core`顾名思义是babel的核心编译器. [babel-preset-latest](https://babeljs.io/docs/plugins/preset-latest/)是一个配置文件, 意思是转换[ES2015](http://exploringjs.com/es6/)/[ES2016](https://leanpub.com/exploring-es2016-es2017/read)/[ES2017](http://www.2ality.com/2016/02/ecmascript-2017.html)到ES5, 是的, 不只ES6哦.
babel还有[其他配置文件](http://babeljs.io/docs/plugins/). 如果只想用ES6, 可以安装[babel-preset-es2015](https://babeljs.io/docs/plugins/preset-es2015/):
```sh
npm install babel-preset-es2015 --save-dev
```
但是光安装了`babel-preset-latest`, 在打包时是不会生效的, 需要在`package.json`加入`babel`配置:
```json
{
  "name": "simple",
  "version": "1.0.0",

  "babel": {
    "presets": [
      "latest"
    ]
  }
}
```
打包时babel会读取`package.json`中`babel`字段的内容, 然后执行相应的转换.

如果使用`babel-preset-es2015`, 这里相应的也要修改为:
```json
{
  "name": "simple",
  "version": "1.0.0",

  "babel": {
    "presets": [
      "es2015"
    ]
  }
}
```

[babel-loader](https://github.com/babel/babel-loader)是webpack的插件, 我们下面章节再说.


### 配置webpack
包都装好了, 接下来, 总算可以进入正题了, 是不是有点心累...呵呵.
我们来创建webpack配置文件`webpack.config.babel.js`, 这里文件名里有`babel`, webpack会识别配置文件里的ES6语法.
我们来看文件内容:
```js
// 导入html-webpack-plugin
import HtmlWebpackPlugin from 'html-webpack-plugin';

/*
导出一个函数, webpack会执行该函数, 把函数返回结果作为配置对象
函数接受一个类型为对象的参数. 当我们在命令行中执行:
webpack --env.dev --env.server localhost
该参数为 { dev: true, server: 'localhost' }
该参数对 webpack-dev-server 命令同样有效
*/
export default function(options = {}) {
  // 返回配置对象给webpack
  return {
    // 配置页面入口js文件
    entry: {
      // 属性名index用来和下面的output.filename配合使用
      index: './src/index.js'
    },

    // 配置打包输出相关
    output: {
      // 打包输出目录
      path: __dirname + '/dist',

      /*
      entry字段配置的入口js的打包输出文件名
      [name]作为占位符, 在输出时会被替换为entry里配置的属性名, 比如这里会被替换为"index"
      [chunkhash]是打包后输出文件的hash值的占位符, 把?[chunkhash]跟在文件名后面可以防止浏览器使用缓存的过期内容,
      这里, webpack会生成以下代码插入到index.html中:
      <script type="text/javascript" src="/assets/index.js?d835352892e6aac768bf"></script>
      这里/assets/目录前缀是下面的publicPath配置的

      options.dev是命令行传入的参数. 这里是由于使用webpack-dev-server启动开发环境时, 是没有[chunkhash]的, 用了会报错
      因此我们不得已在使用webpack-dev-server启动项目时, 命令行跟上--env.dev参数, 当有该参数时, 不在后面跟[chunkhash]

      有人可能注意到官网文档中还有一个[hash]占位符, 这个hash是整个编译过程产生的一个总的hash值,
      它不是针对单个文件的, 并且项目中任何一个文件的改动, 甚至内容没有改变只修改了文件修改日期属性,
      都会造成这个hash值的改变. 它是始终存在的. 但我们不希望修改一个文件导致所有输出的文件hash都改变,
      这样就无法利用浏览器缓存了. 因此这个hash意义不大.
      */
      filename: options.dev ? '[name].js' : '[name].js?[chunkhash]',

      /*
      我们称每一个输出的文件为一个chunk. 使用System.import()加载的文件会被分开打包生成一个chunk,
      chunkFilename用来配置这个chunk输出的文件名.
      [id]: 编译时每个chunk会有一个id. 这里也可以用[name], 但[name]一般是空的, 此时它等于[id],
      除非使用require.ensure()指定第三个参数: http://webpack.github.io/docs/code-splitting.html#named-chunks
      因为一般没必要指定name, 而且System.import()不支持. 所以就没什么意义了.
      */
      chunkFilename: '[id].js?[chunkhash]',

      /*
      浏览器引用文件时的路径前缀, 不包含域名
      比如, 如果域名是www.example.com, publicPath为 /assets/, 那么我们可以通过
      http://www.example.com/assets/index.js?d835352892e6aac768bf
      访问入口js文件
      */
      publicPath: '/assets/'
    },

    module: {
      /*
      配置各种类型文件的加载器, 称之为loader
      webpack当遇到import ... 和 System.import() 时, 会调用这里配置的loader对引用的文件进行编译
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
          先使用eslint-loader处理, 返回的结果交给babel-loader处理. loader的处理顺序是从最后一个到第一个.
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
          use: 'html-loader',
          // loader可以接受参数, 接受什么参数由各个loader自己定义
          options: {
            /*
            html-loader接受attrs参数, 表示什么标签的什么属性需要调用webpack的loader进行打包
            比如这里<img>标签的src属性, webpack会把<img>引用的图片打包, 然后src的属性值替换为打包后的路径

            <link>标签的href属性, 我们用来打包入口index.html引入的favicon.png文件.
            反应快的同学可能会问作为入口的html并没有任何js去import它, 而且转成js字符串了也没法用浏览器打开啊?
            是的, 入口html的处理有点特殊, 我们在下面的plugins段落详细介绍

            那么这些资源文件的打包用什么loader处理呢? 同样是在loaders配置中指定, 我们会在下面看到.
            如果html-loader不指定attrs参数, 默认值是img:src, 意味着会默认打包<img>标签的图片
            */
            attrs: ['img:src', 'link:href']
          }
          /*
          options也可以直接跟在loader后面书写, 比如:
          use: 'html?attrs[]=img:src&attrs[]=link:href'
          attrs后面跟[]代表这是一个数组
          但这样写比较难阅读, 所以我们这里用options对象的方式书写
          */
        },

        {
          // 匹配.css文件
          test: /\.css$/,

          /*
          先使用css-loader处理, 返回的结果交给style-loader处理.
          css-loader将css内容存为js字符串, 并且会把background, @font-face等引用的图片, 字体文件交给指定的loader打包, 类似上面的html-loader, 用什么loader同样在loaders对象中定义, 等会下面就会看到.
          */
          use: ['style-loader', 'css-loader']
        },

        {
          /*
          匹配favicon.png
          上面的html-loader会把入口index.html引用的favicon.png图标文件解析出来进行打包
          打包规则就按照这里指定的loader执行
          */
          test: /favicon\.png$/,

          /*
          使用file-loader加载, file-loader会把文件储存到输出目录, 然后返回输出的文件名, 用来替换源代码的文件名
          比如源代码中我们写
          <link rel="icon" type="image/png" href="favicon.png">
          打包后会变成
          <link rel=icon type=image/png href=/assets/favicon.png?f96884e742967916230673fb715ed750>
          可以去掉的双引号也没去掉了.

          file-loader接受一个叫name的参数, 定义输出的文件名.
          [name]是源文件名, 不包含后缀. [ext]为后缀. [hash]为源文件的hash值,
          这里我们保持文件名, 在后面跟上hash, 防止浏览器读取过期的缓存文件.
          */
          use: 'file-loader',
          options: {
            name: '[name].[ext]?[hash]'
          }
        },

        {
          /*
          匹配各种格式的图片和字体文件
          上面html-loader会把html中<img>标签的图片解析出来, 文件名匹配到这里的test的正则表达式,
          css-loader引用的图片和字体同样会匹配到这里的test条件
          */
          test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,

          // 排除favicon.png, 因为它已经由上面的loader处理了. 如果不排除掉, 它会被这个loader再处理一遍
          exclude: /favicon\.png$/,

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
          <img src="/assets/f78661bef717cf2cc2c2e5158f196384.png">
          */
          use: 'url-loader',
          options: {
            limit: 10000
          }
        }
      ]
    },

    /*
    配置webpack插件
    plugin和loader的区别是, loader是在import时根据不同的文件名, 匹配不同的loader对这个文件做处理,
    而plugin, 关注的不是文件的格式, 而是在编译的各个阶段, 会触发不同的事件, 让你可以干预每个编译阶段,
    比如, 当编译完成时, 在控制台输出自定义的编译结果
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

        html-webpack-plugin也可以不指定template参数, 它会使用默认的模板html.
        还有favicon参数指定favicon文件路径, 会自动打包插入到html文件中.
        但这些参数一般无法满足实际需求, 比如移动端的特殊meta字段和不同尺寸的favicon等, 因此不如还是自己写一个html
        */
        template: 'src/index.html'
      })
    ],

    /*
    配置开发时用的服务器, 让你可以用 http://127.0.0.1:8080/ 这样的url打开页面来调试
    并且带有热更新的功能, 打代码时保存一下文件, 浏览器会自动刷新. 比nginx方便很多
    如果是修改css, 甚至不需要刷新页面, 直接生效. 这让像弹框这种需要点击交互后才会出来的东西调试起来方便很多.
    */
    devServer: {
      // 配置监听端口, 因为8080很常用, 为了避免和其他程序冲突, 我们配个其他的端口号
      port: 8010,

      /*
      historyApiFallback用来配置页面的重定向

      SPA的入口是一个统一的html文件, 比如
      http://localhost:8010/foo
      我们要返回给它
      http://localhost:8010/assets/index.html
      这个文件
      */
      historyApiFallback: {
        /*
        index参数, 指定了当访问的文件不存在时, 返回指定目录下的index.html文件
        这里配置为返回 /assets/index.html
        */
        index: '/assets/'
      }
    }
  };
}
```


### 走一个
配置OK了, 接下来我们就运行一下吧. 我们先试一下开发环境用的webpack-dev-server:
```sh
./node_modules/.bin/webpack-dev-server -d --hot --env.dev
```
npm会把包的可执行文件安装到`./node_modules/.bin/`目录下, 所以我们要在这个目录下执行命令.

`-d`参数是开发环境(Development)的意思, 它会在我们的配置文件中插入调试相关的选项, 比如打开debug,
打开sourceMap, 代码中插入源文件路径注释.

`--hot`开启热更新功能, 参数会帮我们往配置里添加`HotModuleReplacementPlugin`插件, 虽然可以在配置里自己写,
但有点麻烦, 用命令行参数方便很多.

`--env.dev`是我们自定义的参数, 在配置文件中
```
filename: options.dev ? '[name].js' : '[name].js?[chunkhash]'
```
这个地方会根据是否是开发环境用不同的filename.

命令执行后, 控制台的最后一行应该是
```
webpack: bundle is now VALID.
```
这就代表编译成功了, 我们可以在浏览器打开 `http://localhost:8010/foo` 看看效果.
如果有报错, 那可能是什么地方没弄对? 请自己仔细检查一下~

我们可以随意更改一下src目录下的源代码, 保存后, 浏览器里的页面应该很快会有相应变化.

要退出编译, 按`ctrl+c`.

开发环境编译试过之后, 我们试试看编译生产环境的代码, 命令是:
```sh
./node_modules/.bin/webpack -p
```
`-p`参数会开启生产环境模式, 这个模式下webpack会将代码做压缩等优化.

大家可能会发现, 执行脚本的命令有点麻烦. 因此, 我们可以利用npm的特性, 把命令写在`package.json`中:
```json
{
  "name": "simple",
  "version": "1.0.0",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "dev": "webpack-dev-server -d --hot --env.dev",
    "build": "webpack -p"
  }
}
```
`package.json`中的`scripts`对象, 可以用来写一些脚本命令, 命令不需要前缀目录`./node_modules/.bin/`,
npm会自动寻找该目录下的命令. 我们可以执行:
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
* 第三方库的代码最好和业务代码分开打包, 这样更新业务代码时可以借助浏览器缓存, 用户不需要重新下载没有发生变化的第三方库
* 在多人开发时, 每个人可能需要有自己的配置, 比如说webpack-dev-server监听的端口号, 如果写死在webpack配置里,
  而那个端口号在某个同学的电脑上被其他进程占用了, 简单粗暴的修改`webpack.config.babel.js`会导致提交代码后其他同学的端口也被改掉.
* 在业务代码中, 我们可能会有需求知道当前的环境, 比如如果是在debug模式, 就`console.log()`一些调试信息出来

那么, 让我们在上面的配置的基础上继续完善.

### 第三方库和业务代码分开打包
我们的思路是, 入口的html文件引两个js, `vendor.js`和`index.js`. `vendor.js`用来引用第三方库,
比如这儿我们引入一个第三方库来做路由, 我们先安装它:
```sh
npm install spa-history --save
```
然后在`vendor.js`中, 我们引用一下它:
```js
import 'spa-history';
```
我们`import`它但不需要做什么, 这样webpack打包的时候会把这个第三方库打包进`vendor.js.`

然后在`index.js`中, 我们使用它:
```js
import SpaHistory from 'spa-history';

new SpaHistory({
  onNavigate(location) {
    System.import('./views' + location.path + '/index.js').then(module => {
      const View = module.default;
      const view = new View();
      view.mount(document.body);
    });
  }
});
```
页面`foo`和`bar`的js和html文件因为路由的改变也要做些微调, 这里就不多说了, 大家自己抄一下.

然后最重要的webpack的配置需要修改一下:
```js
// 引入webpack, 等会需要用
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default function(options = {}) {
  return {
    entry: {
      // 添加vendor.js问入口js文件
      vendor: './src/vendor',
      index: './src/index'
    },

    // ...省略未改动的配置

    plugins: [
      new HtmlWebpackPlugin({
        template: 'src/index.html'
      }),

      /*
      使用CommonsChunkPlugin插件来处理重复代码
      因为vendor.js和index.js都引用了spa-history, 如果不处理的话, 两个文件里都会有spa-history包的代码,
      我们用CommonsChunkPlugin插件使index.js直接引用vendor.js中的第三方库
      */
      new webpack.optimize.CommonsChunkPlugin({
        /*
        names配置entry中的文件引用的相同库打包进哪个文件, 可以是新建文件, 也可以是entry中已存在的文件
        这里我们指定引用的相同库打包进vendor.js

        但这样还不够, 还记得那个chunkFilename参数吗? 这个参数指定了chunk的打包输出的名字,
        我们设置为 [id].js?[chunkhash] 的格式. 那么打包后这个文件名字符串是存在哪里的呢?
        它就存在引用它的文件中. 这就意味着每次修改被引用的文件, 即使文件本身没变, 也会因为引用的文件的改变而导致改变.

        然后CommonsChunkPlugin有个附加效果, 会把所有的chunk文件名合并到names指定的文件中.
        那么这时当我们修改foo或者bar的时候, vendor.js也会跟着改变, 而index.js不会变.
        那么怎么处理这些chunk文件名呢?

        这里我们用了一点小技巧. names参数可以是一个数组, 意思相当于调用多次CommonsChunkPlugin,
        比如:

        plugins: [
          new webpack.optimize.CommonsChunkPlugin({
            names: ['vendor', 'manifest']
          })
        ]

        相当于

        plugins: [
          new webpack.optimize.CommonsChunkPlugin({
            names: 'vendor'
          }),

          new webpack.optimize.CommonsChunkPlugin({
            names: 'manifest'
          })
        ]

        首先把重复引用的库打包进vendor.js, 这时候我们的代码里已经没有重复引用了, chunk文件名存在vendor.js中,
        然后我们在执行一次CommonsChunkPlugin, 把chunk文件名打包到manifest.js中.
        这样我们就实现了chunk文件名和代码的分离. 这样修改一个js文件不会导致其他js文件在打包时发生改变.
        */
        names: ['vendor', 'manifest']
      })
    ],

    // ...
  };
}
```

### 执行命令行时可以自定义部分参数
我们可以想到, 通过在命令行带入参数, 我们可以在webpack中引入指定的配置文件:
```sh
./node_modules/.bin/webpack-dev-server -d --hot --env.dev --env.profile=myprofile
```

当我们通过`npm run`执行脚本的时候, 往命令中传参的写法是这样的:
```sh
npm run dev --profile=myprofile
```

`package.json`也需要做相应修改:
```json
{
  "name": "advanced",
  "version": "1.0.0",

  "scripts": {
    "dev": "webpack-dev-server -d --hot --env.dev --env.profile=$npm_config_profile",
    "build": "webpack -p --env.profile=$npm_config_profile"
  }
}
```
这里的关键是`npm run`传的`--profile`参数可以通过`$npm_config_profile`拿到.

我们在项目根目录建立一个文件夹`conf`, 里面创建`default.js`:
```js
export default {
  server: {
    port: 8010,
    proxy: {
      '/api/auth/': {
        target: 'http://api.example.dev',
        changeOrigin: true,
        pathRewrite: { '^/api': '' }
      },

      '/api/pay/': {
        target: 'http://pay.example.dev',
        changeOrigin: true,
        pathRewrite: { '^/api': '' }
      }
    }
  }
};
```

`default.js`作为不传profile参数时的默认配置, 然后我们创建`myprofile.js`:
```js
import conf from './default';
conf.devServer.port = 8020;
export default conf;
```
`myprofile.js`引用默认配置, 修改`port`为`8020`.

然后在`webpack.config.babel.js`中, 我们相应的修改一下导出的函数:
```js
export default function(options = {}) {
  // require()和System.import()一样, export default ... 的东西被赋值到了default属性中
  const profile = require('./conf/' + (options.profile || 'default')).default;

  return {
    // ...省略未改动部分

    devServer: {
      port: profile.devServer.port,
      historyApiFallback: {
        index: '/assets/'
      },

      proxy: profile.devServer.proxy
    }
  }
}
```
这样, 我们就实现了不同的人或者环境, 自定义部分参数.

这里我们需要用require()来动态加载js文件, 因为import不支持动态加载, System.import()是异步加载, 不方便.

`profile.devServer.proxy`用来配置后端api的反向代理, ajax `/api/auth/*`的请求会被转发到 `http://api.example.dev/auth/*`,
`/api/pay/*`的请求会被转发到 `http://api.example.dev/pay/*`.

`changeOrigin`会修改HTTP请求头中的`Host`为`target`的域名, 这里会被改为`api.example.dev`

`pathRewrite`用来改写URL, 这里我们把`/api`前缀去掉.


但是, 通过`$npm_config_profile`取环境变量只在macOS/Linux等*nix操作系统有效,
Windows下`npm run`启动的是Windows的命令行程序`cmd.exe`, 要用`%npm_config_profile%`取环境变量,
而且当没有传`--profile`参数时, `%npm_config_profile%`会被原样传给webpack, 而不是空字符串.
因此如果有跨平台需求的话就不能用这个方法了.

那么我们还有一个办法, 就是不改动`package.json`, 只需要在`webpack.config.babel.js`中,
把`options.profile`改为`process.env.npm_config_profile`就可以了. 因为[process.env](https://nodejs.org/dist/latest-v6.x/docs/api/process.html#process_process_env)也可以拿到环境变量.


还有一点, 我们一般不需要把自己个人用的配置文件提交到git, 所以我们在.gitignore中加入:
```
conf/*
!conf/default.js
```
把`conf`目录排除掉, 但是保留默认配置文件.


### 往代码中插入一些环境变量
这里我们用到了[DefinePlugin](http://webpack.github.io/docs/list-of-plugins.html#defineplugin)插件.
```js
export default function(options = {}) {
  const profile = require('./conf/' + (options.profile || 'default')).default;
  const pkgInfo = require('./package.json');

  return {
    // ...省略未改动部分

    plugins: [
      // ...

      new webpack.DefinePlugin({
        DEBUG: Boolean(options.dev),
        VERSION: JSON.stringify(pkgInfo.version),
        CONF: JSON.stringify({
          experimentalFeatures: profile.experimentalFeatures,
          thirdPartyApiKey: profile.thirdPartyApiKey
        })
      })
    ]
  }
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
  console.log('debug mode');
} else {
  console.log('production mode');
}
```
会被编译成:
```js
if (false) {
  console.log('debug mode');
} else {
  console.log('production mode');
}
```
然后压缩优化为:
```js
console.log('production mode');
```

## 还有一些细节的优化
经过上面几轮的调教, 我们的配置文件基本完善了, 但还有一些细节的地方可以优化一下.

### 引用文件的路径过于复杂
文件a引入文件b时, b的路径是相对于a文件所在目录的. 如果a和b在不同的目录, 藏得又深, 写起来就会很麻烦:
```js
import b from '../../../components/b';
```
为了方便, 我们可以定义一个路径别名(alias):
```js
resolve: {
  alias: {
    src: __dirname + '/src'
  }
}
```
这样, 我们可以从`src`为基础路径来`import`文件:
```js
import b from 'src/components/b';
```

## 改进System.import()和require()
我们已经知道, 当使用System.import()和require()引入文件时, export default ... 的东西是被赋值到`.default`属性下的.
这样一来看起来丑, 二来经常会忘记, 我们可以用一个babel插件来改进这个小问题:
```sh
npm install babel-plugin-add-module-exports --save-dev
```
然后`package.json`中babel的配置加入这个插件:
```json
{
  "babel": {
    "presets": [
      "latest"
    ],
    "plugins": [
      "add-module-exports"
    ]
  }
}
```
这样我们就不用写`.default`了, 比如webpack中引入自定义配置:
```js
const profile = require('./conf/' + (options.profile || 'default'));
```

入口index.js文件中引入页面js:
```js
System.import('./views' + location.path + '/index.js').then(View => {
  const view = new View();
  view.mount(document.body);
});
```

## 优化babel编译后的代码的性能
babel编译后的代码一般会造成性能损失, babel提供了一个[loose](http://www.2ality.com/2015/12/babel6-loose-mode.html)选项,
使编译后的代码不需要完全遵循ES6规定, 简化编译后的代码, 提高代码执行效率:
```json
{
  "babel": {
    "presets": [
      [
        "latest",
        {
          "es2015": {
            "loose": true
          }
        }
      ]
    ],
    "plugins": [
      "add-module-exports"
    ]
  }
}
```
但这么做会有兼容性的风险, 可能会导致ES6源码理应的执行结果和编译后的ES5代码的实际结果并不一致.
如果代码没有遇到实际的效率瓶颈, 官方不建议使用`loose`模式.

## 使用webpack 2自带的ES6模块处理功能
我们目前的配置, `import`和`export`都是由babel转成CommonJS模块的, 但其实webpack自己可以处理`import`和`export`,
而且webpack处理`import`时会做代码优化, 把没用到的部分代码删除掉. 因此我们可以把babel转ES6模块到commonjs模块的功能给关闭掉.
但这里有一个问题, webpack的配置文件`webpack.config.babel.js`自身是不经过webpack编译的,
它只是经过babel编译后在node.js中执行, 而node.js的模块是CommonJS规范的, 因此这个文件和它引入的文件都不认识`import`和`export`.

那么我们怎么babel处理webpack配置文件的`import`和`export`, 但不处理`src`目录中的呢?

一个办法是, 我们可以不修改`package.json`中的配置, 而在`babel-loader`的`options`参数再写一份babel的配置,
这样, 只有webpack处理的文件会按这份配置的规则处理. 我们在这份配置中加入 `modules: false` 参数:
```js
{
  test: /\.js$/,
  exclude: /node_modules/,
  use: [
    {
      loader: 'babel-loader',
      options: {
        presets: [
          ['latest', {
            es2015: {
              loose: true,
              modules: false
            }
          }]
        ],
        plugins: [
          'add-module-exports'
        ]
      }
    },

    'eslint-loader'
  ]
}
```
我们把原来的`loader`字段改成了`loaders`数组, 配置也复杂了许多.

## 使用autoprefixer自动创建css的vendor prefixes
css有一个很麻烦的问题就是比较新的css属性在各个浏览器里是要加前缀的, 我们可以使用[autoprefixer](https://github.com/postcss/autoprefixer)工具自动创建这些浏览器规则,
那么我们的css中只需要写:
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

`webpack.config.babel.js`修改一下:
```js
// ...

export default function(options = {}) {
  // ...
  return {
    // ...
    module: {
      rules: [
        // ...

        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader']
        },

        // ...
      ]
    }

    // ...

  };
}
```
然后创建文件`postcss.config.js`:
```js
module.exports = {
  plugins: [
    require('autoprefixer')()
  ]
};
```
你会发现, 这里我们使用了CommonJS规范的模块定义, 因为postcss配置文件不支持使用babel转码...
因为这个原因, 我们的配置文件中中出了一个CommonJS格式的, 有点不统一. 而且联想到上面的babel配置要在`package.json`和webpack配置中各写一份, 也是很蛋疼. 因此, 我干脆连webpack配置也不用babel转码了, 把`webpack.config.babel.js`改名为`webpack.config.js`,
然后把`import ...`用`require()`代替, `export ...`用`module.exports = ...`代替. 把`babel-loader`的`options`删除.
`package.json`中`babel`的配置增加`"modules": false`. `conf`目录下的配置文件也相应改一下. 因为node.js除了ES6模块定义不支持, 其他ES6语法都支持, 因此其他都不用更改.


## 总结
通过这篇文章, 我想大家应该学会了webpack的正确打开姿势. 虽然我没有提及如何用webpack来编译[React](https://facebook.github.io/react/)和[vue.js](http://vuejs.org/), 但大家可以想到,
无非是安装一些loader和plugin来处理[jsx](https://babeljs.io/docs/plugins/preset-react/)和[vue](http://vue-loader.vuejs.org/en/)格式的文件, 那时难度就不在于webpack了, 而是代码架构组织的问题了.
具体的大家自己去摸索一下. 以后有时间我会把脚手架整理一下放到github上, 供大家参考.


## 版权许可
本文章采用“保持署名—非商用”创意共享4.0许可证。
只要保持原作者署名和非商用，您可以自由地阅读、分享、修改本文章。
详细的法律条文请参见[创意共享](http://creativecommons.org/licenses/by-nc/4.0/)网站。
