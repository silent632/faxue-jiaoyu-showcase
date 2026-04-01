"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isShowcaseNavItemActive } from "@/lib/showcase-nav-match";

export default function ShowcaseNav({ items }) {
  const pathname = usePathname();

  return (
    <header className="showcase-nav">
      <div className="showcase-nav-inner">
        <Link href="/" className="showcase-brand" aria-label="返回首页">
          <strong>裁判文书研习平台</strong>
          <span>法理学教学改革展示专站</span>
        </Link>

        <nav className="showcase-nav-links" aria-label="主导航">
          {items.map((item) => {
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
