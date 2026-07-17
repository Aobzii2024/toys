import type { Metadata } from "next";
import { PublicShell } from "@/components/public/PublicShell";
import { listItems } from "@/lib/repositories/love-items";
import { getAllSiteSettings } from "@/lib/settings";
import { LoveListClient } from "./LoveListClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const s = getAllSiteSettings();
  return {
    title: `${s.basic.title} — 恋爱事件`,
  };
}

export default function LoveListPage() {
  const settings = getAllSiteSettings();
  const items = listItems();
  const anim = settings.features.animation
    ? "animated fadeInUp delay-03s"
    : "";

  return (
    <PublicShell settings={settings}>
      <div className="central">
        <div className="title">
          <h1>总有些惊奇的际遇 比方说当我遇见你</h1>
        </div>
        <div className="row central central-800">
          {items.length > 0 ? (
            <div className="card col-lg-12 col-md-12 col-sm-12 col-sm-x-12">
              <div className={`list_texts ${anim}`.trim()}>
                <LoveListClient
                  items={items.map((it) => ({
                    id: it.id,
                    title: it.title,
                    done: it.done === 1,
                    imageUrl: it.image_url,
                  }))}
                />
              </div>
            </div>
          ) : (
            <p className="text-ce" style={{ opacity: 0.7 }}>
              暂无恋爱列表
            </p>
          )}
        </div>
      </div>
    </PublicShell>
  );
}
