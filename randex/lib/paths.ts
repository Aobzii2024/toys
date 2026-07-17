import path from "node:path";
import { env } from "./env";

export function uploadAbsolute(...parts: string[]) {
  const base = path.resolve(env.uploadDir());
  const resolved = path.resolve(base, ...parts);
  const relative = path.relative(base, resolved);
  if (
    relative.startsWith("..") ||
    path.isAbsolute(relative) ||
    relative.split(path.sep).includes("..")
  ) {
    throw new Error("Path traversal denied");
  }
  return resolved;
}

export function toPublicUploadUrl(relativePosix: string) {
  return "/uploads/" + relativePosix.replace(/^\/+/, "");
}
