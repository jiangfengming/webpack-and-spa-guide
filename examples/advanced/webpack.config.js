const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const pkgInfo = require('./package.json');

module.exports = function(options = {}) {
  const profile = require('./conf/' + (options.profile || 'default'));

  return {
    entry: {
      vendor: './src/vendor',
      index: './src/index'
    },

    output: {
      path: __dirname + '/dist',
      filename: options.dev ? '[name].js' : '[name].js?[chunkhash]',
      chunkFilename: '[id].js?[chunkhash]',
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
          use: 'html-loader',
          options: {
            attrs: ['img:src', 'link:href']
          }
        },

        {
          test: /\.css$/,
          use: [
            'style-loader',
            'css-loader',
            'postcss-loader'
          ]
        },

        {
          test: /favicon\.png$/,
          use: 'file-loader',
          options: {
            name: '[name].[ext]?[hash]'
          }
        },

        {
          test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
          exclude: /favicon\.png$/,
          loader: 'url-loader',
          options: {
            limit: 10000
          }
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
        CONF: JSON.stringify({
          experimentalFeatures: profile.experimentalFeatures,
          thirdPartyApiKey: profile.thirdPartyApiKey
        })
      })
    ],

    devServer: {
      port: profile.devServer.port,
      historyApiFallback: {
        index: '/assets/'
      },

      proxy: profile.devServer.proxy
    },

    resolve: {
      alias: {
        src: __dirname + '/src'
      }
    }
  };
};
