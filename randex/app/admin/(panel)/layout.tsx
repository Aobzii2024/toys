import { Suspense } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Flash } from "@/components/admin/Flash";
import {
  displayNameForUsername,
  qqForUsername,
} from "@/lib/accounts";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  const username = session.username || "";
  const displayName = username ? displayNameForUsername(username) : "";
  const qq = username ? qqForUsername(username) : "";

  return (
    <AdminShell
      username={username}
      displayName={displayName}
      qq={qq}
    >
      <Suspense fallback={null}>
        <Flash />
      </Suspense>
      {children}
    </AdminShell>
  );
}
