import { getDb } from "../db";
import type { Post } from "../types";

type PostRow = {
  id: number;
  title: string;
  author: string;
  body_md: string;
  images?: string | null;
  created_at: string;
  updated_at: string;
};

function parseImages(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is string => typeof x === "string")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 30);
  } catch {
    return [];
  }
}

function mapPost(row: PostRow): Post {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    body_md: row.body_md,
    images: parseImages(row.images),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function listPosts(): Post[] {
  const rows = getDb()
    .prepare(
      `SELECT id, title, author, body_md, images, created_at, updated_at
       FROM posts ORDER BY created_at DESC, id DESC`,
    )
    .all() as PostRow[];
  return rows.map(mapPost);
}

export function getPost(id: number): Post | undefined {
  const row = getDb()
    .prepare(
      `SELECT id, title, author, body_md, images, created_at, updated_at
       FROM posts WHERE id = ?`,
    )
    .get(id) as PostRow | undefined;
  return row ? mapPost(row) : undefined;
}

export function createPost(input: {
  title: string;
  author: string;
  body_md: string;
  images?: string[];
}): number {
  const now = new Date().toISOString();
  const images = JSON.stringify((input.images ?? []).slice(0, 30));
  const result = getDb()
    .prepare(
      `INSERT INTO posts (title, author, body_md, images, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(input.title, input.author, input.body_md, images, now, now);
  return Number(result.lastInsertRowid);
}

export function updatePost(
  id: number,
  input: {
    title: string;
    author: string;
    body_md: string;
    images?: string[];
  },
): boolean {
  const images = JSON.stringify((input.images ?? []).slice(0, 30));
  const result = getDb()
    .prepare(
      `UPDATE posts
       SET title = ?, author = ?, body_md = ?, images = ?, updated_at = ?
       WHERE id = ?`,
    )
    .run(
      input.title,
      input.author,
      input.body_md,
      images,
      new Date().toISOString(),
      id,
    );
  return result.changes > 0;
}

export function deletePost(id: number): boolean {
  const result = getDb().prepare(`DELETE FROM posts WHERE id = ?`).run(id);
  return result.changes > 0;
}
