import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MomentsMedia } from "@/components/public/MomentsMedia";
import { PublicShell } from "@/components/public/PublicShell";
import { getPost } from "@/lib/repositories/posts";
import { getAllSiteSettings } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const num = Number(id);
  const settings = getAllSiteSettings();
  if (!Number.isFinite(num)) {
    return { title: settings.basic.title };
  }
  const post = getPost(num);
  const titleText = post
    ? (post.body_md || post.title || "动态").replace(/\s+/g, " ").slice(0, 24)
    : settings.cards.card1;
  return {
    title: `${settings.basic.title} — ${titleText}`,
  };
}

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
  return `https://q1.qlogo.cn/g?b=qq&nk=${couple.boyQQ || "3428828719"}&s=100`;
}

export default async function LittleDetailPage({ params }: Props) {
  const { id } = await params;
  const num = Number(id);
  if (!Number.isFinite(num) || !Number.isInteger(num) || num <= 0) {
    notFound();
  }

  const post = getPost(num);
  if (!post) notFound();

  const settings = getAllSiteSettings();
  const anim = settings.features.animation
    ? "animated fadeInUp delay-03s"
    : "";
  const text = (post.body_md || "").trim();

  return (
    <PublicShell settings={settings}>
      <div className="central">
        <div className="title" />
        <div className="moments-feed central central-800">
          <article className={`moments-card ${anim}`.trim()}>
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

            {text ? (
              <div className="moments-text">
                <div className="moments-text-body is-open">{text}</div>
              </div>
            ) : null}

            <MomentsMedia images={post.images} />

            <div className="moments-foot">
              <Link href="/little">← 返回动态列表</Link>
            </div>
          </article>
        </div>
      </div>
    </PublicShell>
  );
}
