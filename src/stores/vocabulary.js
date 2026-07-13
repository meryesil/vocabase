import { ref } from 'vue'
import { defineStore } from 'pinia'
import { api } from '@/api/client.js'

export const useVocabularyStore = defineStore('vocabulary', () => {
  const sections = ref([])
  const words = ref([])
  const allWords = ref([])
  const starterPacks = ref([])
  const stats = ref(null)
  const loading = ref(false)

  async function fetchSections() {
    loading.value = true
    try {
      const data = await api('/sections')
      sections.value = data.sections
    } finally {
      loading.value = false
    }
  }

  async function fetchStarterPacks() {
    const data = await api('/sections/starter-packs')
    starterPacks.value = data.starterPacks
  }

  async function importPack(packId) {
    loading.value = true
    try {
      const { section } = await api('/sections/import-pack', {
        method: 'POST',
        body: JSON.stringify({ packId })
      })
      sections.value.unshift(section)
      await fetchStats()
      return section
    } finally {
      loading.value = false
    }
  }

  async function createSection(payload) {
    const { section } = await api('/sections', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    sections.value.unshift(section)
    return section
  }

  async function deleteSection(id) {
    await api(`/sections/${id}`, { method: 'DELETE' })
    sections.value = sections.value.filter((s) => s.id !== id)
  }

  async function fetchWords(sectionId) {
    loading.value = true
    try {
      const data = await api(`/words/section/${sectionId}`)
      words.value = data.words
    } finally {
      loading.value = false
    }
  }

  async function fetchAllWords() {
    loading.value = true
    try {
      const data = await api('/words/all')
      allWords.value = data.words
    } finally {
      loading.value = false
    }
  }

  async function addWord(payload) {
    const { word } = await api('/words', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    words.value.unshift(word)
    const section = sections.value.find((s) => s.id === payload.sectionId)
    if (section) section.word_count = (section.word_count || 0) + 1
    return word
  }

  async function updateWord(id, payload) {
    const { word } = await api(`/words/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    })
    const idx = words.value.findIndex((w) => w.id === id)
    if (idx !== -1) words.value[idx] = word
    return word
  }

  async function toggleFavorite(id) {
    const res = await api(`/words/${id}/favorite`, { method: 'PATCH' })
    const w = words.value.find((item) => item.id === id)
    if (w) w.is_favorite = res.is_favorite
    return res.is_favorite
  }

  async function batchImport(sectionId, wordsList) {
    const res = await api('/words/batch-import', {
      method: 'POST',
      body: JSON.stringify({ sectionId, words: wordsList })
    })
    const section = sections.value.find((s) => s.id === sectionId)
    if (section) section.word_count = (section.word_count || 0) + res.added
    if (words.value.length && words.value[0]?.section_id === sectionId) {
      await fetchWords(sectionId)
    }
    return res.added
  }

  async function deleteWord(id) {
    const word = words.value.find((w) => w.id === id)
    await api(`/words/${id}`, { method: 'DELETE' })
    words.value = words.value.filter((w) => w.id !== id)
    if (word) {
      const section = sections.value.find((s) => s.id === word.section_id)
      if (section) section.word_count = Math.max(0, (section.word_count || 1) - 1)
    }
  }

  async function fetchStats() {
    const data = await api('/quiz/stats')
    stats.value = data.stats
  }

  return {
    sections,
    words,
    allWords,
    starterPacks,
    stats,
    loading,
    fetchSections,
    fetchStarterPacks,
    importPack,
    createSection,
    deleteSection,
    fetchWords,
    fetchAllWords,
    addWord,
    updateWord,
    toggleFavorite,
    batchImport,
    deleteWord,
    fetchStats,
  }
})
