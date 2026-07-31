import http from 'node:http'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import WebSocket from 'ws'
import { SignalingServer } from '../src/server.js'
import type { SignalingMessage } from '../src/protocol.js'

let server: http.Server
let signaling: SignalingServer
let port: number

beforeAll(async () => {
  server = http.createServer((_req, res) => res.writeHead(200).end())
  signaling = new SignalingServer()
  server.on('upgrade', (req, socket, head) => {
    if (req.url === '/ws') signaling.handleUpgrade(req, socket, head)
    else socket.destroy()
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  port = (server.address() as { port: number }).port
})

afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()))
})

function connect(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}/ws`)
    ws.on('open', () => resolve(ws))
    ws.on('error', reject)
  })
}

/** 消息收集器：将所有入站消息推入队列，可等待匹配消息，避免竞态丢失。 */
function collector(ws: WebSocket) {
  const queue: SignalingMessage[] = []
  const waiters: Array<{ predicate: (m: SignalingMessage) => boolean; resolve: (m: SignalingMessage) => void }> = []
  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString()) as SignalingMessage
    for (let i = 0; i < waiters.length; i++) {
      const waiter = waiters[i]
      if (waiter.predicate(msg)) {
        waiters.splice(i, 1)
        waiter.resolve(msg)
        return
      }
    }
    queue.push(msg)
  })
  function next(predicate: (m: SignalingMessage) => boolean, timeoutMs = 3000): Promise<SignalingMessage> {
    return new Promise((resolve, reject) => {
      const index = queue.findIndex(predicate)
      if (index >= 0) {
        resolve(queue.splice(index, 1)[0])
        return
      }
      const waiter = { predicate, resolve }
      waiters.push(waiter)
      const timer = setTimeout(() => {
        const i = waiters.indexOf(waiter)
        if (i >= 0) waiters.splice(i, 1)
        reject(new Error('timeout waiting for message'))
      }, timeoutMs)
      // @ts-expect-error 附加 timer 便于清理
      waiter.timer = timer
    })
  }
  return {
    next,
    type(type: string, timeoutMs = 3000) {
      return next((m) => m.type === type, timeoutMs)
    },
  }
}

async function register(ws: WebSocket, deviceId: string, role: string, name?: string): Promise<ReturnType<typeof collector>> {
  const c = collector(ws)
  ws.send(JSON.stringify({ type: 'register', deviceId, role, name }))
  await c.type('registered')
  return c
}

describe('SignalingServer 集成', () => {
  it('被控端注册后收到配对码', async () => {
    const ws = await connect()
    const c = await register(ws, 'device-a', 'controlled', 'Pixel 8')
    const pair = await c.type('pair-code')
    expect(pair.pairCode).toMatch(/^\d{6}$/)
    ws.close()
  })

  it('控制端用配对码连接，双方收到 connected / peer-joined', async () => {
    const controlled = await connect()
    const cControlled = await register(controlled, 'device-a', 'controlled', 'Pixel 8')
    const pair = await cControlled.type('pair-code')

    const controller = await connect()
    const cController = await register(controller, 'controller-x', 'controller', 'Nubia')
    controller.send(JSON.stringify({ type: 'connect', pairCode: pair.pairCode }))

    const joined = await cControlled.type('peer-joined')
    expect(joined.remote?.deviceId).toBe('controller-x')

    const connected = await cController.type('connected')
    expect(connected.remote?.deviceId).toBe('device-a')

    controlled.close()
    controller.close()
  })

  it('错误配对码返回 INVALID_CODE', async () => {
    const controller = await connect()
    const c = await register(controller, 'controller-x', 'controller', 'Nubia')
    controller.send(JSON.stringify({ type: 'connect', pairCode: '000000' }))
    const error = await c.type('error')
    expect(error.error).toContain('INVALID_CODE')
    controller.close()
  })

  it('offer/answer 信令正确转发到对端', async () => {
    const controlled = await connect()
    const cControlled = await register(controlled, 'device-a', 'controlled', 'Pixel 8')
    const pair = await cControlled.type('pair-code')

    const controller = await connect()
    const cController = await register(controller, 'controller-x', 'controller', 'Nubia')
    controller.send(JSON.stringify({ type: 'connect', pairCode: pair.pairCode }))
    await cControlled.type('peer-joined')
    await cController.type('connected')

    controller.send(JSON.stringify({ type: 'offer', sdp: 'sdp-from-controller' }))
    const offer = await cControlled.type('offer')
    expect(offer.sdp).toBe('sdp-from-controller')

    controlled.send(JSON.stringify({ type: 'answer', sdp: 'sdp-from-controlled' }))
    const answer = await cController.type('answer')
    expect(answer.sdp).toBe('sdp-from-controlled')

    controlled.close()
    controller.close()
  })

  it('会话中一端断开后对端收到 disconnect', async () => {
    const controlled = await connect()
    const cControlled = await register(controlled, 'device-a', 'controlled', 'Pixel 8')
    const pair = await cControlled.type('pair-code')

    const controller = await connect()
    const cController = await register(controller, 'controller-x', 'controller', 'Nubia')
    controller.send(JSON.stringify({ type: 'connect', pairCode: pair.pairCode }))
    await cControlled.type('peer-joined')
    await cController.type('connected')

    const disconnectPromise = cControlled.type('disconnect')
    controller.close()
    const disconnect = await disconnectPromise
    expect(disconnect.type).toBe('disconnect')

    controlled.close()
  })
})
