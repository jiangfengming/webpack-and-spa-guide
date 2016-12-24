const { resolve } = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const pkgInfo = require('./package.json')

/*
导出一个函数, webpack会执行该函数, 把函数返回结果作为配置对象
函数接受一个类型为对象的参数. 当我们在命令行中执行:
webpack --env.dev --env.server localhost
该参数为 { dev: true, server: 'localhost' }
该参数对 webpack-dev-server 命令同样有效
*/
module.exports = function(options = {}) {
  const config = require('./config/' + (process.env.npm_config_config || 'default'))

  const cfg = {
    entry: {
      vendor: './src/vendor', // 属性名用来和下面的output.filename配合使用
      index: './src/index'
    },

    output: {
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
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ['babel-loader', 'eslint-loader']
        },

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
        },

        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader']
        },

        {
          test: /favicon\.png$/,
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
          test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
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
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: 'src/index.html'
      }),

      new webpack.optimize.CommonsChunkPlugin({
        names: ['vendor', 'manifest']
      }),

      new webpack.DefinePlugin({
        DEBUG: Boolean(options.dev),
        VERSION: JSON.stringify(pkgInfo.version),
        CONFIG: JSON.stringify(config.runtimeConfig)
      })
    ],

    devServer: {
      host: '0.0.0.0',
      port: config.devServer.port,
      historyApiFallback: {
        index: '/assets/'
      },

      proxy: config.devServer.proxy
    },

    resolve: {
      alias: {
        '~': resolve(__dirname, 'src')
      }
    }
  }

  // 返回配置对象给webpack
  return cfg
}
