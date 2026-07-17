import type { Metadata } from "next";
import { MomentsMedia } from "@/components/public/MomentsMedia";
import { MomentsText } from "@/components/public/MomentsText";
import { PublicShell } from "@/components/public/PublicShell";
import { listPosts } from "@/lib/repositories/posts";
import { getAllSiteSettings } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const s = getAllSiteSettings();
  return {
    title: `${s.basic.title} — ${s.cards.card1}`,
    description: s.cards.deci1,
  };
}

/** Display time accurate to the minute */
function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) {
      return iso.replace("T", " ").slice(0, 16);
    }
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${day} ${hh}:${mm}`;
  } catch {
    return iso.replace("T", " ").slice(0, 16);
  }
}

function avatarFor(
  author: string,
  couple: { boy: string; girl: string; boyQQ: string; girlQQ: string },
) {
  if (author === couple.girl || author === "yzx") {
    return `https://q1.qlogo.cn/g?b=qq&nk=${couple.girlQQ || "3533473864"}&s=100`;
  }
  if (author === couple.boy || author === "bhr") {
    return `https://q1.qlogo.cn/g?b=qq&nk=${couple.boyQQ || "3428828719"}&s=100`;
  }
  // match by QQ nicknames already stored as display names
  if (author.includes("圆") || author === "yzx") {
    return `https://q1.qlogo.cn/g?b=qq&nk=3533473864&s=100`;
  }
  return `https://q1.qlogo.cn/g?b=qq&nk=${couple.boyQQ || "3428828719"}&s=100`;
}

export default function LittleListPage() {
  const settings = getAllSiteSettings();
  const posts = listPosts();
  const anim = settings.features.animation
    ? "animated fadeInUp delay-03s"
    : "";

  return (
    <PublicShell settings={settings}>
      <div className="central">
        <div className="title">
          <h1>{settings.cards.deci1 || "点点滴滴"}</h1>
        </div>

        <div className="moments-feed central central-800">
          {posts.length === 0 ? (
            <div className="moments-card">
              <div className="moments-empty">还没有动态，去后台发表第一条吧～</div>
            </div>
          ) : (
            posts.map((post) => {
              const text = (post.body_md || "").trim();
              return (
                <article
                  key={post.id}
                  className={`moments-card ${anim}`.trim()}
                >
                  <div className="moments-head">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="moments-avatar"
                      src={avatarFor(post.author, settings.couple)}
                      alt=""
                    />
                    <div className="moments-meta">
                      <div className="moments-author">{post.author}</div>
                      <div className="moments-time">
                        {formatDateTime(post.created_at)}
                      </div>
                    </div>
                  </div>

                  <MomentsText text={text} maxLength={90} />
                  <MomentsMedia images={post.images} />
                </article>
              );
            })
          )}
        </div>
      </div>
    </PublicShell>
  );
}
