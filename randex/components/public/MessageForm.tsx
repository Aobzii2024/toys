"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  /** Called after a successful post so parent can refresh live board */
  onSuccess?: () => void;
};

export function MessageForm({ onSuccess }: Props) {
  const [qq, setQq] = useState("");
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [avatar, setAvatar] = useState(
    "https://q1.qlogo.cn/g?b=qq&nk=10000&s=100",
  );
  const [lookingUp, setLookingUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: "ok" | "err" | "info";
    text: string;
  } | null>(null);
  const lookupSeq = useRef(0);

  async function lookupQq(value: string) {
    const trimmed = value.trim();
    if (!/^[1-9][0-9]{4,11}$/.test(trimmed)) {
      setName("");
      setAvatar("https://q1.qlogo.cn/g?b=qq&nk=10000&s=100");
      return;
    }

    const seq = ++lookupSeq.current;
    setLookingUp(true);
    setStatus({ type: "info", text: "正在识别 QQ 昵称…" });
    setAvatar(`https://q1.qlogo.cn/g?b=qq&nk=${trimmed}&s=100`);

    try {
      const res = await fetch(`/api/qq-info?qq=${encodeURIComponent(trimmed)}`);
      const data = (await res.json()) as {
        ok: boolean;
        data?: { nickname: string; avatar: string; resolved?: boolean };
        error?: string;
      };
      if (seq !== lookupSeq.current) return;

      if (data.ok && data.data) {
        setName(data.data.nickname);
        setAvatar(data.data.avatar);
        setStatus(
          data.data.resolved
            ? { type: "ok", text: `已识别：${data.data.nickname}` }
            : {
                type: "info",
                text: "暂未获取到公开昵称，将以「热心网友」展示",
              },
        );
      } else {
        setName("热心网友");
        setStatus({
          type: "err",
          text: data.error ?? "昵称识别失败，可直接留言",
        });
      }
    } catch {
      if (seq !== lookupSeq.current) return;
      setName("热心网友");
      setStatus({ type: "err", text: "网络异常，可直接留言" });
    } finally {
      if (seq === lookupSeq.current) setLookingUp(false);
    }
  }

  // Debounced auto lookup while typing QQ
  useEffect(() => {
    const trimmed = qq.trim();
    if (!/^[1-9][0-9]{4,11}$/.test(trimmed)) {
      setName("");
      return;
    }
    const t = window.setTimeout(() => {
      void lookupQq(trimmed);
    }, 450);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qq]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qqT = qq.trim();
    const bodyT = body.trim();
    if (!/^[1-9][0-9]{4,11}$/.test(qqT)) {
      setStatus({ type: "err", text: "请填写正确的 QQ 号码" });
      return;
    }
    if (!bodyT || bodyT.length < 2) {
      setStatus({ type: "err", text: "请填写两个字符以上的留言内容" });
      return;
    }

    setSubmitting(true);
    setStatus({ type: "info", text: "留言提交中…" });
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qq: qqT, body: bodyT }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        error?: string;
        data?: { name?: string; avatar?: string };
      };
      if (data.ok) {
        if (data.data?.name) setName(data.data.name);
        if (data.data?.avatar) setAvatar(data.data.avatar);
        setStatus({
          type: "ok",
          text: `留言成功${data.data?.name ? `（${data.data.name}）` : ""}，已自动更新展示`,
        });
        setBody("");
        onSuccess?.();
      } else {
        setStatus({
          type: "err",
          text: data.error ?? "留言提交失败",
        });
      }
    } catch {
      setStatus({ type: "err", text: "网络错误，请稍后重试" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <div className="inputbox" id="MessageArea">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={avatar} alt="" className="avatar" />
        <input
          id="QQ"
          type="text"
          name="qq"
          inputMode="numeric"
          autoComplete="off"
          placeholder="请输入 QQ 号码（自动识别昵称）"
          className="rig"
          value={qq}
          onChange={(e) =>
            setQq(e.target.value.replace(/[^\d]/g, "").slice(0, 12))
          }
          onBlur={() => void lookupQq(qq)}
          disabled={submitting}
          required
        />
        <input
          id="nickname"
          type="text"
          name="name"
          placeholder={lookingUp ? "识别中…" : "昵称将自动识别"}
          className="let"
          value={name}
          readOnly
          tabIndex={-1}
          disabled
          aria-readonly="true"
        />
      </div>
      <textarea
        name="text"
        id="wenben"
        rows={8}
        placeholder="请输入您的留言内容..."
        value={body}
        onChange={(e) => setBody(e.target.value)}
        disabled={submitting}
      />
      <div className="input-sub">
        <button
          type="submit"
          id="leavingPost"
          className="tijiao"
          disabled={submitting || lookingUp}
        >
          {submitting ? "留言提交中..." : "提交留言"}
        </button>
      </div>
      {status ? (
        <p
          style={{
            marginTop: "0.75rem",
            color:
              status.type === "ok"
                ? "#2e7d32"
                : status.type === "err"
                  ? "#c62828"
                  : "#555",
          }}
        >
          {status.text}
        </p>
      ) : null}
    </form>
  );
}
