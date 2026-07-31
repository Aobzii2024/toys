import http from 'node:http'
import { config } from './config.js'
import { SignalingServer } from './server.js'

const server = http.createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({ ok: true, service: 'ctrlai-signaling', version: '0.1.0' }))
})

const signaling = new SignalingServer()
server.on('upgrade', (req, socket, head) => {
  if (req.url === '/ws') {
    signaling.handleUpgrade(req, socket, head)
  } else {
    socket.destroy()
  }
})

server.listen(config.port, config.host, () => {
  console.log(`[ctrlai] signaling server listening on ${config.host}:${config.port}`)
})

function shutdown(): void {
  server.close(() => process.exit(0))
  setTimeout(() => process.exit(1), 5000).unref()
}

process.on('SIGTERM', shutdown)
process.on('SIGINT', shutdown)
