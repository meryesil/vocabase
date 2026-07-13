import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import os from 'node:os'
import { initDb } from './db.js'
import authRoutes from './routes/auth.js'
import sectionRoutes from './routes/sections.js'
import wordRoutes from './routes/words.js'
import quizRoutes from './routes/quiz.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 5000

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/sections', sectionRoutes)
app.use('/api/words', wordRoutes)
app.use('/api/quiz', quizRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', name: 'VocaBase API (PostgreSQL)' })
})

const distPath = path.join(__dirname, '..', 'dist')
app.use(express.static(distPath))
app.get('/{*path}', (req, res, next) => {
  if (req.path.startsWith('/api')) return next()
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) next()
  })
})

function getNetworkIps() {
  const nets = os.networkInterfaces()
  const results = []
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      if (net.family === 'IPv4' && !net.internal) {
        results.push(net.address)
      }
    }
  }
  return results
}

initDb().then(() => {
  app.listen(PORT, () => {
    const ips = getNetworkIps()
    console.log('\n  ┌─────────────────────────────────────────────────────────────┐')
    console.log('  │ 🚀 VocaBase Akademik (PostgreSQL) - Sunucu Çalışıyor!      │')
    console.log('  ├─────────────────────────────────────────────────────────────┤')
    console.log(`  │ 🌐 Yerel (Localhost):   http://localhost:${PORT}             │`)
    console.log(`  │ 🌐 Yerel (127.0.0.1):   http://127.0.0.1:${PORT}             │`)
    if (ips.length > 0) {
      ips.forEach(ip => {
        console.log(`  │ 📱 Ağ / Wi-Fi (LAN):    http://${ip}:${PORT}            │`)
      })
    }
    console.log('  └─────────────────────────────────────────────────────────────┘\n')
  })
}).catch((err) => {
  console.error('Veritabanı başlatılamadı:', err)
  process.exit(1)
})
