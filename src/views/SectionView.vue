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
  if (!search.value.trim()) return vocab.words
  const q = search.value.toLowerCase()
  return vocab.words.filter(
    (w) =>
      w.english.toLowerCase().includes(q) ||
      w.turkish.toLowerCase().includes(q) ||
      (w.synonyms && w.synonyms.toLowerCase().includes(q))
  )
})

const masteryLabels = ['Yeni', 'Başlangıç', 'Gelişiyor', 'İyi', 'Çok İyi', 'Uzman']

onMounted(async () => {
  await vocab.fetchSections()
  await vocab.fetchWords(sectionId.value)
})

async function addWord() {
  if (!newWord.value.english.trim() || !newWord.value.turkish.trim()) return
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
              {{ masteryLabels[word.mastery_level] || 'Yeni' }}
            </span>
            <button class="delete-btn" title="Sil" @click="removeWord(word.id)">✕</button>
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
  gap: 0.65rem;
  flex-shrink: 0;
}

.mastery-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.625rem;
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

.delete-btn {
  background: none;
  color: var(--text-muted);
  font-size: 0.875rem;
  padding: 0.25rem;
  border-radius: 6px;
  opacity: 0;
  transition: all 0.2s;
}

.word-card:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: var(--error);
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
</style>
