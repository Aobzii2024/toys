"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LogoutButton } from "./LogoutButton";

const SECTIONS = [
  {
    title: "概览",
    links: [{ href: "/admin", label: "仪表盘", exact: true, icon: "grid" }],
  },
  {
    title: "内容",
    links: [
      { href: "/admin/posts", label: "点点滴滴", icon: "doc" },
      { href: "/admin/messages", label: "留言", icon: "chat" },
      { href: "/admin/photos", label: "相册", icon: "image" },
      { href: "/admin/love-list", label: "恋爱清单", icon: "list" },
      { href: "/admin/about", label: "关于我们", icon: "heart" },
    ],
  },
  {
    title: "系统",
    links: [
      { href: "/admin/settings", label: "站点设置", icon: "settings" },
      { href: "/admin/security", label: "安全", icon: "shield" },
      { href: "/admin/audit", label: "审计日志", icon: "log" },
    ],
  },
] as const;

function NavIcon({ name }: { name: string }) {
  const common = {
    className: "admin-nav-icon",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true as const,
  };

  switch (name) {
    case "grid":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "doc":
      return (
        <svg {...common}>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5" />
          <path d="M9 13h6M9 17h4" />
        </svg>
      );
    case "chat":
      return (
        <svg {...common}>
          <path d="M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 1 1 18 0z" />
        </svg>
      );
    case "image":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="9" cy="10" r="1.5" />
          <path d="M3 16l5-4 4 3 4-5 5 6" />
        </svg>
      );
    case "list":
      return (
        <svg {...common}>
          <path d="M9 6h11M9 12h11M9 18h11" />
          <circle cx="5" cy="6" r="1" fill="currentColor" />
          <circle cx="5" cy="12" r="1" fill="currentColor" />
          <circle cx="5" cy="18" r="1" fill="currentColor" />
        </svg>
      );
    case "heart":
      return (
        <svg {...common}>
          <path d="M12 20s-7-4.4-7-9.2A3.8 3.8 0 0 1 12 7.5a3.8 3.8 0 0 1 7 3.3C19 15.6 12 20 12 20z" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3l8 3v6c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V6l8-3z" />
          <path d="M9.5 12.5l1.8 1.8 3.7-3.8" />
        </svg>
      );
    case "log":
      return (
        <svg {...common}>
          <path d="M8 6h11M8 12h11M8 18h11" />
          <path d="M4 6h.01M4 12h.01M4 18h.01" />
        </svg>
      );
    default:
      return null;
  }
}

function isActive(pathname: string, href: string, exact?: boolean) {
  if (exact) return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

function qqAvatar(qq?: string) {
  const n = (qq || "").trim();
  if (!n) return "";
  return `https://q1.qlogo.cn/g?b=qq&nk=${encodeURIComponent(n)}&s=100`;
}

/**
 * Admin chrome: top-left avatar opens a panel with all navigation + logout.
 */
export function AdminShell({
  username,
  displayName,
  qq,
  children,
}: {
  username?: string;
  displayName?: string;
  qq?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname() || "/admin";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const initial = (displayName || username || "A").slice(0, 1).toUpperCase();
  const avatar = qqAvatar(qq);
  const label = displayName || username || "管理员";

  // Close on outside click / Escape
  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(e: MouseEvent | TouchEvent) {
      const el = menuRef.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  // Close when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <div className="admin-shell">
      <header className="admin-appbar">
        <div className="admin-appbar-left" ref={menuRef}>
          <button
            type="button"
            className={`admin-avatar-btn${menuOpen ? " is-open" : ""}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label="打开导航菜单"
          >
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                className="admin-avatar-btn-img"
                src={avatar}
                alt={label}
                width={40}
                height={40}
              />
            ) : (
              <span className="admin-avatar-btn-fallback">{initial}</span>
            )}
            <span className="admin-avatar-btn-meta">
              <strong>{label}</strong>
              <small>{menuOpen ? "点击收起" : "点击展开菜单"}</small>
            </span>
            <span className="admin-avatar-caret" aria-hidden>
              {menuOpen ? "▴" : "▾"}
            </span>
          </button>

          {menuOpen ? (
            <div className="admin-avatar-menu" role="menu">
              <div className="admin-avatar-menu-head">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="" width={36} height={36} />
                ) : (
                  <span className="admin-avatar-btn-fallback sm">{initial}</span>
                )}
                <div>
                  <strong>{label}</strong>
                  <span>{username || "admin"}</span>
                </div>
              </div>

              <div className="admin-avatar-menu-body">
                {SECTIONS.map((section) => (
                  <div key={section.title} className="admin-avatar-menu-section">
                    <div className="admin-avatar-menu-label">{section.title}</div>
                    {section.links.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        role="menuitem"
                        className={
                          isActive(
                            pathname,
                            item.href,
                            "exact" in item ? item.exact : false,
                          )
                            ? "active"
                            : undefined
                        }
                        onClick={() => setMenuOpen(false)}
                      >
                        <NavIcon name={item.icon} />
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
                ))}
              </div>

              <div className="admin-avatar-menu-foot">
                <LogoutButton className="admin-btn secondary small admin-logout-full" />
              </div>
            </div>
          ) : null}
        </div>

        <div className="admin-appbar-right">
          <span className="admin-appbar-brand">Randex Admin</span>
        </div>
      </header>

      {menuOpen ? (
        <div
          className="admin-menu-scrim"
          onClick={() => setMenuOpen(false)}
          aria-hidden
        />
      ) : null}

      <div className="admin-main">
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
