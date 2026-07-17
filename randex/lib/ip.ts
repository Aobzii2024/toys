/** Extract client IP from request headers (proxy-aware). */
export function clientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;
  const cf = headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf;
  return "unknown";
}

/**
 * Optional city lookup for an IP.
 * Returns empty string on any failure (offline, timeout, bad response).
 */
export async function lookupCity(ip: string): Promise<string> {
  if (!ip || ip === "unknown" || ip === "127.0.0.1" || ip === "::1") {
    return "";
  }
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(
      `https://ipapi.co/${encodeURIComponent(ip)}/json/`,
      { signal: controller.signal, headers: { Accept: "application/json" } },
    );
    clearTimeout(timer);
    if (!res.ok) return "";
    const data = (await res.json()) as {
      city?: string;
      region?: string;
      country_name?: string;
      error?: boolean;
    };
    if (data.error) return "";
    const parts = [data.city, data.region, data.country_name].filter(Boolean);
    return parts.join(" ") || "";
  } catch {
    return "";
  }
}
