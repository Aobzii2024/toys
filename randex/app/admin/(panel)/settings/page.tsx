import { AutoSaveForm } from "@/components/admin/AutoSaveForm";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  updateBasicSettings,
  updateCardsSettings,
  updateCoupleSettings,
  updateCustomSettings,
  updateFeaturesSettings,
} from "@/lib/actions/settings";
import { getAllSiteSettings } from "@/lib/settings";

export const runtime = "nodejs";

export default function AdminSettingsPage() {
  const s = getAllSiteSettings();

  return (
    <>
      <PageHeader
        title="站点设置"
        description="修改后自动保存"
      />

      <div className="admin-card">
        <div className="admin-card-head">
          <div>
            <h3>基础信息</h3>
            <p className="admin-card-desc">顶栏 Logo、页脚版权与站点背景</p>
          </div>
        </div>
        <AutoSaveForm action={updateBasicSettings} className="admin-form">
          <div className="field-grid">
            <div className="field">
              <label htmlFor="title">站点标题</label>
              <input
                id="title"
                name="title"
                defaultValue={s.basic.title}
                placeholder="浏览器标题"
              />
            </div>
            <div className="field">
              <label htmlFor="logo">Logo 文案</label>
              <input
                id="logo"
                name="logo"
                defaultValue={s.basic.logo}
                placeholder="左上角显示"
              />
            </div>
            <div className="field span-2">
              <label htmlFor="writing">一句话</label>
              <input
                id="writing"
                name="writing"
                defaultValue={s.basic.writing}
                placeholder="顶栏右侧短句"
              />
            </div>
            <div className="field">
              <label htmlFor="icp">ICP 备案</label>
              <input id="icp" name="icp" defaultValue={s.basic.icp} />
            </div>
            <div className="field">
              <label htmlFor="copyright">版权信息</label>
              <input
                id="copyright"
                name="copyright"
                defaultValue={s.basic.copyright}
              />
            </div>
            <div className="field span-2">
              <label htmlFor="bgimg">背景图 URL</label>
              <input
                id="bgimg"
                name="bgimg"
                defaultValue={s.basic.bgimg}
                placeholder="/style/img/Cover.webp 或 https://..."
              />
            </div>
          </div>
        </AutoSaveForm>
      </div>

      <div className="admin-card">
        <div className="admin-card-head">
          <div>
            <h3>情侣信息</h3>
            <p className="admin-card-desc">头像区昵称、QQ 与在一起时间</p>
          </div>
        </div>
        <AutoSaveForm action={updateCoupleSettings} className="admin-form">
          <div className="field-grid">
            <div className="field">
              <label htmlFor="boy">男方昵称</label>
              <input id="boy" name="boy" defaultValue={s.couple.boy} />
            </div>
            <div className="field">
              <label htmlFor="girl">女方昵称</label>
              <input id="girl" name="girl" defaultValue={s.couple.girl} />
            </div>
            <div className="field">
              <label htmlFor="boyQQ">男方 QQ</label>
              <input id="boyQQ" name="boyQQ" defaultValue={s.couple.boyQQ} />
            </div>
            <div className="field">
              <label htmlFor="girlQQ">女方 QQ</label>
              <input id="girlQQ" name="girlQQ" defaultValue={s.couple.girlQQ} />
            </div>
            <div className="field span-2">
              <label htmlFor="startTime">在一起时间</label>
              <input
                id="startTime"
                name="startTime"
                defaultValue={s.couple.startTime}
                placeholder="2022-06-05T00:07"
              />
            </div>
          </div>
        </AutoSaveForm>
      </div>

      <div className="admin-card">
        <div className="admin-card-head">
          <div>
            <h3>页面文案</h3>
            <p className="admin-card-desc">
              点点滴滴 / 借您吉言 / 关于我们
            </p>
          </div>
        </div>
        <AutoSaveForm action={updateCardsSettings} className="admin-form">
          <div className="field-grid">
            <div className="field">
              <label htmlFor="card1">点点滴滴 · 标题</label>
              <input id="card1" name="card1" defaultValue={s.cards.card1} />
            </div>
            <div className="field">
              <label htmlFor="deci1">点点滴滴 · 描述</label>
              <input id="deci1" name="deci1" defaultValue={s.cards.deci1} />
            </div>
            <div className="field">
              <label htmlFor="card2">借您吉言 · 标题</label>
              <input id="card2" name="card2" defaultValue={s.cards.card2} />
            </div>
            <div className="field">
              <label htmlFor="deci2">借您吉言 · 描述</label>
              <input id="deci2" name="deci2" defaultValue={s.cards.deci2} />
            </div>
            <div className="field">
              <label htmlFor="card3">关于我们 · 标题</label>
              <input id="card3" name="card3" defaultValue={s.cards.card3} />
            </div>
            <div className="field">
              <label htmlFor="deci3">关于我们 · 描述</label>
              <input id="deci3" name="deci3" defaultValue={s.cards.deci3} />
            </div>
          </div>
        </AutoSaveForm>
      </div>

      <div className="admin-card">
        <div className="admin-card-head">
          <div>
            <h3>展示开关</h3>
            <p className="admin-card-desc">开场动画与毛玻璃</p>
          </div>
        </div>
        <AutoSaveForm action={updateFeaturesSettings} className="admin-form">
          <div className="check-row">
            <input
              type="checkbox"
              id="animation"
              name="animation"
              defaultChecked={s.features.animation}
            />
            <div>
              <label htmlFor="animation">开场动画</label>
            </div>
          </div>
          <div className="check-row">
            <input
              type="checkbox"
              id="blur"
              name="blur"
              defaultChecked={s.features.blur}
            />
            <div>
              <label htmlFor="blur">毛玻璃效果</label>
            </div>
          </div>
          <input
            type="hidden"
            name="pjax"
            value={s.features.pjax ? "on" : ""}
          />
        </AutoSaveForm>
      </div>

      <details className="admin-collapse">
        <summary>
          <span>
            高级设置
            <span
              className="admin-card-desc"
              style={{ display: "block", fontWeight: 400, marginTop: 4 }}
            >
              Head / Footer / 自定义 CSS
            </span>
          </span>
        </summary>
        <div className="admin-collapse-body">
          <AutoSaveForm action={updateCustomSettings} className="admin-form">
            <div className="field">
              <label htmlFor="headCon">Head 注入</label>
              <textarea
                id="headCon"
                name="headCon"
                className="code"
                defaultValue={s.custom.headCon}
              />
            </div>
            <div className="field">
              <label htmlFor="footerCon">Footer 注入</label>
              <textarea
                id="footerCon"
                name="footerCon"
                className="code"
                defaultValue={s.custom.footerCon}
              />
            </div>
            <div className="field">
              <label htmlFor="cssCon">自定义 CSS</label>
              <textarea
                id="cssCon"
                name="cssCon"
                className="code"
                defaultValue={s.custom.cssCon}
              />
            </div>
          </AutoSaveForm>
        </div>
      </details>
    </>
  );
}
