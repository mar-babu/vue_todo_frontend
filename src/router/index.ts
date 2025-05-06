import { createRouter, createWebHistory } from 'vue-router'
import Login from '@/components/auth/Login.vue'
import SignUp from '@/components/auth/Signup.vue'
import Dashboard from '@/components/Dashboard.vue'

const routes = [
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { public: true }
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignUp,
      meta: { public: true }
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true }
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login'
    }
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  const isAuthenticated = localStorage.getItem('auth_token')
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.meta.public && isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router