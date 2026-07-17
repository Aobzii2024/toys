"use server";

import { revalidatePath } from "next/cache";
import { redirectWithFlash } from "@/lib/admin-redirect";
import { requireAdmin } from "@/lib/auth";
import { deleteMessage } from "@/lib/repositories/messages";

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function deleteMessageAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(str(formData, "id"));
  if (!Number.isFinite(id) || id <= 0) {
    redirectWithFlash("/admin/messages", "err", "无效的留言 ID");
  }
  deleteMessage(id);
  revalidatePath("/leaving");
  revalidatePath("/admin/messages");
  redirectWithFlash("/admin/messages", "ok", "留言已删除");
}
