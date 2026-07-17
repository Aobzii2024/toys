"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { setSetting } from "@/lib/repositories/settings";
import type { SiteAbout, SiteAboutScriptItem } from "@/lib/types";
import { SETTINGS_KEYS } from "@/lib/types";

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

/** Silent save for autosave forms */
export async function updateAboutSettings(formData: FormData): Promise<void> {
  await requireAdmin();
  const title = str(formData, "title");
  const aboutimg = str(formData, "aboutimg");
  const scriptRaw =
    typeof formData.get("scriptJson") === "string"
      ? (formData.get("scriptJson") as string)
      : "[]";

  let script: SiteAboutScriptItem[] = [];
  try {
    const parsed = JSON.parse(scriptRaw) as unknown;
    if (!Array.isArray(parsed)) return;
    script = parsed.map((item) => {
      const row = item as Record<string, unknown>;
      const type = row.type === "button" ? "button" : "text";
      if (type === "button") {
        return {
          type: "button" as const,
          text:
            typeof row.text === "string"
              ? row.text
              : String(row.content ?? ""),
        };
      }
      return {
        type: "text" as const,
        content:
          typeof row.content === "string"
            ? row.content
            : String(row.text ?? ""),
      };
    });
  } catch {
    return;
  }

  const data: SiteAbout = { title, aboutimg, script };
  setSetting(SETTINGS_KEYS.about, data);
  revalidatePath("/about");
  revalidatePath("/admin/about");
}
