import './assets/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import Vue3Toastify, { toast, type ToastContainerOptions } from 'vue3-toastify'

import 'vue3-toastify/dist/index.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(Vue3Toastify, {
  autoClose: 700,
  limit: 1,
  position: toast.POSITION.TOP_RIGHT,
  transition: toast.TRANSITIONS.SLIDE,
  hideProgressBar: true
} as ToastContainerOptions)

app.mount('#app')
