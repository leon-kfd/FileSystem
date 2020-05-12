import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import '@/assets/base.css'
import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-chalk/index.css'
import { StandardTable } from 'howdyjs'
import VueSimpleUplader from 'vue-simple-uploader'
import instance, { baseURL } from '@/utils/fetch'
Vue.use(ElementUI, {
  size: 'small'
})
Vue.use(StandardTable, {
  axiosInstance: instance
})
Vue.use(VueSimpleUplader)

Vue.prototype.$baseURL = baseURL
Vue.prototype.$post = (url, data, options) => instance.post(url, data, options)
Vue.prototype.$get = (url, params, options) => instance.get(url, { params, ...options })

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
