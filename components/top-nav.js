"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buildShowcaseNavItems } from "@/lib/showcase-content";
import { isShowcaseNavItemActive } from "@/lib/showcase-nav-match";

export default function TopNav({ user, items }) {
  const pathname = usePathname();
  const navItems = items ?? buildShowcaseNavItems();

  return (
    <header className="topbar showcase-topbar">
      <div className="topbar-inner showcase-topbar-inner">
        <div className="topbar-brand-wrap">
          <Link href="/" className="topbar-brand-link">
            <strong className="topbar-brand">裁判文书研习平台</strong>
            <span className="topbar-brand-subtitle">法理学教学改革专题平台</span>
          </Link>
        </div>

        <nav className="topbar-links" aria-label="主导航">
          <div className="topbar-links-track">
            {navItems.map((item) => {
              const active = isShowcaseNavItemActive(pathname || "", item);

              return (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  className={`nav-tab${active ? " active" : ""}`}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="topbar-right">
          <div className="topbar-user-card showcase-topbar-user-card">
            <strong className="topbar-user-name">{user?.name || "开放浏览"}</strong>
            <span className="topbar-user-meta">{user?.roleLabel || "案例研习平台"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
