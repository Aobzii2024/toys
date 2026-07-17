import { getDb } from "../db";
import type { Message } from "../types";

export function listMessages(limit = 100): Message[] {
  return getDb()
    .prepare(
      `SELECT id, name, qq, body, ip, city, created_at
       FROM messages
       ORDER BY created_at DESC, id DESC
       LIMIT ?`,
    )
    .all(limit) as Message[];
}

export function createMessage(input: {
  name: string;
  qq: string;
  body: string;
  ip: string;
  city?: string | null;
}): number {
  const result = getDb()
    .prepare(
      `INSERT INTO messages (name, qq, body, ip, city, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.name,
      input.qq,
      input.body,
      input.ip,
      input.city ?? null,
      new Date().toISOString(),
    );
  return Number(result.lastInsertRowid);
}

export function deleteMessage(id: number): boolean {
  const result = getDb().prepare(`DELETE FROM messages WHERE id = ?`).run(id);
  return result.changes > 0;
}

export function countMessages(): number {
  const row = getDb()
    .prepare(`SELECT COUNT(*) AS c FROM messages`)
    .get() as { c: number };
  return row.c;
}
