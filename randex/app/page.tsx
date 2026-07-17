import Link from "next/link";
import { LoveTimer } from "@/components/public/LoveTimer";
import { PublicShell } from "@/components/public/PublicShell";
import { getAllSiteSettings } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const HOME_ENTRIES = [
  {
    href: "/little",
    title: "点点滴滴",
    desc: "有人愿意听你碎碎念念也很浪漫",
    img: "/style/img/home/home-page.svg",
    wide: false,
  },
  {
    href: "/photos",
    title: "照片展馆",
    desc: "恋爱相册 · 记录最美瞬间",
    img: "/style/img/home/home-photo.svg",
    wide: false,
  },
  {
    href: "/list",
    title: "恋爱清单",
    desc: "你我之间的约定与小目标",
    img: "/style/img/home/home-list.svg",
    wide: false,
  },
  {
    href: "/leaving",
    title: "借您吉言",
    desc: "在这里写下我们的留言祝福",
    img: "/style/img/home/home-msg.svg",
    wide: false,
  },
  {
    href: "/about",
    title: "关于我们",
    desc: "我们之间认识的经历回忆",
    img: "/style/img/home/home-about.svg",
    wide: false,
  },
  {
    href: "/more",
    title: "更多功能",
    desc: "待增添 · 敬请期待",
    img: "/style/img/home/home-more.svg",
    wide: false,
  },
] as const;

export default function HomePage() {
  const settings = getAllSiteSettings();
  const { couple, features, basic, cards } = settings;
  const anim = features.animation ? "animated fadeInUp" : "";

  // Prefer site.cards copy when available
  const entries = HOME_ENTRIES.map((e) => {
    if (e.href === "/little") {
      return {
        ...e,
        title: cards.card1 || e.title,
        desc: cards.deci1 || e.desc,
      };
    }
    if (e.href === "/leaving") {
      return {
        ...e,
        // keep display title「借您吉言」; only reuse site description if set
        desc: cards.deci2 || e.desc,
      };
    }
    if (e.href === "/about") {
      return {
        ...e,
        title: cards.card3 || e.title,
        desc: cards.deci3 || e.desc,
      };
    }
    return e;
  });

  return (
    <PublicShell settings={settings}>
      <LoveTimer startTime={couple.startTime} />
      <div className="card-wrap">
        <div className="row central">
          {entries.map((item) => (
            <div
              key={item.href}
              className={`${item.wide ? "card-b col-lg-6 col-12 col-sm-12" : "card col-lg-4 col-sm-12 col-sm-x-12"} flex-h ${anim}`.trim()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.img} alt="" />
              <div className="text">
                <span>
                  <Link href={item.href}>{item.title}</Link>
                </span>
                <p>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <span className="sr-only" style={{ display: "none" }}>
        {basic.title}
      </span>
    </PublicShell>
  );
}
