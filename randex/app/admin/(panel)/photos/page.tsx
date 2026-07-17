import { AutoSaveForm } from "@/components/admin/AutoSaveForm";
import { CollapsibleEditorList } from "@/components/admin/CollapsibleEditorList";
import { ConfirmSubmit } from "@/components/admin/ConfirmSubmit";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  createPhotoAction,
  deletePhotoAction,
  updatePhotoAction,
} from "@/lib/actions/photos";
import { listPhotos } from "@/lib/repositories/photos";

export const runtime = "nodejs";

export default function AdminPhotosPage() {
  const photos = listPhotos();

  return (
    <>
      <PageHeader title="相册" description="列表显示标题，点开后用配图编辑" />

      <div className="admin-card">
        <div className="admin-card-head">
          <div>
            <h3>添加照片</h3>
            <p className="admin-card-desc">从相册选择图片后点添加</p>
          </div>
        </div>
        <form className="admin-form" action={createPhotoAction}>
          <ImageUploadField name="url" label="从相册选择图片" />
          <div className="field-grid">
            <div className="field">
              <label htmlFor="taken_on">拍摄日期</label>
              <input id="taken_on" name="taken_on" type="date" />
            </div>
            <div className="field">
              <label htmlFor="caption">说明 / 标题</label>
              <input id="caption" name="caption" placeholder="可选" />
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
            <h3>照片列表</h3>
            <p className="admin-card-desc">
              共 {photos.length} 张 · 点击查看详情
            </p>
          </div>
        </div>
        <div className="admin-scroll-panel">
          <CollapsibleEditorList
            emptyText="暂无照片"
            items={photos.map((p) => ({
              id: p.id,
              title: p.caption?.trim() || `照片 #${p.id}`,
              meta: [p.taken_on, p.created_at?.slice(0, 10)]
                .filter(Boolean)
                .join(" · "),
              preview: (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.url} alt="" className="admin-clist-thumb" />
              ),
              children: (
                <>
                  <AutoSaveForm
                    action={updatePhotoAction}
                    className="admin-form"
                  >
                    <input type="hidden" name="id" value={p.id} />
                    <div className="field-grid">
                      <div className="field">
                        <label>拍摄日期</label>
                        <input
                          name="taken_on"
                          type="date"
                          defaultValue={p.taken_on ?? ""}
                        />
                      </div>
                      <div className="field">
                        <label>说明 / 标题</label>
                        <input name="caption" defaultValue={p.caption ?? ""} />
                      </div>
                      <div className="field span-2">
                        <ImageUploadField
                          name="url"
                          label="配图"
                          defaultValue={p.url}
                        />
                      </div>
                    </div>
                  </AutoSaveForm>
                  <form
                    action={deletePhotoAction}
                    style={{ marginTop: "0.65rem" }}
                  >
                    <input type="hidden" name="id" value={p.id} />
                    <ConfirmSubmit
                      label="删除"
                      confirmMessage="确定删除这张照片？"
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
