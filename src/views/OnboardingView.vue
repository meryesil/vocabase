<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const router = useRouter()
const auth = useAuthStore()

const selected = ref(null)
const loading = ref(false)

const exams = [
  { id: 'yokdil', name: 'YÖKDİL', icon: '🎓', desc: 'Akademik İngilizce yeterlilik sınavı' },
  { id: 'yds', name: 'YDS', icon: '📝', desc: 'Yabancı Dil Bilgisi Seviye Tespit Sınavı' },
  { id: 'toefl', name: 'TOEFL', icon: '🌍', desc: 'Uluslararası İngilizce yeterlilik' },
  { id: 'ielts', name: 'IELTS', icon: '✈️', desc: 'Uluslararası İngilizce dil sınavı' },
  { id: 'kpss', name: 'KPSS', icon: '🏛️', desc: 'Kamu personeli yabancı dil' },
  { id: 'other', name: 'Diğer', icon: '📚', desc: 'Genel akademik İngilizce' },
]

async function continueOnboarding() {
  if (!selected.value) return
  loading.value = true
  try {
    await auth.updateProfile({ examGoal: selected.value })
    router.push('/dashboard')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="page onboarding-page">
    <div class="container onboarding-container">
      <div class="onboarding-header">
        <h1>Hedefin ne?</h1>
        <p>Hangi akademik sınav için çalışıyorsun? Hedefini seç, profilinde rozet olarak sergile ve istikrarla ilerle!</p>
      </div>

      <div class="exam-grid">
        <button
          v-for="exam in exams"
          :key="exam.id"
          class="exam-card glass-card"
          :class="{ selected: selected === exam.id }"
          @click="selected = exam.id"
        >
          <span class="exam-icon">{{ exam.icon }}</span>
          <h3>{{ exam.name }}</h3>
          <p>{{ exam.desc }}</p>
        </button>
      </div>

      <button
        class="btn btn-primary btn-lg continue-btn"
        :disabled="!selected || loading"
        @click="continueOnboarding"
      >
        {{ loading ? 'Kaydediliyor...' : 'Devam Et' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.onboarding-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 3rem 0;
}

.onboarding-container {
  max-width: 720px;
}

.onboarding-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.onboarding-header h1 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.75rem;
}

.onboarding-header p {
  color: var(--text-secondary);
  font-size: 1.0625rem;
}

.exam-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.exam-card {
  padding: 1.5rem;
  text-align: left;
  cursor: pointer;
  color: var(--text-primary);
  background: var(--bg-card);
}

.exam-card.selected {
  border-color: var(--accent);
  background: rgba(99, 102, 241, 0.1);
  box-shadow: 0 0 0 1px var(--accent), 0 4px 20px var(--accent-glow);
}

.exam-icon {
  font-size: 2rem;
  display: block;
  margin-bottom: 0.75rem;
}

.exam-card h3 {
  font-size: 1.0625rem;
  font-weight: 700;
  margin-bottom: 0.25rem;
}

.exam-card p {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.continue-btn {
  display: block;
  width: 100%;
  max-width: 300px;
  margin: 0 auto;
}
</style>
