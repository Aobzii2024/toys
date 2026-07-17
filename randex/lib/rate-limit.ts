type Entry = { count: number; resetAt: number };

export class MemoryRateLimiter {
  private store = new Map<string, Entry>();

  constructor(
    private max: number,
    private windowMs: number,
  ) {}

  tryConsume(key: string): boolean {
    const now = Date.now();
    const cur = this.store.get(key);
    if (!cur || cur.resetAt <= now) {
      this.store.set(key, { count: 1, resetAt: now + this.windowMs });
      return true;
    }
    if (cur.count >= this.max) return false;
    cur.count += 1;
    return true;
  }
}

/** 登录：同 IP 15 分钟最多 10 次 */
export const loginLimiter = new MemoryRateLimiter(10, 15 * 60_000);

/** 留言：同 IP 24 小时最多 1 次（可后续改 settings） */
export const messageLimiter = new MemoryRateLimiter(1, 24 * 60 * 60_000);
