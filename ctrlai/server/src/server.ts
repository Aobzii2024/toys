import { WebSocketServer, WebSocket } from 'ws'
import { config } from './config.js'
import { createError, type SignalingMessage } from './protocol.js'
import { SessionManager } from './room.js'

interface SendableSocket {
  send(data: string): void
  readyState: number
}

function isOpen(socket: WebSocket): boolean {
  return socket.readyState === WebSocket.OPEN
}

function send(socket: WebSocket, message: SignalingMessage): void {
  if (isOpen(socket)) {
    socket.send(JSON.stringify(message))
  }
}

export class SignalingServer {
  readonly sessions = new SessionManager()
  private readonly wss: WebSocketServer
  private socketToDevice = new Map<WebSocket, string>()
  private deviceToSocket = new Map<string, WebSocket>()

  constructor() {
    this.wss = new WebSocketServer({ noServer: true })
    this.wss.on('connection', (socket) => this.handleConnection(socket))
  }

  handleUpgrade(request: import('http').IncomingMessage, socket: import('stream').Duplex, head: Buffer): void {
    this.wss.handleUpgrade(request, socket, head, (ws) => this.wss.emit('connection', ws, request))
  }

  private handleConnection(socket: WebSocket): void {
    socket.on('message', (data) => this.handleMessage(socket, data.toString()))
    socket.on('close', () => this.handleClose(socket))
    socket.on('error', () => this.handleClose(socket))
  }

  private handleMessage(socket: WebSocket, raw: string): void {
    let message: SignalingMessage
    try {
      message = JSON.parse(raw) as SignalingMessage
    } catch {
      send(socket, createError('BAD_MESSAGE', 'invalid JSON'))
      return
    }
    if (!message || typeof message.type !== 'string') {
      send(socket, createError('BAD_MESSAGE', 'missing type'))
      return
    }
    switch (message.type) {
      case 'register':
        this.onRegister(socket, message)
        break
      case 'connect':
        this.onConnect(socket, message)
        break
      case 'offer':
      case 'answer':
      case 'ice':
        this.onRelay(socket, message)
        break
      case 'disconnect':
        this.onDisconnect(socket)
        break
      default:
        send(socket, createError('BAD_MESSAGE', `unknown type: ${message.type}`))
    }
  }

  private onRegister(socket: WebSocket, message: SignalingMessage): void {
    const deviceId = message.deviceId
    const role = message.role
    if (!deviceId || (role !== 'controller' && role !== 'controlled')) {
      send(socket, createError('BAD_MESSAGE', 'register requires deviceId and role'))
      return
    }
    this.socketToDevice.set(socket, deviceId)
    this.deviceToSocket.set(deviceId, socket)
    const result = this.sessions.register(deviceId, role, socket, message.name)
    if (result.error) {
      send(socket, result.error)
      return
    }
    const reply: SignalingMessage = { type: 'registered', deviceId, name: message.name }
    send(socket, reply)
    if (result.pairCode !== undefined) {
      send(socket, { type: 'pair-code', pairCode: result.pairCode })
    }
  }

  private onConnect(socket: WebSocket, message: SignalingMessage): void {
    const deviceId = this.socketToDevice.get(socket)
    if (!deviceId || !message.pairCode) {
      send(socket, createError('BAD_MESSAGE', 'connect requires pairCode'))
      return
    }
    const result = this.sessions.connect(message.pairCode, deviceId, message.name)
    if (result.error) {
      send(socket, result.error)
      return
    }
    const session = result.session!
    const controlledSocket = this.deviceToSocket.get(session.controlled.deviceId)
    if (!controlledSocket) {
      this.sessions.removeSession(session.id)
      send(socket, createError('OFFLINE'))
      return
    }
    send(socket, {
      type: 'connected',
      remote: { deviceId: session.controlled.deviceId, name: session.controlled.name },
    })
    send(controlledSocket, {
      type: 'peer-joined',
      remote: { deviceId: deviceId, name: message.name },
    })
    socket.send(JSON.stringify({ type: 'session-id', sessionId: session.id }))
  }

  private onRelay(socket: WebSocket, message: SignalingMessage): void {
    const deviceId = this.socketToDevice.get(socket)
    if (!deviceId) {
      send(socket, createError('UNAUTHORIZED', 'not registered'))
      return
    }
    const session =
      this.sessions.getSessionByController(deviceId) ?? this.sessions.getSessionByControlled(deviceId)
    if (!session) {
      send(socket, createError('UNAUTHORIZED', 'no active session'))
      return
    }
    const targetDeviceId =
      session.controller.deviceId === deviceId ? session.controlled.deviceId : session.controller.deviceId
    const targetSocket = this.deviceToSocket.get(targetDeviceId)
    if (!targetSocket || !isOpen(targetSocket)) {
      send(socket, createError('OFFLINE'))
      return
    }
    const relayed: SignalingMessage = { type: message.type, sdp: message.sdp, candidate: message.candidate }
    send(targetSocket, relayed)
  }

  private onDisconnect(socket: WebSocket): void {
    this.handleClose(socket)
  }

  private handleClose(socket: WebSocket): void {
    const deviceId = this.socketToDevice.get(socket)
    this.socketToDevice.delete(socket)
    if (deviceId) {
      this.deviceToSocket.delete(deviceId)
      const session =
        this.sessions.getSessionByController(deviceId) ?? this.sessions.getSessionByControlled(deviceId)
      if (session) {
        this.sessions.removeSession(session.id)
        const peerDeviceId =
          session.controller.deviceId === deviceId ? session.controlled.deviceId : session.controller.deviceId
        const peerSocket = this.deviceToSocket.get(peerDeviceId)
        if (peerSocket && isOpen(peerSocket)) {
          send(peerSocket, { type: 'disconnect' })
        }
      }
      this.sessions.unregister(deviceId)
    }
  }

  get connectionCount(): number {
    return this.socketToDevice.size
  }
}
