"use server";

import { revalidatePath } from "next/cache";
import { redirectWithFlash } from "@/lib/admin-redirect";
import { requireAdmin } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import {
  addBlock,
  listBlocks,
  removeBlock,
} from "@/lib/repositories/ip-blocks";
import { findByUsername, updatePassword } from "@/lib/repositories/users";
import { setSetting } from "@/lib/repositories/settings";
import { getAllSiteSettings } from "@/lib/settings";
import type { SiteLeaving } from "@/lib/types";
import { SETTINGS_KEYS } from "@/lib/types";

function str(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v.trim() : "";
}

export async function changeAdminPassword(formData: FormData): Promise<void> {
  const session = await requireAdmin();
  const username = session.username;
  if (!username) {
    redirectWithFlash("/admin/security", "err", "会话无效，请重新登录");
  }

  const current = str(formData, "currentPassword");
  const next = str(formData, "newPassword");
  const confirm = str(formData, "confirmPassword");

  if (!current || !next) {
    redirectWithFlash("/admin/security", "err", "请填写完整密码字段");
  }
  if (next.length < 6) {
    redirectWithFlash("/admin/security", "err", "新密码至少 6 位");
  }
  if (next !== confirm) {
    redirectWithFlash("/admin/security", "err", "两次输入的新密码不一致");
  }

  const user = findByUsername(username);
  if (!user) {
    redirectWithFlash("/admin/security", "err", "用户不存在");
  }

  const valid = await verifyPassword(current, user.password_hash);
  if (!valid) {
    redirectWithFlash("/admin/security", "err", "当前密码不正确");
  }

  const passwordHash = await hashPassword(next);
  updatePassword(username, passwordHash);
  revalidatePath("/admin/security");
  redirectWithFlash("/admin/security", "ok", "密码已更新");
}

export async function addIpBlock(formData: FormData): Promise<void> {
  await requireAdmin();
  const ip = str(formData, "ip");
  const reason = str(formData, "reason") || null;
  if (!ip) {
    redirectWithFlash("/admin/security", "err", "请输入 IP 地址");
  }
  const existing = listBlocks().some((b) => b.ip === ip);
  if (existing) {
    redirectWithFlash("/admin/security", "err", "该 IP 已在封禁列表中");
  }
  try {
    addBlock(ip, reason);
  } catch {
    redirectWithFlash("/admin/security", "err", "添加封禁失败");
  }
  revalidatePath("/admin/security");
  redirectWithFlash("/admin/security", "ok", `已封禁 ${ip}`);
}

export async function removeIpBlock(formData: FormData): Promise<void> {
  await requireAdmin();
  const ip = str(formData, "ip");
  if (!ip) {
    redirectWithFlash("/admin/security", "err", "无效的 IP");
  }
  removeBlock(ip);
  revalidatePath("/admin/security");
  redirectWithFlash("/admin/security", "ok", `已解除 ${ip}`);
}

export async function updateLeavingSettings(
  formData: FormData,
): Promise<void> {
  await requireAdmin();
  const displayLimitRaw = str(formData, "displayLimit");
  const displayLimit = Math.max(
    1,
    Math.min(1000, Number.parseInt(displayLimitRaw || "100", 10) || 100),
  );
  const blockedWordsRaw = str(formData, "blockedWords");
  const blockedWords = blockedWordsRaw
    .split(/[,，\n]/)
    .map((w) => w.trim())
    .filter(Boolean);
  const blockedChars =
    typeof formData.get("blockedChars") === "string"
      ? (formData.get("blockedChars") as string)
      : "";

  const current = getAllSiteSettings().leaving;
  const data: SiteLeaving = {
    ...current,
    displayLimit,
    blockedWords,
    blockedChars,
  };
  setSetting(SETTINGS_KEYS.leaving, data);
  revalidatePath("/leaving");
  revalidatePath("/admin/security");
  // silent for autosave
}
