"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "首页" },
  { href: "/courses", label: "课程体系" },
  { href: "/resources", label: "教学资源" },
  { href: "/cases", label: "案例检索库" },
  { href: "/cases/case-0001/study", label: "研习工作台", matchPrefix: "/cases/" },
  { href: "/impact", label: "成效展示" },
];

function isActive(pathname, item) {
  if (item.href === "/cases") {
    return pathname === "/cases" || /^\/cases\/[^/]+\/?$/u.test(pathname || "");
  }
  if (item.label === "研习工作台") {
    return /^\/cases\/[^/]+\/study\/?$/u.test(pathname || "");
  }
  return pathname === item.href || pathname?.startsWith(item.matchPrefix || `${item.href}/`);
}

export default function TopNav({ user }) {
  const pathname = usePathname();

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
            {NAV_ITEMS.map((item) => (
              <Link key={`${item.href}-${item.label}`} href={item.href} className={`nav-tab${isActive(pathname, item) ? " active" : ""}`}>
                {item.label}
              </Link>
            ))}
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
