import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/api/client.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('vocabase_token'))
  const loading = ref(false)
  const error = ref(null)

  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const needsOnboarding = computed(() => isLoggedIn.value && !user.value?.exam_goal)

  async function fetchMe() {
    if (!token.value) return
    try {
      const { user: me } = await api('/auth/me')
      user.value = me
    } catch {
      logout()
    }
  }

  async function register(email, password, displayName) {
    loading.value = true
    error.value = null
    try {
      const data = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, displayName }),
      })
      token.value = data.token
      user.value = data.user
      localStorage.setItem('vocabase_token', data.token)
      return true
    } catch (e) {
      error.value = e.message
      return false
    } finally {
      loading.value = false
    }
  }

  async function login(email, password) {
    loading.value = true
    error.value = null
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      })
      token.value = data.token
      user.value = data.user
      localStorage.setItem('vocabase_token', data.token)
      return true
    } catch (e) {
      error.value = e.message
      return false
    } finally {
      loading.value = false
    }
  }

  async function updateProfile(updates) {
    const { user: updated } = await api('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
    user.value = updated
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('vocabase_token')
  }

  if (token.value) {
    fetchMe()
  }

  return {
    user,
    token,
    loading,
    error,
    isLoggedIn,
    needsOnboarding,
    register,
    login,
    logout,
    updateProfile,
    fetchMe,
  }
})
