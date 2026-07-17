import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { PageHeader } from "@/components/admin/PageHeader";
import { deleteMessageAction } from "@/lib/actions/messages";
import { listMessages } from "@/lib/repositories/messages";

export const runtime = "nodejs";

export default function AdminMessagesPage() {
  const messages = listMessages(500);

  return (
    <>
      <PageHeader
        title="留言管理"
        description={`共 ${messages.length} 条（最多显示 500 条）`}
      />
      <div className="admin-card flat">
        {messages.length === 0 ? (
          <div className="admin-empty">暂无留言</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>昵称</th>
                  <th>QQ</th>
                  <th>内容</th>
                  <th>IP / 城市</th>
                  <th>时间</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {messages.map((m) => (
                  <tr key={m.id}>
                    <td className="admin-muted">{m.id}</td>
                    <td style={{ fontWeight: 550 }}>{m.name}</td>
                    <td className="admin-muted">{m.qq}</td>
                    <td style={{ maxWidth: 280, wordBreak: "break-word" }}>
                      {m.body}
                    </td>
                    <td className="admin-muted">
                      {m.ip}
                      {m.city ? ` · ${m.city}` : ""}
                    </td>
                    <td className="admin-muted" style={{ whiteSpace: "nowrap" }}>
                      {m.created_at?.replace("T", " ").slice(0, 19)}
                    </td>
                    <td className="actions">
                      <form action={deleteMessageAction}>
                        <input type="hidden" name="id" value={m.id} />
                        <ConfirmSubmit
                          label="删除"
                          confirmMessage={`确定删除 ${m.name} 的留言？`}
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
