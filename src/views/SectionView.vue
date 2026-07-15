<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useVocabularyStore } from '@/stores/vocabulary.js'
import AppNavbar from '@/components/AppNavbar.vue'

const route = useRoute()
const router = useRouter()
const vocab = useVocabularyStore()

const showAddWord = ref(false)
const search = ref('')
const newWord = ref({
  english: '',
  turkish: '',
  example: '',
  notes: '',
  wordType: 'Genel',
  synonyms: '',
  difficulty: 2
})

const wordTypes = [
  'Genel',
  'Edat (Preposition)',
  'Edat (Zaman / Yer / Yön)',
  'Bağlaç (Conjunction)',
  'Bağlaç (Zıtlık)',
  'Bağlaç (Neden-Sonuç)',
  'Bağlaç (Ekleme)',
  'Bağlaç (Koşul)',
  'Fiil (Verb)',
  'Phrasal Verb / Fiil',
  'İsim (Noun)',
  'Sıfat (Adjective)',
  'Zarf (Adverb)',
  'Deyim / Kalıp (Idiom)'
]

const sectionId = computed(() => Number(route.params.id))

const section = computed(() => vocab.sections.find((s) => s.id === sectionId.value))

const filteredWords = computed(() => {
  let list = vocab.words || []
  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(
      (w) =>
        w.english.toLowerCase().includes(q) ||
        w.turkish.toLowerCase().includes(q) ||
        (w.synonyms && w.synonyms.toLowerCase().includes(q))
    )
  }
  return list.slice().sort((a, b) => {
    return (b.is_favorite || 0) - (a.is_favorite || 0) || new Date(b.created_at || 0) - new Date(a.created_at || 0)
  })
})

const movingWord = ref(null)
const targetMoveSectionId = ref('')

function openMoveModal(word) {
  movingWord.value = word
  const available = vocab.sections.filter(s => Number(s.id) !== Number(word.section_id) && !s.name.includes('Öğrenilen'))
  targetMoveSectionId.value = available.length > 0 ? available[0].id : (vocab.sections.find(s => Number(s.id) !== Number(word.section_id))?.id || '')
}

async function executeMove() {
  if (!movingWord.value || !targetMoveSectionId.value) return
  try {
    await vocab.moveWord(movingWord.value.id, targetMoveSectionId.value)
    await vocab.fetchWords(sectionId.value)
    movingWord.value = null
  } catch (err) {
    alert(err.message || 'Taşınırken bir hata oluştu')
  }
}

async function markLearned(word) {
  if (!confirm(`"${word.english}" kelimesini Öğrenildi olarak işaretleyip Öğrenilenler defterine taşımak istiyor musunuz?`)) return
  await vocab.markAsLearned(word.id)
  await vocab.fetchWords(sectionId.value)
}

async function unlearnWord(word) {
  if (!confirm(`"${word.english}" kelimesini Öğrenilenler defterinden çıkarıp tekrar aktif çalışmaya almak istiyor musunuz?`)) return
  try {
    await vocab.markAsUnlearned(word.id, sectionId.value)
    await vocab.fetchWords(sectionId.value)
  } catch (err) {
    alert(err.message || 'İşlem başarısız')
  }
}

function formatMasteryBadge(word) {
  if (!word) return ''
  if (word.mastery_level >= 5 || section.value?.name?.includes('Öğrenilen')) {
    return '🎓 Öğrenildi'
  }
  if (word.mastery_level === 0) {
    return '✨ Yeni'
  }
  return `⚡ Quiz: ${word.mastery_level}/5`
}

onMounted(async () => {
  await Promise.all([
    vocab.fetchSections(),
    vocab.fetchWords(sectionId.value),
    vocab.fetchAllWords()
  ])
})

function normalizeTokens(str) {
  if (!str || typeof str !== 'string') return []
  return str
    .split(/[\/;,|\n\t]|(?:\s+or\s+)|(?:\s+veya\s+)|(?:\s+-\s+)/i)
    .map(s => s.trim().toLowerCase())
    .filter(s => s.length > 0)
}

