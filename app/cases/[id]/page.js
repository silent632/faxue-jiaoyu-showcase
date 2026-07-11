import Link from "next/link";
import { notFound } from "next/navigation";

import CasePdfDisclosure from "@/components/case-pdf-disclosure";
import ShowcaseNav from "@/components/showcase-nav";
import {
  buildCaseReadingJudgment,
  buildCoreDispute,
  buildMissingPdfNote,
  buildOutcomeHeadline,
  buildPrimaryContinuation,
  formatLawNameForDisplay,
  sanitizeSummaryForReading,
} from "@/lib/case-presentation.mjs";
import { normalizePublicFileName, publicFileExists } from "@/lib/data/public-files.js";
import { getShowcaseCaseById, getShowcaseCaseStaticParams } from "@/lib/showcase-cases";

function compactText(value) {
  return String(value || "")
    .replace(/\r\n?/g, "\n")
    .replace(/　/g, " ")
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

function joinMetaParts(parts = [], fallback = "案例信息以原文为准") {
  const values = parts.map((item) => String(item || "").trim()).filter(Boolean);
  return values.length ? values.join(" · ") : fallback;
}

function buildMetaRows(caseItem) {
  return [
    ["法院", caseItem.courtName],
    ["案由", caseItem.causePath || caseItem.causeFocus],
    ["裁判日期", caseItem.judgmentDate],
    ["文书类型", caseItem.docType],
    ["审理程序", caseItem.procedure],
    ["省份", caseItem.province],
    ["裁判结果", caseItem.result],
  ].filter(([, value]) => String(value || "").trim());
}

export async function generateStaticParams() {
  return getShowcaseCaseStaticParams();
}

export default async function CaseDetailPage({ params }) {
  const { id } = await params;
  const caseItem = await getShowcaseCaseById(id);
  if (!caseItem) notFound();

  const pdfFileName = normalizePublicFileName(caseItem.pdfFile);
  const wordFileName = normalizePublicFileName(caseItem.wordFile);
  const [hasPdf, hasWord] = await Promise.all([publicFileExists("pdfs", pdfFileName), publicFileExists("words", wordFileName)]);

  const summaryView = buildSummaryView(caseItem);
  const coreDispute = buildCoreDispute(caseItem);
  const outcomeHeadline = buildOutcomeHeadline(caseItem);
  const readingJudgment = buildCaseReadingJudgment(caseItem);
  const primaryContinuation = buildPrimaryContinuation(caseItem);
  const fileEntryNote = buildMissingPdfNote({ hasPdf, hasWord });
  const leadText = readingJudgment.about;

  const metaRows = buildMetaRows(caseItem);
  const detailMetaLine = joinMetaParts([caseItem.caseNumber, caseItem.courtName, caseItem.judgmentDate]);

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
      <ShowcaseNav />

      <div className={`page-wrap fade-in case-detail-shell${hasPdf ? " has-pdf" : " is-compact"}`}>
        <div className="case-detail-back-row">
          <Link className="btn btn-ghost case-detail-back-btn" href="/cases">
            ← 返回案例检索
          </Link>
        </div>

        <section className="showcase-card case-detail-hero">
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
              <p className="case-detail-meta-line">{detailMetaLine}</p>
              <p className="case-detail-lead">{leadText}</p>

              {/* Jump links — merged from roadmap */}
              <div className="case-detail-jump-links">
                {jumpLinks.map((item) => (
                  <a key={item.href} className="case-anchor-chip" href={item.href}>
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Reading judgment */}
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

          {/* Action bar */}
          <div className="case-detail-action-card">
            <div className="case-detail-action-copy">
              <span className="section-eyebrow">继续判断</span>
              <strong>{primaryContinuation.label}</strong>
            </div>

            <div className="case-detail-action-row">
              <Link className="btn btn-accent case-detail-primary-action" href={primaryContinuation.href}>
                {primaryContinuation.label}
              </Link>

              {hasPdf ? (
                <a className="btn btn-primary case-detail-secondary-action" href={`/pdfs/${encodeURIComponent(pdfFileName)}`} target="_blank" rel="noreferrer">
                  新窗口打开 PDF
                </a>
              ) : null}

              {hasWord ? (
                <a className="btn btn-outline case-detail-secondary-action" href={`/words/${encodeURIComponent(wordFileName)}`} target="_blank" rel="noreferrer">
                  打开 Word 原文
                </a>
              ) : null}
            </div>
          </div>
        </section>

        <div className="case-detail-grid">
          <section id="case-basic-info" className="showcase-card case-detail-panel">
            <div className="case-detail-section-head">
              <h2>基本信息</h2>
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

          <section id="case-summary" className="showcase-card case-detail-panel">
            <div className="case-detail-section-head">
              <h2>案例摘要</h2>
            </div>

            <div className="case-summary-wrap">
              {summaryView.paragraphs.length ? (
                summaryView.paragraphs.map((line, index) => <p key={`${index}-${line.slice(0, 12)}`}>{line}</p>)
              ) : (
                <p>可结合原文入口继续阅读全文。</p>
              )}
            </div>

            <div className="case-summary-callout">
              <strong>导读提示</strong>
              <p>若摘要已足以回答你的问题，可先停留在此；若仍想核对论证过程，再进入案例研习或原文。</p>
            </div>
          </section>
        </div>

        {hasPdf ? (
          <CasePdfDisclosure fileUrl={`/pdfs/${encodeURIComponent(pdfFileName)}`} fileName={pdfFileName} />
        ) : (
          <section className="showcase-card case-detail-empty-panel">
            <strong className="case-detail-empty-title">{fileEntryNote.title}</strong>
            <p className="case-detail-empty-text">{fileEntryNote.body}</p>
          </section>
        )}
      </div>
    </main>
  );
}
