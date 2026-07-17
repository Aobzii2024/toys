"use client";

import { useMemo, useState } from "react";

type Props = {
  text: string;
  /** max chars before collapse (default ~80 like WeChat-ish) */
  maxLength?: number;
};

/** Moments text with fixed collapsed length + expand/collapse. */
export function MomentsText({ text, maxLength = 90 }: Props) {
  const cleaned = text.replace(/\r\n/g, "\n").trim();
  const needsClamp = useMemo(() => {
    if (!cleaned) return false;
    if (cleaned.length > maxLength) return true;
    // also clamp very tall multi-line content
    return cleaned.split("\n").length > 4;
  }, [cleaned, maxLength]);

  const [expanded, setExpanded] = useState(false);

  if (!cleaned) return null;

  const shown =
    !needsClamp || expanded
      ? cleaned
      : clampText(cleaned, maxLength);

  return (
    <div className="moments-text">
      <div className={`moments-text-body${expanded ? " is-open" : ""}`}>
        {shown}
      </div>
      {needsClamp ? (
        <button
          type="button"
          className="moments-expand"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded ? "收起" : "全文"}
        </button>
      ) : null}
    </div>
  );
}

function clampText(text: string, max: number): string {
  if (text.length <= max) {
    const lines = text.split("\n");
    if (lines.length <= 4) return text;
    return `${lines.slice(0, 4).join("\n")}…`;
  }
  return `${text.slice(0, max).trimEnd()}…`;
}
