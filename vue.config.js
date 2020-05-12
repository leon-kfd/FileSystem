module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:5001/',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  },
  productionSourceMap: false,
  publicPath: '/cloud',
  configureWebpack: config => {
    config.externals = {
      vue: 'Vue',
      'vue-router': 'VueRouter',
      'element-ui': 'ELEMENT',
      axios: 'axios'
    }
  }
}
