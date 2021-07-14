const isProduction = process.env.NODE_ENV === 'production'
module.exports = {
  devServer: {
    proxy: {
      '/api': {
        // target: 'http://localhost:5001/',
        target: 'http://kongfandong.cn',
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
    if (isProduction) {
      config.externals = {
        vue: 'Vue',
        'vue-router': 'VueRouter',
        'element-ui': 'ELEMENT',
        axios: 'axios'
      }
    }
  }
}
