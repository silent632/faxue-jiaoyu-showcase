import Link from "next/link";

function renderParagraphs(paragraphs, className = "course-reading-paragraph-group") {
  if (!Array.isArray(paragraphs) || paragraphs.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {paragraphs.map((paragraph) => (
        <p key={paragraph} className="course-reading-paragraph">
          {paragraph}
        </p>
      ))}
    </div>
  );
}

function renderBullets(bullets) {
  if (!Array.isArray(bullets) || bullets.length === 0) {
    return null;
  }

  return (
    <ul className="course-detail-list">
      {bullets.map((bullet) => (
        <li key={bullet}>{bullet}</li>
      ))}
    </ul>
  );
}

function renderMeta(meta) {
  if (!Array.isArray(meta) || meta.length === 0) {
    return null;
  }

  return (
    <dl className="course-detail-meta-pairs">
      {meta.map((item) => (
        <div key={`${item.label}-${item.value}`} className="course-detail-meta-pair">
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function renderScoreItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <ul className="course-detail-score-list">
      {items.map((item) => (
        <li key={`${item.label}-${item.score}`} className="course-detail-score-item">
          <span>{item.label}</span>
          <strong>{item.score}</strong>
        </li>
      ))}
    </ul>
  );
}

function renderCards(cards) {
  if (!Array.isArray(cards) || cards.length === 0) {
    return null;
  }

  return (
    <div className="course-material-subsection-stack">
      {cards.map((card) => (
        <section key={card.title} className="course-material-subsection">
          {card.title ? <h4>{card.title}</h4> : null}
          {renderMeta(card.meta)}
          {renderParagraphs(card.paragraphs, "course-material-subsection-paragraphs")}
          {renderScoreItems(card.scoreItems)}
          {renderBullets(card.bullets)}
        </section>
      ))}
    </div>
  );
}

function shouldDisplayTitle(title) {
  if (!title) {
    return false;
  }

  return !/^反馈焦点\d+$|^研习报告视角\d+$/u.test(title);
}

function renderSection(section, index) {
  const key = section.title || `section-${index}`;

  return (
    <section key={key} className="course-material-article-body-block">
      {shouldDisplayTitle(section.title) ? <h3>{section.title}</h3> : null}
      {section.intro ? <p className="course-material-body-intro">{section.intro}</p> : null}
      {renderMeta(section.meta)}
      {renderParagraphs(section.paragraphs)}
      {renderScoreItems(section.scoreItems)}
      {renderBullets(section.bullets)}
      {renderCards(section.cards)}
    </section>
  );
}

export default function CourseMaterialArticle({ page }) {
  return (
    <div className="course-material-layout">
      <article className="showcase-card course-material-article">
        <header className="course-material-article-head">
          <span className="showcase-card-eyebrow">
            {String(page.order).padStart(2, "0")} · {page.group}
          </span>
          <h2>{page.label}</h2>
        </header>

        <div className="course-material-article-body">{page.sections.map((section, index) => renderSection(section, index))}</div>

        <div className="course-material-page-tail">
          {page.previousPage ? (
            <Link href={page.previousPage.href} className="btn btn-ghost">
              上一页：{page.previousPage.label}
            </Link>
          ) : null}
          {page.nextPage ? (
            <Link href={page.nextPage.href} className="showcase-home-panel-link">
              下一页：{page.nextPage.label}
            </Link>
          ) : null}
        </div>
      </article>
    </div>
  );
}
