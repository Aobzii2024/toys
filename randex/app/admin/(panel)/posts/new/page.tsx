import Link from "next/link";
import { MomentsComposer } from "@/components/admin/MomentsComposer";
import { PageHeader } from "@/components/admin/PageHeader";
import { createPostAction } from "@/lib/actions/posts";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export default async function AdminNewPostPage() {
  await requireAdmin();

  return (
    <>
      <PageHeader
        title="发表动态"
        description="写完点发表即可"
        actions={
          <Link className="admin-btn secondary" href="/admin/posts">
            返回列表
          </Link>
        }
      />
      <div className="admin-card">
        <form className="admin-form" action={createPostAction}>
          <MomentsComposer submitLabel="发表" />
        </form>
      </div>
    </>
  );
}
