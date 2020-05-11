import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('@/views/login')
  },
  {
    path: '/main',
    name: 'Home',
    component: () => import('@/views/home')
  },
  {
    path: '/trash',
    name: 'Trash',
    component: () => import('@/views/trash')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
