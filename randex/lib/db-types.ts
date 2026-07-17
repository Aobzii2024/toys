/** Minimal sync SQLite surface used by repositories/seed (better-sqlite3 or node:sqlite). */

export type RunResult = {
  changes: number;
  lastInsertRowid: number | bigint;
};

export type Statement = {
  get(...params: unknown[]): unknown;
  all(...params: unknown[]): unknown[];
  run(...params: unknown[]): RunResult;
};

export type DbLike = {
  prepare(sql: string): Statement;
  exec(sql: string): void;
  pragma(source: string): unknown;
  close(): void;
};
