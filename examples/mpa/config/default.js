module.exports = {
  runtimeConfig: {
    experimentalFeatures: {
      html5player: true,
      featureFoo: false
    },

    thirdPartyApiKey: 'abcdefg123456'
  },

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
