import bcrypt from "bcryptjs";
import {
  deleteUser,
  findByUsername,
  listUsers,
  upsertUser,
} from "@/lib/repositories/users";
import { getAllSiteSettings } from "@/lib/settings";

const ROUNDS = 10;

/** Site couple accounts (fixed credentials as requested). */
export const COUPLE_ACCOUNTS = [
  {
    username: "yzx",
    password: "329664",
    role: "girl" as const,
    qq: "3533473864",
    fallbackName: "圆小鸡",
  },
  {
    username: "bhr",
    password: "664329",
    role: "boy" as const,
    qq: "3428828719",
    fallbackName: "宝宝然",
  },
] as const;

/**
 * Ensure yzx / bhr exist with correct passwords & QQ, remove legacy randx.
 * Safe to call on each boot (idempotent).
 */
export function ensureCoupleAccounts(): void {
  const couple = getAllSiteSettings().couple;

  for (const acc of COUPLE_ACCOUNTS) {
    const displayName =
      acc.role === "girl"
        ? couple.girl?.trim() || acc.fallbackName
        : couple.boy?.trim() || acc.fallbackName;
    const passwordHash = bcrypt.hashSync(acc.password, ROUNDS);
    upsertUser({
      username: acc.username,
      passwordHash,
      displayName,
      qq: acc.qq,
    });
  }

  // Remove legacy single admin if present
  if (findByUsername("randx")) {
    deleteUser("randx");
  }
  if (findByUsername("admin")) {
    // only remove generic admin when couple accounts exist
    const users = listUsers();
    if (users.some((u) => u.username === "yzx" || u.username === "bhr")) {
      deleteUser("admin");
    }
  }
}

export function displayNameForUsername(username: string): string {
  const user = findByUsername(username);
  if (user?.display_name) return user.display_name;
  const acc = COUPLE_ACCOUNTS.find((a) => a.username === username);
  if (!acc) return username;
  const couple = getAllSiteSettings().couple;
  return acc.role === "girl"
    ? couple.girl?.trim() || acc.fallbackName
    : couple.boy?.trim() || acc.fallbackName;
}

export function qqForUsername(username: string): string {
  const user = findByUsername(username);
  if (user?.qq) return user.qq;
  const acc = COUPLE_ACCOUNTS.find((a) => a.username === username);
  return acc?.qq ?? "";
}
