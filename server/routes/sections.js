import { Router } from 'express'
import db from '../db.js'
import { authMiddleware } from '../middleware/auth.js'
import { starterPacks } from '../starterPacks.js'

const router = Router()
router.use(authMiddleware)

router.get('/starter-packs', (req, res) => {
  res.json({ starterPacks })
})

router.post('/import-pack', async (req, res) => {
  const { packId } = req.body
  const pack = starterPacks.find((p) => p.id === packId)
  if (!pack) {
    return res.status(404).json({ error: 'Seçilen paket bulunamadı' })
  }

  const client = await db.getClient()
  try {
    await client.query('BEGIN')
    const { rows: secRows } = await client.query(
      'INSERT INTO sections (user_id, name, description, color, icon) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.userId, pack.name, pack.description, pack.color, pack.icon]
    )
    const section = secRows[0]

    for (const w of pack.words) {
      await client.query(
        `INSERT INTO words (section_id, user_id, english, turkish, example, notes, word_type, synonyms, difficulty)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          section.id,
          req.userId,
          w.english,
          w.turkish,
          w.example || '',
          w.notes || '',
          w.word_type || 'Genel',
          w.synonyms || '',
          w.difficulty || 2
        ]
      )
    }

    await client.query('COMMIT')
    res.status(201).json({ section: { ...section, word_count: pack.words.length } })
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Paket yükleme hatası:', err)
    res.status(500).json({ error: 'Paket yüklenirken bir hata oluştu' })
  } finally {
    client.release()
  }
})

router.get('/', async (req, res) => {
  try {
    const { rows: sections } = await db.query(
      `SELECT s.*, COUNT(w.id)::int as word_count
       FROM sections s
       LEFT JOIN words w ON w.section_id = s.id
       WHERE s.user_id = $1
       GROUP BY s.id
       ORDER BY s.created_at DESC`,
      [req.userId]
    )
    res.json({ sections })
  } catch (err) {
    res.status(500).json({ error: 'Bölümler alınamadı' })
  }
})

router.post('/', async (req, res) => {
  const { name, description, color, icon } = req.body

  if (!name?.trim()) {
    return res.status(400).json({ error: 'Bölüm adı gerekli' })
  }

  try {
    const { rows } = await db.query(
      'INSERT INTO sections (user_id, name, description, color, icon) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [
        req.userId,
        name.trim(),
        description?.trim() || '',
        color || '#6366f1',
        icon || '📚'
      ]
    )
    res.status(201).json({ section: { ...rows[0], word_count: 0 } })
  } catch (err) {
    res.status(500).json({ error: 'Bölüm oluşturulamadı' })
  }
})

router.patch('/:id', async (req, res) => {
  try {
    const { rows: secRows } = await db.query('SELECT * FROM sections WHERE id = $1 AND user_id = $2', [req.params.id, req.userId])
    const section = secRows[0]
    if (!section) return res.status(404).json({ error: 'Bölüm bulunamadı' })

    const { name, description, color, icon } = req.body
    const { rows: updated } = await db.query(
      'UPDATE sections SET name = $1, description = $2, color = $3, icon = $4 WHERE id = $5 RETURNING *',
      [
        name?.trim() || section.name,
        description !== undefined ? description.trim() : section.description,
        color || section.color,
        icon || section.icon,
        section.id
      ]
    )
    res.json({ section: updated[0] })
  } catch (err) {
    res.status(500).json({ error: 'Bölüm güncellenemedi' })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const result = await db.query('DELETE FROM sections WHERE id = $1 AND user_id = $2', [req.params.id, req.userId])
    if (result.rowCount === 0) return res.status(404).json({ error: 'Bölüm bulunamadı' })
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ error: 'Bölüm silinemedi' })
  }
})

export default router
