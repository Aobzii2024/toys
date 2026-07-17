import { AutoSaveForm } from "@/components/admin/AutoSaveForm";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  addIpBlock,
  changeAdminPassword,
  removeIpBlock,
  updateLeavingSettings,
} from "@/lib/actions/security";
import { listBlocks } from "@/lib/repositories/ip-blocks";
import { getAllSiteSettings } from "@/lib/settings";

export const runtime = "nodejs";

export default function AdminSecurityPage() {
  const blocks = listBlocks();
  const leaving = getAllSiteSettings().leaving;

  return (
    <>
      <PageHeader title="安全" description="密码需手动确认；过滤规则自动保存" />

      <div className="admin-card">
        <div className="admin-card-head">
          <div>
            <h3>修改密码</h3>
            <p className="admin-card-desc">需点击更新</p>
          </div>
        </div>
        <form className="admin-form" action={changeAdminPassword}>
          <div className="field-grid">
            <div className="field span-2">
              <label htmlFor="currentPassword">当前密码</label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="newPassword">新密码</label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
              />
            </div>
            <div className="field">
              <label htmlFor="confirmPassword">确认新密码</label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={6}
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="admin-btn">
              更新密码
            </button>
          </div>
        </form>
      </div>

      <div className="admin-card">
        <div className="admin-card-head">
          <div>
            <h3>留言过滤</h3>
            <p className="admin-card-desc">修改后自动保存</p>
          </div>
        </div>
        <AutoSaveForm action={updateLeavingSettings} className="admin-form">
          <div className="field-grid">
            <div className="field">
              <label htmlFor="displayLimit">展示条数上限</label>
              <input
                id="displayLimit"
                name="displayLimit"
                type="number"
                min={1}
                max={1000}
                defaultValue={leaving.displayLimit}
              />
            </div>
            <div className="field">
              <label htmlFor="blockedChars">屏蔽字符</label>
              <input
                id="blockedChars"
                name="blockedChars"
                defaultValue={leaving.blockedChars}
              />
            </div>
            <div className="field span-2">
              <label htmlFor="blockedWords">敏感词</label>
              <textarea
                id="blockedWords"
                name="blockedWords"
                defaultValue={leaving.blockedWords.join(", ")}
              />
            </div>
          </div>
        </AutoSaveForm>
      </div>

      <div className="admin-card">
        <div className="admin-card-head">
          <div>
            <h3>IP 封禁</h3>
          </div>
        </div>
        <form className="admin-form" action={addIpBlock}>
          <div className="field-grid">
            <div className="field">
              <label htmlFor="ip">IP</label>
              <input id="ip" name="ip" placeholder="1.2.3.4" required />
            </div>
            <div className="field">
              <label htmlFor="reason">原因</label>
              <input id="reason" name="reason" placeholder="可选" />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="admin-btn">
              添加封禁
            </button>
          </div>
        </form>

        {blocks.length === 0 ? (
          <div className="admin-empty" style={{ padding: "1.25rem 0 0.25rem" }}>
            暂无封禁记录
          </div>
        ) : (
          <div className="admin-table-wrap" style={{ marginTop: "1rem" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>IP</th>
                  <th>原因</th>
                  <th>时间</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {blocks.map((b) => (
                  <tr key={b.id}>
                    <td style={{ fontWeight: 550 }}>{b.ip}</td>
                    <td>{b.reason || "—"}</td>
                    <td className="admin-muted">
                      {b.created_at?.replace("T", " ").slice(0, 19)}
                    </td>
                    <td className="actions">
                      <form action={removeIpBlock}>
                        <input type="hidden" name="ip" value={b.ip} />
                        <ConfirmSubmit
                          label="解除"
                          confirmMessage={`确定解除 ${b.ip}？`}
                          className="admin-btn danger secondary small"
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