function checkFrontendDuplicate(allWords, newEng) {
  const newTokens = normalizeTokens(newEng)
  if (!allWords || allWords.length === 0 || newTokens.length === 0) return null

  for (const w of allWords) {
    if (w.english.trim().toLowerCase() === newEng.trim().toLowerCase()) {
      return { matchedToken: newEng.trim(), existingEnglish: w.english, sectionName: w.section_name }
    }
    const existingTokens = normalizeTokens(w.english)
    for (const t of newTokens) {
      if (existingTokens.includes(t)) {
        return { matchedToken: t, existingEnglish: w.english, sectionName: w.section_name }
      }
    }
  }
  return null
}

async function addWord() {
  if (!newWord.value.english.trim() || !newWord.value.turkish.trim()) return
  try {
    if (vocab.allWords && vocab.allWords.length > 0) {
      const dup = checkFrontendDuplicate(vocab.allWords, newWord.value.english)
      if (dup && dup.sectionName) {
        const msg = dup.existingEnglish.toLowerCase() !== newWord.value.english.trim().toLowerCase()
          ? `⚠️ "${newWord.value.english.trim()}" kelimesi (veya içindeki "${dup.matchedToken}" ifadesi), zaten "${dup.sectionName}" defterinizde "${dup.existingEnglish}" olarak kayıtlı! Eklenmedi.`
          : `⚠️ "${newWord.value.english.trim()}" kelimesi zaten "${dup.sectionName}" defterinizin içinde kayıtlı! Eklenmedi.`
        alert(msg)
        return
      }
    }
    await vocab.addWord({ sectionId: sectionId.value, ...newWord.value })
    showAddWord.value = false
    newWord.value = {
      english: '',
      turkish: '',
      example: '',
      notes: '',
      wordType: 'Genel',
      synonyms: '',
      difficulty: 2
    }
  } catch (err) {
    alert(err.message || 'Kelime eklenemedi')
  }
}

async function toggleFav(word) {
  const status = await vocab.toggleFavorite(word.id)
  word.is_favorite = status
}

async function removeWord(id) {
  if (!confirm('Bu kelimeyi silmek istediğinize emin misiniz?')) return
  await vocab.deleteWord(id)
}
</script>

