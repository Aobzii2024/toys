import { getDb } from "../db";
import type { User } from "../types";

type UserRow = {
  id: number;
  username: string;
  password_hash: string;
  display_name?: string | null;
  qq?: string | null;
  created_at: string;
};

function mapUser(row: UserRow): User {
  return {
    id: row.id,
    username: row.username,
    password_hash: row.password_hash,
    display_name: (row.display_name ?? "").trim() || row.username,
    qq: (row.qq ?? "").trim(),
    created_at: row.created_at,
  };
}

export function findByUsername(username: string): User | undefined {
  const row = getDb()
    .prepare(
      `SELECT id, username, password_hash, display_name, qq, created_at
       FROM users WHERE username = ?`,
    )
    .get(username) as UserRow | undefined;
  return row ? mapUser(row) : undefined;
}

export function findById(id: number): User | undefined {
  const row = getDb()
    .prepare(
      `SELECT id, username, password_hash, display_name, qq, created_at
       FROM users WHERE id = ?`,
    )
    .get(id) as UserRow | undefined;
  return row ? mapUser(row) : undefined;
}

export function listUsers(): User[] {
  const rows = getDb()
    .prepare(
      `SELECT id, username, password_hash, display_name, qq, created_at
       FROM users ORDER BY id ASC`,
    )
    .all() as UserRow[];
  return rows.map(mapUser);
}

export function createUser(input: {
  username: string;
  passwordHash: string;
  displayName: string;
  qq: string;
}): number {
  const result = getDb()
    .prepare(
      `INSERT INTO users (username, password_hash, display_name, qq, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(
      input.username,
      input.passwordHash,
      input.displayName,
      input.qq,
      new Date().toISOString(),
    );
  return Number(result.lastInsertRowid);
}

export function upsertUser(input: {
  username: string;
  passwordHash: string;
  displayName: string;
  qq: string;
}): void {
  const existing = findByUsername(input.username);
  if (existing) {
    getDb()
      .prepare(
        `UPDATE users
         SET password_hash = ?, display_name = ?, qq = ?
         WHERE username = ?`,
      )
      .run(
        input.passwordHash,
        input.displayName,
        input.qq,
        input.username,
      );
    return;
  }
  createUser(input);
}

export function deleteUser(username: string): boolean {
  const result = getDb()
    .prepare(`DELETE FROM users WHERE username = ?`)
    .run(username);
  return result.changes > 0;
}

export function updatePassword(username: string, passwordHash: string): boolean {
  const result = getDb()
    .prepare(`UPDATE users SET password_hash = ? WHERE username = ?`)
    .run(passwordHash, username);
  return result.changes > 0;
}
