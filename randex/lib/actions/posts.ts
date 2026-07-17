"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { displayNameForUsername } from "@/lib/accounts";
import { redirectWithFlash } from "@/lib/admin-redirect";
import { requireAdmin } from "@/lib/auth";
import { renderMarkdown } from "@/lib/markdown";
import {
  createPost,
  deletePost,
  getPost,
  updatePost,
} from "@/lib/repositories/posts";

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

function bodyMd(formData: FormData): string {
  const v = formData.get("body_md");
  return typeof v === "string" ? v : "";
}

function parseImages(formData: FormData): string[] {
  const raw = formData.get("images_json");
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is string => typeof x === "string")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 30);
  } catch {
    return [];
  }
}

function autoTitle(body: string, fallback = "动态"): string {
  const line = body
    .replace(/\r/g, "")
    .split("\n")
    .map((s) => s.trim())
    .find(Boolean);
  if (!line) return fallback;
  const cleaned = line.replace(/^#+\s*/, "").slice(0, 40);
  return cleaned || fallback;
}

export async function previewMarkdown(source: string): Promise<string> {
  await requireAdmin();
  return renderMarkdown(source ?? "");
}

export async function createPostAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const body = bodyMd(formData).trim();
  const images = parseImages(formData);
  if (!body && images.length === 0) {
    redirectWithFlash("/admin/posts/new", "err", "请填写文字或添加图片");
  }
  const username = session.username || "";
  const author = displayNameForUsername(username) || username || "Admin";
  const title = str(formData, "title") || autoTitle(body);
  const id = createPost({ title, author, body_md: body, images });
  revalidatePath("/little");
  revalidatePath(`/little/${id}`);
  revalidatePath("/admin/posts");
  redirectWithFlash(`/admin/posts/${id}`, "ok", "动态已发布");
}

export async function updatePostAction(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const id = Number(str(formData, "id"));
  if (!Number.isFinite(id) || id <= 0) {
    redirectWithFlash("/admin/posts", "err", "无效的动态 ID");
  }
  const existing = getPost(id);
  if (!existing) {
    redirectWithFlash("/admin/posts", "err", "动态不存在");
  }
  const body = bodyMd(formData).trim();
  const images = parseImages(formData);
  if (!body && images.length === 0) {
    redirectWithFlash(`/admin/posts/${id}`, "err", "请填写文字或添加图片");
  }
  // Keep original author on edit (who posted it); do not overwrite with editor
  const author = existing.author;
  const title = str(formData, "title") || autoTitle(body, existing.title);
  updatePost(id, { title, author, body_md: body, images });
  revalidatePath("/little");
  revalidatePath(`/little/${id}`);
  revalidatePath("/admin/posts");
  revalidatePath(`/admin/posts/${id}`);
  // silent for autosave on edit
}

export async function deletePostAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = Number(str(formData, "id"));
  if (!Number.isFinite(id) || id <= 0) {
    redirectWithFlash("/admin/posts", "err", "无效的动态 ID");
  }
  deletePost(id);
  revalidatePath("/little");
  revalidatePath(`/little/${id}`);
  revalidatePath("/admin/posts");
  redirect("/admin/posts?ok=" + encodeURIComponent("动态已删除"));
}
