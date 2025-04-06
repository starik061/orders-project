import { createRouter, createWebHistory } from 'vue-router'
import NavLayout from '@/layouts/NavLayout.vue'
import DevelopmentView from '@/views/DevelopmentView.vue'
const routes = [
  {
    path: '/',
    component: NavLayout,
    children: [
      {
        path: '',
        name: 'Receiving',
        component: DevelopmentView
      },
      {
        path: 'groups',
        name: 'Groups',
        component: DevelopmentView
      },
      {
        path: 'products',
        name: 'Products',
        component: DevelopmentView
      },
      {
        path: 'users',
        name: 'Users',
        component: DevelopmentView
      },
      {
        path: 'settings',
        name: 'Settings',
        component: DevelopmentView
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
