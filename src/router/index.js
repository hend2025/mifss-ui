import { createRouter, createWebHashHistory } from 'vue-router'
import SysPara from '../views/SysPara.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/sysPara'
    },
    {
      path: '/sysPara',
      name: 'sysPara',
      component: SysPara
    },
    {
      path: '/crtf',
      name: 'crtf',
      component: () => import('../views/Crtf.vue')
    }
  ]
})

export default router
