import type { Metadata } from "next";
import { AboutBotui } from "@/components/public/AboutBotui";
import { PublicShell } from "@/components/public/PublicShell";
import { getAllSiteSettings } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const s = getAllSiteSettings();
  return {
    title: `${s.basic.title} — ${s.cards.card3}`,
  };
}

export default function AboutPage() {
  const settings = getAllSiteSettings();
  const { about } = settings;
  const hasImg = Boolean(about.aboutimg?.trim());

  return (
    <PublicShell settings={settings}>
      {hasImg ? (
        <style
          dangerouslySetInnerHTML={{
            __html: `.central-600.has-about-img { background-image: linear-gradient(160deg, rgba(15,23,42,.45), rgba(30,41,59,.35)), url(${JSON.stringify(about.aboutimg)}); background-size: cover; background-position: center top; background-repeat: no-repeat; }`,
          }}
        />
      ) : null}

      <h4 className="text-ce central">
        与 <i>{about.title || "Randex"}</i> 小站对话中...
      </h4>
      <div
        className={`central central-600${hasImg ? " has-about-img" : ""}`.trim()}
      >
        <AboutBotui items={about.script ?? []} />
      </div>
    </PublicShell>
  );
}