<template>
  <div class="page section-page">
    <AppNavbar />

    <div class="container section-content">
      <button class="back-btn" @click="router.push('/dashboard')">← Ana Sayfa</button>

      <header v-if="section" class="section-header">
        <div class="section-info">
          <span class="section-icon" :style="{ background: section.color + '22' }">
            {{ section.icon }}
          </span>
          <div>
            <h1>{{ section.name }}</h1>
            <p v-if="section.description">{{ section.description }}</p>
            <span class="word-counter">Bölümde {{ vocab.words.length }} kelime var</span>
          </div>
        </div>
        <div class="section-actions">
          <button class="btn btn-primary" @click="showAddWord = true">+ Yeni Kelime Ekle</button>
          <button
            class="btn btn-ghost"
            :disabled="vocab.words.length === 0"
            @click="router.push(`/quiz?section=${sectionId}`)"
          >
            🎯 Akıllı Quiz
          </button>
        </div>
      </header>

      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input
          v-model="search"
          class="form-input search-input"
          placeholder="Bu bölümde kelime ara..."
          type="search"
        />
      </div>

      <div v-if="vocab.loading" class="loading">Yükleniyor...</div>

      <div v-else-if="filteredWords.length === 0" class="empty-state glass-card">
        <span class="empty-icon">✏️</span>
        <h3>{{ search ? 'Sonuç bulunamadı' : 'Henüz kelime yok' }}</h3>
        <p v-if="!search">İlk kelimeni ekle ve öğrenmeye başla!</p>
        <button v-if="!search" class="btn btn-primary" @click="showAddWord = true">
          + Kelime Ekle
        </button>
      </div>

      <div v-else class="words-list">
        <div v-for="word in filteredWords" :key="word.id" class="word-card glass-card">
          <div class="word-main">
            <div class="word-header">
              <span class="word-en">{{ word.english }}</span>
              <span class="type-badge">{{ word.word_type || 'Genel' }}</span>
              <button
                class="star-btn"
                :class="{ starred: word.is_favorite === 1 }"
                title="Yıldızla"
                @click="toggleFav(word)"
              >
                {{ word.is_favorite === 1 ? '⭐' : '☆' }}
              </button>
            </div>

            <div class="word-tr">{{ word.turkish }}</div>

            <div v-if="word.synonyms" class="word-synonyms">
              <strong>Eş Anlam:</strong> {{ word.synonyms }}
            </div>

            <p v-if="word.example" class="word-example">"{{ word.example }}"</p>
            <p v-if="word.notes" class="word-notes">📝 {{ word.notes }}</p>
          </div>

          <div class="word-meta">
            <span class="mastery-badge" :data-level="word.mastery_level">
              {{ formatMasteryBadge(word) }}
            </span>
            <div class="mini-actions-row">
              <button
                v-if="word.mastery_level < 5 && !section?.name?.includes('Öğrenilen')"
                class="mini-btn learn-pill"
                title="Öğrenildi Olarak İşaretle (Öğrenilenler Defterine Gönder)"
                @click="markLearned(word)"
              >
                ✓ Öğrenildi
              </button>
              <button class="mini-btn move-pill" title="İstediğin Deftere Taşı" @click="openMoveModal(word)">
                ↗ Taşı
              </button>
              <button class="mini-btn del-pill" title="Sil" @click="removeWord(word.id)">✕</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showAddWord" class="modal-overlay" @click.self="showAddWord = false">
        <div class="modal glass-card">
          <h2>Yeni Kelime / Bağlaç Ekle</h2>
          <form @submit.prevent="addWord" class="modal-form">
            <div class="form-row">
              <div class="form-group flex-1">
                <label>İngilizce</label>
                <input
                  v-model="newWord.english"
                  class="form-input"
                  placeholder="Örn: nevertheless"
                  required
                />
              </div>
              <div class="form-group flex-1">
                <label>Türkçe Anlam</label>
                <input
                  v-model="newWord.turkish"
                  class="form-input"
                  placeholder="Örn: buna rağmen, yine de"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label>Tür / Kategori</label>
                <select v-model="newWord.wordType" class="form-input">
                  <option v-for="wt in wordTypes" :key="wt" :value="wt">{{ wt }}</option>
                </select>
              </div>
              <div class="form-group flex-1">
                <label>Zorluk Seviyesi (1-3)</label>
                <select v-model.number="newWord.difficulty" class="form-input">
                  <option :value="1">1 - Temel</option>
                  <option :value="2">2 - Orta Akademik</option>
                  <option :value="3">3 - İleri YÖKDİL/YDS</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Eş Anlamlılar (Synonyms - Opsiyonel)</label>
              <input
                v-model="newWord.synonyms"
                class="form-input"
                placeholder="Örn: however, yet, even so"
              />
            </div>

            <div class="form-group">
              <label>Örnek Cümle</label>
              <textarea
                v-model="newWord.example"
                class="form-input"
                rows="2"
                placeholder="Örn: Nevertheless, the study showed significant results."
              ></textarea>
            </div>

            <div class="form-group">
              <label>Notlar</label>
              <input
                v-model="newWord.notes"
                class="form-input"
                placeholder="Ek notlar..."
              />
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-ghost" @click="showAddWord = false">
                İptal
              </button>
              <button type="submit" class="btn btn-primary">Kaydet</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Move Word Modal -->
    <Teleport to="body">
      <div v-if="movingWord" class="modal-overlay" @click.self="movingWord = null">
        <div class="modal glass-card">
          <h2>📦 Kelimeyi Başka Deftere Taşı</h2>
          <p class="modal-desc">"<strong>{{ movingWord.english }}</strong>" kelimesini nereye taşımak istersiniz?</p>
          
          <div class="form-group" style="margin-top: 1.2rem;">
            <label>Hedef Defter / Bölüm</label>
            <select v-model="targetMoveSectionId" class="form-input">
              <option v-for="sec in vocab.sections.filter(s => Number(s.id) !== Number(movingWord?.section_id))" :key="sec.id" :value="sec.id">
                {{ sec.icon || '📚' }} {{ sec.name }}
              </option>
            </select>
          </div>

          <div class="modal-actions" style="margin-top: 1.5rem;">
            <button type="button" class="btn btn-ghost" @click="movingWord = null">İptal</button>
            <button type="button" class="btn btn-primary" @click="executeMove">Taşı</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.section-content {
  padding: 2rem 1.5rem 4rem;
}

