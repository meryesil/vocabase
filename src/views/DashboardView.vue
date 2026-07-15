<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { useVocabularyStore } from '@/stores/vocabulary.js'
import { getRanksList, getRankByXp } from '@/utils/ranks.js'
import AppNavbar from '@/components/AppNavbar.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const vocab = useVocabularyStore()

const showModal = ref(false)
const showStarterModal = ref(false)
const showRanksModal = ref(false)
const importingPackId = ref(null)
const newSection = ref({ name: '', description: '', icon: '📚', color: '#6366f1' })

const icons = ['📚', '🔗', '📝', '💡', '🎯', '⚡', '🧠', '📖', '✏️', '🏷️', '🩺', '🏛️']
const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']

const examLabels = {
  yokdil: 'YÖKDİL',
  yds: 'YDS',
  toefl: 'TOEFL',
  ielts: 'IELTS',
  kpss: 'KPSS',
  other: 'Genel Akademik'
}

const userExamGoal = computed(() => auth.user?.exam_goal || auth.user?.examGoal || 'other')
const userRankInfo = computed(() => getRankByXp(vocab.stats?.xp || 0, userExamGoal.value))
const currentRanksList = computed(() => getRanksList(userExamGoal.value))

async function changeExamGoal(newGoal) {
  try {
    await auth.updateProfile({ examGoal: newGoal })
  } catch (e) {
    alert(e.message || 'Hedef güncellenemedi')
  }
}

onMounted(async () => {
  if (route.query.ranks === '1') {
    showRanksModal.value = true
  }
  await Promise.all([
    vocab.fetchSections(),
    vocab.fetchStats(),
    vocab.fetchStarterPacks()
  ])
})

async function createSection() {
  if (!newSection.value.name.trim()) return
  await vocab.createSection(newSection.value)
  showModal.value = false
  newSection.value = { name: '', description: '', icon: '📚', color: '#6366f1' }
  await vocab.fetchStats()
}

async function handleImportPack(packId) {
  importingPackId.value = packId
  try {
    const sec = await vocab.importPack(packId)
    alert(`🎉 "${sec.name}" bölümü ve içindeki ${sec.word_count} kelime defterinize eklendi!`)
    showStarterModal.value = false
  } catch (e) {
    alert('Hata: ' + e.message)
  } finally {
    importingPackId.value = null
  }
}

async function removeSection(id) {
  if (!confirm('Bu bölümü ve içindeki tüm kelimeleri silmek istediğinize emin misiniz?')) return
  await vocab.deleteSection(id)
  await vocab.fetchStats()
}
</script>

