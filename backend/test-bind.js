const http = require('http')

const PORT = Number(process.env.PORT || 3002)

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ ok: true, pid: process.pid, url: `http://0.0.0.0:${PORT}${req.url}` }))
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Bind test listening on http://0.0.0.0:${PORT}`)
})

server.on('error', (err) => {
  console.error('Bind test server error:', err)
  process.exit(1)
})
