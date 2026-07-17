import { NextResponse } from "next/server";
import { writeAudit } from "@/lib/audit";
import { verifyPassword } from "@/lib/password";
import { loginLimiter } from "@/lib/rate-limit";
import { findByUsername } from "@/lib/repositories/users";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  return req.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(req: Request) {
  const ip = clientIp(req);

  if (!loginLimiter.tryConsume(ip)) {
    return NextResponse.json(
      { ok: false, error: "Too many login attempts", code: "RATE_LIMITED" },
      { status: 429 },
    );
  }

  let body: { username?: unknown; password?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON", code: "AUTH_FAILED" },
      { status: 401 },
    );
  }

  const username = typeof body.username === "string" ? body.username.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  const user = username ? findByUsername(username) : undefined;
  const valid =
    user != null && (await verifyPassword(password, user.password_hash));

  if (!valid) {
    writeAudit("login_fail", ip, username || "(empty)");
    return NextResponse.json(
      { ok: false, error: "Invalid username or password", code: "AUTH_FAILED" },
      { status: 401 },
    );
  }

  const session = await getSession();
  session.userId = user.id;
  session.username = user.username;
  session.isLoggedIn = true;
  await session.save();

  writeAudit("login_ok", ip, user.username);
  return NextResponse.json({ ok: true });
}
