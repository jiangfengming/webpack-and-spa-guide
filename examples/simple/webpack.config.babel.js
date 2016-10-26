/*eslint no-console: 'off'*/

import conf from './conf';
import parseArgs from 'minimist';
import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ChunkManifestPlugin from 'chunk-manifest-webpack-plugin';
import autoprefixer from 'autoprefixer';
import fs from 'fs';
import crypto from 'crypto';

export default function(options = {}) {
  let packageInfo = require('./package.json');
  let argv = parseArgs(process.argv.slice(2));
  let cfgFile = argv.c || 'default';
  let confCustom = require('./conf/' + cfgFile).default;
  Object.assign(conf, confCustom, options);
  console.log(JSON.stringify(conf, null, 2));

  let _conf = Object.assign({}, conf);
  delete _conf.server;

  let webpackConf = {
    entry: {
      vendor: './src/vendor.js',
      app: './src/index.js'
    },

    output: {
      path: __dirname + '/dist',
      publicPath: conf.assets,
      filename: conf.debug ? '[name].js' : '[name].js?[chunkhash]',
      chunkFilename: conf.debug ? '[name].js' : '[name].js?[chunkhash]'
    },

    resolve: {
      alias: {
        src: __dirname + '/src'
      }
    },

    module: {
      loaders: [
        {
          test: /\.json$/,
          loader: 'json'
        },

        {
          test: /favicon\.(ico|png)$/,
          loader: 'file?name=[name].[ext]?[hash]'
        },

        {
          test: /\.html$/,
          loader: 'html'
        },

        {
          test: /\.css$/,
          loader: 'style!css'
        },

        {
          test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
          exclude: /favicon\.png$/,
          loader: 'url?limit=10000'
        },

        {
          test: /\.styl$/,
          loader: 'style!css!postcss!stylus'
        }
      ]
    },

    stylus: {
      import: [__dirname + '/src/global.styl']
    },

    postcss: function() {
      return [autoprefixer];
    },

    ejsHtml: {
      conf: conf
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: 'html?attrs=link:href!ejs-html!./index.ejs',
        inject: false
      }),

      new webpack.DefinePlugin({
        DEBUG: conf.debug,
        CONF: JSON.stringify(_conf),
        TARGET: JSON.stringify(conf.target),
        VERSION: JSON.stringify(packageInfo.version)
      })
    ],

    devServer: {
      host: '0.0.0.0',
      port: conf.server.port,
      noInfo: true,
      contentBase: './dist',
      historyApiFallback: {
        index: conf.assets
      },
      proxy: conf.server.proxy,
      https: conf.server.https,
      cert: conf.server.cert,
      cacert: conf.server.cacert,
      key: conf.server.key
    }
  };

  if (conf.debug) {
    webpackConf.debug = true;
    webpackConf.devtool = 'source-map';
  } else {
    webpackConf.module.loaders.push({
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel',
      query: {
        presets: [['es2015', { modules: false }]]
      }
    });

    webpackConf.plugins.push(
      new webpack.optimize.CommonsChunkPlugin('vendor'),
      new ChunkManifestPlugin(),

      // long-term caching
      // http://webpack.github.io/docs/long-term-caching.html
      function() {
        this.plugin('done', function(stats) {
          let chunks = stats.toJson().assetsByChunkName;
          // append script hash in index.html
          let indexHtml = fs.readFileSync('./dist/index.html', 'utf8');
          var manifest = fs.readFileSync('./dist/manifest.json');
          var version = crypto.createHash('md5').update(manifest).digest('hex');
          fs.writeFileSync('./dist/manifest.js', 'webpackManifest = ' + manifest);
          fs.writeFileSync('./dist/version', version);
          indexHtml = indexHtml.replace('manifest.js', 'manifest.js?' + version);

          for (var entry in chunks) {
            var src = entry + '.js';
            var dest = chunks[entry];
            indexHtml = indexHtml.replace(src, dest);
          }

          fs.writeFileSync('./dist/index.html', indexHtml);
        });
      }
    );
  }

  return webpackConf;
}
