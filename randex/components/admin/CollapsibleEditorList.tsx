"use client";

import { useState } from "react";

export type CollapsibleItem = {
  id: string | number;
  title: string;
  meta?: string;
  preview?: React.ReactNode;
  children: React.ReactNode;
};

type Props = {
  items: CollapsibleItem[];
  emptyText?: string;
};

/** Title-only list; click a row to expand detail editor. */
export function CollapsibleEditorList({
  items,
  emptyText = "暂无记录",
}: Props) {
  const [openId, setOpenId] = useState<string | number | null>(null);

  if (items.length === 0) {
    return <div className="admin-empty">{emptyText}</div>;
  }

  return (
    <div className="admin-clist">
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div
            key={item.id}
            className={`admin-clist-item${open ? " is-open" : ""}`}
          >
            <button
              type="button"
              className="admin-clist-row"
              onClick={() => setOpenId(open ? null : item.id)}
              aria-expanded={open}
            >
              <div className="admin-clist-row-main">
                {item.preview ? (
                  <div className="admin-clist-preview">{item.preview}</div>
                ) : null}
                <div className="admin-clist-text">
                  <strong className="admin-clist-title">{item.title}</strong>
                  {item.meta ? (
                    <span className="admin-clist-meta">{item.meta}</span>
                  ) : null}
                </div>
              </div>
              <span className="admin-clist-chevron" aria-hidden>
                {open ? "收起" : "查看"}
              </span>
            </button>
            {open ? (
              <div className="admin-clist-detail">{item.children}</div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
