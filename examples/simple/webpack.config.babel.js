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
      [chunkhash]是打包后输出文件的hash值的占位符, 把?[chunkhash]跟在文件名后面可以防止浏览器缓存,
      这里, webpack会生成以下代码插入到index.html中:
      <script type="text/javascript" src="/assets/index.js?d835352892e6aac768bf"></script>
      这里/assets/目录前缀是下面的publicPath配置的

      options.dev是命令行传入的参数. 这里是由于使用webpack-dev-server启动开发环境时, 是没有chunkhash的, 用了会报错
      因此我们不得已在使用webpack-dev-server启动项目时, 不在后面跟chunkhash, 启动命令如下:
      webpack-dev-server --hot --inline --env.dev
      --hot和--inline下面讲

      有人可能注意到官网文档中还有一个[hash]占位符, 这个hash是源文件的hash值, 它是始终存在的.
      那为什么不用它呢?
      因为当我们在源文件里使用import和System.import()时, 如果文件本身没有改变, 但引用的文件发生了改变,
      那么打包后的文件也会改变, 因为它里面记录的引用文件的打包输出的文件名发生了变化(通过下面的chunkFilename配置).
      但[hash]是源文件的hash, 所以没有跟着变, 意味着无法防止缓存问题.
      */
      filename: options.dev ? '[name].js' : '[name].js?[chunkhash]',

      /*

      */
      chunkFilename: '[id].js?[chunkhash]'

      /*
      浏览器引用文件时的路径前缀, 不包含域名
      比如, 如果域名是www.example.com, publicPath为 /assets/, 那么我们可以通过
      http://www.example.com/assets/index.js
      访问入口js文件
      */
      publicPath: '/assets/',
    },

    module: {
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel'
        },

        {
          test: /\.html$/,
          loader: 'html'
        },

        {
          test: /\.css$/,
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
