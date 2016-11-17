import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default function(options = {}) {
  const profile = require('./conf/' + (options.profile || 'default'));
  const pkgInfo = require('./package.json');

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
      loaders: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loaders: [
            {
              loader: 'babel-loader',
              query: {
                presets: [
                  ['latest', {
                    es2015: {
                      loose: true
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
        },

        {
          test: /\.html$/,
          loader: 'html-loader',
          query: {
            attrs: ['img:src', 'link:href']
          }
        },

        {
          test: /\.css$/,
          loader: 'style-loader!css-loader'
        },

        {
          test: /favicon\.png$/,
          loader: 'file-loader?name=[name].[ext]?[hash]'
        },

        {
          test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
          exclude: /favicon\.png$/,
          loader: 'url-loader?limit=10000'
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
}
