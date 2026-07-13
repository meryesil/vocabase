import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'landing', component: () => import('@/views/LandingView.vue') },
    { path: '/login', name: 'login', component: () => import('@/views/LoginView.vue') },
    { path: '/register', name: 'register', component: () => import('@/views/RegisterView.vue') },
    {
      path: '/onboarding',
      name: 'onboarding',
      component: () => import('@/views/OnboardingView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/section/:id',
      name: 'section',
      component: () => import('@/views/SectionView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/words',
      name: 'words',
      component: () => import('@/views/WordsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/quiz',
      name: 'quiz',
      component: () => import('@/views/QuizView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (auth.token && !auth.user) {
    await auth.fetchMe()
  }

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'login' }
  }

  if (auth.isLoggedIn && auth.needsOnboarding && to.name !== 'onboarding') {
    return { name: 'onboarding' }
  }

  if (auth.isLoggedIn && !auth.needsOnboarding && (to.name === 'login' || to.name === 'register')) {
    return { name: 'dashboard' }
  }

  if (auth.isLoggedIn && to.name === 'landing') {
    return { name: 'dashboard' }
  }
})

export default router
