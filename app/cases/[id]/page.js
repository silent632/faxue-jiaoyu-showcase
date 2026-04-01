import Link from "next/link";
import { notFound } from "next/navigation";

import CasePdfDisclosure from "@/components/case-pdf-disclosure";
import TopNav from "@/components/top-nav";
import { buildOutcomeHeadline, formatLawNameForDisplay } from "@/lib/case-presentation.mjs";
import { normalizePublicFileName, publicFileExists } from "@/lib/data/public-files.js";
import { getPublicShowcaseCaseById } from "@/lib/public-showcase-cases.js";
import { getPublicShowcaseUser } from "@/lib/public-showcase-user.js";
import { getShowcaseCaseStaticParams } from "@/lib/showcase-cases";

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
    paragraphs: toParagraphs(caseItem.summary, 3),
  };
}

export async function generateStaticParams() {
  return getShowcaseCaseStaticParams(24);
}

export default async function CaseDetailPage({ params }) {
  const user = getPublicShowcaseUser();
  const { id } = await params;
  const caseItem = await getPublicShowcaseCaseById(id);
  if (!caseItem) notFound();

  const pdfFileName = normalizePublicFileName(caseItem.pdfFile);
  const wordFileName = normalizePublicFileName(caseItem.wordFile);
  const [hasPdf, hasWord] = await Promise.all([publicFileExists("pdfs", pdfFileName), publicFileExists("words", wordFileName)]);

  const summaryView = buildSummaryView(caseItem);
  const outcomeHeadline = buildOutcomeHeadline(caseItem);
  const leadText = outcomeHeadline || summaryView.paragraphs[0] || "先查看摘要，再决定是否继续精读全文。";

  const metaRows = [
    ["法院", caseItem.courtName || "-"],
    ["案由", caseItem.causePath || caseItem.causeFocus || "-"],
    ["裁判日期", caseItem.judgmentDate || "-"],
    ["文书类型", caseItem.docType || "-"],
    ["审理程序", caseItem.procedure || "-"],
    ["省份", caseItem.province || "-"],
    ["裁判结果", caseItem.result || "-"],
  ];

  const readingRoadmap = [
    {
      id: "01",
      title: "基本信息",
      description: "从法院、案由、程序和裁判结果把握案例的基本轮廓。",
    },
    {
      id: "02",
      title: "案例摘要",
      description: "结合摘要进入案件事实与裁判要点，形成后续阅读的整体判断。",
    },
    {
      id: "03",
      title: "原文与研习",
      description: "可继续查看原文、进入研习页面，沿着同一份裁判文书展开深入阅读。",
    },
  ];

  const jumpLinks = [
    { href: "#case-basic-info", label: "基本信息" },
    { href: "#case-summary", label: "案例摘要" },
  ];
  if (hasPdf) {
    jumpLinks.push({ href: "#case-preview", label: "PDF 预览" });
  }

  return (
    <main className="showcase-page case-detail-page">
      <TopNav user={user} />

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
              <p className="case-detail-kicker">案例详情</p>
              <h1 className="case-detail-title">{caseItem.title}</h1>
              <p className="case-detail-meta-line">
                {caseItem.caseNumber || "案号待补充"} · {caseItem.courtName || "法院待补充"} · {caseItem.judgmentDate || "日期待补充"}
              </p>
              <p className="case-detail-lead">{leadText}</p>
            </div>

            <aside className="case-detail-action-card">
              <div className="case-detail-action-copy">
                <span className="section-eyebrow">继续阅读</span>
                <h2>从案例信息进入原文与研习</h2>
                <p>结合摘要、裁判结果与原文入口，可进一步进入研习页面或继续查看完整文书。</p>
              </div>

              <div className="case-detail-action-row">
                <Link className="btn btn-accent" href={`/cases/${caseItem.id}/study`}>
                  进入案例研习
                </Link>

                {hasPdf ? (
                  <Link className="btn btn-primary" href={`/pdfs/${encodeURIComponent(pdfFileName)}`} target="_blank" rel="noreferrer">
                    新窗口打开 PDF
                  </Link>
                ) : (
                  <button className="btn btn-primary" type="button" disabled>
                    暂无 PDF
                  </button>
                )}

                {hasWord ? (
                  <Link className="btn btn-outline" href={`/words/${encodeURIComponent(wordFileName)}`} target="_blank" rel="noreferrer">
                    打开 Word 原文
                  </Link>
                ) : (
                  <button className="btn btn-outline" type="button" disabled>
                    暂无 Word
                  </button>
                )}
              </div>

              <div className="case-detail-action-note-box">
                <strong>阅读提示</strong>
                <p>若原文文件暂未提供，仍可结合摘要、事实与争议焦点继续浏览案例内容。</p>
              </div>
            </aside>
          </div>
        </section>

        <section className="glass-sm case-reading-roadmap">
          <div className="case-reading-roadmap-head">
            <div>
              <h2>案例阅读路径</h2>
              <p>从基本信息、摘要到原文入口，页面围绕同一份文书组织连续的阅读线索。</p>
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
                <p>围绕法院、案由、日期和裁判结果，建立对案件的基本认识。</p>
              </div>
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
                <p>通过摘要把握案件事实、裁判理由与进一步阅读的重点。</p>
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
              <strong>阅读提示</strong>
              <p>可先结合摘要形成初步判断，再进入原文与研习页面继续阅读和分析。</p>
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
            <p className="case-detail-empty-text">当前案例未配置可预览的 PDF 文件，公开展示模式仅保留案例导读与研习入口。</p>
          </section>
        )}
      </div>
    </main>
  );
}
