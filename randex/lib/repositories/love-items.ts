import { getDb } from "../db";
import type { LoveItem } from "../types";

type LoveRow = {
  id: number;
  title: string;
  done: number;
  image_url: string | null;
  sort_order: number;
  pinned?: number | null;
  created_at: string;
};

function mapItem(row: LoveRow): LoveItem {
  return {
    id: row.id,
    title: row.title,
    done: row.done,
    image_url: row.image_url,
    sort_order: row.sort_order ?? 0,
    pinned: Number(row.pinned ?? 0) ? 1 : 0,
    created_at: row.created_at,
  };
}

export function listItems(): LoveItem[] {
  const rows = getDb()
    .prepare(
      `SELECT id, title, done, image_url, sort_order, pinned, created_at
       FROM love_items
       ORDER BY pinned DESC, id DESC`,
    )
    .all() as LoveRow[];
  return rows.map(mapItem);
}

export function createItem(input: {
  title: string;
  done?: number;
  image_url?: string | null;
  pinned?: number;
}): number {
  const result = getDb()
    .prepare(
      `INSERT INTO love_items (title, done, image_url, sort_order, pinned, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.title,
      input.done ?? 0,
      input.image_url ?? null,
      0,
      input.pinned ?? 0,
      new Date().toISOString(),
    );
  return Number(result.lastInsertRowid);
}

export function updateItem(
  id: number,
  input: {
    title: string;
    done: number;
    image_url?: string | null;
    pinned?: number;
  },
): boolean {
  const result = getDb()
    .prepare(
      `UPDATE love_items
       SET title = ?, done = ?, image_url = ?, pinned = ?
       WHERE id = ?`,
    )
    .run(
      input.title,
      input.done,
      input.image_url ?? null,
      input.pinned ?? 0,
      id,
    );
  return result.changes > 0;
}

export function deleteItem(id: number): boolean {
  const result = getDb()
    .prepare(`DELETE FROM love_items WHERE id = ?`)
    .run(id);
  return result.changes > 0;
}
