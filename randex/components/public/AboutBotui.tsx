"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { SiteAboutScriptItem } from "@/lib/types";

type Props = {
  items: SiteAboutScriptItem[];
};

type ChatLine =
  | { kind: "bot"; text: string }
  | { kind: "human"; text: string };

/**
 * About-page conversational UI (React-native).
 * Replaces flaky Vue+BotUI runtime with a reliable progressive chat.
 */
export function AboutBotui({ items }: Props) {
  const { introTexts, buttons, restTexts } = useMemo(() => {
    const texts = items.filter((i) => i.type === "text");
    const btns = items.filter((i) => i.type === "button");
    return {
      introTexts: texts.slice(0, 3),
      buttons: btns,
      restTexts: texts.slice(3),
    };
  }, [items]);

  const [lines, setLines] = useState<ChatLine[]>([]);
  const [phase, setPhase] = useState<"intro" | "await" | "rest" | "done">(
    "intro",
  );
  const [typing, setTyping] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const pushBot = useCallback(async (text: string, delayMs = 700) => {
    setTyping(true);
    await wait(delayMs);
    setTyping(false);
    setLines((prev) => [...prev, { kind: "bot", text }]);
  }, []);

  // Intro messages
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLines([]);
      setShowActions(false);
      setPhase("intro");
      for (const t of introTexts) {
        if (cancelled) return;
        await pushBot(t.content ?? "", 750);
      }
      if (cancelled) return;
      if (buttons.length > 0 && restTexts.length > 0) {
        setShowActions(true);
        setPhase("await");
      } else {
        for (const t of restTexts) {
          if (cancelled) return;
          await pushBot(t.content ?? "", 850);
        }
        if (!cancelled) setPhase("done");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [introTexts, buttons.length, restTexts, pushBot]);

  async function onAction(label: string, value: "next" | "end") {
    setShowActions(false);
    setLines((prev) => [...prev, { kind: "human", text: label }]);
    if (value === "end") {
      await pushBot("感谢来访，愿得一人心 白首不相离。", 600);
      setPhase("done");
      return;
    }
    setPhase("rest");
    for (const t of restTexts) {
      await pushBot(t.content ?? "", 850);
    }
    setPhase("done");
  }

  if (items.length === 0) {
    return (
      <div className="about-chat about-chat-empty">
        <p>暂无对话内容，请在后台「关于我们」中配置脚本。</p>
      </div>
    );
  }

  const primary = buttons[0]?.text?.trim() || "继续";
  const secondary = buttons[1]?.text?.trim() || "结束";

  return (
    <div className="about-chat" id="botui-app">
      <div className="about-chat-messages">
        {lines.map((line, i) => (
          <div
            key={`${line.kind}-${i}`}
            className={`about-chat-row ${line.kind}`}
          >
            <div className={`about-chat-bubble ${line.kind}`}>{line.text}</div>
          </div>
        ))}
        {typing ? (
          <div className="about-chat-row bot">
            <div className="about-chat-bubble bot about-chat-typing">
              <span />
              <span />
              <span />
            </div>
          </div>
        ) : null}
      </div>

      {showActions && phase === "await" ? (
        <div className="about-chat-actions">
          <button
            type="button"
            className="about-chat-btn primary"
            onClick={() => void onAction(primary, "next")}
          >
            {primary}
          </button>
          <button
            type="button"
            className="about-chat-btn"
            onClick={() => void onAction(secondary, "end")}
          >
            {secondary}
          </button>
        </div>
      ) : null}
    </div>
  );
}

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}
