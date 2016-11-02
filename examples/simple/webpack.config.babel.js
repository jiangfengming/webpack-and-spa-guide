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
  const config = {
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

      options.dev是命令行传入的参数. 这里是由于使用webpack-dev-server启动开发环境时, 是没有chunkhash的, 用了会报错
      因此我们不得已在使用webpack-dev-server启动项目时, 不在后面跟chunkhash, 启动命令如下:
      webpack-dev-server --hot --inline --env.dev
      --hot和--inline下面讲

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

    // 配置各种类型文件的加载插件
    module: {

      /*
      当编译一个文件时, webpack会按照 preloaders -> loaders -> import时指定的loader -> postLoaders 这个顺序,
      依次使用配置的插件处理文件, 一个插件处理返回的结果交给下一个插件处理.
      一般我们只需要使用到loaders配置
      */
      loaders: [
        // 使用babel编译ES6/ES7/ES8为ES5代码
        {
          // 使用正则表达式匹配后缀名为.js的文件
          test: /\.js$/,
          // 排除node_modules目录下的文件, npm安装的包不需要编译
          exclude: /node_modules/,
          // 指定加载器为babel, 就是刚才我们安装的babel-loader包, "-loader"可以省略
          loader: 'babel'
        },

        {

          /*
          匹配favicon.png

          */
          test: /favicon\.png$/,

          /*
          使用file-loader加载,
          */
          loader: 'file?name=[name].[ext]?[hash]'
        },

        {
          test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
          exclude: /favicon\.png$/,
          loader: 'url?limit=10000'
        },

        {
          // 匹配.html文件
          test: /\.html$/,
          // 使用html-loader, 将html内容存为js字符串
          loader: 'html',
          query: {
            attrs: ['img:src', 'link:href']
          }
        },

        {
          // 匹配.css文件
          test: /\.css$/,

          /*
          先使用css-loader处理, 返回的结果交给style-loader处理, loader之间使用!分隔,
          从右往左处理.
          css-loader将css内容
          */
          loader: 'style!css'
        }
      ]
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: 'src/index.html'
      })
    ],

    devServer: {
      port: '8010',
      contentBase: './dist',
      historyApiFallback: {
        index: '/assets/'
      }
    }
  };

  // 返回配置对象给webpack
  return config;
}
