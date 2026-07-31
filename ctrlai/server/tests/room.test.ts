import { describe, it, expect, beforeEach } from 'vitest'
import { SessionManager } from '../src/room.js'

const fakeSocket = {} as unknown

describe('SessionManager', () => {
  let manager: SessionManager

  beforeEach(() => {
    manager = new SessionManager()
  })

  it('注册被控端并生成配对码', () => {
    const result = manager.register('device-a', 'controlled', fakeSocket, 'Pixel 8')
    expect(result.pairCode).toMatch(/^\d{6}$/)
  })

  it('注册控制端不生成配对码', () => {
    const result = manager.register('controller-x', 'controller', fakeSocket, 'Nubia')
    expect(result.pairCode).toBeUndefined()
  })

  it('控制端用正确配对码连接被控端', () => {
    const registerResult = manager.register('device-a', 'controlled', fakeSocket, 'Pixel 8')
    manager.register('controller-x', 'controller', fakeSocket, 'Nubia')
    const result = manager.connect(registerResult.pairCode!, 'controller-x', 'Nubia')
    expect(result.session).toBeDefined()
    expect(result.error).toBeUndefined()
  })

  it('拒绝错误的配对码', () => {
    manager.register('device-a', 'controlled', fakeSocket)
    const result = manager.connect('000000', 'controller-x')
    expect(result.session).toBeUndefined()
    expect(result.error?.error).toContain('INVALID_CODE')
  })

  it('同一被控端拒绝第二个控制端', () => {
    const registerResult = manager.register('device-a', 'controlled', fakeSocket)
    manager.register('controller-x', 'controller', fakeSocket)
    const first = manager.connect(registerResult.pairCode!, 'controller-x')
    expect(first.session).toBeDefined()

    manager.register('controller-y', 'controller', fakeSocket)
    const registerResult2 = manager.register('device-a', 'controlled', fakeSocket)
    const second = manager.connect(registerResult2.pairCode!, 'controller-y')
    expect(second.session).toBeUndefined()
    expect(second.error?.error).toContain('ROOM_FULL')
  })

  it('注销被控端后配对码失效', () => {
    const registerResult = manager.register('device-a', 'controlled', fakeSocket)
    manager.unregister('device-a')
    const result = manager.connect(registerResult.pairCode!, 'controller-x')
    expect(result.ok).toBeUndefined()
    expect(result.error?.error).toContain('INVALID_CODE')
  })

  it('通过会话查找对端', () => {
    const registerResult = manager.register('device-a', 'controlled', fakeSocket)
    manager.register('controller-x', 'controller', fakeSocket)
    manager.connect(registerResult.pairCode!, 'controller-x')
    const session = manager.getSessionByController('controller-x')
    expect(session?.controlled.deviceId).toBe('device-a')
  })
})
