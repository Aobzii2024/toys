import { createError, type Role, type SignalingMessage } from './protocol.js'
import { PairingManager } from './pairing.js'

export interface Peer {
  deviceId: string
  role: Role
  name?: string
  socket: unknown
  pairCode?: string
}

export interface Session {
  id: string
  controller: Peer
  controlled: Peer
}

/**
 * 在线设备注册表与会话房间管理。
 * 每个被控端同一时间仅允许一个控制端接入（ROOM_FULL）。
 */
export class SessionManager {
  readonly pairing = new PairingManager()
  private peers = new Map<string, Peer>()
  private sessions = new Map<string, Session>()

  register(deviceId: string, role: Role, socket: unknown, name?: string): { pairCode?: string; error?: SignalingMessage } {
    this.peers.set(deviceId, { deviceId, role, socket, name })
    if (role === 'controlled') {
      const record = this.pairing.create(deviceId, name)
      return { pairCode: record.code }
    }
    return {}
  }

  unregister(deviceId: string): void {
    this.peers.delete(deviceId)
    this.pairing.revokeByDevice(deviceId)
    for (const [id, session] of this.sessions) {
      if (session.controller.deviceId === deviceId || session.controlled.deviceId === deviceId) {
        this.sessions.delete(id)
      }
    }
  }

  getPeer(deviceId: string): Peer | undefined {
    return this.peers.get(deviceId)
  }

  isOnline(deviceId: string): boolean {
    return this.peers.has(deviceId)
  }

  connect(pairCode: string, deviceId: string, name?: string): { session?: Session; error?: SignalingMessage } {
    const verification = this.pairing.verify(pairCode, deviceId)
    if (!verification.ok) {
      return { error: verification.error }
    }
    const { record } = verification
    const controlled = this.peers.get(record.deviceId)
    if (!controlled || controlled.role !== 'controlled') {
      return { error: createError('OFFLINE') }
    }
    for (const session of this.sessions.values()) {
      if (session.controlled.deviceId === record.deviceId) {
        return { error: createError('ROOM_FULL') }
      }
    }
    const controller: Peer = { deviceId, role: 'controller', name, socket: this.peers.get(deviceId)?.socket }
    const session: Session = {
      id: `${record.deviceId}::${deviceId}`,
      controller,
      controlled,
    }
    this.sessions.set(session.id, session)
    return { session }
  }

  getSessionByController(deviceId: string): Session | undefined {
    for (const session of this.sessions.values()) {
      if (session.controller.deviceId === deviceId) {
        return session
      }
    }
    return undefined
  }

  getSessionByControlled(deviceId: string): Session | undefined {
    for (const session of this.sessions.values()) {
      if (session.controlled.deviceId === deviceId) {
        return session
      }
    }
    return undefined
  }

  findSession(id: string): Session | undefined {
    return this.sessions.get(id)
  }

  removeSession(sessionId: string): void {
    this.sessions.delete(sessionId)
  }
}
