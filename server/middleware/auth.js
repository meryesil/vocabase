import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'vocabase-dev-secret-change-in-production'

export function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' })
}

export function authMiddleware(req, res, next) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Giriş yapmanız gerekiyor' })
  }

  try {
    const payload = jwt.verify(header.slice(7), JWT_SECRET)
    req.userId = payload.id
    next()
  } catch {
    return res.status(401).json({ error: 'Oturum süresi doldu, tekrar giriş yapın' })
  }
}
