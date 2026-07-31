export type Role = 'controller' | 'controlled'

export type MessageType =
  | 'register'
  | 'registered'
  | 'connect'
  | 'connected'
  | 'pair-code'
  | 'session-id'
  | 'offer'
  | 'answer'
  | 'ice'
  | 'peer-joined'
  | 'disconnect'
  | 'error'

export type ErrorCode =
  | 'INVALID_CODE'
  | 'CODE_EXPIRED'
  | 'OFFLINE'
  | 'REJECTED'
  | 'ICE_FAILED'
  | 'ROOM_FULL'
  | 'BAD_MESSAGE'
  | 'UNAUTHORIZED'

export interface SignalingMessage {
  type: MessageType
  deviceId?: string
  role?: Role
  pairCode?: string
  name?: string
  sdp?: string
  candidate?: string
  sessionId?: string
  error?: ErrorCode | string
  remote?: {
    deviceId: string
    name?: string
  }
}

export function createError(code: ErrorCode, detail?: string): SignalingMessage {
  return { type: 'error', error: detail ? `${code}: ${detail}` : code }
}
