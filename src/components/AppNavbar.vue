<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { useVocabularyStore } from '@/stores/vocabulary.js'

const router = useRouter()
const auth = useAuthStore()
const vocab = useVocabularyStore()

const theme = ref(localStorage.getItem('theme') || 'dark')

function setTheme(newTheme) {
  theme.value = newTheme
  localStorage.setItem('theme', newTheme)
  document.documentElement.setAttribute('data-theme', newTheme)
}

const examPrefix = computed(() => {
  const goal = (auth.user?.exam_goal || '').toString().toLowerCase()
  if (goal.includes('yds')) return 'YDS'
  if (goal.includes('toefl')) return 'TOEFL'
  if (goal.includes('ielts')) return 'IELTS'
  if (goal.includes('kpss')) return 'KPSS'
  if (goal.includes('other') || goal.includes('genel') || goal.includes('akademik')) return 'Akademik'
  return 'YÖKDİL'
})

const academicRank = computed(() => {
  const xp = vocab.stats?.xp || 0
  const p = examPrefix.value
  if (xp >= 4000) return { title: `👑 ${p} Üstadı`, color: '#f59e0b', border: 'rgba(245, 158, 11, 0.4)', bg: 'rgba(245, 158, 11, 0.15)' }
  if (xp >= 1500) return { title: '🎓 Doçent Adayı', color: '#ec4899', border: 'rgba(236, 72, 153, 0.4)', bg: 'rgba(236, 72, 153, 0.15)' }
  if (xp >= 500) return { title: '🔬 Araştırmacı', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.4)', bg: 'rgba(59, 130, 246, 0.15)' }
  if (xp >= 100) return { title: '📖 Akademik Okur', color: '#10b981', border: 'rgba(16, 185, 129, 0.4)', bg: 'rgba(16, 185, 129, 0.15)' }
  return { title: `🌱 ${p} Adayı`, color: '#c084fc', border: 'rgba(192, 132, 252, 0.4)', bg: 'rgba(192, 132, 252, 0.15)' }
})

onMounted(async () => {
  document.documentElement.setAttribute('data-theme', theme.value)
  if (auth.isAuthenticated && !vocab.stats) {
    await vocab.fetchStats()
  }
})

function logout() {
  auth.logout()
  router.push('/')
}
</script>

<template>
  <div>
    <nav class="navbar">
      <div class="container navbar-inner">
        <RouterLink to="/dashboard" class="logo">
          <div class="logo-icon custom-logo">
            <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="36" height="36" rx="10" fill="url(#vb-pro-bg)"/>
              <path d="M9.5 11.5 C9.5 10.67 10.17 10 11 10 H15.2 C15.7 10 16.18 10.25 16.48 10.68 L18 12.8 L19.52 10.68 C19.82 10.25 20.3 10 20.8 10 H25 C25.83 10 26.5 10.67 26.5 11.5 C26.5 11.95 26.3 12.38 25.95 12.68 L19.45 25.18 C18.88 26.28 17.12 26.28 16.55 25.18 L10.05 12.68 C9.7 12.38 9.5 11.95 9.5 11.5 Z" fill="url(#vb-v-grad)"/>
              <path d="M18 14.5 L22.2 11.8 L18 20 L13.8 11.8 L18 14.5 Z" fill="#FFFFFF" fill-opacity="0.92"/>
              <path d="M18 7 L20.8 10 L18 13 L15.2 10 L18 7 Z" fill="url(#vb-diamond-grad)"/>
              <defs>
                <linearGradient id="vb-pro-bg" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#0F172A"/>
                  <stop offset="0.5" stop-color="#1E1E2E"/>
                  <stop offset="1" stop-color="#311042"/>
                </linearGradient>
                <linearGradient id="vb-v-grad" x1="9" y1="10" x2="27" y2="26" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#818CF8"/>
                  <stop offset="0.6" stop-color="#C084FC"/>
                  <stop offset="1" stop-color="#E879F9"/>
                </linearGradient>
                <linearGradient id="vb-diamond-grad" x1="15" y1="7" x2="21" y2="13" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#38BDF8"/>
                  <stop offset="1" stop-color="#818CF8"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span class="logo-text">
            VocaBase
            <span
              v-if="vocab.stats"
              class="logo-badge rank-badge-top"
              :style="{ color: academicRank.color, borderColor: academicRank.border, background: academicRank.bg }"
              :title="'XP: ' + (vocab.stats?.xp || 0) + ' -> ' + academicRank.title"
            >
              {{ academicRank.title }}
            </span>
          </span>
        </RouterLink>

        <div class="nav-links">
          <RouterLink to="/dashboard" class="nav-link">Ana Sayfa</RouterLink>
          <RouterLink to="/words" class="nav-link">Defterim</RouterLink>
          <RouterLink to="/quiz" class="nav-link quiz-link">⚡ Akıllı Quiz & Oyunlar</RouterLink>
        </div>

        <div class="nav-user">
          <div v-if="vocab.stats" class="gamify-badges">
            <span class="badge-item streak-badge" title="Günlük Seri">
              🔥 <strong>{{ vocab.stats.streakDays || 0 }}</strong> Gün
            </span>
            <span class="badge-item xp-badge" title="Toplam Puan">
              ⚡ <strong>{{ vocab.stats.xp || 0 }}</strong> XP
            </span>
          </div>

          <!-- Sayfa başında sabit, kompakt Tema Seçici Kapsül -->
          <div class="theme-pill-top">
            <button
              class="theme-btn"
              :class="{ active: theme === 'light' }"
              @click="setTheme('light')"
              title="Açık Temayı Seç"
            >
              <span>☀️</span> Açık
            </button>
            <button
              class="theme-btn"
              :class="{ active: theme === 'dark' }"
              @click="setTheme('dark')"
              title="Koyu Temayı Seç"
            >
              <span>🌙</span> Koyu
            </button>
          </div>

          <span class="user-name">{{ auth.user?.display_name }}</span>
          <button class="btn btn-ghost btn-sm logout-btn" @click="logout">Çıkış</button>
        </div>
      </div>
    </nav>

    <!-- Mobile Bottom Navigation Bar (100% Solid Opacity so text never mixes) -->
    <div class="mobile-bottom-nav">
      <RouterLink to="/dashboard" class="mobile-nav-item">
        <span class="mob-icon">🏠</span>
        <span class="mob-label">Ana Sayfa</span>
      </RouterLink>
      <RouterLink to="/words" class="mobile-nav-item">
        <span class="mob-icon">📚</span>
        <span class="mob-label">Defterim</span>
      </RouterLink>
      <RouterLink to="/quiz" class="mobile-nav-item mob-quiz-item">
        <span class="mob-icon">⚡</span>
        <span class="mob-label">Quiz & Oyun</span>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: 10000;
  background: #13131f; /* Solid dark base by default */
  border-bottom: 1px solid var(--border);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

