import Link from "next/link";
import { notFound } from "next/navigation";
import { AutoSaveForm } from "@/components/admin/AutoSaveForm";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { MomentsComposer } from "@/components/admin/MomentsComposer";
import { PageHeader } from "@/components/admin/PageHeader";
import { deletePostAction, updatePostAction } from "@/lib/actions/posts";
import { getPost } from "@/lib/repositories/posts";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

export default async function AdminEditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id: idRaw } = await params;
  const id = Number(idRaw);
  if (!Number.isFinite(id) || id <= 0) notFound();
  const post = getPost(id);
  if (!post) notFound();

  return (
    <>
      <PageHeader
        title={`编辑动态 #${post.id}`}
        description="修改后自动保存"
        actions={
          <Link className="admin-btn secondary" href="/admin/posts">
            返回列表
          </Link>
        }
      />
      <div className="admin-card">
        <AutoSaveForm action={updatePostAction} className="admin-form">
          <MomentsComposer
            postId={post.id}
            defaultBody={post.body_md}
            defaultImages={post.images}
            hideSubmit
          />
        </AutoSaveForm>
        <p className="field-hint" style={{ marginTop: "0.85rem" }}>
          {post.author} · {post.created_at?.replace("T", " ").slice(0, 16)}
        </p>
        <div
          style={{
            marginTop: "1.25rem",
            paddingTop: "1rem",
            borderTop: "1px solid var(--admin-border)",
          }}
        >
          <form action={deletePostAction}>
            <input type="hidden" name="id" value={post.id} />
            <ConfirmSubmit
              label="删除动态"
              confirmMessage="确定删除这条动态？"
              className="admin-btn danger secondary"
            />
          </form>
        </div>
      </div>
    </>
  );
}
