<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import confetti from 'canvas-confetti'
import { api } from '@/api/client.js'
import { useAuthStore } from '@/stores/auth.js'
import { useVocabularyStore } from '@/stores/vocabulary.js'
import AppNavbar from '@/components/AppNavbar.vue'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const vocab = useVocabularyStore()

// Game / Study state
const activeMode = ref('menu') // 'menu', 'multiple_choice', 'flashcard', 'match', 'spelling', 'result'
const selectedSectionId = ref(route.query.section || '')
const questionLimit = ref(10)
const loading = ref(false)
const errorMsg = ref('')

// Session data
const questions = ref([])
const currentIndex = ref(0)
const selectedAnswer = ref(null)
const isAnswered = ref(false)
const isCorrect = ref(false)
const score = ref(0)
const totalAnswered = ref(0)
const earnedXpTotal = ref(0)
const showResult = ref(false)

// Flashcard mode specific state
const isCardFlipped = ref(false)

// Match mode specific state
const matchPairs = ref([])
const enOptions = ref([])
const trOptions = ref([])
const selectedEn = ref(null)
const selectedTr = ref(null)
const matchedIds = ref(new Set())
const matchError = ref(false)

// Spelling mode specific state
const spellingInput = ref('')
const questionHistory = ref({})

const currentQuestion = computed(() => questions.value[currentIndex.value] || null)

onMounted(async () => {
  await vocab.fetchSections()
  if (route.query.mode) {
    activeMode.value = route.query.mode
    await startQuiz(route.query.mode)
  }
})

async function startQuiz(mode) {
  loading.value = true
  errorMsg.value = ''
  activeMode.value = mode
  currentIndex.value = 0
  score.value = 0
  totalAnswered.value = 0
  earnedXpTotal.value = 0
  showResult.value = false
  isAnswered.value = false
  selectedAnswer.value = null
  isCorrect.value = false
  isCardFlipped.value = false
  spellingInput.value = ''
  matchedIds.value = new Set()
  questionHistory.value = {}

  try {
    const params = new URLSearchParams()
    if (selectedSectionId.value) params.append('sectionId', selectedSectionId.value)
    params.append('limit', questionLimit.value)
    params.append('mode', mode)

    const data = await api(`/quiz/session?${params.toString()}`)
    if (mode === 'match') {
      matchPairs.value = data.pairs || []
      enOptions.value = data.englishOptions || []
      trOptions.value = data.turkishOptions || []
    } else {
      questions.value = data.questions || []
    }
  } catch (e) {
    errorMsg.value = e.message || 'Quiz verileri yüklenirken bir sorun oluştu.'
    activeMode.value = 'menu'
  } finally {
    loading.value = false
  }
}

// Helper: Save and Restore Question State to prevent XP farming
function saveCurrentQuestionState() {
  if (currentIndex.value < 0) return
  questionHistory.value[currentIndex.value] = {
    isAnswered: isAnswered.value,
    selectedAnswer: selectedAnswer.value,
    isCorrect: isCorrect.value,
    isCardFlipped: isCardFlipped.value,
    spellingInput: spellingInput.value
  }
}

function restoreQuestionState(index) {
  const saved = questionHistory.value[index]
  if (saved) {
    isAnswered.value = saved.isAnswered
    selectedAnswer.value = saved.selectedAnswer
    isCorrect.value = saved.isCorrect
    isCardFlipped.value = saved.isCardFlipped
    spellingInput.value = saved.spellingInput || ''
  } else {
    isAnswered.value = false
    selectedAnswer.value = null
    isCorrect.value = false
    isCardFlipped.value = false
    spellingInput.value = ''
  }
}

// Mode 1: Multiple Choice Logic
async function handleMcAnswer(option) {
  if (isAnswered.value || !currentQuestion.value) return
  selectedAnswer.value = option
  isAnswered.value = true
  isCorrect.value = option === currentQuestion.value.correctAnswer

  if (isCorrect.value) {
    score.value++
    fireMiniConfetti()
  }
  totalAnswered.value++
  saveCurrentQuestionState()

  const res = await api('/quiz/answer', {
    method: 'POST',
    body: JSON.stringify({
      wordId: currentQuestion.value.id,
      correct: isCorrect.value,
      earnedXp: isCorrect.value ? 10 : 2
    })
  })
  if (res.gamification) {
    earnedXpTotal.value += res.gamification.earnedXp || 0
    if (vocab.stats) {
      vocab.stats.xp = res.gamification.xp
      vocab.stats.streakDays = res.gamification.streakDays
    }
  }
}

