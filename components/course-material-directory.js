import Link from "next/link";

export default function CourseMaterialDirectory({ groups, activeSlug, variant = activeSlug ? "aside" : "inline" }) {
  if (variant === "inline") {
    return (
      <nav className="course-material-directory course-material-directory-inline" aria-label="本期材料目录">
        {groups.map((group) => (
          <section key={group.title} className="course-material-group">
            <strong className="course-material-group-title">{group.title}</strong>

            <div className="course-material-card-grid">
              {group.items.map((item) => (
                <Link key={item.slug} href={item.href} className="course-material-card">
                  <span className="course-material-card-order">{String(item.order).padStart(2, "0")}</span>
                  <span className="course-material-card-label">{item.shortLabel}</span>
                  <span className="course-material-card-arrow">→</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </nav>
    );
  }

  return (
    <nav className="course-material-directory course-material-directory-aside" aria-label="本期材料目录">
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
                <span className="course-material-directory-order">{String(item.order).padStart(2, "0")}</span>
                <span className="course-material-directory-text">{item.shortLabel}</span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </nav>
  );
}
