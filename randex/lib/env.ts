import path from "node:path";

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (!v) throw new Error(`Missing env ${name}`);
  return v;
}

/**
 * Resolve filesystem paths for SQLite / uploads.
 * - Relative paths resolve against cwd
 * - Absolute paths stay absolute
 * - Git Bash/MSYS can mangle Linux paths like `/data` into `E:/More Apps/Git/data`
 *   when spawning Docker from Windows shells — detect and correct that case.
 */
function resolveDataPath(input: string, dockerFallback: string): string {
  let p = input;

  // MSYS-converted Windows path that is NOT a real Windows runtime target
  if (
    process.platform !== "win32" &&
    /^[A-Za-z]:[\\/].*[/\\]data([/\\]|$)/i.test(p)
  ) {
    const base = path.posix.basename(p.replace(/\\/g, "/"));
    p = path.posix.join("/data", base === "data" ? "" : base);
    if (p === "/data" || p === "/data/") p = dockerFallback;
  }

  if (path.isAbsolute(p) || p.startsWith("/")) {
    // Keep POSIX absolute paths stable even when path.win32 is active
    if (p.startsWith("/") && !/^[A-Za-z]:/.test(p)) {
      return p;
    }
    return path.resolve(p);
  }

  return path.resolve(p);
}

export const env = {
  sessionSecret: () => required("SESSION_SECRET", "dev-only-secret-change-me"),
  adminUser: () => required("ADMIN_USER", "admin"),
  adminPassword: () => required("ADMIN_PASSWORD", "changeme"),
  databasePath: () =>
    resolveDataPath(
      process.env.DATABASE_PATH ?? "./data/likegirl.db",
      "/data/likegirl.db",
    ),
  uploadDir: () =>
    resolveDataPath(process.env.UPLOAD_DIR ?? "./data/uploads", "/data/uploads"),
  seedDemo: () => (process.env.SEED_DEMO ?? "true") === "true",
};