function nextMcQuestion() {
  if (currentIndex.value + 1 < questions.value.length) {
    saveCurrentQuestionState()
    currentIndex.value++
    restoreQuestionState(currentIndex.value)
  } else {
    finishSession()
  }
}

// Mode 2: Flashcard Logic
async function rateFlashcard(remembered) {
  if (!currentQuestion.value || isAnswered.value) return
  isAnswered.value = true
  selectedAnswer.value = remembered ? 'yes' : 'no'

  if (remembered) {
    score.value++
    fireMiniConfetti()
  }
  totalAnswered.value++
  saveCurrentQuestionState()

  const res = await api('/quiz/answer', {
    method: 'POST',
    body: JSON.stringify({
      wordId: currentQuestion.value.id,
      correct: remembered,
      earnedXp: remembered ? 5 : 2
    })
  })
  if (res.gamification) {
    earnedXpTotal.value += res.gamification.earnedXp || 0
    if (vocab.stats) {
      vocab.stats.xp = res.gamification.xp
      vocab.stats.streakDays = res.gamification.streakDays
    }
  }

  isCardFlipped.value = false
  if (currentIndex.value + 1 < questions.value.length) {
    currentIndex.value++
    restoreQuestionState(currentIndex.value)
  } else {
    finishSession()
  }
}

// Mode 3: Match Game Logic
function selectMatchOption(item, type) {
  if (matchedIds.value.has(item.id)) return
  matchError.value = false
  if (type === 'en') {
    selectedEn.value = item
  } else {
    selectedTr.value = item
  }

  if (selectedEn.value && selectedTr.value) {
    if (selectedEn.value.id === selectedTr.value.id) {
      matchedIds.value.add(selectedEn.value.id)
      score.value++
      fireMiniConfetti()

      api('/quiz/answer', {
        method: 'POST',
        body: JSON.stringify({ wordId: selectedEn.value.id, correct: true, earnedXp: 8 })
      }).then((res) => {
        if (res.gamification && vocab.stats) {
          earnedXpTotal.value += res.gamification.earnedXp || 0
          vocab.stats.xp = res.gamification.xp
          vocab.stats.streakDays = res.gamification.streakDays
        }
      })

      selectedEn.value = null
      selectedTr.value = null

      if (matchedIds.value.size === matchPairs.value.length) {
        totalAnswered.value = matchPairs.value.length
        setTimeout(() => finishSession(), 600)
      }
    } else {
      matchError.value = true
      setTimeout(() => {
        selectedEn.value = null
        selectedTr.value = null
        matchError.value = false
      }, 700)
    }
  }
}

// Mode 4: Spelling Logic
async function handleSpellingSubmit() {
  if (isAnswered.value || !currentQuestion.value || !spellingInput.value.trim()) return
  isAnswered.value = true
  const userText = spellingInput.value.trim().toLowerCase()
  const correctText = currentQuestion.value.correctAnswer.toLowerCase()

  isCorrect.value = userText === correctText
  if (isCorrect.value) {
    score.value++
    fireMiniConfetti()
  }
  totalAnswered.value++
  saveCurrentQuestionState()

  const res = await api('/quiz/answer', {
    method: 'POST',
    body: JSON.stringify({
      wordId: currentQuestion.value.id,
      correct: isCorrect.value,
      earnedXp: isCorrect.value ? 12 : 3
    })
  })
  if (res.gamification) {
    earnedXpTotal.value += res.gamification.earnedXp || 0
    if (vocab.stats) {
      vocab.stats.xp = res.gamification.xp
      vocab.stats.streakDays = res.gamification.streakDays
    }
  }
}

function nextSpellingQuestion() {
  if (currentIndex.value + 1 < questions.value.length) {
    saveCurrentQuestionState()
    currentIndex.value++
    restoreQuestionState(currentIndex.value)
  } else {
    finishSession()
  }
}

function finishSession() {
  showResult.value = true
  activeMode.value = 'result'
  if (totalAnswered.value > 0 && score.value / totalAnswered.value >= 0.7) {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    })
  }
}

function fireMiniConfetti() {
  confetti({
    particleCount: 35,
    spread: 50,
    origin: { y: 0.7 }
  })
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
  if (xp >= 4000) return { title: `👑 ${p} Üstadı (Profesör)`, next: null, color: '#f59e0b' }
  if (xp >= 1500) return { title: '🎓 Doçent Adayı (Associate)', next: `👑 ${p} Üstadı (4000 XP)`, needed: 4000 - xp, color: '#ec4899' }
  if (xp >= 500) return { title: '🔬 Kelime Araştırmacısı', next: '🎓 Doçent Adayı (1500 XP)', needed: 1500 - xp, color: '#3b82f6' }
  if (xp >= 100) return { title: '📖 Akademik Okur', next: '🔬 Kelime Araştırmacısı (500 XP)', needed: 500 - xp, color: '#10b981' }
  return { title: `🌱 ${p} Adayı (Beginner)`, next: '📖 Akademik Okur (100 XP)', needed: 100 - xp, color: '#c084fc' }
})

