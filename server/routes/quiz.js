import { Router } from 'express'
import db from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware)

async function updateUserGamification(userId, earnedXp = 10) {
  const { rows } = await db.query('SELECT xp, streak_days, last_active_date FROM users WHERE id = $1', [userId])
  const user = rows[0]
  if (!user) return null

  const today = new Date().toISOString().split('T')[0]
  let newStreak = user.streak_days || 0

  if (user.last_active_date !== today) {
    if (!user.last_active_date) {
      newStreak = 1
    } else {
      const lastDate = new Date(user.last_active_date)
      const now = new Date(today)
      const diffDays = Math.round((now - lastDate) / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        newStreak += 1
      } else if (diffDays > 1) {
        newStreak = 1
      }
    }
  }

  const newXp = (user.xp || 0) + earnedXp

  await db.query('UPDATE users SET xp = $1, streak_days = $2, last_active_date = $3 WHERE id = $4', [
    newXp,
    newStreak,
    today,
    userId
  ])

  return { xp: newXp, streakDays: newStreak, earnedXp }
}

router.get('/stats', async (req, res) => {
  try {
    const { rows: statsRows } = await db.query(
      `SELECT
        COUNT(*)::int as total_words,
        SUM(CASE WHEN mastery_level >= 3 THEN 1 ELSE 0 END)::int as learned,
        SUM(CASE WHEN mastery_level IN (1, 2) THEN 1 ELSE 0 END)::int as learning,
        SUM(CASE WHEN mastery_level = 0 THEN 1 ELSE 0 END)::int as new_words
       FROM words WHERE user_id = $1`,
      [req.userId]
    )
    const stats = statsRows[0] || {}

    const { rows: secRows } = await db.query('SELECT COUNT(*)::int as count FROM sections WHERE user_id = $1', [req.userId])
    const sectionCount = secRows[0]?.count || 0

    const { rows: userRows } = await db.query('SELECT xp, streak_days, last_active_date, daily_goal FROM users WHERE id = $1', [req.userId])
    const user = userRows[0] || {}

    res.json({
      stats: {
        totalWords: stats.total_words || 0,
        learned: stats.learned || 0,
        learning: stats.learning || 0,
        newWords: stats.new_words || 0,
        sectionCount,
        xp: user?.xp || 0,
        streakDays: user?.streak_days || 0,
        lastActiveDate: user?.last_active_date || null,
        dailyGoal: user?.daily_goal || 15
      }
    })
  } catch (err) {
    console.error('İstatistik alma hatası:', err)
    res.status(500).json({ error: 'İstatistikler alınamadı' })
  }
})

router.get('/session', async (req, res) => {
  const { sectionId, limit = 10, mode = 'multiple_choice' } = req.query
  const count = Math.min(parseInt(limit, 10) || 10, 50)

  try {
    let words
    if (sectionId) {
      const { rows } = await db.query(
        `SELECT w.* FROM words w
         WHERE w.user_id = $1 AND w.section_id = $2
         ORDER BY w.mastery_level ASC, RANDOM()
         LIMIT $3`,
        [req.userId, sectionId, count]
      )
      words = rows
    } else {
      const { rows } = await db.query(
        `SELECT * FROM words
         WHERE user_id = $1
         ORDER BY mastery_level ASC, RANDOM()
         LIMIT $2`,
        [req.userId, count]
      )
      words = rows
    }

    if (words.length === 0) {
      return res.status(404).json({ error: 'Quiz için kelime bulunamadı. Lütfen önce kelime ekleyin.' })
    }

    // MODE 1: Multiple Choice
    if (mode === 'multiple_choice') {
      const questions = []
      for (const word of words) {
        const { rows: distRows } = await db.query(
          `SELECT turkish FROM words
           WHERE user_id = $1 AND id != $2
           ORDER BY RANDOM() LIMIT 3`,
          [req.userId, word.id]
        )
        const distractors = distRows.map((w) => w.turkish)
        const options = [word.turkish, ...distractors]
        for (let i = options.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[options[i], options[j]] = [options[j], options[i]]
        }

        questions.push({
          id: word.id,
          english: word.english,
          example: word.example,
          wordType: word.word_type || 'Genel',
          synonyms: word.synonyms || '',
          options,
          correctAnswer: word.turkish,
          masteryLevel: word.mastery_level
        })
      }
      return res.json({ mode, questions })
    }

    // MODE 2: Flashcards
    if (mode === 'flashcard') {
      const questions = words.map((word) => ({
        id: word.id,
        english: word.english,
        turkish: word.turkish,
        example: word.example,
        notes: word.notes,
        wordType: word.word_type || 'Genel',
        synonyms: word.synonyms || '',
        masteryLevel: word.mastery_level
      }))
      return res.json({ mode, questions })
    }

    // MODE 3: Match Game (Kelime Eşleştirme)
    if (mode === 'match') {
      const matchWords = words.slice(0, 6)
      const englishOptions = matchWords.map((w) => ({ id: w.id, text: w.english, type: 'en' }))
      const turkishOptions = matchWords.map((w) => ({ id: w.id, text: w.turkish, type: 'tr' }))

      for (let i = englishOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[englishOptions[i], englishOptions[j]] = [englishOptions[j], englishOptions[i]]
      }
      for (let i = turkishOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[turkishOptions[i], turkishOptions[j]] = [turkishOptions[j], turkishOptions[i]]
      }

      return res.json({
        mode,
        pairs: matchWords.map((w) => ({ id: w.id, english: w.english, turkish: w.turkish })),
        englishOptions,
        turkishOptions
      })
    }

    // MODE 4: Spelling / Typing
    if (mode === 'spelling') {
      const questions = words.map((word) => {
        let maskedExample = word.example || ''
        if (maskedExample) {
          const regex = new RegExp(word.english.split('/')[0].trim(), 'gi')
          maskedExample = maskedExample.replace(regex, '______')
        }

        return {
          id: word.id,
          turkish: word.turkish,
          exampleMasked: maskedExample,
          wordType: word.word_type || 'Genel',
          correctAnswer: word.english.split('/')[0].trim(),
          fullEnglish: word.english,
          masteryLevel: word.mastery_level
        }
      })
      return res.json({ mode, questions })
    }

    res.status(400).json({ error: 'Bilinmeyen quiz modu' })
  } catch (err) {
    console.error('Quiz oturum hatası:', err)
    res.status(500).json({ error: 'Quiz verileri hazırlanamadı' })
  }
})

router.post('/answer', async (req, res) => {
  const { wordId, correct, earnedXp = 10 } = req.body

  try {
    const { rows: wRows } = await db.query('SELECT * FROM words WHERE id = $1 AND user_id = $2', [wordId, req.userId])
    const word = wRows[0]
    if (!word) return res.status(404).json({ error: 'Kelime bulunamadı' })

    let newLevel = word.mastery_level
    if (correct) {
      newLevel = Math.min(newLevel + 1, 5)
      await db.query('UPDATE words SET correct_count = correct_count + 1 WHERE id = $1', [wordId])
    } else {
      newLevel = Math.max(newLevel - 1, 0)
      await db.query('UPDATE words SET wrong_count = wrong_count + 1 WHERE id = $1', [wordId])
    }

    await db.query('UPDATE words SET mastery_level = $1, last_quizzed = $2 WHERE id = $3', [
      newLevel,
      new Date().toISOString(),
      wordId
    ])

    const gamification = await updateUserGamification(req.userId, correct ? earnedXp : 2)
    res.json({ masteryLevel: newLevel, gamification })
  } catch (err) {
    res.status(500).json({ error: 'Cevap kaydedilemedi' })
  }
})

export default router
