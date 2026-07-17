import type { Metadata } from "next";
import { LeavingBoard } from "@/components/public/LeavingBoard";
import { PublicShell } from "@/components/public/PublicShell";
import {
  countMessages,
  listMessages,
} from "@/lib/repositories/messages";
import { getAllSiteSettings } from "@/lib/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const s = getAllSiteSettings();
  return {
    title: `${s.basic.title} — ${s.cards.card2}`,
    description: s.cards.deci2,
  };
}

export default function LeavingPage() {
  const settings = getAllSiteSettings();
  const limit = settings.leaving.displayLimit || 100;
  const total = countMessages();
  const messages = listMessages(limit);

  return (
    <PublicShell settings={settings}>
      <div className="central central-800 bg">
        <div className="title mt-2rem">
          <h1>{settings.cards.deci2}</h1>
        </div>
        <LeavingBoard
          limit={limit}
          initialTotal={total}
          initialMessages={messages.map((m) => ({
            id: m.id,
            name: m.name,
            qq: m.qq,
            body: m.body,
          }))}
        />
      </div>
    </PublicShell>
  );
}
