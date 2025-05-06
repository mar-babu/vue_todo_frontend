import { createApp } from 'vue'
import './index.css'
import App from './App.vue'
import Vue3Toastify, { type ToastContainerOptions } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'
import router from './router'

const app = createApp(App)
app.use(router)

app.use(Vue3Toastify, {
  autoClose: 3000,
  position: 'top-right',
  theme: 'colored',
  hideProgressBar: true,
  closeButton: false,
} as ToastContainerOptions)

app.mount('#app')
