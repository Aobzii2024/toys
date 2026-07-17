import { NextResponse } from "next/server";
import { z } from "zod";
import { writeAudit } from "@/lib/audit";
import { clientIp, lookupCity } from "@/lib/ip";
import { resolveQqProfile } from "@/lib/qq-info";
import { messageLimiter } from "@/lib/rate-limit";
import { isBlocked } from "@/lib/repositories/ip-blocks";
import {
  countMessages,
  createMessage,
  listMessages,
} from "@/lib/repositories/messages";
import { getAllSiteSettings } from "@/lib/settings";
import {
  containsBlocked,
  isValidQQ,
  stripDangerous,
} from "@/lib/validate";

export const runtime = "nodejs";

const bodySchema = z.object({
  qq: z.string().min(1),
  body: z.string().min(1),
  // name is optional; server always resolves from QQ
  name: z.string().optional(),
});

/** Public list for live board refresh (no private fields). */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limitRaw = Number(searchParams.get("limit") || "100");
  const limit = Math.max(1, Math.min(200, Number.isFinite(limitRaw) ? limitRaw : 100));
  const settings = getAllSiteSettings();
  const displayLimit = Math.min(limit, settings.leaving.displayLimit || 100);
  const total = countMessages();
  const messages = listMessages(displayLimit).map((m) => ({
    id: m.id,
    name: m.name,
    qq: m.qq,
    body: m.body,
    created_at: m.created_at,
  }));
  return NextResponse.json({
    ok: true,
    data: { total, messages, limit: displayLimit },
  });
}

export async function POST(req: Request) {
  const ip = clientIp(req.headers);

  if (isBlocked(ip)) {
    writeAudit("message_blocked_ip", ip, "ip blacklist");
    return NextResponse.json(
      { ok: false, error: "您的 IP 已被限制留言", code: "IP_BLOCKED" },
      { status: 403 },
    );
  }

  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON", code: "BAD_REQUEST" },
      { status: 400 },
    );
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "表单信息不完整", code: "VALIDATION" },
      { status: 400 },
    );
  }

  const qq = parsed.data.qq.trim().slice(0, 15);
  const body = stripDangerous(parsed.data.body.trim().slice(0, 500));

  if (!qq || !body) {
    return NextResponse.json(
      { ok: false, error: "请填写 QQ 与留言内容", code: "VALIDATION" },
      { status: 400 },
    );
  }

  if (!isValidQQ(qq)) {
    return NextResponse.json(
      { ok: false, error: "QQ 号码格式错误", code: "INVALID_QQ" },
      { status: 400 },
    );
  }

  if (body.length < 2) {
    return NextResponse.json(
      { ok: false, error: "请填写两个字符以上的内容", code: "VALIDATION" },
      { status: 400 },
    );
  }

  if (/^[0-9]+$/.test(body)) {
    return NextResponse.json(
      { ok: false, error: "内容为纯数字，已被拦截", code: "BLOCKED" },
      { status: 400 },
    );
  }

  // Always resolve nickname from QQ — do not trust client-provided name
  const profile = await resolveQqProfile(qq);
  const name = stripDangerous(profile.nickname).slice(0, 32) || "热心网友";

  const settings = getAllSiteSettings();
  const { blockedWords, blockedChars } = settings.leaving;

  if (containsBlocked(body, blockedWords) || containsBlocked(name, blockedWords)) {
    writeAudit("message_blocked_word", ip, body.slice(0, 80));
    return NextResponse.json(
      {
        ok: false,
        error: "内容包含违禁词，请注意发言文明",
        code: "BLOCKED",
      },
      { status: 400 },
    );
  }

  if (blockedChars) {
    const chars = blockedChars.split("").filter(Boolean);
    if (chars.some((c) => body.includes(c) || name.includes(c))) {
      writeAudit("message_blocked_char", ip, body.slice(0, 80));
      return NextResponse.json(
        {
          ok: false,
          error: "内容包含违禁字符，请注意发言文明",
          code: "BLOCKED",
        },
        { status: 400 },
      );
    }
  }

  // Rate-limit after validation so bad payloads do not burn the daily slot.
  if (!messageLimiter.tryConsume(ip)) {
    writeAudit("message_rate_limited", ip, "");
    return NextResponse.json(
      {
        ok: false,
        error: "你今天已经留言过了，请明天再来~",
        code: "RATE_LIMITED",
      },
      { status: 429 },
    );
  }

  const city = await lookupCity(ip);

  try {
    const id = createMessage({ name, qq, body, ip, city: city || null });
    writeAudit("message_ok", ip, `id=${id};nick=${name}`);
    return NextResponse.json({
      ok: true,
      data: { id, name, avatar: profile.avatar },
    });
  } catch (err) {
    writeAudit(
      "message_error",
      ip,
      err instanceof Error ? err.message : "unknown",
    );
    return NextResponse.json(
      { ok: false, error: "留言提交失败", code: "SERVER_ERROR" },
      { status: 500 },
    );
  }
}
