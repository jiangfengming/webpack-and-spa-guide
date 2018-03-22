const { resolve } = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const pkgInfo = require('./package.json')
const url = require('url')

module.exports = (env = {}, argv) => {
  const dev = argv.mode === 'development'
  const config = require('./config/' + (process.env.npm_config_config || env.config || 'default'))

  return {
    entry: {
      index: './src/index'
    },

    optimization: {
      runtimeChunk: true,
      splitChunks: {
        chunks: 'all'
      }
    },

    output: {
      path: resolve(__dirname, 'dist'),
      filename: dev ? '[name].js' : '[name].[chunkhash].js',
      chunkFilename: '[chunkhash].js',
      publicPath: config.publicPath
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
                name: '[name].[hash].[ext]'
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
        template: 'src/index.html',
        chunksSortMode: 'none'
      }),

      new webpack.HashedModuleIdsPlugin(),

      new webpack.DefinePlugin({
        DEBUG: Boolean(dev),
        VERSION: JSON.stringify(pkgInfo.version),
        CONFIG: JSON.stringify(config.runtimeConfig)
      })
    ],

    resolve: {
      alias: {
        '~': resolve(__dirname, 'src')
      }
    },

    devServer: config.devServer ? {
      host: '0.0.0.0',
      disableHostCheck: true,
      port: config.devServer.port,
      proxy: config.devServer.proxy,
      historyApiFallback: {
        index: url.parse(config.publicPath).pathname,
        disableDotRule: true
      }
    } : undefined,

    performance: {
      hints: dev ? false : 'warning'
    }
  }
}
