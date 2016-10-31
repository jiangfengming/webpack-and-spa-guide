import HtmlWebpackPlugin from 'html-webpack-plugin';

export default {
  entry: {
    index: './src/index.js'
  },

  output: {
    path: __dirname + '/dist',
    filename: '[name].js'
  },

  module: {
    loaders: [
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
    historyApiFallback: true
  }
};
