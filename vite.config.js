import { createVuePlugin } from 'vite-plugin-vue2'
import { viteExternalsPlugin } from 'vite-plugin-externals'

export default {
  base: '/cloud/',
  plugins: [
    createVuePlugin(),
    viteExternalsPlugin({
      vue: 'Vue',
      'vue-router': 'VueRouter',
      'element-ui': 'ELEMENT',
      axios: 'axios'
    }),
  ],
  server: {
    proxy: {
      '/api': {
        // target: 'http://localhost:5001/',
        target: 'http://kongfandong.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
}
