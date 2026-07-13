<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)

async function handleLogin() {
  const ok = await auth.login(email.value, password.value)
  if (ok) {
    router.push(auth.needsOnboarding ? '/onboarding' : '/dashboard')
  }
}
</script>

<template>
  <div class="page auth-page">
    <div class="container auth-container">
      <div class="auth-card glass-card">
        <RouterLink to="/" class="auth-logo">
          <div class="logo-icon custom-logo">
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="36" height="36" rx="10" fill="url(#vb-pro-bg-log)"/>
              <path d="M9.5 11.5 C9.5 10.67 10.17 10 11 10 H15.2 C15.7 10 16.18 10.25 16.48 10.68 L18 12.8 L19.52 10.68 C19.82 10.25 20.3 10 20.8 10 H25 C25.83 10 26.5 10.67 26.5 11.5 C26.5 11.95 26.3 12.38 25.95 12.68 L19.45 25.18 C18.88 26.28 17.12 26.28 16.55 25.18 L10.05 12.68 C9.7 12.38 9.5 11.95 9.5 11.5 Z" fill="url(#vb-v-grad-log)"/>
              <path d="M18 14.5 L22.2 11.8 L18 20 L13.8 11.8 L18 14.5 Z" fill="#FFFFFF" fill-opacity="0.92"/>
              <path d="M18 7 L20.8 10 L18 13 L15.2 10 L18 7 Z" fill="url(#vb-diamond-grad-log)"/>
              <defs>
                <linearGradient id="vb-pro-bg-log" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#0F172A"/>
                  <stop offset="0.5" stop-color="#1E1E2E"/>
                  <stop offset="1" stop-color="#311042"/>
                </linearGradient>
                <linearGradient id="vb-v-grad-log" x1="9" y1="10" x2="27" y2="26" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#818CF8"/>
                  <stop offset="0.6" stop-color="#C084FC"/>
                  <stop offset="1" stop-color="#E879F9"/>
                </linearGradient>
                <linearGradient id="vb-diamond-grad-log" x1="15" y1="7" x2="21" y2="13" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#38BDF8"/>
                  <stop offset="1" stop-color="#818CF8"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span class="logo-text">VocaBase</span>
        </RouterLink>

        <h1>Tekrar hoş geldin</h1>
        <p class="auth-sub">Hesabına giriş yap ve çalışmaya devam et.</p>

        <form @submit.prevent="handleLogin" class="auth-form">
          <div class="form-group">
            <label for="email">E-posta</label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="form-input"
              placeholder="ornek@email.com"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Şifre</label>
            <div class="password-input-wrapper">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input password-input"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                class="password-toggle-btn"
                @click="showPassword = !showPassword"
                :title="showPassword ? 'Şifreyi Gizle' : 'Şifreyi Göster'"
              >
                {{ showPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <span class="password-hint">💡 Şifreniz en az 6 karakterden oluşmalıdır.</span>
          </div>

          <p v-if="auth.error" class="error-msg">{{ auth.error }}</p>

          <button type="submit" class="btn btn-primary btn-full" :disabled="auth.loading">
            {{ auth.loading ? 'Giriş yapılıyor...' : 'Giriş Yap' }}
          </button>
        </form>

        <p class="auth-footer">
          Hesabın yok mu?
          <RouterLink to="/register">Kayıt ol</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem 0;
}

.auth-container {
  width: 100%;
  max-width: 420px;
}

.auth-card {
  padding: 2.5rem;
}

.auth-logo {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 700;
  margin-bottom: 2rem;
}

.custom-logo {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 18px var(--accent-glow);
  border-radius: 11px;
}

.custom-logo svg {
  width: 38px;
  height: 38px;
}

.logo-text {
  font-weight: 800;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
}

.auth-card h1 {
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.auth-sub {
  color: var(--text-secondary);
  margin-bottom: 2rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input {
  width: 100%;
  padding-right: 2.75rem;
}

.password-toggle-btn {
  position: absolute;
  right: 0.75rem;
  background: transparent;
  border: none;
  font-size: 1.15rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0.25rem;
  transition: transform 0.2s;
}

.password-toggle-btn:hover {
  transform: scale(1.15);
}

.password-hint {
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin-top: 0.2rem;
}

.btn-full {
  width: 100%;
  margin-top: 0.5rem;
}

.auth-footer {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9375rem;
  color: var(--text-secondary);
}
</style>
