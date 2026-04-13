import Link from "next/link";

import ShowcaseSection from "@/components/showcase-section";

function renderParagraphs(paragraphs) {
  if (!Array.isArray(paragraphs) || paragraphs.length === 0) {
    return null;
  }

  return (
    <div className="course-reading-paragraph-group">
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

function renderSections(sections) {
  if (!Array.isArray(sections) || sections.length === 0) {
    return null;
  }

  return (
    <div className="course-reading-section-grid">
      {sections.map((section) => (
        <article key={section.title} className="course-reading-section-card">
          <strong>{section.title}</strong>
          {section.intro ? <p className="course-detail-card-intro">{section.intro}</p> : null}
          {renderMeta(section.meta)}
          {renderParagraphs(section.paragraphs)}
          {renderScoreItems(section.scoreItems)}
          {renderBullets(section.bullets)}

          {Array.isArray(section.cards) && section.cards.length > 0 ? (
            <div className="course-material-card-grid">
              {section.cards.map((card) => (
                <article key={card.title} className="course-material-section-card">
                  <strong>{card.title}</strong>
                  {renderMeta(card.meta)}
                  {renderParagraphs(card.paragraphs)}
                  {renderScoreItems(card.scoreItems)}
                  {renderBullets(card.bullets)}
                </article>
              ))}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

export default function CourseMaterialArticle({ period, page }) {
  return (
    <div className="course-material-layout">
      <article className="showcase-card course-material-article">
        <header className="course-material-article-head">
          <span className="showcase-card-eyebrow">
            {String(page.order).padStart(2, "0")} · {page.group}
          </span>
          <h2>{page.label}</h2>
          <p className="course-detail-lead">{page.purpose}</p>
        </header>

        <ShowcaseSection
          title={page.label}
          eyebrow={period.period}
          description={page.lead}
          className="showcase-section-compact course-period-section"
        >
          {renderSections(page.sections)}
        </ShowcaseSection>

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
