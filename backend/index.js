const express = require('express')
const cors = require('cors')

const weatherRoutes = require('./routes/weather')
const riskRoutes = require('./routes/risk')
const locationsRoutes = require('./routes/locations')

const app = express()
const PORT = Number(process.env.PORT || 3000)

app.use(cors())
app.use(express.json())

app.use('/api/weather', weatherRoutes)
app.use('/api/risk', riskRoutes)
app.use('/api/locations', locationsRoutes)

// Root API info
app.get('/api', (req, res) => {
  res.json({
    service: 'KodeKalesh backend',
    status: 'ok',
    endpoints: [
      '/api/health',
      '/api/locations',
      '/api/weather/current',
      '/api/weather/forecast',
      '/api/risk/assessment'
    ]
  })
})

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))


process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason)
})

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err)

  process.exit(1)
})

const tryPorts = [Number(process.env.PORT || 3000), 3001, 3002, 3003]

async function startListening(ports) {
  for (const p of ports) {
    try {
      await new Promise((resolve, reject) => {
        const server = app.listen(p, '0.0.0.0')
        server.once('listening', () => {
          console.log(`PID=${process.pid} - KodeKalesh backend running on http://0.0.0.0:${p}/api`)
          resolve(server)
        })
        server.once('error', (err) => {
          server.close?.()
          reject(err)
        })
      })
      return
    } catch (err) {
      console.warn(`Port ${p} unavailable:`, err.code || err.message || err)
     
    }
  }
  console.error('All ports failed, cannot start server')
}

startListening(tryPorts)
