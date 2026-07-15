<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useVocabularyStore } from '@/stores/vocabulary.js'
import AppNavbar from '@/components/AppNavbar.vue'

const router = useRouter()
const route = useRoute()
const vocab = useVocabularyStore()

const search = ref('')
const selectedSection = ref('')
const selectedType = ref('')
const selectedDifficulty = ref('')
const onlyFavorites = ref(false)
const onlyLearned = ref(route.query.learned === '1')
const viewMode = ref('cards') // 'cards' or 'table'

// Edit modal state
const editingWord = ref(null)
const showEditModal = ref(false)

// Import/Export state
const showImportModal = ref(false)
const importJsonText = ref('')
const importTargetSection = ref('')
const importStatus = ref('')

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

onMounted(async () => {
  await Promise.all([vocab.fetchSections(), vocab.fetchAllWords()])
  if (vocab.sections.length > 0 && !importTargetSection.value) {
    importTargetSection.value = vocab.sections[0].id
  }
})

const filteredWords = computed(() => {
  let list = vocab.allWords || []

  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    list = list.filter(
      (w) =>
        w.english.toLowerCase().includes(q) ||
        w.turkish.toLowerCase().includes(q) ||
        (w.example && w.example.toLowerCase().includes(q)) ||
        (w.synonyms && w.synonyms.toLowerCase().includes(q))
    )
  }

  if (selectedSection.value) {
    list = list.filter((w) => Number(w.section_id) === Number(selectedSection.value))
  }

  if (selectedType.value) {
    list = list.filter((w) => w.word_type === selectedType.value)
  }

  if (selectedDifficulty.value) {
    list = list.filter((w) => Number(w.difficulty) === Number(selectedDifficulty.value))
  }

  if (onlyFavorites.value) {
    list = list.filter((w) => w.is_favorite === 1)
  }

  if (onlyLearned.value) {
    list = list.filter((w) => w.mastery_level >= 5 || (w.section_name && w.section_name.includes('Öğrenilen')))
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
    await vocab.fetchAllWords()
    movingWord.value = null
  } catch (err) {
    alert(err.message || 'Taşınırken bir hata oluştu')
  }
}

async function markLearned(word) {
  if (!confirm(`"${word.english}" kelimesini Öğrenildi olarak işaretleyip Öğrenilenler defterine taşımak istiyor musunuz?`)) return
  await vocab.markAsLearned(word.id)
}

async function unlearnWord(word) {
  if (!confirm(`"${word.english}" kelimesini Öğrenilenler defterinden çıkarıp tekrar aktif çalışmaya almak istiyor musunuz?`)) return
  try {
    await vocab.markAsUnlearned(word.id)
    await vocab.fetchAllWords()
  } catch (err) {
    alert(err.message || 'İşlem başarısız')
  }
}

async function toggleFav(word) {
  const newStatus = await vocab.toggleFavorite(word.id)
  word.is_favorite = newStatus
}

function openEdit(word) {
  editingWord.value = { ...word }
  showEditModal.value = true
}

async function saveEdit() {
  if (!editingWord.value) return
  await vocab.updateWord(editingWord.value.id, {
    english: editingWord.value.english,
    turkish: editingWord.value.turkish,
    example: editingWord.value.example,
    notes: editingWord.value.notes,
    wordType: editingWord.value.word_type,
    synonyms: editingWord.value.synonyms,
    difficulty: editingWord.value.difficulty
  })
  await vocab.fetchAllWords()
  showEditModal.value = false
}

async function removeWord(id) {
  if (!confirm('Bu kelimeyi silmek istediğinize emin misiniz?')) return
  await vocab.deleteWord(id)
  await vocab.fetchAllWords()
}

