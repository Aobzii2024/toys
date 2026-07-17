import fs from "node:fs";
import path from "node:path";
import { env } from "./env";
import { SCHEMA_SQL } from "./schema.sql";
import { seedIfEmpty } from "./seed";
import type { DbLike, RunResult, Statement } from "./db-types";

/** SQLite requires Node.js runtime (not Edge). */
export const runtimeHint = "nodejs";

let _db: DbLike | null = null;
let _driver: "better-sqlite3" | "node:sqlite" | null = null;

function wrapBetterSqlite3(raw: {
  prepare(sql: string): {
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
    run(...params: unknown[]): { changes: number; lastInsertRowid: number | bigint };
  };
  exec(sql: string): unknown;
  pragma(source: string): unknown;
  close(): void;
}): DbLike {
  return {
    prepare(sql: string): Statement {
      const stmt = raw.prepare(sql);
      return {
        get: (...params) => stmt.get(...params),
        all: (...params) => stmt.all(...params) as unknown[],
        run: (...params) => {
          const r = stmt.run(...params);
          return {
            changes: Number(r.changes),
            lastInsertRowid: r.lastInsertRowid,
          };
        },
      };
    },
    exec(sql: string) {
      raw.exec(sql);
    },
    pragma(source: string) {
      return raw.pragma(source);
    },
    close() {
      raw.close();
    },
  };
}

function wrapNodeSqlite(raw: {
  prepare(sql: string): {
    get(...params: unknown[]): unknown;
    all(...params: unknown[]): unknown[];
    run(...params: unknown[]): { changes: number; lastInsertRowid: number | bigint };
  };
  exec(sql: string): unknown;
  close(): void;
}): DbLike {
  return {
    prepare(sql: string): Statement {
      const stmt = raw.prepare(sql);
      return {
        get: (...params) => stmt.get(...params),
        all: (...params) => stmt.all(...params) as unknown[],
        run: (...params) => {
          const r = stmt.run(...params);
          return {
            changes: Number(r.changes ?? 0),
            lastInsertRowid: r.lastInsertRowid ?? 0,
          } satisfies RunResult;
        },
      };
    },
    exec(sql: string) {
      raw.exec(sql);
    },
    pragma(source: string) {
      // node:sqlite: use PRAGMA via exec/prepare
      const cleaned = source.replace(/^pragma\s+/i, "").trim();
      try {
        raw.prepare(`PRAGMA ${cleaned}`).get();
      } catch {
        raw.exec(`PRAGMA ${cleaned}`);
      }
      return undefined;
    },
    close() {
      raw.close();
    },
  };
}

function openDatabase(dbPath: string): DbLike {
  // Prefer better-sqlite3 (production / Docker). Fall back to Node 22+ built-in.
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require("better-sqlite3") as new (p: string) => {
      prepare(sql: string): {
        get(...params: unknown[]): unknown;
        all(...params: unknown[]): unknown[];
        run(...params: unknown[]): { changes: number; lastInsertRowid: number | bigint };
      };
      exec(sql: string): unknown;
      pragma(source: string): unknown;
      close(): void;
    };
    const raw = new Database(dbPath);
    // Probe native binding with a trivial pragma
    raw.pragma("foreign_keys = ON");
    _driver = "better-sqlite3";
    return wrapBetterSqlite3(raw);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (!msg.includes("Could not locate the bindings") && !msg.includes("better_sqlite3")) {
      // fall through to node:sqlite anyway on Windows native failures
    }
  }

  try {
    // Node 22.5+ experimental: node:sqlite
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { DatabaseSync } = require("node:sqlite") as {
      DatabaseSync: new (p: string) => {
        prepare(sql: string): {
          get(...params: unknown[]): unknown;
          all(...params: unknown[]): unknown[];
          run(...params: unknown[]): { changes: number; lastInsertRowid: number | bigint };
        };
        exec(sql: string): unknown;
        close(): void;
      };
    };
    const raw = new DatabaseSync(dbPath);
    _driver = "node:sqlite";
    return wrapNodeSqlite(raw);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Unable to open SQLite database. Install better-sqlite3 native bindings (Node 22 LTS + build tools) or use Docker. Detail: ${msg}`,
    );
  }
}

export function getDbDriver(): string | null {
  return _driver;
}

export function getDb(): DbLike {
  if (_db) return _db;
  const dbPath = env.databasePath();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  _db = openDatabase(dbPath);
  try {
    _db.pragma("journal_mode = WAL");
  } catch {
    /* optional */
  }
  try {
    _db.pragma("foreign_keys = ON");
  } catch {
    /* optional */
  }
  _db.exec(SCHEMA_SQL);
  migrateSchema(_db);
  seedIfEmpty(_db);
  // Couple accounts after settings seed so display names can use couple nicknames
  try {
    // lazy require to avoid circular init with settings/db
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { ensureCoupleAccounts } = require("./accounts") as {
      ensureCoupleAccounts: () => void;
    };
    ensureCoupleAccounts();
  } catch {
    /* ignore */
  }
  return _db;
}

/** Lightweight additive migrations for existing SQLite files. */
function migrateSchema(db: DbLike) {
  try {
    const postCols = db.prepare(`PRAGMA table_info(posts)`).all() as Array<{
      name: string;
    }>;
    const postNames = new Set(postCols.map((c) => c.name));
    if (!postNames.has("images")) {
      db.exec(`ALTER TABLE posts ADD COLUMN images TEXT NOT NULL DEFAULT '[]'`);
    }
  } catch {
    /* ignore */
  }

  try {
    const userCols = db.prepare(`PRAGMA table_info(users)`).all() as Array<{
      name: string;
    }>;
    const userNames = new Set(userCols.map((c) => c.name));
    if (!userNames.has("display_name")) {
      db.exec(
        `ALTER TABLE users ADD COLUMN display_name TEXT NOT NULL DEFAULT ''`,
      );
    }
    if (!userNames.has("qq")) {
      db.exec(`ALTER TABLE users ADD COLUMN qq TEXT NOT NULL DEFAULT ''`);
    }
  } catch {
    /* ignore */
  }

  try {
    const loveCols = db.prepare(`PRAGMA table_info(love_items)`).all() as Array<{
      name: string;
    }>;
    const loveNames = new Set(loveCols.map((c) => c.name));
    if (!loveNames.has("pinned")) {
      db.exec(
        `ALTER TABLE love_items ADD COLUMN pinned INTEGER NOT NULL DEFAULT 0`,
      );
    }
  } catch {
    /* ignore */
  }
}

/** Test helper: reset singleton (does not delete the file). */
export function _resetDbForTests() {
  if (_db) {
    try {
      _db.close();
    } catch {
      /* ignore */
    }
    _db = null;
    _driver = null;
  }
}
