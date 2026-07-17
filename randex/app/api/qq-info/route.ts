import { NextResponse } from "next/server";
import { resolveQqProfile } from "@/lib/qq-info";
import { isValidQQ } from "@/lib/validate";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const qq = (searchParams.get("qq") ?? "").trim();

  if (!isValidQQ(qq)) {
    return NextResponse.json(
      { ok: false, error: "QQ 号码格式不正确", code: "INVALID_QQ" },
      { status: 400 },
    );
  }

  const profile = await resolveQqProfile(qq);
  return NextResponse.json({
    ok: true,
    data: {
      nickname: profile.nickname,
      avatar: profile.avatar,
      resolved: profile.resolved,
    },
  });
}