<template>
  <div class="page dashboard">
    <AppNavbar />

    <div class="container dashboard-content">
      <!-- Hero Welcome -->
      <header class="dash-header">
        <div>
          <h1>Merhaba, {{ auth.user?.display_name }} 👋</h1>
          <p class="dash-sub">
            <span v-if="auth.user?.exam_goal" class="exam-badge">
              🎓 {{ examLabels[auth.user.exam_goal] || auth.user.exam_goal }} Hedefi
            </span>
            Dijital akademik kelime defterin & akıllı çalışma istasyonun hazır.
          </p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary btn-glow" @click="router.push('/quiz')">⚡ Akıllı Quiz & Oyunlar</button>
          <button class="btn btn-ghost" @click="router.push('/words')">📖 Tüm Defterim</button>
          <button class="btn btn-ghost" @click="showRanksModal = true">🏆 Ünvan & XP</button>
          <button class="btn btn-ghost" @click="showModal = true">+ Yeni Bölüm</button>
        </div>
      </header>

      <!-- Gamified Progress Strip -->
      <div v-if="vocab.stats" class="gamify-strip glass-card">
        <div class="strip-item">
          <span class="strip-icon streak-glow">🔥</span>
          <div class="strip-text">
            <span class="strip-val">{{ vocab.stats.streakDays || 0 }} Gün</span>
            <span class="strip-lbl">Çalışma Serisi</span>
          </div>
        </div>
        <div class="strip-item clickable-strip" @click="showRanksModal = true" title="Ünvan basamaklarını ve XP tablosunu görmek için tıklayın">
          <span class="strip-icon xp-glow">⚡</span>
          <div class="strip-text">
            <span class="strip-val">{{ vocab.stats.xp || 0 }} XP</span>
            <span class="strip-lbl">Akademik Puan 🏆</span>
          </div>
        </div>
        <div class="strip-item clickable-strip" @click="router.push('/words?learned=1')" title="Öğrenilen kelimelerinizi görmek için tıklayın">
          <span class="strip-icon">🎯</span>
          <div class="strip-text">
            <span class="strip-val">{{ vocab.stats.learned || 0 }} / {{ vocab.stats.totalWords || 0 }}</span>
            <span class="strip-lbl">Öğrenilen Kelime</span>
          </div>
        </div>
        <div class="strip-item">
          <span class="strip-icon">📚</span>
          <div class="strip-text">
            <span class="strip-val">{{ vocab.stats.sectionCount || 0 }}</span>
            <span class="strip-lbl">Özel Kategori</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions Banner for Starter Packs -->
      <div class="starter-banner glass-card">
        <div class="banner-info">
          <h3>📦 Hazır {{ examLabels[userExamGoal] || 'Akademik' }} Kelime & Bağlaç Paketleri</h3>
          <p>
            Daha hızlı başlamak ister misin? Hedefine özel en sık çıkan <strong>Bağlaçlar</strong>, <strong>Temel Fiiller</strong> ve alan kelimelerini tek tıkla defterine aktar!
          </p>
        </div>
        <button class="btn btn-primary banner-btn" @click="showStarterModal = true">
          ✨ Hazır Paket İncele & Ekle
        </button>
      </div>

      <!-- Sections Grid -->
      <section class="sections-area">
        <div class="sections-header">
          <h2>📁 Defter Bölümlerim</h2>
          <button class="btn btn-ghost btn-sm" @click="showModal = true">+ Bölüm Ekle</button>
        </div>

        <div v-if="vocab.loading" class="loading">Yükleniyor...</div>

        <div v-else-if="vocab.sections.length === 0" class="empty-state glass-card">
          <span class="empty-icon">📚</span>
          <h3>Henüz özel bölümünüz yok</h3>
          <p>Kendi kategorilerinizi oluşturun veya hazır paketlerimizden birini tek tıkla yükleyin.</p>
          <div class="empty-actions">
            <button class="btn btn-primary" @click="showModal = true">+ Kendi Bölümümü Oluştur</button>
            <button class="btn btn-ghost" @click="showStarterModal = true">📦 Hazır Paket Ekle</button>
          </div>
        </div>

        <div v-else class="sections-grid">
          <div
            v-for="section in vocab.sections"
            :key="section.id"
            class="section-card glass-card"
            @click="router.push(`/section/${section.id}`)"
          >
            <div class="section-top">
              <span class="section-icon" :style="{ background: section.color + '22', borderColor: section.color }">
                {{ section.icon }}
              </span>
              <button
                class="delete-btn"
                title="Bölümü Sil"
                @click.stop="removeSection(section.id)"
              >
                ✕
              </button>
            </div>
            <h3>{{ section.name }}</h3>
            <p v-if="section.description" class="section-desc">{{ section.description }}</p>
            <div class="section-meta">
              <span class="word-count">✏️ {{ section.word_count || 0 }} kelime</span>
              <span class="go-link">İncele →</span>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Create Section Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal glass-card">
          <h2>Yeni Bölüm Oluştur</h2>
          <form @submit.prevent="createSection" class="modal-form">
            <div class="form-group">
              <label>Bölüm Adı</label>
              <input
                v-model="newSection.name"
                class="form-input"
                placeholder="Örn: YÖKDİL Bağlaçlar, Akademik Sıfatlar..."
                required
              />
            </div>
            <div class="form-group">
              <label>Açıklama (opsiyonel)</label>
              <input
                v-model="newSection.description"
                class="form-input"
                placeholder="Bu bölümde ne tür kelimeler olacak?"
              />
            </div>
            <div class="form-group">
              <label>İkon Seç</label>
              <div class="picker-row">
                <button
                  v-for="ic in icons"
                  :key="ic"
                  type="button"
                  class="picker-item"
                  :class="{ active: newSection.icon === ic }"
                  @click="newSection.icon = ic"
                >
                  {{ ic }}
                </button>
              </div>
            </div>
            <div class="form-group">
              <label>Renk Tema Tokenı</label>
              <div class="picker-row">
                <button
                  v-for="c in colors"
                  :key="c"
                  type="button"
                  class="color-item"
                  :class="{ active: newSection.color === c }"
                  :style="{ background: c }"
                  @click="newSection.color = c"
                ></button>
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-ghost" @click="showModal = false">İptal</button>
              <button type="submit" class="btn btn-primary">Oluştur</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Starter Packs Modal -->
    <Teleport to="body">
      <div v-if="showStarterModal" class="modal-overlay" @click.self="showStarterModal = false">
        <div class="modal starter-modal glass-card">
          <h2>📦 Hazır {{ examLabels[userExamGoal] || 'Akademik' }} Kelime & Bağlaç Paketleri</h2>
          <p class="modal-sub">
            Aşağıdaki uzman onaylı hazır kelime paketlerinden istediğinizi tek tıkla kendi defterinize ayrı bir bölüm olarak ekleyebilirsiniz.
          </p>

          <div class="packs-list">
            <div v-for="pack in vocab.starterPacks" :key="pack.id" class="pack-card glass-card">
              <div class="pack-top">
                <span class="pack-icon" :style="{ background: pack.color + '22', color: pack.color }">
                  {{ pack.icon }}
                </span>
                <div class="pack-details">
                  <h4>{{ pack.name }}</h4>
                  <p>{{ pack.description }}</p>
                </div>
              </div>
              <div class="pack-actions">
                <span class="pack-badge">{{ pack.words.length }} Kelime</span>
                <button
                  class="btn btn-primary btn-sm"
                  :disabled="importingPackId === pack.id"
                  @click="handleImportPack(pack.id)"
                >
                  {{ importingPackId === pack.id ? 'Ekleniyor...' : '➕ Tek Tıkla Ekle' }}
                </button>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" @click="showStarterModal = false">Kapat</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Ranks and XP Progression Modal -->
    <Teleport to="body">
      <div v-if="showRanksModal" class="modal-overlay" @click.self="showRanksModal = false">
        <div class="modal ranks-modal glass-card">
          <div class="modal-header-flex">
            <div>
              <h2 class="modal-title">🏆 {{ examLabels[userExamGoal] || 'Akademik' }} Ünvan Basamakları & XP Yolu</h2>
              <p class="modal-desc">Seçtiğiniz hedefe uygun kelimelerde uzmanlaştıkça yeni ünvanların kilidini açın.</p>
            </div>
            <button class="close-icon-btn" @click="showRanksModal = false">✕</button>
          </div>

          <!-- Goal Switcher inside modal -->
          <div class="goal-switcher">
            <span>🎯 Aktif Hedefin: <strong>{{ examLabels[userExamGoal] || 'Genel Akademik' }}</strong> <small>(Değiştirmek için tıkla)</small></span>
            <div class="goal-chips">
              <button
                v-for="(label, key) in examLabels"
                :key="key"
                class="goal-chip"
                :class="{ active: userExamGoal === key }"
                @click="changeExamGoal(key)"
              >
                {{ label }}
              </button>
            </div>
          </div>

          <!-- Current Rank & Progress Card -->
          <div class="current-rank-card" :style="{ borderColor: userRankInfo.current.border, background: userRankInfo.current.bg }">
            <div class="rank-current-left">
              <span class="rank-badge-lg" :style="{ color: userRankInfo.current.color, borderColor: userRankInfo.current.border }">
                {{ userRankInfo.current.title }}
              </span>
              <p class="rank-current-desc">{{ userRankInfo.current.desc }}</p>
            </div>
            <div class="rank-current-right">
              <div class="xp-stat-num">{{ vocab.stats?.xp || 0 }} <span>XP</span></div>
              <div v-if="userRankInfo.next" class="xp-next-info">
                Sonraki Ünvan: <strong>{{ userRankInfo.next.title }}</strong> ({{ userRankInfo.xpNeeded }} XP kaldı)
              </div>
              <div v-else class="xp-next-info">
                👑 Zirve Ünvana Ulaştınız!
              </div>
              <div v-if="userRankInfo.next" class="progress-bar-wrap">
                <div class="progress-bar-inner" :style="{ width: userRankInfo.progressPercent + '%' }"></div>
              </div>
            </div>
          </div>

          <!-- Ranks Ladder -->
          <div class="ranks-ladder">
            <div
              v-for="rank in currentRanksList"
              :key="rank.title"
              class="rank-ladder-item"
              :class="{ 'rank-achieved': (vocab.stats?.xp || 0) >= rank.xp, 'rank-active-now': userRankInfo.current.title === rank.title }"
            >
              <div class="rank-item-left">
                <span class="rank-status-icon">
                  {{ (vocab.stats?.xp || 0) >= rank.xp ? '✅' : '🔒' }}
                </span>
                <div>
                  <div class="rank-item-title" :style="{ color: rank.color }">{{ rank.title }}</div>
                  <div class="rank-item-desc">{{ rank.desc }}</div>
                </div>
              </div>
              <div class="rank-item-xp">{{ rank.xp }} XP</div>
            </div>
          </div>

          <!-- How to Earn XP Tips -->
          <div class="xp-tips-box">
            <h4>💡 Nasıl XP Kazanılır?</h4>
            <ul>
              <li>⚡ <strong>Akıllı Quiz & Oyunlar:</strong> Tamamlanan her seans için +25 ile +50 XP</li>
              <li>📖 <strong>Doğru Kelime Cevapları:</strong> Quizde bildiğiniz her doğru kelime için +5 XP</li>
              <li>🔥 <strong>Günlük Seri (Streak):</strong> Çalışma serinizi koruduğunuz her gün ekstra bonus XP</li>
            </ul>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-primary" @click="showRanksModal = false">Anladım, Çalışmaya Devam 🚀</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.dashboard-content {
  padding: 2.25rem 1.5rem 5rem;
}

