import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/login.vue')
  },
  {
    path: '/main',
    name: 'Home',
    component: () => import('../views/Home.vue')
  },
  {
    path: '/trash',
    name: 'Trash',
    component: () => import('../views/trash.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: '/cloud',
  routes
})

export default router
