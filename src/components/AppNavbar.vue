<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { useVocabularyStore } from '@/stores/vocabulary.js'

const router = useRouter()
const auth = useAuthStore()
const vocab = useVocabularyStore()

const theme = ref(localStorage.getItem('theme') || 'dark')

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  localStorage.setItem('theme', theme.value)
  document.documentElement.setAttribute('data-theme', theme.value)
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
          <button
            class="btn btn-ghost btn-sm theme-toggle-btn"
            @click="toggleTheme"
            :title="theme === 'dark' ? 'Açık Temaya Geç' : 'Koyu Temaya Geç'"
          >
            {{ theme === 'dark' ? '☀️' : '🌙' }}
          </button>

          <div v-if="vocab.stats" class="gamify-badges">
            <span class="badge-item streak-badge" title="Günlük Seri">
              🔥 <strong>{{ vocab.stats.streakDays || 0 }}</strong> Gün
            </span>
            <span class="badge-item xp-badge" title="Toplam Puan">
              ⚡ <strong>{{ vocab.stats.xp || 0 }}</strong> XP
            </span>
          </div>

          <span class="user-name">{{ auth.user?.display_name }}</span>
          <button class="btn btn-ghost btn-sm" @click="logout">Çıkış</button>
        </div>
      </div>
    </nav>

    <!-- Mobile Bottom Navigation Bar -->
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
  z-index: 100;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  background: rgba(10, 10, 15, 0.85);
  border-bottom: 1px solid var(--border);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);
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
  flex-shrink: 0;
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
  font-size: 1.15rem;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  white-space: nowrap;
}

.rank-badge-top {
  font-size: 0.75rem;
  padding: 0.22rem 0.65rem;
  border-radius: 999px;
  font-weight: 700;
  border: 1px solid;
  transition: all 0.3s ease;
  white-space: nowrap;
  letter-spacing: 0.02em;
}

.nav-links {
  display: flex;
  gap: 0.4rem;
  align-items: center;
  flex-shrink: 0;
}

.nav-link {
  padding: 0.45rem 0.85rem;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.92rem;
  transition: all 0.2s;
  text-decoration: none;
  white-space: nowrap;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: var(--text-primary);
  background: var(--bg-card-hover);
}

.quiz-link {
  background: rgba(139, 92, 246, 0.15);
  color: #c084fc;
  border: 1px solid rgba(139, 92, 246, 0.35);
}

.quiz-link:hover {
  background: rgba(139, 92, 246, 0.25);
  box-shadow: 0 0 15px rgba(168, 85, 247, 0.3);
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
  gap: 0.4rem;
}

.badge-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
  white-space: nowrap;
  flex-shrink: 0;
  height: 32px;
  line-height: 1;
}

.streak-badge {
  color: #fbbf24;
  border-color: rgba(251, 191, 36, 0.3);
  background: rgba(251, 191, 36, 0.1);
}

.xp-badge {
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.3);
  background: rgba(56, 189, 248, 0.1);
}

.user-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-sm {
  padding: 0.45rem 0.85rem;
  font-size: 0.8rem;
  white-space: nowrap;
  flex-shrink: 0;
  height: 32px;
  display: inline-flex;
  align-items: center;
}

.mobile-bottom-nav {
  display: none;
}

/* Responsive Rules */
.theme-toggle-btn {
  font-size: 1.15rem;
  padding: 0.35rem 0.6rem;
}

@media (max-width: 992px) {
  .nav-link {
    padding: 0.4rem 0.6rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 768px) {
  .navbar-inner {
    padding: 0 0.75rem;
    gap: 0.5rem;
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
    font-size: 0.68rem;
    padding: 0.18rem 0.45rem;
  }
  .logo-text {
    font-size: 1.02rem;
    gap: 0.35rem;
  }
  .mobile-bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 66px;
    background: rgba(12, 12, 20, 0.96);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-top: 1px solid var(--border);
    z-index: 1000;
    justify-content: space-around;
    align-items: center;
    padding: 0 0.5rem;
    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.6);
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
}
</style>