.dash-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.dash-header h1 {
  font-size: 1.875rem;
  font-weight: 800;
}

.dash-sub {
  color: var(--text-secondary);
  margin-top: 0.4rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
  line-height: 1.6;
}

.exam-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.75rem;
  background: rgba(99, 102, 241, 0.18);
  border: 1px solid rgba(99, 102, 241, 0.4);
  border-radius: 999px;
  font-size: 0.8125rem;
  font-weight: 700;
  color: #a855f7;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-glow {
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
}

.gamify-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05), rgba(99, 102, 241, 0.06));
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.strip-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.strip-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
}

.streak-glow {
  box-shadow: 0 0 16px rgba(251, 191, 36, 0.3);
  background: rgba(251, 191, 36, 0.12);
}

.xp-glow {
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.3);
  background: rgba(56, 189, 248, 0.12);
}

.strip-text {
  display: flex;
  flex-direction: column;
}

.strip-val {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-primary);
}

.strip-lbl {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.starter-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.6rem 2rem;
  margin-bottom: 2.5rem;
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(59, 130, 246, 0.12));
  border: 1px solid rgba(139, 92, 246, 0.3);
  flex-wrap: wrap;
}

.banner-info h3 {
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 0.35rem;
  color: #e9d5ff;
}

.banner-info p {
  color: var(--text-secondary);
  font-size: 0.9375rem;
  max-width: 650px;
}

