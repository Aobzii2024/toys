"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MessageDanmaku,
  type DanmakuMessage,
} from "@/components/public/MessageDanmaku";
import { MessageForm } from "@/components/public/MessageForm";

type Props = {
  initialMessages: DanmakuMessage[];
  initialTotal: number;
  limit: number;
};

const POLL_MS = 5000;

/**
 * Live leave-message board: danmaku + form.
 * Polls /api/messages so new posts appear without full page refresh.
 */
export function LeavingBoard({
  initialMessages,
  initialTotal,
  limit,
}: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [total, setTotal] = useState(initialTotal);
  const lastSig = useRef(signature(initialMessages, initialTotal));
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const res = await fetch(
        `/api/messages?limit=${encodeURIComponent(String(limit))}`,
        { cache: "no-store" },
      );
      const data = (await res.json()) as {
        ok?: boolean;
        data?: {
          total: number;
          messages: Array<{
            id: number;
            name: string;
            qq: string;
            body: string;
          }>;
        };
      };
      if (!data.ok || !data.data) return;
      const next = data.data.messages.map((m) => ({
        id: m.id,
        name: m.name,
        qq: m.qq,
        body: m.body,
      }));
      const sig = signature(next, data.data.total);
      if (sig !== lastSig.current) {
        lastSig.current = sig;
        setMessages(next);
        setTotal(data.data.total);
      }
    } catch {
      /* ignore transient network errors */
    } finally {
      inFlight.current = false;
    }
  }, [limit]);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, POLL_MS);
    const onVis = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [refresh]);

  return (
    <>
      <h3>
        已收到 <b>{total}</b> 条祝福留言
        <i className="jiequ">
          （弹幕展示最新 {Math.min(limit, messages.length)} 条）
        </i>
      </h3>

      <div className="row">
        <div className="card col-lg-12 col-md-12 col-sm-12 col-sm-x-12 leaving-card">
          <MessageDanmaku height={300} messages={messages} />
          <MessageForm
            onSuccess={() => {
              void refresh();
            }}
          />
        </div>
      </div>
    </>
  );
}

function signature(messages: DanmakuMessage[], total: number): string {
  if (messages.length === 0) return `0:${total}`;
  const head = messages[0];
  const tail = messages[messages.length - 1];
  return `${total}:${messages.length}:${head.id}:${tail.id}`;
}
