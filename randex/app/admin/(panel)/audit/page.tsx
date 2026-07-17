import { PageHeader } from "@/components/admin/PageHeader";
import { listAuditLogs } from "@/lib/repositories/audit";

export const runtime = "nodejs";

const KIND_LABEL: Record<string, string> = {
  login_ok: "登录成功",
  login_fail: "登录失败",
  message_ok: "留言成功",
  message_blocked_ip: "留言拦截·IP",
  message_blocked_word: "留言拦截·敏感词",
  message_blocked_char: "留言拦截·字符",
  message_rate_limited: "留言限流",
};

function formatKind(kind: string): string {
  return KIND_LABEL[kind] || kind;
}

function kindBadgeClass(kind: string): string {
  if (kind.includes("fail") || kind.includes("blocked") || kind.includes("rate")) {
    return "admin-badge warn";
  }
  if (kind.includes("ok")) return "admin-badge ok";
  return "admin-badge";
}

export default function AdminAuditPage() {
  const logs = listAuditLogs(200);

  return (
    <>
      <PageHeader
        title="审计日志"
        description="登录、留言与安全相关事件记录（最近 200 条）"
      />

      <div className="admin-card flat">
        {logs.length === 0 ? (
          <div className="admin-empty">暂无审计记录</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>类型</th>
                  <th>IP</th>
                  <th>详情</th>
                  <th>时间</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="admin-muted">{log.id}</td>
                    <td>
                      <span className={kindBadgeClass(log.kind)}>
                        {formatKind(log.kind)}
                      </span>
                    </td>
                    <td>{log.ip || "—"}</td>
                    <td
                      style={{
                        maxWidth: 320,
                        wordBreak: "break-word",
                        color: "#475569",
                      }}
                    >
                      {log.detail || "—"}
                    </td>
                    <td className="admin-muted" style={{ whiteSpace: "nowrap" }}>
                      {log.created_at?.replace("T", " ").slice(0, 19)}
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