.banner-btn {
  white-space: nowrap;
}

.sections-area {
  margin-top: 1rem;
}

.sections-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.35rem;
}

.sections-header h2 {
  font-size: 1.35rem;
  font-weight: 800;
}

.sections-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.section-card {
  padding: 1.6rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.section-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.1rem;
}

.section-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 14px;
  font-size: 1.75rem;
  border: 1px solid transparent;
}

.delete-btn {
  background: none;
  color: var(--text-muted);
  font-size: 0.875rem;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  opacity: 0;
  transition: all 0.2s;
}

.section-card:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  background: rgba(248, 113, 113, 0.15);
  color: var(--error);
}

.section-card h3 {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: 0.35rem;
}

.section-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: 1.25rem;
  line-height: 1.5;
}

.section-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 0.85rem;
  margin-top: auto;
}

.word-count {
  font-size: 0.825rem;
  color: #38bdf8;
  font-weight: 600;
}

.go-link {
  font-size: 0.825rem;
  font-weight: 600;
  color: var(--accent);
  transition: transform 0.2s;
}

.section-card:hover .go-link {
  transform: translateX(4px);
}

.empty-state {
  text-align: center;
  padding: 3.5rem 2rem;
}

.empty-icon {
  font-size: 3.5rem;
  display: block;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.35rem;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 1.75rem;
}

