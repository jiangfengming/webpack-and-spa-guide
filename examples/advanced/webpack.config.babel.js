import webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';

export default function(options = {}) {
  const config = {
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
          loader: 'babel-loader'
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
        names: ['vendor', 'manifest'],
        minChunks: Infinity
      })
    ],

    devServer: {
      port: 8010,
      historyApiFallback: {
        index: '/assets/'
      }
    }
  };

  return config;
}
