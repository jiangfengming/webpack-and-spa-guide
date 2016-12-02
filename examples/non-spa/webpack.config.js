const { resolve } = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const pkgInfo = require('./package.json');
const glob = require('glob');

module.exports = function(options = {}) {
  const config = require('./config/' + (process.env.npm_config_config || 'default'));

  const entries = glob.sync('./src/**/index.js');
  const entryJsList = {};
  const entryHtmlList = [];
  for (const filepath of entries) {
    const chunkName = filepath.slice('./src/pages/'.length, -'/index.js'.length);
    entryJsList[chunkName] = filepath;
    entryHtmlList.push(new HtmlWebpackPlugin({
      template: filepath.replace('index.js', 'index.html'),
      filename: chunkName + '.html',
      chunks: ['manifest', 'vendor', chunkName]
    }));
  }

  return {
    entry: Object.assign({
      vendor: './src/vendor'
    }, entryJsList),

    output: {
      path: resolve(__dirname, 'dist'),
      filename: options.dev ? '[name].js' : '[name].js?[chunkhash]',
      chunkFilename: '[id].js?[chunkhash]',
      publicPath: '/'
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
      ...entryHtmlList,

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
      proxy: config.devServer.proxy
    },

    resolve: {
      alias: {
        '~': resolve(__dirname, 'src')
      }
    }
  };
};
