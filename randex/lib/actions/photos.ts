"use server";

import { revalidatePath } from "next/cache";
import { redirectWithFlash } from "@/lib/admin-redirect";
import { requireAdmin } from "@/lib/auth";
import {
  createPhoto,
  deletePhoto,
  updatePhoto,
} from "@/lib/repositories/photos";

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function revalidate() {
  revalidatePath("/photos");
  revalidatePath("/admin/photos");
}

export async function createPhotoAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const url = str(formData, "url");
  if (!url) {
    redirectWithFlash("/admin/photos", "err", "请填写或上传图片");
  }
  const taken_on = str(formData, "taken_on") || null;
  const caption = str(formData, "caption") || null;
  createPhoto({ url, taken_on, caption });
  revalidate();
  redirectWithFlash("/admin/photos", "ok", "照片已添加");
}

/** Silent update for autosave */
export async function updatePhotoAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(str(formData, "id"));
  if (!Number.isFinite(id) || id <= 0) return;
  const url = str(formData, "url");
  if (!url) return;
  const taken_on = str(formData, "taken_on") || null;
  const caption = str(formData, "caption") || null;
  updatePhoto(id, { url, taken_on, caption });
  revalidate();
}

export async function deletePhotoAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(str(formData, "id"));
  if (!Number.isFinite(id) || id <= 0) {
    redirectWithFlash("/admin/photos", "err", "无效的照片 ID");
  }
  deletePhoto(id);
  revalidate();
  redirectWithFlash("/admin/photos", "ok", "照片已删除");
}
