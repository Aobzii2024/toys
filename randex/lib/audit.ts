import { getDb } from "./db";

export function writeAudit(
  kind: string,
  ip: string | null,
  detail: string,
) {
  getDb()
    .prepare(
      `INSERT INTO audit_logs (kind, ip, detail, created_at) VALUES (?, ?, ?, ?)`,
    )
    .run(kind, ip, detail, new Date().toISOString());
}
