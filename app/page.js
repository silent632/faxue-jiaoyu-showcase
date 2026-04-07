import Link from "next/link";
import ShowcaseOperationsBand from "@/components/showcase-operations-band";
import ShowcaseTrendPanel from "@/components/showcase-trend-panel";
import TopNav from "@/components/top-nav";
import { getPublicShowcaseUser } from "@/lib/public-showcase-user.js";
import { getShowcaseCanonicalStudyHref, loadShowcaseCases } from "@/lib/showcase-cases";
import { buildShowcaseContent } from "@/lib/showcase-content";

export default async function HomePage() {
  const content = buildShowcaseContent();
  const user = getPublicShowcaseUser();
  const studyHref = getShowcaseCanonicalStudyHref();
  const cases = await loadShowcaseCases();
  const quickKpis = (content.homeDashboard?.kpis ?? []).slice(0, 3);
  const featuredCases = cases.slice(0, 3);
  const coverageCards = content.impactDashboard?.coverageCards ?? [];
  const trendPanels = content.impactDashboard?.trendPanels ?? [];
  const reviewHighlights = [
    "先确认平台是否真实运行，再查看课程与资源如何支撑教学改革。",
    "案例检索、详情页、研习工作台与 PDF 原文保持同一条抽查链路。",
    "课程视频与课程体系作为补充支撑材料，供专家继续核验。",
  ];
  const consoleLedger = [
    {
      label: "审阅定位",
      value: "先看运行指标，再进入案例抽查。",
    },
    {
      label: "核验重点",
      value: "详情页、研习页与 PDF 原文保持连通。",
    },
    {
      label: "支撑材料",
      value: "课程视频与课程体系用于补充说明。",
    },
  ];
  const evidenceCards = [
    {
      eyebrow: "运行台账",
      title: trendPanels[0]?.value || "运行指标持续更新",
      description: trendPanels[0]?.detail || "围绕访问、活跃与课程迭代形成连续运行轨迹。",
      metric: `${trendPanels[0]?.metricLabel || "指标"} · ${trendPanels[0]?.metricValue || "更新中"}`,
    },
    {
      eyebrow: "覆盖证明",
      title: coverageCards[0]?.title || "教学建设覆盖",
      description: coverageCards[0]?.description || "课程、任务单和评价指标已形成支撑闭环。",
      metric: coverageCards[0]?.coverageValue || "持续扩展",
    },
    {
      eyebrow: "核验路径",
      title: "案例检索、导读判断与研习工作台已打通",
      description: "专家可直接从检索结果抽样进入详情页，再进入研习页与 PDF 原文核查。",
      metric: "检索 -> 详情 -> 研习 -> PDF",
    },
  ];
  const inlineEvidence = [
    {
      label: "运行状态",
      value: trendPanels[0]?.value || "稳定运行",
    },
    {
      label: "覆盖范围",
      value: coverageCards[0]?.coverageValue || "持续扩展",
    },
    {
      label: "核验链路",
      value: "检索 -> 详情 -> 研习 -> PDF",
    },
  ];

  return (
    <main className="showcase-page">
      <TopNav user={user} items={content.nav} />

      <div className="showcase-page-body">
        <section className="homepage-review-console" aria-label="首页审阅总览">
          <div className="homepage-console-main showcase-card">
            <div className="homepage-console-status">
              <p className="showcase-hero-kicker">平台审阅首页</p>
              <h1>{content.homeDashboard.hero.title}</h1>
              <p className="showcase-hero-subtitle">{content.homeDashboard.hero.summary}</p>
              <p className="showcase-hero-brief">首页先看运行、覆盖和抽查入口，再决定进入哪条核验路径。</p>
            </div>

            <div className="homepage-console-meta">
              <div className="homepage-console-ledger" aria-label="首页审阅结论">
                {consoleLedger.map((item) => (
                  <article key={item.label} className="homepage-console-ledger-item">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </article>
                ))}
              </div>

              <div className="homepage-console-kpis" aria-label="首页关键结果">
                {quickKpis.map((item) => (
                  <article key={item.label} className="homepage-console-kpi">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </article>
                ))}
              </div>

              <div className="homepage-console-inline-evidence" aria-label="首屏证据摘要">
                {inlineEvidence.map((item) => (
                  <article key={item.label} className="homepage-console-evidence-chip">
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <aside className="homepage-validation-rail showcase-card">
            <div className="homepage-validation-head">
              <span className="showcase-section-eyebrow">核验入口</span>
              <h2>从首页直接进入案例抽查、研习页和结果总览</h2>
              <p>核验入口集中在同一列，便于抽样查看详情页、研习页与原文材料。</p>
            </div>

            <div className="homepage-validation-summary">
              <strong>建议核验顺序</strong>
              <p>先打开案例检索，任选样本进入详情页，再从详情页继续进入研习工作台和 PDF 原文。</p>
            </div>

            <div className="homepage-validation-links">
              <Link href="/cases" className="homepage-validation-link">
                <span>案例检索</span>
                <strong>进入案例抽查台</strong>
              </Link>
              <Link href={studyHref} className="homepage-validation-link">
                <span>研习工作台</span>
                <strong>检查结构化研习链路</strong>
              </Link>
              <Link href="/impact" className="homepage-validation-link">
                <span>成效展示</span>
                <strong>查看结果核验总览</strong>
              </Link>
            </div>
          </aside>
        </section>

        <section className="homepage-review-ledger showcase-card" aria-label="首页审阅编号结论">
          {reviewHighlights.map((item, index) => (
            <article key={item} className="homepage-review-item">
              <span>{`0${index + 1}`}</span>
              <strong>{item}</strong>
            </article>
          ))}
        </section>

        <section className="homepage-evidence-ledger" aria-label="首页证据总览">
          <div className="homepage-evidence-main">
            <ShowcaseOperationsBand kpis={content.homeDashboard.kpis} className="homepage-review-band" />

            <ShowcaseTrendPanel
              trendSnapshot={content.homeDashboard.trendSnapshot}
              panels={trendPanels}
              className="homepage-review-trend"
            />
          </div>

          <aside className="homepage-evidence-side showcase-card">
            <div className="homepage-band-head">
              <span className="showcase-section-eyebrow">证据索引</span>
              <h2>运行、覆盖与抽查链路在此集中列出</h2>
              <p>进入下层页面前，可先核对运行趋势、应用覆盖和样本核验路径。</p>
            </div>

            <div className="homepage-evidence-stack">
              {evidenceCards.map((item) => (
                <article key={item.title} className="homepage-evidence-card">
                  <span className="showcase-card-eyebrow">{item.eyebrow}</span>
                  <strong>{item.title}</strong>
                  <p>{item.description}</p>
                  <small>{item.metric}</small>
                </article>
              ))}
            </div>
          </aside>
        </section>

        <section className="homepage-audit-entry-grid showcase-card" aria-label="继续核验入口">
          <div className="homepage-band-head">
            <span className="showcase-section-eyebrow">继续核验</span>
            <h2>案例检索、样本案例与研习工作台保持同一条进入路径</h2>
            <p>支持从总览继续进入案例检索、代表样本与结构化研习页面。</p>
          </div>

          <div className="homepage-audit-entry-shell">
            <div className="homepage-audit-entry-list">
              {content.homeEntries.map((item) => (
                <Link key={item.href} href={item.href} className="homepage-audit-entry-card">
                  <span className="showcase-card-eyebrow">{item.label}</span>
                  <strong>{item.description}</strong>
                </Link>
              ))}
            </div>

            <div className="homepage-audit-case-list">
              {featuredCases.map((item) => (
                <Link key={item.id} href={`/cases/${item.id}`} className="homepage-audit-case-card">
                  <span>{item.caseNumber || item.causeFocus || "典型案例"}</span>
                  <strong>{item.title}</strong>
                </Link>
              ))}

              <Link href={studyHref} className="homepage-audit-case-card is-action">
                <span>直接进入</span>
                <strong>直接进入研习工作台，检查结构化研习链路</strong>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
