# Webpack 简介

## 写在开头
先说说为什么要写这篇文章, 最初的原因是组里的小朋友们看了webpack文档后, 表情都是这样的:
(摘自webpack[一篇文档](http://webpack.github.io/docs/usage.html)的评论区)
![WTF](wtf.jpg)

和这样的:
![You Couldn't Handle Me](couldn't-handle.jpg)

是的, 即使是英语国家的外国佬也在吐槽这文档不是人能看的. 回想起当年自己啃webpack文档的血与泪的往事,
觉得有必要整一个教程, 可以让大家看完后轻松愉快地搭建起一个webpack打包方案的项目.

可能会有人觉得我现在不用webpack活得也好好的, 没必要去搞这个东西. 所以, 在说webpack之前,
我想先谈一下前端打包方案这几年的演进历程, 在什么场景下, 我们遇到了什么问题, 催生出了应对这些问题的工具.
了解了需求和目的之后, 你就知道什么时候webpack可以帮到你.

## 先说说前端打包方案的黑暗历史
在很长的一段前端历史里, 是不存在打包这个说法的. 那个时候页面基本是纯静态的或者服务端输出的, 没有AJAX, 也没有jQuery.
那个时候的JavaScript就像个玩具, 用处大概就是在侧栏弄个时钟, 用media player放个mp3之类的脚本,
代码量不是很多, 直接放在`<script>`标签里或者弄个js文件引一下就行, 日子过得很轻松愉快.

随后的几年, 人们开始尝试在一个页面里做更多的事情. 容器的显示, 隐藏, 切换. 用css写的弹层,
图片轮播等等. 但如果一个页面内不能向服务器请求数据, 能做的事情毕竟有限的, 代码的量也能维持在页面交互逻辑范围内.
这时候很多人开始突破一个页面能做的事情的范围, 使用隐藏的iframe和flash等作为和服务器通信的桥梁,
新世界的大门慢慢地被打开, 在一个页面内和服务器进行数据交互, 意味着以前需要跳转多个页面的事情现在可以用一个页面搞定.
但由于iframe和flash技术过于tricky和复杂, 并没能得到广泛的推广. 直到Google推出Gmail的时候, 人们意识到了一个被忽略的接口,
XMLHttpRequest, 也就是我们俗称的AJAX, 这是一个使用方便的, 兼容性良好的服务器通信接口. 从此开始,
我们的页面开始玩出各种花来了, 前端一下子出现了各种各样的库, [Prototype](http://prototypejs.org/), [Dojo](https://dojotoolkit.org/), [MooTools](http://mootools.net/), [Ext JS](https://www.sencha.com/products/extjs/), [jQuery](https://jquery.com/)... 我们开始往页面里引用各种库和插件,
我们的js文件也就爆炸了...

随着js能做的事情越来越多, 引用越来越多, 文件越来越大, 加上当时大约只有2Mbps左右的网速, 下载速度还不如3G网络,
对js文件的压缩和合并的需求越来越强烈, 当然这里面也有把代码混淆了不容易被盗用等其他因素在里面. [JSMin](http://crockford.com/javascript/jsmin), [YUI Compressor](http://yui.github.io/yuicompressor/), [Closure Compiler](https://developers.google.com/closure/compiler/), [UglifyJS](http://lisperator.net/uglifyjs/) 等js文件压缩合并工具陆陆续续诞生了. 压缩工具是有了, 但我们得要执行它, 最简单的办法呢, 就是windows上搞个bat脚本,
mac/linux上搞个bash脚本, 哪几个文件要合并在一块的, 哪几个要压缩的, 发布的时候运行一下脚本,
生成压缩后的文件.

基于合并压缩技术, 项目越做越大, 问题也越来越多, 大概就是以下这些问题:
* 库和插件为了要给他人调用, 肯定要找个地方注册, 一般就是在window下申明一个全局的函数或对象.
  难保哪天用的两个库在全局用同样的名字, 那就冲突了. jQuery倒还好, 它有自己的插件注册机制,
  并不是在全局作用域里.
* 库和插件如果还依赖其他的库和插件, 就要告知使用人, 需要先引哪些依赖库, 那些依赖库也有自己的依赖库的话,
  就要先引依赖库的依赖库, 以此类推...

于是呢, 就有人弄了个[AMD](http://requirejs.org/)模块方案解决了这个事情.

js的问题基本解决了, 但css和html也没闲着. 什么[less](http://lesscss.org/),
[sass](http://sass-lang.com/), [stylus](http://stylus-lang.com/)的css预处理器横空出世,
说能帮我们简化css的写法, 自动给你加vendor prefix. html在这期间也出现了一堆模板语言,
什么[handlebars](http://handlebarsjs.com/), [ejs](http://www.embeddedjs.com/),
[jade](http://jade-lang.com/), 可以把ajax拿到的数据插入到模板中, 然后用innerHTML显示到页面上.

托AMD和CSS预处理和模板语言的福, 我们的编译脚本也洋洋洒洒写了百来行, 又一个新需求就这样产生了:
我们需要一个简单的脚本文件, 可以利用各种编译工具, 编译/压缩js, css, html, 图片等资源.
然后[Grunt](http://gruntjs.com/)产生了, 配置文件格式是我们最爱的js, 比shell脚本熟悉很多,
写法也很简单, 社区有非常多的插件支持各种编译, lint, 测试工具.

###
