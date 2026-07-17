import { getDb } from "../db";
import type { AuditLog } from "../types";

export function listAuditLogs(limit = 100): AuditLog[] {
  const n = Math.max(1, Math.min(500, limit));
  return getDb()
    .prepare(
      `SELECT id, kind, ip, detail, created_at
       FROM audit_logs
       ORDER BY id DESC
       LIMIT ?`,
    )
    .all(n) as AuditLog[];
}

export function countAuditLogs(): number {
  const row = getDb()
    .prepare(`SELECT COUNT(*) AS c FROM audit_logs`)
    .get() as { c: number };
  return Number(row?.c ?? 0);
}
