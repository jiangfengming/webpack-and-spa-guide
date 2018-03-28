const { resolve } = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const HtmlWebpackIncludeSiblingChunksPlugin = require('html-webpack-include-sibling-chunks-plugin')
const pkgInfo = require('./package.json')
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

const dev = Boolean(process.env.WEBPACK_SERVE)
const config = require('./config/' + (process.env.npm_config_config || 'default'))

module.exports = {
  mode: dev ? 'development' : 'production',

  entry,

  optimization: {
    runtimeChunk: true,
    splitChunks: {
      chunks: 'all'
    }
  },

  output: {
    path: resolve(__dirname, 'dist'),
    filename: dev ? '[name].js' : '[name].[chunkhash].js',
    chunkFilename: '[chunkhash].js'
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
    ...htmlPlugins,
    new HtmlWebpackIncludeSiblingChunksPlugin(),

    new webpack.HashedModuleIdsPlugin(),

    new webpack.DefinePlugin({
      DEBUG: dev,
      VERSION: JSON.stringify(pkgInfo.version),
      CONFIG: JSON.stringify(config.runtimeConfig)
    })
  ],

  resolve: {
    alias: {
      '~': resolve(__dirname, 'src')
    }
  },

  performance: {
    hints: dev ? false : 'warning'
  }
}

if (dev) {
  module.exports.serve = {
    host: '0.0.0.0',
    port: config.serve.port
  }
}
