"use server";

import { revalidatePath } from "next/cache";
import { redirectWithFlash } from "@/lib/admin-redirect";
import { requireAdmin } from "@/lib/auth";
import {
  createItem,
  deleteItem,
  updateItem,
} from "@/lib/repositories/love-items";

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function revalidate() {
  revalidatePath("/list");
  revalidatePath("/admin/love-list");
}

export async function createLoveItemAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const title = str(formData, "title");
  if (!title) {
    redirectWithFlash("/admin/love-list", "err", "标题不能为空");
  }
  const done =
    formData.get("done") === "on" || formData.get("done") === "1" ? 1 : 0;
  const pinned =
    formData.get("pinned") === "on" || formData.get("pinned") === "1" ? 1 : 0;
  const image_url = str(formData, "image_url") || null;
  createItem({ title, done, image_url, pinned });
  revalidate();
  redirectWithFlash("/admin/love-list", "ok", "清单项已添加");
}

/** Silent update for autosave */
export async function updateLoveItemAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(str(formData, "id"));
  if (!Number.isFinite(id) || id <= 0) return;
  const title = str(formData, "title");
  if (!title) return;
  const done =
    formData.get("done") === "on" || formData.get("done") === "1" ? 1 : 0;
  const pinned =
    formData.get("pinned") === "on" || formData.get("pinned") === "1" ? 1 : 0;
  const image_url = str(formData, "image_url") || null;
  updateItem(id, { title, done, image_url, pinned });
  revalidate();
}

export async function deleteLoveItemAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(str(formData, "id"));
  if (!Number.isFinite(id) || id <= 0) {
    redirectWithFlash("/admin/love-list", "err", "无效的项目 ID");
  }
  deleteItem(id);
  revalidate();
  redirectWithFlash("/admin/love-list", "ok", "清单项已删除");
}
