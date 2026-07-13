import { Router } from 'express'
import bcrypt from 'bcryptjs'
import db from '../db.js'
import { signToken, authMiddleware } from '../middleware/auth.js'

const router = Router()

router.post('/register', async (req, res) => {
  const { email, password, displayName } = req.body

  if (!email?.trim() || !password || !displayName?.trim()) {
    return res.status(400).json({ error: 'Lütfen ad-soyad, e-posta ve şifre alanlarının tamamını eksiksiz doldurun.' })
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Güvenliğiniz için şifreniz en az 6 karakterden oluşmalıdır.' })
  }

  try {
    const { rows: existing } = await db.query('SELECT id FROM users WHERE email = $1', [email.trim().toLowerCase()])
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Bu e-posta adresi ile daha önce üye olunmuş! Lütfen giriş yapmayı deneyin veya farklı bir e-posta adresi kullanın.' })
    }

    const hash = bcrypt.hashSync(password, 10)
    const { rows: inserted } = await db.query(
      'INSERT INTO users (email, password_hash, display_name) VALUES ($1, $2, $3) RETURNING id, email, display_name, exam_goal',
      [email.trim().toLowerCase(), hash, displayName.trim()]
    )

    const user = inserted[0]
    const token = signToken(user)
    res.status(201).json({ token, user })
  } catch (err) {
    console.error('Kayıt hatası:', err)
    res.status(500).json({ error: 'Sunucuda bir hata oluştu, lütfen tekrar deneyin.' })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email?.trim() || !password) {
    return res.status(400).json({ error: 'Lütfen e-posta adresinizi ve şifrenizi girin.' })
  }

  try {
    const { rows } = await db.query(
      'SELECT id, email, password_hash, display_name, exam_goal FROM users WHERE email = $1',
      [email.trim().toLowerCase()]
    )
    const user = rows[0]

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'E-posta adresiniz veya şifreniz hatalı! Lütfen bilgilerinizi kontrol edip tekrar deneyin.' })
    }

    const token = signToken(user)
    const { password_hash, ...safeUser } = user
    res.json({ token, user: safeUser })
  } catch (err) {
    console.error('Giriş hatası:', err)
    res.status(500).json({ error: 'Sunucuda bir hata oluştu, lütfen tekrar deneyin.' })
  }
})

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query(
      'SELECT id, email, display_name, exam_goal, created_at FROM users WHERE id = $1',
      [req.userId]
    )
    const user = rows[0]

    if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı' })
    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: 'Kullanıcı bilgileri alınamadı' })
  }
})

router.patch('/me', authMiddleware, async (req, res) => {
  const { displayName, examGoal } = req.body

  try {
    if (displayName !== undefined) {
      await db.query('UPDATE users SET display_name = $1 WHERE id = $2', [displayName.trim(), req.userId])
    }
    if (examGoal !== undefined) {
      await db.query('UPDATE users SET exam_goal = $1 WHERE id = $2', [examGoal, req.userId])
    }

    const { rows } = await db.query(
      'SELECT id, email, display_name, exam_goal, created_at FROM users WHERE id = $1',
      [req.userId]
    )
    res.json({ user: rows[0] })
  } catch (err) {
    res.status(500).json({ error: 'Profil güncellenemedi' })
  }
})

export default router
