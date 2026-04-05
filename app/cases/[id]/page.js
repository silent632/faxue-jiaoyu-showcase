import Link from "next/link";
import { notFound } from "next/navigation";

import CasePdfDisclosure from "@/components/case-pdf-disclosure";
import TopNav from "@/components/top-nav";
import {
  buildCaseReadingJudgment,
  buildCaseReadingRoadmap,
  buildCoreDispute,
  buildMissingPdfNote,
  buildOutcomeHeadline,
  buildPrimaryContinuation,
  formatLawNameForDisplay,
  sanitizeSummaryForReading,
} from "@/lib/case-presentation.mjs";
import { normalizePublicFileName, publicFileExists } from "@/lib/data/public-files.js";
import { getPublicShowcaseCaseById } from "@/lib/public-showcase-cases.js";
import { getPublicShowcaseUser } from "@/lib/public-showcase-user.js";
import { getShowcaseCaseStaticParams } from "@/lib/showcase-cases";
import { buildShowcaseContent } from "@/lib/showcase-content";

function compactText(value) {
  return String(value || "")
    .replace(/\r\n?/g, "\n")
    .replace(/\u3000/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function toParagraphs(value, maxParagraphs = 3) {
  const text = compactText(value);
  if (!text) return [];

  const lines = text
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (lines.length > 1) {
    return lines.slice(0, maxParagraphs);
  }

  const sentenceMatches = lines[0].match(/[^。！？；!?;]+[。！？；!?;]?/gu) || [lines[0]];
  const sentences = sentenceMatches.map((item) => item.trim()).filter(Boolean);
  const chunks = [];

  for (let index = 0; index < sentences.length; index += 2) {
    chunks.push(`${sentences[index]} ${sentences[index + 1] || ""}`.trim());
  }

  return chunks.slice(0, maxParagraphs);
}

function buildSummaryView(caseItem) {
  return {
    paragraphs: toParagraphs(sanitizeSummaryForReading(caseItem.summary), 3),
  };
}

export async function generateStaticParams() {
  return getShowcaseCaseStaticParams(24);
}

export default async function CaseDetailPage({ params }) {
  const user = getPublicShowcaseUser();
  const navItems = buildShowcaseContent().nav;
  const { id } = await params;
  const caseItem = await getPublicShowcaseCaseById(id);
  if (!caseItem) notFound();

  const pdfFileName = normalizePublicFileName(caseItem.pdfFile);
  const wordFileName = normalizePublicFileName(caseItem.wordFile);
  const [hasPdf, hasWord] = await Promise.all([publicFileExists("pdfs", pdfFileName), publicFileExists("words", wordFileName)]);

  const summaryView = buildSummaryView(caseItem);
  const coreDispute = buildCoreDispute(caseItem);
  const outcomeHeadline = buildOutcomeHeadline(caseItem);
  const readingJudgment = buildCaseReadingJudgment(caseItem);
  const readingRoadmap = buildCaseReadingRoadmap(caseItem);
  const primaryContinuation = buildPrimaryContinuation(caseItem);
  const fileEntryNote = buildMissingPdfNote({ hasPdf, hasWord });
  const leadText = readingJudgment.about;

  const metaRows = [
    ["法院", caseItem.courtName || "-"],
    ["案由", caseItem.causePath || caseItem.causeFocus || "-"],
    ["裁判日期", caseItem.judgmentDate || "-"],
    ["文书类型", caseItem.docType || "-"],
    ["审理程序", caseItem.procedure || "-"],
    ["省份", caseItem.province || "-"],
    ["裁判结果", caseItem.result || "-"],
  ];

  const jumpLinks = [
    { href: "#case-reading-judgment", label: "导读判断" },
    { href: "#case-basic-info", label: "基本信息" },
    { href: "#case-summary", label: "案例摘要" },
  ];
  if (hasPdf) {
    jumpLinks.push({ href: "#case-preview", label: "PDF 预览" });
  }

  return (
    <main className="showcase-page case-detail-page">
      <TopNav user={user} items={navItems} />

      <div className={`page-wrap fade-in case-detail-shell${hasPdf ? " has-pdf" : " is-compact"}`}>
        <div className="case-detail-back-row">
          <Link className="btn btn-ghost case-detail-back-btn" href="/cases">
            ← 返回案例检索
          </Link>
        </div>

        <section className="glass case-detail-hero">
          <div className="case-detail-hero-band">
            {caseItem.causeL1 ? <span className="tag tag-accent">{caseItem.causeL1}</span> : null}
            {caseItem.causeL2 ? <span className="tag">{caseItem.causeL2}</span> : null}
            {caseItem.causeL3 ? <span className="tag">{caseItem.causeL3}</span> : null}
            {caseItem.result ? <span className="tag">{caseItem.result}</span> : null}
          </div>

          <div className="case-detail-hero-main">
            <div className="case-detail-main-copy">
              <p className="case-detail-kicker">案例导读判断</p>
              <h1 className="case-detail-title">{caseItem.title}</h1>
              <p className="case-detail-meta-line">
                {caseItem.caseNumber || "案号待补充"} · {caseItem.courtName || "法院待补充"} · {caseItem.judgmentDate || "日期待补充"}
              </p>
              <p className="case-detail-lead">{leadText}</p>

              <div id="case-reading-judgment" className="case-reading-judgment-grid">
                <article className="case-reading-judgment-card">
                  <span className="case-reading-judgment-label">这案子在讲什么</span>
                  <strong>{coreDispute || "先从案由与摘要建立案件判断。"}</strong>
                  <p>{readingJudgment.about}</p>
                </article>

                <article className="case-reading-judgment-card is-emphasis">
                  <span className="case-reading-judgment-label">为什么值得读</span>
                  <strong>{outcomeHeadline || "先看摘要再决定是否精读"}</strong>
                  <p>{readingJudgment.whyRead}</p>
                </article>

                <article className="case-reading-judgment-card">
                  <span className="case-reading-judgment-label">是否继续进入研习</span>
                  <strong>先判断，再继续</strong>
                  <p>{readingJudgment.shouldContinue}</p>
                </article>
              </div>
            </div>

            <aside className="case-detail-action-card">
              <div className="case-detail-action-copy">
                <span className="section-eyebrow">继续判断</span>
                <h2>{primaryContinuation.label}</h2>
                <p>{primaryContinuation.description}</p>
              </div>

              <div className="case-detail-action-row">
                <Link className="btn btn-accent case-detail-primary-action" href={primaryContinuation.href}>
                  {primaryContinuation.label}
                </Link>

                {hasPdf ? (
                  <Link className="btn btn-primary case-detail-secondary-action" href={`/pdfs/${encodeURIComponent(pdfFileName)}`} target="_blank" rel="noreferrer">
                    新窗口打开 PDF
                  </Link>
                ) : (
                  <button className="btn btn-primary case-detail-secondary-action" type="button" disabled>
                    PDF 预览待补充
                  </button>
                )}

                {hasWord ? (
                  <Link className="btn btn-outline case-detail-secondary-action" href={`/words/${encodeURIComponent(wordFileName)}`} target="_blank" rel="noreferrer">
                    打开 Word 原文
                  </Link>
                ) : (
                  <button className="btn btn-outline case-detail-secondary-action" type="button" disabled>
                    Word 原文待补充
                  </button>
                )}
              </div>

              <div className="case-detail-action-note-box">
                <strong>{fileEntryNote.title}</strong>
                <p>{fileEntryNote.body}</p>
              </div>
            </aside>
          </div>
        </section>

        <section className="glass-sm case-reading-roadmap">
          <div className="case-reading-roadmap-head">
            <div>
              <h2>三步完成导读判断</h2>
              <p>先看争议，再看裁判结论与摘要，最后决定是否继续进入案例研习。</p>
            </div>
            <div className="case-reading-roadmap-links">
              {jumpLinks.map((item) => (
                <a key={item.href} className="case-anchor-chip" href={item.href}>
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          <div className="case-reading-roadmap-grid">
            {readingRoadmap.map((item) => (
              <article key={item.id} className="case-reading-step-card">
                <span className="case-reading-step-index">{item.id}</span>
                <div className="case-reading-step-copy">
                  <strong className="case-reading-step-title">{item.title}</strong>
                  <p className="case-reading-step-desc">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <div className="case-detail-grid">
          <section id="case-basic-info" className="glass-sm case-detail-panel">
            <div className="case-detail-section-head">
              <div>
                <h2>基本信息</h2>
                <p>用法院、案由和裁判结果补齐背景，帮助你判断这份裁判的适读范围。</p>
              </div>
            </div>

            <div className="case-top-focus-grid">
              <article className="case-focus-card">
                <span className="case-focus-label">核心争议</span>
                <strong>{coreDispute || "待补充"}</strong>
              </article>
              <article className="case-focus-card is-outcome">
                <span className="case-focus-label">裁判结论</span>
                <strong>{outcomeHeadline || caseItem.resultText || "裁判结论待补充。"}</strong>
              </article>
            </div>

            <div className="case-meta-grid">
              {metaRows.map(([label, value]) => (
                <article key={label} className="case-meta-item">
                  <span className="case-meta-label">{label}</span>
                  <strong className="case-meta-value">{value}</strong>
                </article>
              ))}
            </div>

            {(caseItem.laws || []).length ? (
              <div className="case-laws-section">
                <p className="case-laws-title">关联法条</p>
                <div className="case-laws-row">
                  {(caseItem.laws || []).map((lawItem) => (
                    <Link
                      key={`${lawItem.law}-${lawItem.article}`}
                      href={`/cases?lawName=${encodeURIComponent(lawItem.law)}&lawArticle=${encodeURIComponent(lawItem.article)}`}
                      className="tag case-law-chip"
                    >
                      {lawItem.displayLaw || formatLawNameForDisplay(lawItem.law) || lawItem.law}
                      {lawItem.article ? ` ${lawItem.article}` : ""}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          <section id="case-summary" className="glass-sm case-detail-panel">
            <div className="case-detail-section-head">
              <div>
                <h2>案例摘要</h2>
                <p>通过摘要把握案件事实、裁判理由与是否继续细读的依据。</p>
              </div>
            </div>

            <div className="case-summary-wrap">
              {summaryView.paragraphs.length ? (
                summaryView.paragraphs.map((line, index) => <p key={`${index}-${line.slice(0, 12)}`}>{line}</p>)
              ) : (
                <p>当前暂无摘要。</p>
              )}
            </div>

            <div className="case-summary-callout">
              <strong>导读提示</strong>
              <p>若摘要已足以回答你的问题，可先停留在此；若仍想核对论证过程，再进入案例研习或原文。</p>
            </div>

            <div className="case-outcome-box case-detail-outcome-box">
              <span className="case-outcome-label">裁判结论</span>
              <p>{outcomeHeadline || caseItem.resultText || "裁判结论待补充。"}</p>
            </div>
          </section>
        </div>

        {hasPdf ? (
          <CasePdfDisclosure fileUrl={`/pdfs/${encodeURIComponent(pdfFileName)}`} fileName={pdfFileName} />
        ) : (
          <section className="card case-detail-empty-panel">
            <strong className="case-detail-empty-title">{fileEntryNote.title}</strong>
            <p className="case-detail-empty-text">{fileEntryNote.body}</p>
          </section>
        )}
      </div>
    </main>
  );
}
