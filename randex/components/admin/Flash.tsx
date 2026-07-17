"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** Auto-dismissing flash banner driven by ?ok= / ?err= query params. */
export function Flash() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const ok = searchParams.get("ok");
  const err = searchParams.get("err");
  const message = err || ok;
  const type = err ? "error" : "ok";
  const [visible, setVisible] = useState(Boolean(message));

  useEffect(() => {
    setVisible(Boolean(message));
    if (!message) return;
    const t = setTimeout(() => setVisible(false), 4200);
    return () => clearTimeout(t);
  }, [message]);

  useEffect(() => {
    if (!message) return;
    // Clean query string so refresh does not re-show the flash
    const t = setTimeout(() => {
      router.replace(pathname, { scroll: false });
    }, 100);
    return () => clearTimeout(t);
  }, [message, pathname, router]);

  if (!message || !visible) return null;

  return (
    <div className={`admin-alert ${type}`} role="status">
      <span className="admin-alert-dot" aria-hidden />
      <span className="admin-alert-text">{message}</span>
      <button
        type="button"
        className="admin-alert-close"
        aria-label="关闭"
        onClick={() => setVisible(false)}
      >
        ×
      </button>
    </div>
  );
}
