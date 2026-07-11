"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { isShowcaseNavItemActive } from "@/lib/showcase-nav-match";

const ICON_PATHS = {
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5.5 9.5V20a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1V9.5" />
      <path d="M9.5 21v-6h5v6" />
    </>
  ),
  book: (
    <>
      <path d="M12 6.5C10.4 5 8.2 4.5 5.5 4.5c-1 0-2 .1-2.5.3v13.7c.5-.2 1.5-.3 2.5-.3 2.7 0 4.9.5 6.5 2 1.6-1.5 3.8-2 6.5-2 1 0 2 .1 2.5.3V4.8c-.5-.2-1.5-.3-2.5-.3-2.7 0-4.9.5-6.5 2Z" />
      <path d="M12 6.5v13.7" />
    </>
  ),
  scale: (
    <>
      <path d="M12 3v18" />
      <path d="M5 6.5h14" />
      <path d="M8.5 21h7" />
      <path d="M5 6.5 2.5 13a3 3 0 0 0 5 0L5 6.5Z" />
      <path d="M19 6.5 16.5 13a3 3 0 0 0 5 0L19 6.5Z" />
    </>
  ),
  flask: (
    <>
      <path d="M9.5 3h5" />
      <path d="M10 3v6L4.7 18a2 2 0 0 0 1.8 3h11a2 2 0 0 0 1.8-3L14 9V3" />
      <path d="M7.5 14.5h9" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20h16" />
      <path d="M7 20v-7" />
      <path d="M12 20V6" />
      <path d="M17 20v-10" />
    </>
  ),
};

function pickIcon(href) {
  if (href === "/") return "home";
  if (href.startsWith("/courses")) return "book";
  if (href.startsWith("/cases")) return "scale";
  if (href.startsWith("/experiments")) return "flask";
  return "book";
}

function NavIcon({ name }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[name] || ICON_PATHS.book}
    </svg>
  );
}

function useStudyStats() {
  const [stats, setStats] = useState({ cases: 0, experiments: 0 });

  useEffect(() => {
    try {
      let cases = 0;
      for (let i = 0; i < window.localStorage.length; i += 1) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith("study_") && !key.startsWith("study_recent_")) cases += 1;
      }

      let experiments = 0;
      const raw = window.localStorage.getItem("faxue-experiment-archive");
      if (raw) {
        const archive = JSON.parse(raw);
        for (const moduleRecords of Object.values(archive)) {
          experiments += Object.keys(moduleRecords || {}).length;
        }
      }

      setStats({ cases, experiments });
    } catch (_error) {
      // localStorage 不可用时保持 0
    }
  }, []);

  return stats;
}

export default function TopNav({ user, items }) {
  const pathname = usePathname();
  const navItems = items ?? [];
  const [open, setOpen] = useState(false);
  const stats = useStudyStats();

  const toggle = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <header className="mobilebar">
        <button
          className={`mobilebar-burger${open ? " is-open" : ""}`}
          type="button"
          aria-label={open ? "关闭导航" : "打开导航"}
          aria-expanded={open}
          onClick={toggle}
        >
          <span />
          <span />
          <span />
        </button>
        <Link href="/" className="mobilebar-brand" onClick={close}>
          裁判文书研习平台
        </Link>
      </header>

      <aside className={`sidenav${open ? " is-open" : ""}`}>
        <Link href="/" className="sidenav-brand" onClick={close}>
          <span className="sidenav-brand-mark" aria-hidden="true">
            <NavIcon name="scale" />
          </span>
          <span className="sidenav-brand-text">
            <strong className="topbar-brand">裁判文书研习平台</strong>
            <span className="topbar-brand-subtitle">法理学教学改革专题平台</span>
          </span>
        </Link>

        <nav className="sidenav-links" aria-label="主导航">
          {navItems.map((item) => {
            const active = isShowcaseNavItemActive(pathname || "", item);

            return (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className={`sidenav-item nav-tab${active ? " active" : ""}`}
                aria-current={active ? "page" : undefined}
                onClick={close}
                title={item.label}
              >
                <NavIcon name={pickIcon(item.href)} />
                <span className="sidenav-item-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidenav-foot">
          <div className="sidenav-stats">
            <div className="sidenav-stat">
              <strong>{stats.cases}</strong>
              <span>研习案例</span>
            </div>
            <div className="sidenav-stat">
              <strong>{stats.experiments}</strong>
              <span>实验存档</span>
            </div>
          </div>
          <div className="sidenav-user showcase-topbar-user-card">
            <strong className="topbar-user-name">{user?.name || "开放浏览"}</strong>
            <span className="topbar-user-meta">{user?.roleLabel || "案例研习平台"}</span>
          </div>
        </div>
      </aside>

      {open && <div className="sidenav-overlay" onClick={close} aria-hidden="true" />}
    </>
  );
}
