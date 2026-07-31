import { createError, type SignalingMessage } from './protocol.js'

export interface PairingRecord {
  code: string
  deviceId: string
  name?: string
  expireAt: number
  used: boolean
}

const CODE_TTL_MS = 3 * 60 * 1000

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

/**
 * 配对码管理器。被控端注册时生成 6 位配对码，控制端连接时校验。
 * 配对码一次性有效，校验成功后立即失效，防止重放攻击。
 */
export class PairingManager {
  private records = new Map<string, PairingRecord>()

  create(deviceId: string, name?: string): PairingRecord {
    this.purgeExpired()
    const record: PairingRecord = {
      code: generateCode(),
      deviceId,
      name,
      expireAt: Date.now() + CODE_TTL_MS,
      used: false,
    }
    this.records.set(record.code, record)
    return record
  }

  verify(code: string, deviceId: string): { ok: true; record: PairingRecord } | { ok: false; error: SignalingMessage } {
    const record = this.records.get(code)
    if (!record || record.used) {
      return { ok: false, error: createError('INVALID_CODE') }
    }
    if (Date.now() > record.expireAt) {
      this.records.delete(code)
      return { ok: false, error: createError('CODE_EXPIRED') }
    }
    record.used = true
    this.records.delete(code)
    return { ok: true, record }
  }

  revokeByDevice(deviceId: string): void {
    for (const [code, record] of this.records) {
      if (record.deviceId === deviceId) {
        this.records.delete(code)
      }
    }
  }

  private purgeExpired(): void {
    const now = Date.now()
    for (const [code, record] of this.records) {
      if (record.expireAt < now) {
        this.records.delete(code)
      }
    }
  }

  get size(): number {
    this.purgeExpired()
    return this.records.size
  }
}
