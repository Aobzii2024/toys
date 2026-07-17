"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        fontFamily:
          'system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans SC", sans-serif',
      }}
    >
      <div style={{ maxWidth: 420, textAlign: "center" }}>
        <h1 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
          页面加载出错
        </h1>
        <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.55 }}>
          多半是部署后浏览器缓存了旧版本脚本。请强制刷新，或点击下方按钮重试。
        </p>
        <div
          style={{
            display: "flex",
            gap: "0.6rem",
            justifyContent: "center",
            marginTop: "1.25rem",
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={() => reset()}
            style={{
              padding: "0.55rem 1rem",
              borderRadius: 8,
              border: "none",
              background: "#2563eb",
              color: "#fff",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            重试
          </button>
          <button
            type="button"
            onClick={() => {
              // Hard reload bypasses some stale module caches
              window.location.href = window.location.pathname + "?_=" + Date.now();
            }}
            style={{
              padding: "0.55rem 1rem",
              borderRadius: 8,
              border: "1px solid #d1d5db",
              background: "#fff",
              color: "#334155",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            强制刷新
          </button>
        </div>
      </div>
    </div>
  );
}