[data-theme="light"] .navbar {
  background: #ffffff !important;
  border-bottom: 1px solid #cbd5e1 !important;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.06) !important;
}

.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
  gap: 1rem;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 800;
  font-size: 1.25rem;
  transition: transform 0.2s;
  flex-shrink: 0;
}

.logo:hover {
  transform: scale(1.02);
}

.custom-logo {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
}

.custom-logo svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 2px 8px rgba(139, 92, 246, 0.3));
}

.logo-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'Outfit', 'Inter', sans-serif;
  letter-spacing: -0.02em;
}

.rank-badge-top {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  border: 1px solid;
  transition: all 0.3s;
  white-space: nowrap;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9375rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}

.nav-link:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}

.nav-link.router-link-active {
  color: var(--accent);
  background: rgba(99, 102, 241, 0.1);
}

.quiz-link {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15));
  border: 1px solid rgba(139, 92, 246, 0.3);
  color: #c084fc;
}

[data-theme="light"] .quiz-link {
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.12), rgba(219, 39, 119, 0.12));
  color: #4f46e5;
  border-color: rgba(79, 70, 229, 0.3);
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.gamify-badges {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge-item {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.streak-badge {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.xp-badge {
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
  border: 1px solid rgba(56, 189, 248, 0.3);
}

/* Sayfa başında sabit, kompakt Tema Seçici Kapsül */
.theme-pill-top {
  display: flex;
  align-items: center;
  gap: 2px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--border);
  padding: 3px;
  border-radius: 999px;
}

[data-theme="light"] .theme-pill-top {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.theme-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-btn:hover {
  color: var(--text-primary);
}

.theme-btn.active {
  background: linear-gradient(135deg, #6366f1, #818cf8);
  color: #ffffff !important;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.mobile-bottom-nav {
  display: none;
}

@media (max-width: 768px) {
  .navbar-inner {
    padding: 0 0.75rem;
    gap: 0.4rem;
  }
  .nav-links {
    display: none;
  }
  .streak-badge {
    display: none;
  }
  .user-name {
    display: none;
  }
  .nav-user {
    gap: 0.4rem;
  }
  .rank-badge-top {
    font-size: 0.65rem;
    padding: 0.15rem 0.4rem;
  }
  .logo-text {
    font-size: 1.05rem;
    gap: 0.35rem;
  }
  .theme-btn {
    padding: 4px 8px;
    font-size: 0.75rem;
  }
  /* 100% Solid Mobile Bottom Navigation Bar */
  .mobile-bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 66px;
    background: #13131f !important;
    border-top: 1px solid rgba(255, 255, 255, 0.15);
    z-index: 99999;
    justify-content: space-around;
    align-items: center;
    padding: 0 0.5rem;
    box-shadow: 0 -6px 25px rgba(0, 0, 0, 0.4);
    transition: background-color 0.3s ease, border-color 0.3s ease;
  }
  [data-theme="light"] .mobile-bottom-nav {
    background: #ffffff !important;
    border-top: 1px solid #cbd5e1 !important;
    box-shadow: 0 -4px 20px rgba(15, 23, 42, 0.1) !important;
  }
  .mobile-nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.15rem;
    color: var(--text-secondary);
    text-decoration: none;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 0.35rem 0.75rem;
    border-radius: 12px;
    transition: all 0.2s;
    flex: 1;
  }
  .mobile-nav-item.router-link-active {
    color: #c084fc;
    background: rgba(139, 92, 246, 0.15);
    border: 1px solid rgba(139, 92, 246, 0.3);
  }
  [data-theme="light"] .mobile-nav-item.router-link-active {
    color: #4f46e5;
    background: rgba(79, 70, 229, 0.12);
    border: 1px solid rgba(79, 70, 229, 0.3);
  }
  .mob-icon {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .rank-badge-top {
    display: none;
  }
  .logo-text {
    font-size: 0.95rem;
  }
  .logout-btn {
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
  }
}
</style>
