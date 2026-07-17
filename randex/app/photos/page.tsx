import type { Metadata } from "next";
import { PublicShell } from "@/components/public/PublicShell";
import { listPhotos } from "@/lib/repositories/photos";
import { getAllSiteSettings } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const s = getAllSiteSettings();
  return {
    title: `${s.basic.title} — 恋爱相册`,
    description: "记录下你的最美瞬间",
  };
}

export default function PhotosPage() {
  const settings = getAllSiteSettings();
  const photos = listPhotos();
  const anim = settings.features.animation
    ? "animated zoomIn delay-03s"
    : "";

  return (
    <PublicShell settings={settings}>
      <h4 className="text-ce central">记录下你的最美瞬间</h4>
      <div className="row central">
        {photos.length === 0 ? (
          <p className="text-ce central" style={{ opacity: 0.7 }}>
            暂无照片
          </p>
        ) : (
          photos.map((photo) => (
            <div
              key={photo.id}
              className={`img_card col-lg-4 col-md-6 col-sm-12 col-sm-x-12 ${anim}`.trim()}
            >
              <div className="love_img">
                <img
                  src={photo.url}
                  alt={photo.caption ?? ""}
                  className="spotlight"
                />
                <div className="words">
                  {photo.taken_on ? <i>Date：{photo.taken_on}</i> : null}
                  {photo.caption ? <span>{photo.caption}</span> : null}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </PublicShell>
  );
}
