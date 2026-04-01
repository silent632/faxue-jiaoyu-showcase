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
      title: "先看基本信息",
      description: "先确认法院、案由、程序和裁判结果，判断这是不是你当前要继续研读的案例。",
    },
    {
      id: "02",
      title: "再读案例摘要",
      description: "摘要只负责导读，不直接给出研习答案，方便你先建立自己的阅读预期。",
    },
    {
      id: "03",
      title: "最后决定怎么读原文",
      description: "要快速浏览，就展开详情页预览；要连续精读，就直接进入研习页或打开原始 PDF。",
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
                <span className="section-eyebrow">下一步</span>
                <h2>先判断，再决定怎么继续</h2>
                <p>这页只保留判断信息和动作入口。要精读原文就进入研习页或展开 PDF，不在这里堆过多说明。</p>
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
                <strong>公开展示模式</strong>
                <p>保留真实阅读链路与研习入口；若原文文件未随展示站发布，则会在此处自然降级为只读说明。</p>
              </div>
            </aside>
          </div>
        </section>

        <section className="glass-sm case-reading-roadmap">
          <div className="case-reading-roadmap-head">
            <div>
              <h2>这页怎么用最合适</h2>
              <p>把详情页当成导读页使用，只完成“确认是否值得继续读”这一步。</p>
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
                <p>先看这些关键信息，通常就能判断这是不是你当前要继续研读的案例。</p>
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
                <p>摘要只负责帮你建立阅读预期，不直接代替原文阅读和研习判断。</p>
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
              <strong>导读提醒</strong>
              <p>详情页不会提前放出事实、争点和法理分析参考答案，避免你在真正阅读前被现成结论带着走。</p>
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
