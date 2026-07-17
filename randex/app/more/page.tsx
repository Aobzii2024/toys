import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/public/PublicShell";
import { getAllSiteSettings } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const s = getAllSiteSettings();
  return {
    title: `${s.basic.title} — 更多功能`,
    description: "更多功能待增添",
  };
}

export default function MorePage() {
  const settings = getAllSiteSettings();
  const anim = settings.features.animation
    ? "animated fadeInUp delay-03s"
    : "";

  return (
    <PublicShell settings={settings}>
      <div className="central central-800">
        <div className="title">
          <h1>更多功能</h1>
        </div>
        <div className={`card ${anim}`.trim()} style={{ padding: "2.5rem 1.5rem", textAlign: "center" }}>
          <p
            style={{
              margin: "0 0 1rem",
              fontSize: "1.35rem",
              fontFamily: "'Noto Serif SC', serif",
              fontWeight: 700,
              color: "#475569",
            }}
          >
            待增添
          </p>
          <p style={{ margin: "0 0 1.5rem", color: "#94a3b8", lineHeight: 1.7 }}>
            这里会陆续加入更多有趣的小功能，敬请期待～
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              padding: "0.55rem 1.25rem",
              borderRadius: "999px",
              background: "#0f172a",
              color: "#fff",
              textDecoration: "none",
              fontSize: "0.95rem",
            }}
          >
            返回首页
          </Link>
        </div>
      </div>
    </PublicShell>
  );
}
