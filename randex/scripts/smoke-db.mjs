/**
 * Smoke test for SQLite bootstrap + repositories.
 * Usage: node --import tsx scripts/smoke-db.mjs
 *    or: npx tsx scripts/smoke-db.mjs
 * Uses a temp DB path so it does not clobber local data.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const tmpDir = path.join(root, "data", "smoke");
const dbPath = path.join(tmpDir, `smoke-${Date.now()}.db`);
fs.mkdirSync(tmpDir, { recursive: true });

process.env.DATABASE_PATH = dbPath;
process.env.ADMIN_USER = process.env.ADMIN_USER || "admin";
process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "changeme";
process.env.SEED_DEMO = "true";
process.env.SESSION_SECRET = process.env.SESSION_SECRET || "smoke-secret";

const { getDb } = await import("../lib/db.ts");
const { createPost, listPosts } = await import("../lib/repositories/posts.ts");
const { getAllSiteSettings } = await import("../lib/settings.ts");
const { findByUsername } = await import("../lib/repositories/users.ts");
const { writeAudit } = await import("../lib/audit.ts");
const { listItems } = await import("../lib/repositories/love-items.ts");
const { listPhotos } = await import("../lib/repositories/photos.ts");

const db = getDb();
const users = db.prepare("SELECT username FROM users").all();
console.log("users:", users);

const admin = findByUsername("admin");
console.log("admin found:", !!admin);

const settings = getAllSiteSettings();
console.log("site title:", settings.basic.title);
console.log("couple:", settings.couple.boy, "/", settings.couple.girl);
console.log("demo posts:", listPosts().length);
console.log("demo photos:", listPhotos().length);
console.log("demo love items:", listItems().length);

const before = listPosts().length;
const id = createPost({
  title: "smoke post",
  author: "smoke",
  body_md: "# hello",
});
const after = listPosts();
console.log(
  "createPost id:",
  id,
  "listPosts count:",
  after.length,
  "(was",
  before + ")",
);

writeAudit("smoke", "127.0.0.1", "ok");
const audits = db
  .prepare("SELECT kind FROM audit_logs WHERE kind = 'smoke'")
  .all();
console.log("audit rows:", audits.length);

db.close();
for (const f of [dbPath, dbPath + "-wal", dbPath + "-shm"]) {
  try {
    fs.unlinkSync(f);
  } catch {
    /* ignore */
  }
}
console.log("SMOKE OK");
