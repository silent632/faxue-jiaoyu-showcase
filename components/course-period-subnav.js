import Link from "next/link";

export default function CoursePeriodSubnav({ items, activeKey }) {
  return (
    <nav className="course-period-subnav" aria-label="课程栏目">
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className={`course-period-subnav-link${item.key === activeKey ? " active" : ""}`}
          aria-current={item.key === activeKey ? "page" : undefined}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
