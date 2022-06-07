import { createVuePlugin } from 'vite-plugin-vue2'

export default {
  base: '/cloud/',
  plugins: [
    createVuePlugin()
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