function exportToJson() {
  const dataStr = JSON.stringify(vocab.allWords, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `vocabase_yedek_${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function exportToCsv() {
  const headers = ['English', 'Turkish', 'Word Type', 'Synonyms', 'Example', 'Notes', 'Difficulty']
  const rows = vocab.allWords.map((w) => [
    `"${w.english.replace(/"/g, '""')}"`,
    `"${w.turkish.replace(/"/g, '""')}"`,
    `"${(w.word_type || 'Genel').replace(/"/g, '""')}"`,
    `"${(w.synonyms || '').replace(/"/g, '""')}"`,
    `"${(w.example || '').replace(/"/g, '""')}"`,
    `"${(w.notes || '').replace(/"/g, '""')}"`,
    w.difficulty || 2
  ])
  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `vocabase_kelimeler_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

async function handleJsonImport() {
  if (!importJsonText.value.trim()) return
  try {
    const parsed = JSON.parse(importJsonText.value)
    if (!Array.isArray(parsed)) {
      importStatus.value = 'Hata: JSON verisi bir kelime listesi (array [...]) olmalıdır.'
      return
    }
    const addedCount = await vocab.batchImport(Number(importTargetSection.value), parsed)
    importStatus.value = `Başarılı! ${addedCount} kelime bölüme eklendi.`
    await vocab.fetchAllWords()
    setTimeout(() => {
      showImportModal.value = false
      importStatus.value = ''
      importJsonText.value = ''
    }, 1500)
  } catch (e) {
    importStatus.value = 'Hata: Geçersiz JSON formatı. ' + e.message
  }
}
</script>

<template>
  <div class="page words-page">
    <AppNavbar />

    <div class="container words-content">
      <header class="page-header">
        <div>
          <h1>📖 Tüm Kelime Defterim</h1>
          <p class="subtitle">
            Kayıtlı toplam <strong>{{ vocab.allWords.length }}</strong> kelimenizi inceleyin, filtreleyin, içe veya dışa aktarın.
          </p>
        </div>
        <div class="header-actions">
          <button class="btn btn-ghost" @click="showImportModal = true">📥 İçe Aktar (JSON)</button>
          <button class="btn btn-ghost" @click="exportToJson">📤 JSON İndir</button>
          <button class="btn btn-ghost" @click="exportToCsv">📊 CSV (Excel)</button>
          <button class="btn btn-primary" @click="router.push('/quiz')">🎯 Quiz Yap</button>
        </div>
      </header>

      <!-- Filter Bar -->
      <div class="filter-panel glass-card">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            v-model="search"
            class="form-input search-input"
            placeholder="İngilizce, Türkçe, örnek cümle veya eş anlam ara..."
            type="search"
          />
        </div>

        <div class="filter-controls">
          <select v-model="selectedSection" class="form-input filter-select">
            <option value="">📁 Tüm Bölümler</option>
            <option v-for="sec in vocab.sections" :key="sec.id" :value="sec.id">
              {{ sec.icon }} {{ sec.name }}
            </option>
          </select>

          <select v-model="selectedType" class="form-input filter-select">
            <option value="">🏷️ Tüm Türler</option>
            <option v-for="wt in wordTypes" :key="wt" :value="wt">{{ wt }}</option>
          </select>

          <select v-model="selectedDifficulty" class="form-input filter-select">
            <option value="">📈 Tüm Seviyeler</option>
            <option value="1">⭐ Temel</option>
            <option value="2">⭐⭐ Orta Akademik</option>
            <option value="3">⭐⭐⭐ İleri YÖKDİL/YDS</option>
          </select>

          <button
            class="btn fav-toggle-btn"
            :class="{ active: onlyFavorites }"
            @click="onlyFavorites = !onlyFavorites"
          >
            ⭐ Sadece Yıldızlılar
          </button>

          <button
            class="btn fav-toggle-btn learned-toggle-btn"
            :class="{ active: onlyLearned }"
            @click="onlyLearned = !onlyLearned"
          >
            🏆 Sadece Öğrenilenler
          </button>

          <div class="view-toggle">
            <button
              class="toggle-item"
              :class="{ active: viewMode === 'cards' }"
              title="Kart Görünümü"
              @click="viewMode = 'cards'"
            >
              🗂️
            </button>
            <button
              class="toggle-item"
              :class="{ active: viewMode === 'table' }"
              title="Tablo Görünümü"
              @click="viewMode = 'table'"
            >
              📋
            </button>
          </div>
        </div>
      </div>

      <!-- Words Display -->
      <div v-if="vocab.loading" class="loading">Kelimeler yükleniyor...</div>

      <div v-else-if="filteredWords.length === 0" class="empty-state glass-card">
        <span class="empty-icon">📂</span>
        <h3>Sonuç bulunamadı</h3>
        <p>Arama kriterlerinizi değiştirin veya yeni kelimeler ekleyin.</p>
        <button class="btn btn-primary" @click="router.push('/dashboard')">Bölüme Git & Kelime Ekle</button>
      </div>

      <!-- Card Grid Mode -->
      <div v-else-if="viewMode === 'cards'" class="words-grid">
        <div v-for="word in filteredWords" :key="word.id" class="word-card glass-card">
          <div class="card-header">
            <span class="section-badge" :style="{ background: word.section_color + '25', borderColor: word.section_color }">
              {{ word.section_icon }} {{ word.section_name }}
            </span>
            <div class="card-top-right">
              <span class="type-badge">{{ word.word_type || 'Genel' }}</span>
              <button
                class="star-btn"
                :class="{ starred: word.is_favorite === 1 }"
                title="Yıldızla / Favorilere Ekle"
                @click="toggleFav(word)"
              >
                {{ word.is_favorite === 1 ? '⭐' : '☆' }}
              </button>
            </div>
          </div>

          <div class="card-body">
            <h3 class="word-en">{{ word.english }}</h3>
            <p class="word-tr">{{ word.turkish }}</p>

            <div v-if="word.synonyms" class="word-synonyms">
              <strong>Eş Anlam:</strong> {{ word.synonyms }}
            </div>

            <p v-if="word.example" class="word-example">"{{ word.example }}"</p>
            <p v-if="word.notes" class="word-notes">📝 {{ word.notes }}</p>
          </div>

          <div class="card-footer">
            <div class="diff-level" :title="`Zorluk: ${word.difficulty || 2}/3`">
              <span v-for="n in 3" :key="n" class="dot" :class="{ filled: n <= (word.difficulty || 2) }"></span>
            </div>
            <div class="mini-actions-row">
              <button
                v-if="word.mastery_level < 5 && !word.section_name?.includes('Öğrenilen')"
                class="mini-btn learn-pill"
                title="Öğrenildi Olarak İşaretle (Öğrenilenler Defterine Gönder)"
                @click="markLearned(word)"
              >
                ✓ Öğrenildi
              </button>
              <button class="mini-btn move-pill" title="İstediğin Deftere Taşı" @click="openMoveModal(word)">
                ↗ Taşı
              </button>
              <button class="mini-btn edit-pill" title="Düzenle" @click="openEdit(word)">✏️</button>
              <button class="mini-btn del-pill" title="Sil" @click="removeWord(word.id)">✕</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Table Mode -->
      <div v-else class="table-wrapper glass-card">
        <table class="words-table">
          <thead>
            <tr>
              <th>⭐</th>
              <th>İngilizce</th>
              <th>Türkçe</th>
              <th>Tür</th>
              <th>Eş Anlam</th>
              <th>Örnek Cümle</th>
              <th>Bölüm</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="word in filteredWords" :key="word.id">
              <td>
                <button class="star-btn table-star" @click="toggleFav(word)">
                  {{ word.is_favorite === 1 ? '⭐' : '☆' }}
                </button>
              </td>
              <td class="font-bold text-accent">{{ word.english }}</td>
              <td>{{ word.turkish }}</td>
              <td><span class="type-badge mini">{{ word.word_type || 'Genel' }}</span></td>
              <td class="text-secondary">{{ word.synonyms || '-' }}</td>
              <td class="example-cell">{{ word.example ? `"${word.example}"` : '-' }}</td>
              <td>
                <span class="section-badge mini" :style="{ background: word.section_color + '22' }">
                  {{ word.section_icon }} {{ word.section_name }}
                </span>
              </td>
              <td class="actions-cell">
                <button
                  v-if="word.mastery_level < 5 && !word.section_name?.includes('Öğrenilen')"
                  class="mini-btn learn-pill"
                  title="Öğrenildi"
                  @click="markLearned(word)"
                >
                  ✓ Öğrenildi
                </button>
                <button class="mini-btn move-pill" title="Taşı" @click="openMoveModal(word)">↗ Taşı</button>
                <button class="mini-btn edit-pill" title="Düzenle" @click="openEdit(word)">✏️</button>
                <button class="mini-btn del-pill" title="Sil" @click="removeWord(word.id)">✕</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Edit Modal -->
    <Teleport to="body">
      <div v-if="showEditModal && editingWord" class="modal-overlay" @click.self="showEditModal = false">
        <div class="modal glass-card">
          <h2>Kelimeyi Düzenle</h2>
          <form @submit.prevent="saveEdit" class="modal-form">
            <div class="form-row">
              <div class="form-group flex-1">
                <label>İngilizce</label>
                <input v-model="editingWord.english" class="form-input" required />
              </div>
              <div class="form-group flex-1">
                <label>Türkçe Anlamı</label>
                <input v-model="editingWord.turkish" class="form-input" required />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group flex-1">
                <label>Kelime / Bağlaç Türü</label>
                <select v-model="editingWord.word_type" class="form-input">
                  <option v-for="wt in wordTypes" :key="wt" :value="wt">{{ wt }}</option>
                </select>
              </div>
              <div class="form-group flex-1">
                <label>Zorluk Seviyesi (1-3)</label>
                <select v-model.number="editingWord.difficulty" class="form-input">
                  <option :value="1">1 - Temel</option>
                  <option :value="2">2 - Orta Akademik</option>
                  <option :value="3">3 - İleri YÖKDİL/YDS</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Eş Anlamlılar (Synonyms)</label>
              <input v-model="editingWord.synonyms" class="form-input" placeholder="Örn: however, yet, even so" />
            </div>

            <div class="form-group">
              <label>Örnek Cümle</label>
              <textarea v-model="editingWord.example" class="form-input" rows="2"></textarea>
            </div>

            <div class="form-group">
              <label>Notlar</label>
              <input v-model="editingWord.notes" class="form-input" placeholder="Ek hatırlatıcılar..." />
            </div>

            <div class="modal-actions">
              <button type="button" class="btn btn-ghost" @click="showEditModal = false">İptal</button>
              <button type="submit" class="btn btn-primary">Değişiklikleri Kaydet</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- JSON Import Modal -->
    <Teleport to="body">
      <div v-if="showImportModal" class="modal-overlay" @click.self="showImportModal = false">
        <div class="modal glass-card">
          <h2>📥 Toplu Kelime İçe Aktar (JSON)</h2>
          <p class="modal-desc">
            Daha önce indirdiğiniz veya oluşturduğunuz JSON formatındaki kelime listesini aşağıya yapıştırın.
          </p>

          <div class="form-group" style="margin-bottom: 1rem;">
            <label>Aktarılacak Hedef Bölüm:</label>
            <select v-model="importTargetSection" class="form-input">
              <option v-for="sec in vocab.sections" :key="sec.id" :value="sec.id">
                {{ sec.icon }} {{ sec.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>JSON Verisi:</label>
            <textarea
              v-model="importJsonText"
              class="form-input code-area"
              rows="6"
              placeholder='[{"english":"nevertheless","turkish":"buna rağmen","word_type":"Bağlaç (Zıtlık)","synonyms":"however"}]'
            ></textarea>
          </div>

          <div v-if="importStatus" class="import-status" :class="{ error: importStatus.includes('Hata') }">
            {{ importStatus }}
          </div>

          <div class="modal-actions">
            <button type="button" class="btn btn-ghost" @click="showImportModal = false">İptal</button>
            <button type="button" class="btn btn-primary" :disabled="!importJsonText" @click="handleJsonImport">
              Toplu Ekle
            </button>
          </div>
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
.words-content {
  padding: 2rem 1.5rem 5rem;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.page-header h1 {
  font-size: 1.875rem;
  font-weight: 800;
  margin-bottom: 0.375rem;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.header-actions {
  display: flex;
  gap: 0.625rem;
  flex-wrap: wrap;
}

.filter-panel {
  padding: 1.25rem;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
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

.filter-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}

.filter-select {
  padding: 0.5rem 0.875rem;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
  color: var(--text-primary);
}

.filter-select option {
  background: var(--bg-primary);
  color: var(--text-primary);
}

.fav-toggle-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
}

.fav-toggle-btn.active {
  background: rgba(251, 191, 36, 0.15);
  border-color: #fbbf24;
  color: #fbbf24;
}

.view-toggle {
  margin-left: auto;
  display: flex;
  gap: 0.25rem;
  background: rgba(255, 255, 255, 0.04);
  padding: 0.25rem;
  border-radius: 8px;
  border: 1px solid var(--border);
}

.toggle-item {
  background: transparent;
  padding: 0.35rem 0.625rem;
  border-radius: 6px;
  color: var(--text-muted);
  font-size: 1rem;
  transition: all 0.2s;
}

.toggle-item.active {
  background: var(--accent);
  color: white;
}

.words-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
}

.word-card {
  padding: 1.35rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.section-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.65rem;
  border-radius: 999px;
  border: 1px solid transparent;
}

.section-badge.mini {
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
}

.card-top-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.type-badge {
  font-size: 0.75rem;
  color: #a855f7;
  background: rgba(168, 85, 247, 0.12);
  border: 1px solid rgba(168, 85, 247, 0.3);
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
}

.type-badge.mini {
  font-size: 0.7rem;
}

.star-btn {
  background: none;
  font-size: 1.25rem;
  color: #64748b;
  transition: transform 0.2s;
}

.star-btn:hover {
  transform: scale(1.2);
}

.star-btn.starred {
  color: #fbbf24;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.word-en {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--accent);
}

.word-tr {
  font-size: 1.05rem;
  font-weight: 600;
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
  margin-top: 0.25rem;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  padding-top: 0.85rem;
}

.diff-level {
  display: flex;
  gap: 0.3rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
}

.dot.filled {
  background: #34d399;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
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

.edit-pill {
  color: #fbbf24;
  background: transparent;
  border-color: transparent;
  padding: 0.18rem 0.4rem;
}
.edit-pill:hover {
  background: rgba(251, 191, 36, 0.12);
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

.learned-toggle-btn.active {
  background: rgba(245, 158, 11, 0.22) !important;
  color: #fbbf24 !important;
  border-color: #fbbf24 !important;
}

/* Table styles */
.table-wrapper {
  overflow-x: auto;
  padding: 1.5rem;
}

.words-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.words-table th {
  padding: 0.85rem 1rem;
  font-size: 0.825rem;
  text-transform: uppercase;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border);
}

.words-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  font-size: 0.9375rem;
}

.words-table tr:hover {
  background: rgba(255, 255, 255, 0.03);
}

.example-cell {
  max-width: 260px;
  font-style: italic;
  color: var(--text-secondary);
}

.font-bold {
  font-weight: 700;
}

.text-accent {
  color: var(--accent);
}

.actions-cell {
  display: flex;
  gap: 0.35rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  font-size: 3.5rem;
  display: block;
  margin-bottom: 1rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: var(--text-secondary);
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
  max-width: 580px;
  padding: 2.25rem;
  max-height: 90vh;
  overflow-y: auto;
}

.modal h2 {
  font-size: 1.5rem;
  font-weight: 800;
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

.code-area {
  font-family: monospace;
  font-size: 0.85rem;
}

.modal-desc {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 1.25rem;
}

.import-status {
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: rgba(52, 211, 153, 0.15);
  color: #34d399;
  border: 1px solid rgba(52, 211, 153, 0.3);
  font-weight: 600;
}

.import-status.error {
  background: rgba(248, 113, 113, 0.15);
  color: #f87171;
  border-color: rgba(248, 113, 113, 0.3);
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

select option {
  background-color: var(--bg-primary) !important;
  color: var(--text-primary) !important;
}

/* Mobile Responsiveness for WordsView */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  .header-actions {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  .header-actions .btn {
    flex: 1;
    min-width: 130px;
    padding: 0.6rem 0.5rem;
    font-size: 0.82rem;
  }
  .table-container {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .words-table {
    min-width: 650px;
  }
  .cards-grid {
    grid-template-columns: 1fr;
  }
  .filters-card {
    padding: 1rem;
  }
  .filter-controls {
    flex-direction: column;
    gap: 0.75rem;
  }
  .search-box {
    width: 100%;
  }
}
</style>
