import Link from "next/link";

export default function CourseMaterialDirectory({ groups, activeSlug }) {
  return (
    <nav className="course-material-directory" aria-label="本期材料目录">
      {groups.map((group) => (
        <section key={group.title} className="course-material-directory-group">
          <strong className="course-material-directory-title">{group.title}</strong>

          <div className="course-material-directory-links">
            {group.items.map((item) => (
              <Link
                key={item.slug}
                href={item.href}
                className={`course-material-directory-link${item.slug === activeSlug ? " active" : ""}`}
                aria-current={item.slug === activeSlug ? "page" : undefined}
              >
                <span>{String(item.order).padStart(2, "0")}</span>
                <span>{item.shortLabel}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </nav>
  );
}