function confirmExitMenu() {
  if (confirm('Quiz/Çalışma devam ediyor! Menüye dönerseniz mevcut seans ilerlemeniz yarıda kalacak ve sıfırlanacaktır. Çıkmak istediğinize emin misiniz?')) {
    activeMode.value = 'menu'
  }
}

function previousQuestion() {
  if (currentIndex.value > 0) {
    saveCurrentQuestionState()
    currentIndex.value--
    restoreQuestionState(currentIndex.value)
  }
}
</script>

<template>
  <div class="page quiz-page">
    <AppNavbar />

    <div class="container quiz-content">
      <!-- 1. MODE SELECTION MENU -->
      <div v-if="activeMode === 'menu'" class="mode-menu">
        <header class="menu-header">
          <h1>⚡ Akıllı Quiz & Eğlenceli Çalışma Merkezi</h1>
          <p class="subtitle">
            Hafızanızı güçlendirmek, bağlaç ve kelimeleri kalıcı öğrenmek için dilediğiniz oyun veya test modunu seçin.
          </p>

          <div v-if="errorMsg" class="error-banner glass-card">⚠️ {{ errorMsg }}</div>

          <div class="filter-bar glass-card">
            <div class="filter-item">
              <label>📁 Çalışılacak Bölüm:</label>
              <select v-model="selectedSectionId" class="form-input select-sm">
                <option value="">🌟 Tüm Defterim (Kelimelerin Tümü)</option>
                <option v-for="sec in vocab.sections" :key="sec.id" :value="sec.id">
                  {{ sec.icon }} {{ sec.name }} ({{ sec.word_count || 0 }} kelime)
                </option>
              </select>
            </div>
            <div class="filter-item">
              <label>🎯 Soru Sayısı:</label>
              <select v-model.number="questionLimit" class="form-input select-sm">
                <option :value="5">5 Soru - Kısa Pratik Seansı</option>
                <option :value="10">10 Soru - Standart Akademik Test</option>
                <option :value="20">20 Soru - Kapsamlı Bilgi Taraması</option>
                <option :value="30">30 Soru - Yoğun Sınav Simülasyonu</option>
              </select>
            </div>
          </div>
        </header>

        <div class="modes-grid">
          <div class="mode-card glass-card" @click="startQuiz('multiple_choice')">
            <div class="mode-icon mc-icon">🎯</div>
            <div class="mode-info">
              <h3>Çoktan Seçmeli Akıllı Quiz</h3>
              <p>İngilizce kelimeyi görün, 4 seçenek arasından doğru Türkçe anlamı hızlıca bulun. Anında feedback & XP puanı kazanın!</p>
              <span class="mode-tag">+10 XP / Doğru</span>
            </div>
          </div>

          <div class="mode-card glass-card" @click="startQuiz('flashcard')">
            <div class="mode-icon fc-icon">🎴</div>
            <div class="mode-info">
              <h3>Dinamik Bilgi Kartları (Flashcard)</h3>
              <p>Önce kelimeyi veya bağlacı düşünün, kartı çevirip anlamını ve örnek cümlesini görün. Kendi kendinizi test edin.</p>
              <span class="mode-tag">+5 XP / Tekrar</span>
            </div>
          </div>

          <div class="mode-card glass-card" @click="startQuiz('match')">
            <div class="mode-icon match-icon">🧩</div>
            <div class="mode-info">
              <h3>Hızlı Eşleştirme Oyunu (Speed Match)</h3>
              <p>Ekrandaki İngilizce ve Türkçe kartları doğru eşleştirip tahtayı en hızlı şekilde temizleyin. Eğlenceli ve akılda kalıcı!</p>
              <span class="mode-tag">+8 XP / Eşleşme</span>
            </div>
          </div>

          <div class="mode-card glass-card" @click="startQuiz('spelling')">
            <div class="mode-icon spell-icon">⌨️</div>
            <div class="mode-info">
              <h3>Örnek Cümlede Boşluk Doldurma</h3>
              <p>İngilizce kelimenin örnek cümlesindeki yerini doğru harflerle yazarak doldurun. YÖKDİL cloze-test becerinizi katlayın.</p>
              <span class="mode-tag">+12 XP / Doğru Yazım</span>
            </div>
          </div>
        </div>
      </div>

      <!-- LOADING STATE -->
      <div v-else-if="loading" class="loading-state glass-card">
        <div class="spinner">⚡</div>
        <h3>Akıllı çalışma seansınız hazırlanıyor...</h3>
        <p>Kelimeler ve çeldirici şıklar optimize ediliyor.</p>
      </div>

      <!-- 2. MODE 1: MULTIPLE CHOICE QUIZ -->
      <div v-else-if="activeMode === 'multiple_choice' && currentQuestion" class="game-area">
        <div class="game-header">
          <div class="header-btns">
            <button class="btn btn-ghost btn-sm" @click="confirmExitMenu">← Menüye Dön</button>
            <button v-if="currentIndex > 0" class="btn btn-ghost btn-sm prev-btn ml-2" @click="previousQuestion">← Önceki Soru</button>
          </div>
          <div class="progress-info">
            <span>Soru {{ currentIndex + 1 }} / {{ questions.length }}</span>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${((currentIndex + 1) / questions.length) * 100}%` }"></div>
            </div>
          </div>
          <span class="xp-gain-badge" :key="earnedXpTotal">+{{ earnedXpTotal }} XP</span>
        </div>

        <div class="question-card glass-card">
          <span class="q-type">{{ currentQuestion.wordType || 'Genel' }}</span>
          <h2 class="q-word">{{ currentQuestion.english }}</h2>
          <p v-if="currentQuestion.example" class="q-example">"{{ currentQuestion.example }}"</p>
          <div v-if="currentQuestion.synonyms" class="q-syn">Eş Anlam: {{ currentQuestion.synonyms }}</div>
        </div>

        <div class="options-grid">
          <button
            v-for="opt in currentQuestion.options"
            :key="opt"
            class="option-btn glass-card"
            :class="{
              selected: selectedAnswer === opt,
              correct: isAnswered && opt === currentQuestion.correctAnswer,
              wrong: isAnswered && selectedAnswer === opt && opt !== currentQuestion.correctAnswer
            }"
            :disabled="isAnswered"
            @click="handleMcAnswer(opt)"
          >
            <span>{{ opt }}</span>
            <span v-if="isAnswered && opt === currentQuestion.correctAnswer" class="icon correct-ic">✓</span>
            <span v-if="isAnswered && selectedAnswer === opt && opt !== currentQuestion.correctAnswer" class="icon wrong-ic">✕</span>
          </button>
        </div>

        <div v-if="isAnswered" class="next-action">
          <button class="btn btn-primary btn-lg next-btn" @click="nextMcQuestion">
            {{ currentIndex + 1 < questions.length ? 'Sonraki Soru →' : 'Sonuçları Gör 🎉' }}
          </button>
        </div>
      </div>

      <!-- 3. MODE 2: FLASHCARD REVIEW -->
      <div v-else-if="activeMode === 'flashcard' && currentQuestion" class="game-area">
        <div class="game-header">
          <div class="header-btns">
            <button class="btn btn-ghost btn-sm" @click="confirmExitMenu">← Menüye Dön</button>
            <button v-if="currentIndex > 0" class="btn btn-ghost btn-sm prev-btn ml-2" @click="previousQuestion">← Önceki Kart</button>
          </div>
          <div class="progress-info">
            <span>Kart {{ currentIndex + 1 }} / {{ questions.length }}</span>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${((currentIndex + 1) / questions.length) * 100}%` }"></div>
            </div>
          </div>
          <span class="xp-gain-badge">+{{ earnedXpTotal }} XP</span>
        </div>

        <div
          class="flashcard-scene"
          @click="isCardFlipped = !isCardFlipped"
        >
          <div class="flashcard-inner" :class="{ flipped: isCardFlipped }">
            <!-- Front -->
            <div class="fc-face fc-front glass-card">
              <span class="fc-type">{{ currentQuestion.wordType || 'Genel' }}</span>
              <h2 class="fc-word">{{ currentQuestion.english }}</h2>
              <p class="fc-prompt">👇 Anlamını görmek ve örnek cümleyi okumak için karta tıklayın</p>
            </div>

            <!-- Back -->
            <div class="fc-face fc-back glass-card">
              <span class="fc-type">Türkçe Anlamı</span>
              <h2 class="fc-word-tr">{{ currentQuestion.turkish }}</h2>
              <div v-if="currentQuestion.synonyms" class="fc-syn">
                <strong>Eş Anlam:</strong> {{ currentQuestion.synonyms }}
              </div>
              <p v-if="currentQuestion.example" class="fc-ex">"{{ currentQuestion.example }}"</p>
              <p v-if="currentQuestion.notes" class="fc-not">📝 {{ currentQuestion.notes }}</p>
            </div>
          </div>
        </div>

        <div class="flashcard-actions">
          <button class="btn btn-ghost fc-rate-btn again-btn" :disabled="isAnswered" @click="rateFlashcard(false)">
            <span class="btn-ic">🔄</span> Tekrar Bakmam Lazım
          </button>
          <button class="btn btn-primary fc-rate-btn learned-btn" :disabled="isAnswered" @click="rateFlashcard(true)">
            <span class="btn-ic">✨</span> Çok İyi Biliyorum (+XP)
          </button>
        </div>

        <div v-if="isAnswered" class="next-action mt-4">
          <div class="fc-answered-badge glass-card mb-3 py-2 px-3">
            {{ selectedAnswer === 'yes' ? '✨ Bu kartı bildiniz (+XP) olarak işaretlediniz.' : '🔄 Bu kartı tekrar çalışılacak olarak işaretlediniz.' }}
          </div>
          <button class="btn btn-primary btn-lg next-btn" @click="nextMcQuestion">
            {{ currentIndex + 1 < questions.length ? 'Sonraki Kart →' : 'Sonuçları Gör 🎉' }}
          </button>
        </div>
      </div>

      <!-- 4. MODE 3: MATCH GAME -->
      <div v-else-if="activeMode === 'match'" class="game-area">
        <div class="game-header">
          <button class="btn btn-ghost btn-sm" @click="confirmExitMenu">← Menüye Dön</button>
          <div class="progress-info">
            <span>Eşleşen: {{ matchedIds.size }} / {{ matchPairs.length }} Çift</span>
          </div>
          <span class="xp-gain-badge">+{{ earnedXpTotal }} XP</span>
        </div>

        <div class="match-instructions glass-card">
          💡 Bir İngilizce kart seçin, ardından doğru Türkçe anlamına tıklayarak tahtayı temizleyin!
        </div>

        <div class="match-board">
          <!-- English Cards -->
          <div class="match-column">
            <h4 class="col-title">🇬🇧 İngilizce</h4>
            <div
              v-for="item in enOptions"
              :key="item.id"
              class="match-card glass-card"
              :class="{
                selected: selectedEn && selectedEn.id === item.id,
                matched: matchedIds.has(item.id),
                'shake-error': matchError && selectedEn && selectedEn.id === item.id
              }"
              @click="!matchedIds.has(item.id) && selectMatchOption(item, 'en')"
            >
              <span>{{ item.text }}</span>
              <span v-if="matchedIds.has(item.id)" class="match-check">✓</span>
            </div>
          </div>

          <!-- Turkish Cards -->
          <div class="match-column">
            <h4 class="col-title">🇹🇷 Türkçe Anlamı</h4>
            <div
              v-for="item in trOptions"
              :key="item.id"
              class="match-card glass-card"
              :class="{
                selected: selectedTr && selectedTr.id === item.id,
                matched: matchedIds.has(item.id),
                'shake-error': matchError && selectedTr && selectedTr.id === item.id
              }"
              @click="!matchedIds.has(item.id) && selectMatchOption(item, 'tr')"
            >
              <span>{{ item.text }}</span>
              <span v-if="matchedIds.has(item.id)" class="match-check">✓</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. MODE 4: SPELLING / TYPING -->
      <div v-else-if="activeMode === 'spelling' && currentQuestion" class="game-area">
        <div class="game-header">
          <div class="header-btns">
            <button class="btn btn-ghost btn-sm" @click="confirmExitMenu">← Menüye Dön</button>
            <button v-if="currentIndex > 0" class="btn btn-ghost btn-sm prev-btn ml-2" @click="previousQuestion">← Önceki Soru</button>
          </div>
          <div class="progress-info">
            <span>Soru {{ currentIndex + 1 }} / {{ questions.length }}</span>
            <div class="progress-bar">
              <div class="progress-fill" :style="{ width: `${((currentIndex + 1) / questions.length) * 100}%` }"></div>
            </div>
          </div>
          <span class="xp-gain-badge">+{{ earnedXpTotal }} XP</span>
        </div>

        <div class="question-card glass-card">
          <span class="q-type">{{ currentQuestion.wordType || 'Genel' }} • Yazım Testi</span>
          <h3 class="spell-tr">Türkçe Anlamı: <strong>{{ currentQuestion.turkish }}</strong></h3>

          <div v-if="currentQuestion.exampleMasked" class="masked-sentence">
            "{{ currentQuestion.exampleMasked }}"
          </div>
          <div v-else class="masked-sentence">
            İngilizce kelimeyi aşağıdaki kutuya doğru harflerle yazın.
          </div>
        </div>

        <form @submit.prevent="handleSpellingSubmit" class="spelling-form">
          <div class="input-row">
            <input
              v-model="spellingInput"
              class="form-input spelling-input"
              placeholder="İngilizce kelimeyi buraya yazın..."
              :disabled="isAnswered"
              autofocus
            />
            <button
              v-if="!isAnswered"
              type="submit"
              class="btn btn-primary spell-submit"
              :disabled="!spellingInput.trim()"
            >
              Cevapla ↵
            </button>
          </div>
        </form>

        <div v-if="isAnswered" class="spell-feedback glass-card" :class="{ correct: isCorrect, wrong: !isCorrect }">
          <div class="fb-icon">{{ isCorrect ? '🎉 Doğru Yazım!' : '❌ Eksik veya Hatalı Yazım' }}</div>
          <div class="fb-detail">
            <span>Doğru Cevap: <strong>{{ currentQuestion.fullEnglish }}</strong></span>
          </div>
          <button class="btn btn-primary next-btn mt-3" @click="nextSpellingQuestion">
            {{ currentIndex + 1 < questions.length ? 'Sonraki Soru →' : 'Sonuçları Gör 🎉' }}
          </button>
        </div>
      </div>

      <!-- 6. RESULT SUMMARY -->
      <div v-else-if="activeMode === 'result'" class="result-area glass-card">
        <span class="res-icon">{{ score / (totalAnswered || 1) >= 0.7 ? '🏆' : '💪' }}</span>
        <h2>Tebrikler! Seansı Tamamladınız</h2>
        <p class="res-sub">Bu seans boyunca gösterdiğiniz akademik kelime performansı:</p>

        <div class="rank-badge-card glass-card mt-3 mb-4">
          <div class="rank-title" :style="{ color: academicRank.color }">{{ academicRank.title }}</div>
          <div v-if="academicRank.next" class="rank-progress">
            <span>Sıradaki Ünvan: <strong>{{ academicRank.next }}</strong></span>
            <span class="xp-remaining ml-2">(-{{ academicRank.needed }} XP)</span>
          </div>
          <div v-else class="rank-progress">🌟 Maksimum akademik seviyeye ulaştınız!</div>
        </div>

        <div class="res-stats">
          <div class="res-stat-box">
            <span class="rs-val">{{ score }} / {{ totalAnswered }}</span>
            <span class="rs-lbl">Doğru Cevap</span>
          </div>
          <div class="res-stat-box">
            <span class="rs-val xp-txt">+{{ earnedXpTotal }} XP</span>
            <span class="rs-lbl">Kazanılan Puan</span>
          </div>
          <div class="res-stat-box">
            <span class="rs-val streak-txt">🔥 {{ vocab.stats?.streakDays || 1 }} Gün</span>
            <span class="rs-lbl">Günlük Seri</span>
          </div>
        </div>

        <div class="res-actions">
          <button class="btn btn-ghost" @click="activeMode = 'menu'">🎯 Yeni Mod Seç</button>
          <button class="btn btn-primary btn-glow" @click="router.push('/dashboard')">🏠 Ana Sayfaya Dön</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quiz-content {
  padding: 2.25rem 1.5rem 5rem;
  max-width: 900px;
  margin: 0 auto;
}

