import { getDb } from "../db";
import type { IpBlock } from "../types";

export function isBlocked(ip: string): boolean {
  const row = getDb()
    .prepare(`SELECT id FROM ip_blocks WHERE ip = ?`)
    .get(ip);
  return !!row;
}

export function listBlocks(): IpBlock[] {
  return getDb()
    .prepare(
      `SELECT id, ip, reason, created_at
       FROM ip_blocks
       ORDER BY created_at DESC, id DESC`,
    )
    .all() as IpBlock[];
}

export function addBlock(ip: string, reason?: string | null): number {
  const result = getDb()
    .prepare(
      `INSERT INTO ip_blocks (ip, reason, created_at) VALUES (?, ?, ?)`,
    )
    .run(ip, reason ?? null, new Date().toISOString());
  return Number(result.lastInsertRowid);
}

export function removeBlock(ip: string): boolean {
  const result = getDb().prepare(`DELETE FROM ip_blocks WHERE ip = ?`).run(ip);
  return result.changes > 0;
}
