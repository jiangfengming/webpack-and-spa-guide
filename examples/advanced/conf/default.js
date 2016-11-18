module.exports = {
  experimentalFeatures: {
    html5player: true,
    featureFoo: false
  },

  thirdPartyApiKey: 'abcdefg123456',

  devServer: {
    port: 8010,
    proxy: {
      '/api/auth/': {
        target: 'http://api.example.dev',
        changeOrigin: true,
        pathRewrite: { '^/api': '' }
      },

      '/api/pay/': {
        target: 'http://pay.example.dev',
        changeOrigin: true,
        pathRewrite: { '^/api': '' }
      }
    }
  }
};
