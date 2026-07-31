import { describe, it, expect, beforeEach } from 'vitest'
import { PairingManager } from '../src/pairing.js'

describe('PairingManager', () => {
  let manager: PairingManager

  beforeEach(() => {
    manager = new PairingManager()
  })

  it('生成 6 位数字配对码', () => {
    const record = manager.create('device-a')
    expect(record.code).toMatch(/^\d{6}$/)
    expect(record.used).toBe(false)
  })

  it('校验正确的配对码并标记为一次性使用', () => {
    const record = manager.create('device-a')
    const result = manager.verify(record.code, 'controller-x')
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.record.deviceId).toBe('device-a')
    }
    const second = manager.verify(record.code, 'controller-y')
    expect(second.ok).toBe(false)
  })

  it('拒绝不存在的配对码', () => {
    const result = manager.verify('000000', 'controller-x')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.error).toContain('INVALID_CODE')
    }
  })

  it('拒绝过期配对码', () => {
    const record = manager.create('device-a')
    record.expireAt = Date.now() - 1000
    const result = manager.verify(record.code, 'controller-x')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.error).toContain('CODE_EXPIRED')
    }
  })

  it('按设备撤销所有配对码', () => {
    manager.create('device-a')
    manager.create('device-a')
    manager.revokeByDevice('device-a')
    expect(manager.size).toBe(0)
  })
})
