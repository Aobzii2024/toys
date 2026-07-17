import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { toPublicUploadUrl, uploadAbsolute } from "@/lib/paths";
import { getSession } from "@/lib/session";

export const runtime = "nodejs";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid form data" },
      { status: 400 },
    );
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "Missing file" },
      { status: 400 },
    );
  }

  const mime = file.type;
  const ext = ALLOWED[mime];
  if (!ext) {
    return NextResponse.json(
      { ok: false, error: "Only jpeg/png/webp/gif allowed" },
      { status: 400 },
    );
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "File too large (max 5MB)" },
      { status: 400 },
    );
  }

  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const filename = `${randomUUID()}${ext}`;
  const relativePosix = `${yyyy}/${mm}/${filename}`;

  const absDir = uploadAbsolute(yyyy, mm);
  await mkdir(absDir, { recursive: true });
  const absFile = uploadAbsolute(yyyy, mm, filename);
  const buf = Buffer.from(await file.arrayBuffer());
  await writeFile(absFile, buf);

  const url = toPublicUploadUrl(relativePosix.replace(/\\/g, "/"));
  return NextResponse.json({ ok: true, data: { url, path: relativePosix } });
}
