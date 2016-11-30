import { resolve } from 'path';
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
      path: resolve(__dirname, 'dist'),

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
          use: [
            /*
            loader可以接受参数, 接受什么参数由各个loader自己定义
            如果loader需要接受options参数, 则需要写成对象格式
            */
            {
              loader: 'html-loader',
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
            }
          ]
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
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].[ext]?[hash]'
              }
            }
          ]
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
        但它有个bug, 打包后的文件名路径不带hash:
        https://github.com/ampedandwired/html-webpack-plugin/issues/364
        就算有hash, 它也是[hash], 而不是[chunkhash], 导致修改代码也会改变favicon打包输出的文件名.
        还有移动端的meta字段和不同尺寸的favicon等, 因此综合考虑还是自己写一个html

        那个issue中提交的favicons-webpack-plugin倒是可以用, 但它依赖PhantomJS, 非常大.
        */
        template: './src/index.html'
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
