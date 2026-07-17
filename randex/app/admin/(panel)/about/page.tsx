import { AutoSaveForm } from "@/components/admin/AutoSaveForm";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { PageHeader } from "@/components/admin/PageHeader";
import { updateAboutSettings } from "@/lib/actions/about";
import { getAllSiteSettings } from "@/lib/settings";

export const runtime = "nodejs";

export default function AdminAboutPage() {
  const about = getAllSiteSettings().about;
  const scriptJson = JSON.stringify(about.script, null, 2);

  return (
    <>
      <PageHeader
        title="关于我们"
        description="修改后自动保存"
      />
      <div className="admin-card">
        <div className="admin-card-head">
          <div>
            <h3>页面内容</h3>
            <p className="admin-card-desc">标题、背景图与对话脚本</p>
          </div>
        </div>
        <AutoSaveForm action={updateAboutSettings} className="admin-form">
          <div className="field-grid">
            <div className="field">
              <label htmlFor="title">标题</label>
              <input id="title" name="title" defaultValue={about.title} />
            </div>
            <div className="field span-2">
              <ImageUploadField
                name="aboutimg"
                label="关于页背景图（从相册添加，可选）"
                defaultValue={about.aboutimg}
              />
            </div>
            <div className="field span-2">
              <label htmlFor="scriptJson">对话脚本（JSON 数组）</label>
              <textarea
                id="scriptJson"
                name="scriptJson"
                className="code"
                defaultValue={scriptJson}
                style={{ minHeight: 300 }}
              />
              <span className="field-hint">
                {`{ "type": "text", "content": "..." }`} 或{" "}
                {`{ "type": "button", "text": "..." }`}
              </span>
            </div>
          </div>
        </AutoSaveForm>
      </div>
    </>
  );
}
