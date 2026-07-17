import { getDb } from "../db";
import type { Photo } from "../types";

export function listPhotos(): Photo[] {
  return getDb()
    .prepare(
      `SELECT id, taken_on, caption, url, created_at
       FROM photos
       ORDER BY taken_on DESC, id DESC`,
    )
    .all() as Photo[];
}

export function createPhoto(input: {
  taken_on?: string | null;
  caption?: string | null;
  url: string;
}): number {
  const result = getDb()
    .prepare(
      `INSERT INTO photos (taken_on, caption, url, created_at)
       VALUES (?, ?, ?, ?)`,
    )
    .run(
      input.taken_on ?? null,
      input.caption ?? null,
      input.url,
      new Date().toISOString(),
    );
  return Number(result.lastInsertRowid);
}

export function updatePhoto(
  id: number,
  input: {
    taken_on?: string | null;
    caption?: string | null;
    url: string;
  },
): boolean {
  const result = getDb()
    .prepare(
      `UPDATE photos SET taken_on = ?, caption = ?, url = ? WHERE id = ?`,
    )
    .run(
      input.taken_on ?? null,
      input.caption ?? null,
      input.url,
      id,
    );
  return result.changes > 0;
}

export function deletePhoto(id: number): boolean {
  const result = getDb().prepare(`DELETE FROM photos WHERE id = ?`).run(id);
  return result.changes > 0;
}
