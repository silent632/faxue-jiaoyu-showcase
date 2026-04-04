"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { buildShowcaseNavItems } from "@/lib/showcase-content";
import { isShowcaseNavItemActive } from "@/lib/showcase-nav-match";

export default function ShowcaseNav({ items }) {
  const pathname = usePathname();
  const navItems = items ?? buildShowcaseNavItems();

  return (
    <header className="showcase-nav">
      <div className="showcase-nav-inner">
        <Link href="/" className="showcase-brand" aria-label="返回首页">
          <strong>裁判文书研习平台</strong>
          <span>法理学教学改革专题平台</span>
        </Link>

        <nav className="showcase-nav-links" aria-label="主导航">
          {navItems.map((item) => {
            const active = isShowcaseNavItemActive(pathname, item);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`showcase-nav-link${active ? " active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
