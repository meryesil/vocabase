import { Router } from 'express'
import db from '../db.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()
router.use(authMiddleware)

async function verifySection(userId, sectionId) {
  const { rows } = await db.query('SELECT id FROM sections WHERE id = $1 AND user_id = $2', [sectionId, userId])
  return rows[0]
}

router.get('/all', async (req, res) => {
  try {
    const { rows: words } = await db.query(
      `SELECT w.*, s.name as section_name, s.icon as section_icon, s.color as section_color
       FROM words w
       JOIN sections s ON s.id = w.section_id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [req.userId]
    )
    res.json({ words })
  } catch (err) {
    res.status(500).json({ error: 'Kelimeler alınamadı' })
  }
})

router.get('/section/:sectionId', async (req, res) => {
  try {
    if (!(await verifySection(req.userId, req.params.sectionId))) {
      return res.status(404).json({ error: 'Bölüm bulunamadı' })
    }

    const { rows: words } = await db.query('SELECT * FROM words WHERE section_id = $1 ORDER BY created_at DESC', [req.params.sectionId])
    res.json({ words })
  } catch (err) {
    res.status(500).json({ error: 'Kelimeler alınamadı' })
  }
})

router.post('/', async (req, res) => {
  const { sectionId, english, turkish, example, notes, wordType, synonyms, antonyms, difficulty } = req.body

  if (!sectionId || !english?.trim() || !turkish?.trim()) {
    return res.status(400).json({ error: 'İngilizce kelime ve anlamı gerekli' })
  }
  try {
    if (!(await verifySection(req.userId, sectionId))) {
      return res.status(404).json({ error: 'Bölüm bulunamadı' })
    }

    const { rows } = await db.query(
      `INSERT INTO words (section_id, user_id, english, turkish, example, notes, word_type, synonyms, antonyms, difficulty)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        sectionId,
        req.userId,
        english.trim(),
        turkish.trim(),
        example?.trim() || '',
        notes?.trim() || '',
        wordType || 'Genel',
        synonyms?.trim() || '',
        antonyms?.trim() || '',
        difficulty !== undefined ? difficulty : 2
      ]
    )
    res.status(201).json({ word: rows[0] })
  } catch (err) {
    console.error('Kelime ekleme hatası:', err)
    res.status(500).json({ error: 'Kelime eklenemedi' })
  }
})

router.post('/batch-import', async (req, res) => {
  const { sectionId, words } = req.body

  if (!sectionId || !Array.isArray(words) || words.length === 0) {
    return res.status(400).json({ error: 'Geçersiz bölüm veya kelime listesi' })
  }
  try {
    if (!(await verifySection(req.userId, sectionId))) {
      return res.status(404).json({ error: 'Bölüm bulunamadı' })
    }

    const client = await db.getClient()
    let count = 0
    try {
      await client.query('BEGIN')
      for (const w of words) {
        if (!w.english?.trim() || !w.turkish?.trim()) continue
        await client.query(
          `INSERT INTO words (section_id, user_id, english, turkish, example, notes, word_type, synonyms, difficulty)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            sectionId,
            req.userId,
            w.english.trim(),
            w.turkish.trim(),
            w.example?.trim() || '',
            w.notes?.trim() || '',
            w.word_type || 'Genel',
            w.synonyms?.trim() || '',
            w.difficulty || 2
          ]
        )
        count++
      }
      await client.query('COMMIT')
      res.status(201).json({ added: count })
    } catch (err) {
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  } catch (err) {
    res.status(500).json({ error: 'Toplu kelime ekleme başarısız' })
  }
})

router.patch('/:id/favorite', async (req, res) => {
  try {
    const { rows: wRows } = await db.query('SELECT id, is_favorite FROM words WHERE id = $1 AND user_id = $2', [req.params.id, req.userId])
    const word = wRows[0]
    if (!word) return res.status(404).json({ error: 'Kelime bulunamadı' })

    const newFav = word.is_favorite ? 0 : 1
    await db.query('UPDATE words SET is_favorite = $1 WHERE id = $2', [newFav, word.id])
    res.json({ id: word.id, is_favorite: newFav })
  } catch (err) {
    res.status(500).json({ error: 'Favori güncellenemedi' })
  }
})

router.patch('/:id', async (req, res) => {
  try {
    const { rows: wRows } = await db.query('SELECT * FROM words WHERE id = $1 AND user_id = $2', [req.params.id, req.userId])
    const word = wRows[0]
    if (!word) return res.status(404).json({ error: 'Kelime bulunamadı' })

    const { english, turkish, example, notes, masteryLevel, wordType, synonyms, antonyms, difficulty, isFavorite } = req.body
    const { rows: updated } = await db.query(
      `UPDATE words SET
        english = $1, turkish = $2, example = $3, notes = $4,
        mastery_level = $5, last_quizzed = $6, word_type = $7, synonyms = $8, antonyms = $9, difficulty = $10, is_favorite = $11
       WHERE id = $12 RETURNING *`,
      [
        english?.trim() || word.english,
        turkish?.trim() || word.turkish,
        example !== undefined ? example.trim() : word.example,
        notes !== undefined ? notes.trim() : word.notes,
        masteryLevel !== undefined ? masteryLevel : word.mastery_level,
        masteryLevel !== undefined ? new Date().toISOString() : word.last_quizzed,
        wordType !== undefined ? wordType : word.word_type,
        synonyms !== undefined ? synonyms.trim() : word.synonyms,
        antonyms !== undefined ? antonyms.trim() : word.antonyms,
        difficulty !== undefined ? difficulty : word.difficulty,
        isFavorite !== undefined ? (isFavorite ? 1 : 0) : word.is_favorite,
        word.id
      ]
    )
    res.json({ word: updated[0] })
  } catch (err) {
    res.status(500).json({ error: 'Kelime güncellenemedi' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM words WHERE id = $1 AND user_id = $2', [req.params.id, req.userId])
    if (result.rowCount === 0) return res.status(404).json({ error: 'Kelime bulunamadı' })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Kelime silinemedi' })
  }
})

export default router
