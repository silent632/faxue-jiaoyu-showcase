import Link from "next/link";

import ShowcaseNav from "@/components/showcase-nav";
import ShowcaseSection from "@/components/showcase-section";
import CoursePeriodSubnav from "@/components/course-period-subnav";

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

function renderQuestions(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <div className="course-question-grid">
      {items.map((item) => (
        <article key={item.question} className="course-question-card">
          <strong>{item.question}</strong>
          <p>{item.detail}</p>
        </article>
      ))}
    </div>
  );
}

function renderBlocks(blocks) {
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return null;
  }

  return (
    <div className="course-reading-section-grid">
      {blocks.map((block) => (
        <article key={block.title} className="course-reading-section-card">
          <strong>{block.title}</strong>
          {renderParagraphs(block.paragraphs)}
          {renderBullets(block.bullets)}
        </article>
      ))}
    </div>
  );
}

function renderGroups(groups) {
  if (!Array.isArray(groups) || groups.length === 0) {
    return null;
  }

  return (
    <div className="course-material-section-grid">
      {groups.map((group) => (
        <article key={group.title} className="course-material-section-card">
          <strong>{group.title}</strong>
          {group.summary ? <p>{group.summary}</p> : null}
          {Array.isArray(group.items) && group.items.length > 0 ? (
            <ul className="course-detail-material-list">
              {group.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function renderDetailSections(detailSections) {
  if (!Array.isArray(detailSections) || detailSections.length === 0) {
    return null;
  }

  return (
    <div className="course-detail-section-stack">
      {detailSections.map((section) => (
        <section key={section.title} className="course-detail-section-panel">
          <div className="course-detail-section-header">
            <strong>{section.title}</strong>
            {section.intro ? <p>{section.intro}</p> : null}
          </div>

          {renderParagraphs(section.paragraphs)}
          {renderBullets(section.bullets)}

          {Array.isArray(section.cards) && section.cards.length > 0 ? (
            <div className="course-detail-section-card-grid">
              {section.cards.map((card) => (
                <article key={card.title} className="course-detail-section-card">
                  <strong>{card.title}</strong>
                  {renderMeta(card.meta)}
                  {renderParagraphs(card.paragraphs)}
                  {renderScoreItems(card.scoreItems)}
                  {renderBullets(card.bullets)}
                </article>
              ))}
            </div>
          ) : null}
        </section>
      ))}
    </div>
  );
}

export function CoursePeriodShell({ period, title, summary, activeSectionKey = null, children }) {
  const heroMeta = [
    { label: "课程主题", value: period.guide.courseTheme || period.theme },
    { label: "课程模块", value: period.module },
    { label: "理论导师", value: period.guide.theoryMentor },
    { label: "实务导师", value: period.guide.practiceMentor },
  ].filter((item) => item.value);

  return (
    <main className="showcase-page" data-page-role="course-detail">
      <ShowcaseNav />

      <div className="showcase-page-body">
        <div className="course-detail-back-row">
          <Link href="/courses" className="btn btn-ghost">
            返回课程体系
          </Link>
        </div>

        <section className="showcase-card course-detail-hero">
          <div className="course-detail-hero-copy">
            <p className="showcase-page-kicker">{period.period}</p>
            <h1>{title || period.title}</h1>
            <p className="course-detail-lead">{summary}</p>
          </div>

          <div className="course-detail-hero-side">
            <div className="course-detail-chip-row">
              <span className="tag tag-accent">{period.stageTag}</span>
              <span className="tag">{period.phaseLabel}</span>
            </div>

            <div className="course-detail-meta-grid">
              {heroMeta.map((item) => (
                <article key={item.label} className="course-detail-meta-card">
                  <span>{item.label}</span>
                  <strong>{item.value}</strong>
                </article>
              ))}
            </div>

            <div className="course-detail-action-row">
              <Link href={period.videoHref} className="showcase-home-panel-link">
                查看本期视频
              </Link>
            </div>
          </div>
        </section>

        {activeSectionKey ? (
          <CoursePeriodSubnav items={period.sectionNavItems} activeKey={activeSectionKey} />
        ) : null}

        {children}
      </div>
    </main>
  );
}

export function CoursePeriodSectionContent({ period, section }) {
  return (
    <ShowcaseSection
      title={section.title}
      eyebrow={period.period}
      description={section.lead}
      className="showcase-section-compact course-period-section"
    >
      {renderParagraphs(section.paragraphs)}
      {renderQuestions(section.questions)}
      {renderBlocks(section.blocks)}
      {renderGroups(section.groups)}
      {renderDetailSections(section.detailSections)}
    </ShowcaseSection>
  );
}
