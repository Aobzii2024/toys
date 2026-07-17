/**
 * Resolve QQ nickname + avatar from public APIs.
 * Nickname sources are unreliable; we try multiple providers and fall back gracefully.
 */

export type QqProfile = {
  nickname: string;
  avatar: string;
  /** true when we got a real nickname (not a placeholder) */
  resolved: boolean;
};

function avatarUrl(qq: string): string {
  return `https://q1.qlogo.cn/g?b=qq&nk=${encodeURIComponent(qq)}&s=100`;
}

function looksLikePlaceholder(name: string, qq: string): boolean {
  const n = name.trim();
  if (!n) return true;
  if (n === qq) return true;
  if (/^QQ用户/i.test(n)) return true;
  if (/^qq\s*user/i.test(n)) return true;
  // mojibake / replacement chars
  if (/[锟�]/.test(n) || n.includes("\uFFFD")) return true;
  return false;
}

async function fetchText(
  url: string,
  timeoutMs = 4500,
): Promise<{ ok: boolean; text: string; status: number }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: "application/json,text/plain,*/*",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://qzone.qq.com/",
      },
      cache: "no-store",
    });
    const text = await res.text();
    return { ok: res.ok, text, status: res.status };
  } catch {
    return { ok: false, text: "", status: 0 };
  } finally {
    clearTimeout(timer);
  }
}

function pickNickname(...candidates: Array<string | undefined | null>): string | null {
  for (const c of candidates) {
    if (typeof c !== "string") continue;
    const n = c.trim();
    if (!n) continue;
    if (looksLikePlaceholder(n, "")) continue;
    // strip obvious HTML
    const clean = n.replace(/<[^>]+>/g, "").trim();
    if (!clean) continue;
    return clean.slice(0, 32);
  }
  return null;
}

async function fromAndeer(qq: string): Promise<string | null> {
  const { ok, text } = await fetchText(
    `https://api.andeer.top/API/qqname.php?qq=${encodeURIComponent(qq)}`,
  );
  if (!ok || !text) return null;
  try {
    const data = JSON.parse(text) as {
      success?: boolean;
      code?: number;
      data?: { name?: string };
      name?: string;
    };
    if (data.success === false) return null;
    return pickNickname(data.data?.name, data.name);
  } catch {
    return null;
  }
}

async function fromVvhan(qq: string): Promise<string | null> {
  const { ok, text } = await fetchText(
    `https://api.vvhan.com/api/qqinfo?qq=${encodeURIComponent(qq)}`,
  );
  if (!ok || !text) return null;
  try {
    const data = JSON.parse(text) as {
      success?: boolean;
      name?: string;
      nick?: string;
      imgurl?: string;
    };
    return pickNickname(data.name, data.nick);
  } catch {
    return null;
  }
}

/**
 * Tencent portrait API — nickname often corrupted for CJK, but works for ASCII.
 */
async function fromQzonePortrait(qq: string): Promise<string | null> {
  const { ok, text } = await fetchText(
    `https://users.qzone.qq.com/fcg-bin/cgi_get_portrait.fcg?uins=${encodeURIComponent(qq)}`,
  );
  if (!ok || !text) return null;
  try {
    const m = text.match(/portraitCallBack\((\{[\s\S]*\})\)/);
    if (!m?.[1]) return null;
    const obj = JSON.parse(m[1]) as Record<string, unknown>;
    const row = obj[qq];
    if (!Array.isArray(row)) return null;
    // [avatar, ?, ?, ?, ?, ?, nickname, ?]
    const nick = typeof row[6] === "string" ? row[6] : null;
    // Only accept if mostly printable and not mojibake
    if (!nick) return null;
    if (looksLikePlaceholder(nick, qq)) return null;
    // Prefer ASCII / common printable nicknames from this source
    if (/^[\x20-\x7E\u4e00-\u9fff\u3400-\u4dbf]+$/.test(nick) && !/[锟]/.test(nick)) {
      return nick.trim().slice(0, 32);
    }
    return null;
  } catch {
    return null;
  }
}

/** Resolve QQ profile: real nickname when possible, never "QQ用户{qq}". */
export async function resolveQqProfile(qq: string): Promise<QqProfile> {
  const avatar = avatarUrl(qq);

  const sources = [fromAndeer, fromVvhan, fromQzonePortrait];
  for (const source of sources) {
    try {
      const nickname = await source(qq);
      if (nickname && !looksLikePlaceholder(nickname, qq)) {
        return { nickname, avatar, resolved: true };
      }
    } catch {
      /* try next */
    }
  }

  // Soft fallback: short friendly label without exposing full QQ
  return {
    nickname: "热心网友",
    avatar,
    resolved: false,
  };
}
