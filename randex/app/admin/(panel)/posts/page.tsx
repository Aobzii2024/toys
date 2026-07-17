import Link from "next/link";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { PageHeader } from "@/components/admin/PageHeader";
import { deletePostAction } from "@/lib/actions/posts";
import { listPosts } from "@/lib/repositories/posts";

export const runtime = "nodejs";

export default function AdminPostsPage() {
  const posts = listPosts();

  return (
    <>
      <PageHeader
        title="点点滴滴"
        description="朋友圈式动态管理"
        actions={
          <Link className="admin-btn" href="/admin/posts/new">
            发表动态
          </Link>
        }
      />

      <div className="admin-card flat">
        {posts.length === 0 ? (
          <div className="admin-empty">
            还没有动态 ·{" "}
            <Link
              href="/admin/posts/new"
              style={{ color: "var(--admin-primary)" }}
            >
              写第一条
            </Link>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>预览</th>
                  <th>内容</th>
                  <th>作者</th>
                  <th>图片</th>
                  <th>时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p.id}>
                    <td className="admin-muted">{p.id}</td>
                    <td style={{ maxWidth: 280 }}>
                      <Link href={`/admin/posts/${p.id}`}>
                        {(p.body_md || p.title || "（仅图片）")
                          .replace(/\s+/g, " ")
                          .slice(0, 48)}
                        {(p.body_md || p.title || "").length > 48 ? "…" : ""}
                      </Link>
                    </td>
                    <td>{p.author}</td>
                    <td>
                      {p.images.length > 0 ? (
                        <span className="admin-badge">{p.images.length} 张</span>
                      ) : (
                        <span className="admin-muted">—</span>
                      )}
                    </td>
                    <td className="admin-muted" style={{ whiteSpace: "nowrap" }}>
                      {p.updated_at?.replace("T", " ").slice(0, 19)}
                    </td>
                    <td className="actions">
                      <Link
                        className="admin-btn small secondary"
                        href={`/admin/posts/${p.id}`}
                      >
                        编辑
                      </Link>
                      <Link
                        className="admin-btn small ghost"
                        href={`/little/${p.id}`}
                        target="_blank"
                      >
                        查看
                      </Link>
                      <form action={deletePostAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <ConfirmSubmit
                          label="删除"
                          confirmMessage="确定删除这条动态？"
                        />
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
