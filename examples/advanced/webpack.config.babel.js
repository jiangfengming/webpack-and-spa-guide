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
          loader: 'babel'
        },

        {
          test: /\.html$/,
          loader: 'html',
          query: {
            attrs: ['img:src', 'link:href']
          }
        },

        {
          test: /\.css$/,
          loader: 'style!css'
        },

        {
          test: /favicon\.png$/,
          loader: 'file?name=[name].[ext]?[hash]'
        },

        {
          test: /\.(png|jpg|jpeg|gif|eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
          exclude: /favicon\.png$/,
          loader: 'url?limit=10000'
        }
      ]
    },

    plugins: [
      new HtmlWebpackPlugin({
        template: 'src/index.html'
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
