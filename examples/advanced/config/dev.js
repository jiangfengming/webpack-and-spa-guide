module.exports = {
  runtimeConfig: {
    experimentalFeatures: {
      featureFoo: false,
      featureBar: true
    },

    thirdPartyApiKey: 'abcdefg123456'
  },

  publicPath: '/assets/',

  devServer: {
    port: 8100,
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
}