.menu-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.menu-header h1 {
  font-size: 2.1rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #fff, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: var(--text-secondary);
  font-size: 1rem;
  max-width: 650px;
  margin: 0 auto 1.75rem;
  line-height: 1.6;
}

.error-banner {
  padding: 1rem;
  border-radius: 12px;
  background: rgba(248, 113, 113, 0.15);
  border: 1px solid rgba(248, 113, 113, 0.3);
  color: #f87171;
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.filter-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  padding: 1.25rem 1.5rem;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.filter-item label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  white-space: nowrap;
}

.select-sm {
  padding: 0.45rem 0.85rem !important;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.06);
}

.select-sm option {
  background: #111118;
  color: #fff;
}

.modes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 1.5rem;
}

.mode-card {
  padding: 1.75rem;
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  cursor: pointer;
  transition: all 0.25s;
}

.mode-card:hover {
  transform: translateY(-5px);
  border-color: rgba(139, 92, 246, 0.5);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(139, 92, 246, 0.2);
}

.mode-icon {
  width: 58px;
  height: 58px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
}

.mc-icon {
  background: rgba(99, 102, 241, 0.15);
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.fc-icon {
  background: rgba(236, 72, 153, 0.15);
  border: 1px solid rgba(236, 72, 153, 0.3);
}

.match-icon {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.spell-icon {
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.mode-info h3 {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 0.4rem;
}

.mode-info p {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 1rem;
}

.mode-tag {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.2rem 0.65rem;
  border-radius: 999px;
  background: rgba(56, 189, 248, 0.15);
  color: #38bdf8;
}

/* GAME AREAS */
.game-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.75rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.header-btns {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.progress-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  flex: 1;
  min-width: 180px;
  max-width: 300px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #a855f7);
  transition: width 0.3s ease;
}

.xp-gain-badge {
  padding: 0.35rem 0.85rem;
  border-radius: 999px;
  background: rgba(56, 189, 248, 0.15);
  border: 1px solid rgba(56, 189, 248, 0.3);
  color: #38bdf8;
  font-weight: 800;
  font-size: 0.85rem;
  white-space: nowrap;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  height: 32px;
}

.question-card {
  padding: 2.5rem 2rem;
  text-align: center;
  margin-bottom: 2rem;
}

.q-type {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: #a855f7;
  background: rgba(168, 85, 247, 0.15);
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  margin-bottom: 1rem;
}

.q-word {
  font-size: 2.25rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.q-example {
  font-size: 1.05rem;
  color: var(--text-secondary);
  font-style: italic;
  margin-bottom: 0.5rem;
}

.q-syn {
  font-size: 0.875rem;
  color: #38bdf8;
  margin-top: 0.5rem;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.15rem;
}

.option-btn {
  padding: 1.35rem;
  text-align: left;
  font-size: 1.05rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  transition: all 0.2s;
  color: #f8fafc !important;
  background: rgba(30, 41, 59, 0.85) !important;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.option-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(5px);
}

.option-btn.correct {
  background: rgba(52, 211, 153, 0.2);
  border-color: #34d399;
  color: #34d399;
}

.option-btn.wrong {
  background: rgba(248, 113, 113, 0.2);
  border-color: #f87171;
  color: #f87171;
}

.next-action {
  margin-top: 2rem;
  text-align: center;
}

.next-btn {
  padding: 1rem 2.5rem;
  font-size: 1.05rem;
  box-shadow: 0 0 20px rgba(139, 92, 246, 0.4);
}

/* FLASHCARD SCENE */
.flashcard-scene {
  perspective: 1000px;
  width: 100%;
  height: 360px;
  margin-bottom: 2rem;
  cursor: pointer;
}

.flashcard-inner {
  width: 100%;
  height: 100%;
  position: relative;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
}

.flashcard-inner.flipped {
  transform: rotateY(180deg);
}

.fc-face {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem;
  text-align: center;
}

.fc-back {
  transform: rotateY(180deg);
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(30, 41, 59, 0.85));
}

.fc-word {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.fc-prompt {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-top: auto;
}

.fc-word-tr {
  font-size: 2.25rem;
  font-weight: 800;
  color: #34d399;
  margin-bottom: 0.75rem;
}

.fc-syn {
  font-size: 0.95rem;
  color: #38bdf8;
  margin-bottom: 0.75rem;
}

.fc-ex {
  font-size: 1rem;
  font-style: italic;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.fc-not {
  font-size: 0.85rem;
  color: var(--text-muted);
}

.flashcard-actions {
  display: flex;
  gap: 1.25rem;
  justify-content: center;
  flex-wrap: wrap;
}

.fc-rate-btn {
  flex: 1;
  min-width: 220px;
  padding: 1.15rem;
  font-size: 1.05rem;
}

.again-btn {
  border: 1px solid rgba(251, 191, 36, 0.4);
  color: #fbbf24;
}

.again-btn:hover {
  background: rgba(251, 191, 36, 0.15);
}

.learned-btn {
  box-shadow: 0 0 20px rgba(52, 211, 153, 0.3);
}

/* MATCH BOARD */
.match-instructions {
  padding: 1rem 1.25rem;
  margin-bottom: 1.75rem;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.match-board {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.match-column {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.col-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 0.35rem;
  text-align: center;
}

.match-card {
  padding: 1.15rem 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  transition: all 0.2s;
  color: #f8fafc !important;
  background: rgba(30, 41, 59, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.match-card:hover:not(.matched) {
  background: rgba(255, 255, 255, 0.1);
  transform: scale(1.02);
}

.match-card.selected {
  border-color: var(--accent);
  background: rgba(99, 102, 241, 0.2);
  box-shadow: 0 0 16px rgba(99, 102, 241, 0.3);
}

.match-card.matched {
  opacity: 0.35;
  background: rgba(52, 211, 153, 0.15);
  border-color: #34d399;
  cursor: default;
  transform: scale(0.96);
}

.match-check {
  color: #34d399;
  font-weight: 800;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-6px); }
  75% { transform: translateX(6px); }
}

.shake-error {
  animation: shake 0.3s ease-in-out;
  border-color: #f87171 !important;
  background: rgba(248, 113, 113, 0.2) !important;
}

/* SPELLING MODE */
.spell-tr {
  font-size: 1.35rem;
  margin-bottom: 1rem;
}

.masked-sentence {
  font-size: 1.15rem;
  color: #c084fc;
  font-family: monospace;
  background: rgba(0, 0, 0, 0.3);
  padding: 1.25rem;
  border-radius: 12px;
  margin-top: 1rem;
}

.spelling-form {
  margin-bottom: 1.5rem;
}

.input-row {
  display: flex;
  gap: 1rem;
}

.spelling-input {
  font-size: 1.15rem !important;
  padding: 1rem 1.25rem !important;
}

.spell-submit {
  padding: 0 2rem;
  font-size: 1.1rem;
}

.spell-feedback {
  padding: 1.5rem;
  text-align: center;
}

.spell-feedback.correct {
  background: rgba(52, 211, 153, 0.15);
  border-color: rgba(52, 211, 153, 0.3);
}

.spell-feedback.wrong {
  background: rgba(248, 113, 113, 0.15);
  border-color: rgba(248, 113, 113, 0.3);
}

.fb-icon {
  font-size: 1.35rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

/* RESULT AREA */
.result-area {
  padding: 3.5rem 2rem;
  text-align: center;
  max-width: 600px;
  margin: 2rem auto;
}

.res-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 1rem;
}

.result-area h2 {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.res-sub {
  color: var(--text-secondary);
  margin-bottom: 2.25rem;
}

.res-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2.5rem;
}

.res-stat-box {
  background: rgba(255, 255, 255, 0.04);
  padding: 1.25rem 0.75rem;
  border-radius: 14px;
  border: 1px solid var(--border);
}

.rs-val {
  display: block;
  font-size: 1.5rem;
  font-weight: 800;
}

.xp-txt { color: #38bdf8; }
.streak-txt { color: #fbbf24; }

.rs-lbl {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 0.25rem;
  display: block;
}

.res-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.loading-state {
  text-align: center;
  padding: 4rem 2rem;
}

.spinner {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.15); opacity: 0.7; }
}
.header-btns {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.prev-btn {
  background: rgba(255, 255, 255, 0.08) !important;
  color: #e2e8f0 !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
}

.prev-btn:hover {
  background: rgba(255, 255, 255, 0.18) !important;
  color: #fff !important;
}

.rank-badge-card {
  padding: 1.25rem;
  border-radius: var(--radius-md);
  background: rgba(30, 41, 59, 0.65);
  border: 1px solid rgba(148, 163, 184, 0.25);
  text-align: center;
}

.rank-title {
  font-size: 1.35rem;
  font-weight: 800;
  margin-bottom: 0.35rem;
}

.rank-progress {
  font-size: 0.95rem;
  color: #cbd5e1;
}

.xp-remaining {
  color: #f43f5e;
  font-weight: 700;
}

@media (max-width: 768px) {
  .match-board {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
  .modes-grid {
    grid-template-columns: 1fr;
  }
  .res-stats {
    grid-template-columns: 1fr;
  }
  .options-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  .question-card {
    padding: 1.5rem 1rem;
  }
  .q-word {
    font-size: 1.75rem;
  }
  .game-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  .header-btns {
    width: 100%;
    justify-content: space-between;
  }
  .progress-info {
    width: 100%;
    max-width: 100%;
  }
  .spelling-form .input-row {
    flex-direction: column;
    gap: 0.75rem;
  }
  .spelling-input {
    width: 100%;
  }
  .spell-submit {
    width: 100%;
  }
  .flashcard-actions {
    flex-direction: column;
    gap: 0.75rem;
  }
  .fc-rate-btn {
    width: 100%;
  }
}

/* Dynamic Light Mode Enhancements for Quiz Cards and Options */
[data-theme="light"] .option-btn,
[data-theme="light"] .match-card {
  background: var(--bg-card) !important;
  color: var(--text-primary) !important;
  border-color: var(--border) !important;
}

[data-theme="light"] .option-btn:hover:not(:disabled),
[data-theme="light"] .match-card:hover:not(.matched) {
  background: #ffffff !important;
  border-color: var(--accent) !important;
  box-shadow: 0 4px 16px rgba(79, 70, 229, 0.12);
}

[data-theme="light"] .prev-btn {
  background: #ffffff !important;
  color: var(--text-secondary) !important;
  border-color: var(--border) !important;
}

[data-theme="light"] .prev-btn:hover {
  background: #f1f5f9 !important;
  color: var(--text-primary) !important;
}

[data-theme="light"] .rank-badge-card {
  background: #ffffff !important;
  border-color: var(--border) !important;
}
</style>
