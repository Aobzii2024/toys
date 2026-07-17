import { getDb } from "../db";

export function getSetting(key: string): string | null {
  const row = getDb()
    .prepare(`SELECT value FROM site_settings WHERE key = ?`)
    .get(key) as { value: string } | undefined;
  return row?.value ?? null;
}

export function setSetting(key: string, value: unknown): void {
  const json = typeof value === "string" ? value : JSON.stringify(value);
  const updatedAt = new Date().toISOString();
  getDb()
    .prepare(
      `INSERT INTO site_settings (key, value, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    )
    .run(key, json, updatedAt);
}
