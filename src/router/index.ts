import { createRouter, createWebHistory } from 'vue-router'
import NavLayout from '@/layouts/NavLayout.vue'
import DevelopmentView from '@/views/DevelopmentView.vue'
import Orders from '@/views/Orders.vue'
import Products from '@/views/Products.vue'
const routes = [
  {
    path: '/',
    component: NavLayout,
    children: [
      {
        path: '',
        name: 'Orders',
        component: Orders
      },
      {
        path: 'groups',
        name: 'Groups',
        component: DevelopmentView
      },
      {
        path: 'products',
        name: 'Products',
        component: Products
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
