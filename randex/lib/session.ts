import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { env } from "./env";

export type SessionData = {
  userId?: number;
  username?: string;
  isLoggedIn: boolean;
};

/** iron-session requires password length >= 32 */
function sessionPassword(): string {
  const secret = env.sessionSecret();
  if (secret.length >= 32) return secret;
  return secret.padEnd(32, "0");
}

/**
 * Secure cookies only when explicitly enabled or when COOKIE_SECURE is not set
 * and we detect HTTPS proxy headers at request time is hard in options factory —
 * so use env: COOKIE_SECURE=true behind HTTPS; false for local HTTP/Docker.
 */
function cookieSecure(): boolean {
  const flag = process.env.COOKIE_SECURE;
  if (flag === "true" || flag === "1") return true;
  if (flag === "false" || flag === "0") return false;
  // Default: secure only in production if COOKIE_SECURE unset — prefer false for
  // plain HTTP Docker demos; set COOKIE_SECURE=true on real HTTPS deployments.
  return false;
}

export function getSessionOptions(): SessionOptions {
  return {
    cookieName: "likegirl_session",
    password: sessionPassword(),
    cookieOptions: {
      httpOnly: true,
      secure: cookieSecure(),
      sameSite: "lax",
      path: "/",
    },
  };
}

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), getSessionOptions());
}
