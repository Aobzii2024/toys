import { AutoSaveForm } from "@/components/admin/AutoSaveForm";
import { CollapsibleEditorList } from "@/components/admin/CollapsibleEditorList";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  createLoveItemAction,
  deleteLoveItemAction,
  updateLoveItemAction,
} from "@/lib/actions/love-items";
import { listItems } from "@/lib/repositories/love-items";

export const runtime = "nodejs";

export default function AdminLoveListPage() {
  const items = listItems();

  return (
    <>
      <PageHeader
        title="恋爱清单"
        description="列表只显示标题；可置顶多项"
      />

      <div className="admin-card">
        <div className="admin-card-head">
          <div>
            <h3>添加项目</h3>
          </div>
        </div>
        <form className="admin-form" action={createLoveItemAction}>
          <div className="field-grid">
            <div className="field span-2">
              <label htmlFor="title">标题</label>
              <input
                id="title"
                name="title"
                required
                placeholder="例如：一起看海"
              />
            </div>
            <div className="field">
              <div className="check-row" style={{ marginTop: "0.35rem" }}>
                <input type="checkbox" id="done" name="done" />
                <div>
                  <label htmlFor="done">已完成</label>
                </div>
              </div>
            </div>
            <div className="field">
              <div className="check-row" style={{ marginTop: "0.35rem" }}>
                <input type="checkbox" id="pinned" name="pinned" />
                <div>
                  <label htmlFor="pinned">置顶</label>
                  <span className="check-desc">可同时置顶多条</span>
                </div>
              </div>
            </div>
            <div className="field span-2">
              <ImageUploadField
                name="image_url"
                label="从相册添加配图（可选）"
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="admin-btn">
              添加
            </button>
          </div>
        </form>
      </div>

      <div className="admin-card admin-card-list">
        <div className="admin-card-head">
          <div>
            <h3>清单列表</h3>
            <p className="admin-card-desc">
              共 {items.length} 项 · 点击标题查看与修改
            </p>
          </div>
        </div>
        <div className="admin-scroll-panel">
          <CollapsibleEditorList
            emptyText="暂无清单项"
            items={items.map((item) => ({
              id: item.id,
              title: item.title,
              meta: [
                item.pinned === 1 ? "置顶" : null,
                item.done === 1 ? "已完成" : "未完成",
              ]
                .filter(Boolean)
                .join(" · "),
              children: (
                <>
                  <AutoSaveForm
                    action={updateLoveItemAction}
                    className="admin-form"
                  >
                    <input type="hidden" name="id" value={item.id} />
                    <div className="field-grid">
                      <div className="field span-2">
                        <label>标题</label>
                        <input
                          name="title"
                          defaultValue={item.title}
                          required
                        />
                      </div>
                      <div className="field">
                        <div className="check-row" style={{ marginTop: 0 }}>
                          <input
                            type="checkbox"
                            name="done"
                            id={`done-${item.id}`}
                            defaultChecked={item.done === 1}
                          />
                          <div>
                            <label htmlFor={`done-${item.id}`}>已完成</label>
                          </div>
                        </div>
                      </div>
                      <div className="field">
                        <div className="check-row" style={{ marginTop: 0 }}>
                          <input
                            type="checkbox"
                            name="pinned"
                            id={`pinned-${item.id}`}
                            defaultChecked={item.pinned === 1}
                          />
                          <div>
                            <label htmlFor={`pinned-${item.id}`}>置顶</label>
                          </div>
                        </div>
                      </div>
                      <div className="field span-2">
                        <ImageUploadField
                          name="image_url"
                          label="配图"
                          defaultValue={item.image_url ?? ""}
                        />
                      </div>
                    </div>
                  </AutoSaveForm>
                  <form
                    action={deleteLoveItemAction}
                    style={{ marginTop: "0.65rem" }}
                  >
                    <input type="hidden" name="id" value={item.id} />
                    <ConfirmSubmit
                      label="删除"
                      confirmMessage={`确定删除「${item.title}」？`}
                      className="admin-btn danger secondary small"
                    />
                  </form>
                </>
              ),
            }))}
          />
        </div>
      </div>
    </>
  );
}
