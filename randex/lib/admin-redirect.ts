import { redirect } from "next/navigation";

/** Redirect within admin with a one-shot flash message via query string. */
export function redirectWithFlash(
  path: string,
  type: "ok" | "err",
  message: string,
): never {
  const url = new URL(path, "http://local");
  url.searchParams.set(type, message);
  redirect(`${url.pathname}${url.search}`);
}

export function flashFromSearchParams(sp: {
  ok?: string | string[];
  err?: string | string[];
}): { message: string; type: "ok" | "error" } | null {
  const ok = Array.isArray(sp.ok) ? sp.ok[0] : sp.ok;
  const err = Array.isArray(sp.err) ? sp.err[0] : sp.err;
  if (err) return { message: err, type: "error" };
  if (ok) return { message: ok, type: "ok" };
  return null;
}
