import { createRouter, createWebHistory } from 'vue-router'
import First from '@/components/First.vue'
const routes = [
  {
    path: '/',
    name: 'Home',
    component: First // создадим этот файл позже
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