.empty-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.loading {
  text-align: center;
  color: var(--text-secondary);
  padding: 3rem;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal {
  width: 100%;
  max-width: 480px;
  padding: 2.25rem;
  max-height: 90vh;
  overflow-y: auto;
}

.starter-modal {
  max-width: 680px;
}

.modal h2 {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.modal-sub {
  color: var(--text-secondary);
  font-size: 0.9375rem;
  margin-bottom: 1.75rem;
  line-height: 1.6;
}

.packs-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.pack-card {
  padding: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.pack-top {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
  min-width: 250px;
}

.pack-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.pack-details h4 {
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 0.2rem;
}

.pack-details p {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.pack-actions {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.pack-badge {
  font-size: 0.8rem;
  color: #38bdf8;
  font-weight: 600;
  background: rgba(56, 189, 248, 0.12);
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.picker-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.picker-item {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
  font-size: 1.25rem;
  transition: all 0.2s;
}

.picker-item.active {
  border-color: var(--accent);
  background: rgba(99, 102, 241, 0.2);
  transform: scale(1.08);
}

.color-item {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.color-item.active {
  border-color: white;
  transform: scale(1.18);
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.4);
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 0.75rem;
}

/* Mobile Responsiveness for Dashboard */
@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .header-actions {
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
  .header-actions .btn {
    width: 100%;
    padding: 0.65rem 0.5rem;
    font-size: 0.85rem;
  }
  .gamify-strip {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
  .sections-grid {
    grid-template-columns: 1fr;
  }
}

[data-theme="light"] .banner-info h3,
[data-theme="light"] .sections-header h2,
[data-theme="light"] .section-card h3 {
  color: #0f172a !important;
}

[data-theme="light"] .starter-banner {
  background: #ffffff !important;
  border-color: #cbd5e1 !important;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08) !important;
}

.clickable-strip {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.clickable-strip:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.22);
}

.ranks-modal {
  max-width: 680px !important;
  max-height: 88vh;
  overflow-y: auto;
}

.goal-switcher {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
  padding: 0.9rem 1.1rem;
  border-radius: 12px;
  margin-bottom: 1.25rem;
  font-size: 0.88rem;
}

.goal-switcher small {
  color: var(--text-muted);
  font-size: 0.78rem;
  margin-left: 0.35rem;
}

.goal-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.65rem;
}

.goal-chip {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  padding: 0.3rem 0.75rem;
  border-radius: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  transition: all 0.2s;
  cursor: pointer;
}

.goal-chip:hover {
  background: rgba(255, 255, 255, 0.12);
  color: var(--text-primary);
}

.goal-chip.active {
  background: rgba(139, 92, 246, 0.2);
  border-color: #8b5cf6;
  color: #c084fc;
  box-shadow: 0 0 10px rgba(139, 92, 246, 0.25);
}

.current-rank-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-radius: 16px;
  border: 1px solid;
  margin-bottom: 1.5rem;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.rank-current-left {
  flex: 1;
  min-width: 220px;
}

.rank-badge-lg {
  font-size: 1.1rem;
  font-weight: 800;
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  border: 1px solid;
  display: inline-block;
  margin-bottom: 0.6rem;
}

.rank-current-desc {
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0;
}

.rank-current-right {
  min-width: 200px;
  text-align: right;
}

.xp-stat-num {
  font-size: 1.85rem;
  font-weight: 900;
  color: #fbbf24;
}

.xp-stat-num span {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-muted);
}

.xp-next-info {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin: 0.35rem 0 0.55rem;
}

.progress-bar-wrap {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  overflow: hidden;
}

.progress-bar-inner {
  height: 100%;
  background: linear-gradient(90deg, #38bdf8, #818cf8, #c084fc);
  transition: width 0.5s ease;
}

.ranks-ladder {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.rank-ladder-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 1.15rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid var(--border);
  transition: all 0.2s;
}

.rank-ladder-item.rank-achieved {
  background: rgba(16, 185, 129, 0.06);
  border-color: rgba(16, 185, 129, 0.25);
}

.rank-ladder-item.rank-active-now {
  border: 2px solid #8b5cf6 !important;
  box-shadow: 0 0 15px rgba(139, 92, 246, 0.25);
  background: rgba(139, 92, 246, 0.12) !important;
}

.rank-item-left {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.rank-status-icon {
  font-size: 1.25rem;
}

.rank-item-title {
  font-weight: 700;
  font-size: 0.98rem;
  margin-bottom: 0.15rem;
}

.rank-item-desc {
  font-size: 0.82rem;
  color: var(--text-muted);
}

.rank-item-xp {
  font-weight: 800;
  font-size: 0.9rem;
  color: var(--text-secondary);
  background: rgba(255, 255, 255, 0.06);
  padding: 0.25rem 0.65rem;
  border-radius: 8px;
  white-space: nowrap;
}

.xp-tips-box {
  background: rgba(56, 189, 248, 0.08);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 12px;
  padding: 1.1rem 1.25rem;
  margin-bottom: 1.5rem;
}

.xp-tips-box h4 {
  font-size: 0.95rem;
  font-weight: 700;
  color: #38bdf8;
  margin-bottom: 0.6rem;
}

.xp-tips-box ul {
  margin: 0;
  padding-left: 1.25rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
  line-height: 1.7;
}
</style>