.back-btn {
  background: none;
  color: var(--text-secondary);
  font-size: 0.9375rem;
  margin-bottom: 1.5rem;
  padding: 0.25rem 0;
  transition: color 0.2s;
}

.back-btn:hover {
  color: var(--text-primary);
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.75rem;
  flex-wrap: wrap;
}

.section-info {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.section-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 16px;
  font-size: 2rem;
  flex-shrink: 0;
}

.section-header h1 {
  font-size: 1.65rem;
  font-weight: 800;
}

.section-header p {
  color: var(--text-secondary);
  font-size: 0.9375rem;
  margin-top: 0.25rem;
}

.word-counter {
  display: inline-block;
  margin-top: 0.4rem;
  font-size: 0.8rem;
  color: #38bdf8;
  font-weight: 600;
}

.section-actions {
  display: flex;
  gap: 0.75rem;
}

.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 1.75rem;
}

.search-icon {
  position: absolute;
  left: 1rem;
  font-size: 1.125rem;
  opacity: 0.6;
}

.search-input {
  width: 100%;
  padding-left: 2.75rem !important;
  font-size: 1rem;
}

.words-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.word-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.35rem 1.6rem;
}

.word-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.word-en {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--accent);
}

.type-badge {
  font-size: 0.75rem;
  color: #a855f7;
  background: rgba(168, 85, 247, 0.12);
  border: 1px solid rgba(168, 85, 247, 0.3);
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
}

.star-btn {
  background: none;
  font-size: 1.2rem;
  color: #64748b;
  transition: transform 0.2s;
}

.star-btn:hover {
  transform: scale(1.2);
}

.star-btn.starred {
  color: #fbbf24;
}

.word-tr {
  font-size: 1.0625rem;
  font-weight: 600;
  margin-top: 0.25rem;
  color: var(--text-primary);
}

.word-synonyms {
  font-size: 0.825rem;
  color: #38bdf8;
  margin-top: 0.25rem;
}

.word-example {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-style: italic;
  margin-top: 0.5rem;
}

.word-notes {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin-top: 0.375rem;
}

.word-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.45rem;
  flex-shrink: 0;
}

.mastery-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.22rem 0.6rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-muted);
}

.mastery-badge[data-level='3'],
.mastery-badge[data-level='4'],
.mastery-badge[data-level='5'] {
  background: rgba(52, 211, 153, 0.15);
  color: var(--success);
}

.mastery-badge[data-level='1'],
.mastery-badge[data-level='2'] {
  background: rgba(251, 191, 36, 0.15);
  color: var(--warning);
}

.mini-actions-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.mini-btn {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  padding: 0.18rem 0.55rem;
  font-size: 0.72rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
}

.mini-btn:hover {
  transform: translateY(-1px);
}

.learn-pill {
  color: #34d399;
  background: rgba(52, 211, 153, 0.12);
  border-color: rgba(52, 211, 153, 0.25);
}
.learn-pill:hover {
  background: rgba(52, 211, 153, 0.22);
}

.move-pill {
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.12);
  border-color: rgba(56, 189, 248, 0.25);
}
.move-pill:hover {
  background: rgba(56, 189, 248, 0.22);
}

.del-pill {
  color: #94a3b8;
  background: transparent;
  border-color: transparent;
  padding: 0.18rem 0.4rem;
}
.del-pill:hover {
  color: #f87171;
  background: rgba(248, 113, 113, 0.12);
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.loading {
  text-align: center;
  color: var(--text-secondary);
  padding: 2rem;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal {
  width: 100%;
  max-width: 520px;
  padding: 2rem;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h2 {
  font-size: 1.375rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.flex-1 {
  flex: 1;
  min-width: 200px;
}

textarea.form-input {
  resize: vertical;
  min-height: 60px;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 0.5rem;
}

[data-theme="light"] .section-header h1,
[data-theme="light"] .word-card h3 {
  color: #0f172a !important;
}
</style>
