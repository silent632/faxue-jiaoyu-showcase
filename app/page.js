import Link from "next/link";
import ShowcaseVideoLink from "@/components/showcase-video-link";
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
  const homeVideoBlock = content.homeVideoBlock;
  const trendPanels = content.impactDashboard?.trendPanels ?? [];
  const reviewHighlights = [
    "平台运行、课程建设与案例研习入口已形成连续展示。",
    "案例检索、详情页、研习工作台与 PDF 原文保持同一路径。",
    "课程视频与课程体系补充呈现课堂组织与建设背景。",
  ];
  const consoleLedger = [
    {
      label: "首页重点",
      value: "运行指标、覆盖范围与核心入口集中呈现。",
    },
    {
      label: "案例链路",
      value: "详情页、研习页与 PDF 原文保持连通。",
    },
    {
      label: "课程支撑",
      value: "课程视频与课程体系补充呈现建设背景。",
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
      eyebrow: "案例链路",
      title: "案例检索、导读判断与研习工作台已打通",
      description: "案例检索、详情页、研习工作台与 PDF 原文已连通。",
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
      label: "访问链路",
      value: "检索 -> 详情 -> 研习 -> PDF",
    },
  ];

  return (
    <main className="showcase-page">
      <TopNav user={user} items={content.nav} />

      <div className="showcase-page-body">
        <section className="homepage-review-console" aria-label="首页总览">
          <div className="homepage-console-main showcase-card">
            <div className="homepage-console-status">
              <p className="showcase-hero-kicker">平台首页</p>
              <h1>{content.homeDashboard.hero.title}</h1>
              <p className="showcase-hero-subtitle">{content.homeDashboard.hero.summary}</p>
              <p className="showcase-hero-brief">首页集中呈现运行指标、覆盖范围与核心入口。</p>
            </div>

            <div className="homepage-console-meta">
              <div className="homepage-console-ledger" aria-label="首页概览">
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
              <span className="showcase-section-eyebrow">快速入口</span>
              <h2>从首页直达案例检索、研习工作台与成效展示</h2>
              <p>核心页面与样本入口集中在同一列。</p>
            </div>

            <div className="homepage-validation-summary">
              <strong>访问顺序</strong>
              <p>案例检索、详情页、研习工作台与 PDF 原文已连通。</p>
            </div>

            <div className="homepage-validation-links">
              <Link href="/cases" className="homepage-validation-link">
                <span>案例检索</span>
                <strong>打开案例检索工作台</strong>
              </Link>
              <Link href={studyHref} className="homepage-validation-link">
                <span>研习工作台</span>
                <strong>查看结构化研习页面</strong>
              </Link>
              <Link href="/impact" className="homepage-validation-link">
                <span>成效展示</span>
                <strong>浏览成效展示总览</strong>
              </Link>
            </div>
          </aside>
        </section>

        <section className="homepage-review-ledger showcase-card" aria-label="首页编号摘要">
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
              <h2>运行、覆盖与案例链路在此集中列出</h2>
              <p>可先查看运行趋势、应用覆盖与核心页面入口。</p>
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

        <section className="homepage-video-block showcase-card" aria-label="课程视频展示">
          <div className="homepage-band-head">
            <span className="showcase-section-eyebrow">课程视频</span>
            <h2>{homeVideoBlock.title}</h2>
            <p>{homeVideoBlock.description}</p>
          </div>

          <div className="homepage-video-featured">
            <div className="homepage-video-cover homepage-video-cover-featured">
              <span className="homepage-video-cover-label">{homeVideoBlock.featured.label}</span>
              <strong>{homeVideoBlock.featured.title}</strong>
              <p>{homeVideoBlock.featured.summary}</p>
            </div>

            <article className="homepage-video-featured-card">
              <span className="showcase-card-eyebrow">重点观看</span>
              <strong>{homeVideoBlock.featured.title}</strong>
              <p>{homeVideoBlock.featured.summary}</p>
              <p className="homepage-video-purpose">{homeVideoBlock.featured.purpose}</p>
              <ShowcaseVideoLink
                href={homeVideoBlock.featured.href}
                external={homeVideoBlock.featured.external}
                className="homepage-video-link"
              >
                点击观看
              </ShowcaseVideoLink>
            </article>
          </div>

          <div className="homepage-video-grid">
            {homeVideoBlock.supporting.map((item) => (
              <article key={item.slug} className="homepage-video-card">
                <div className="homepage-video-cover">
                  <span className="homepage-video-cover-label">{item.label}</span>
                  <strong>{item.title}</strong>
                  <p>{item.summary}</p>
                </div>

                <div className="homepage-video-card-copy">
                  <span className="showcase-card-eyebrow">课程视频</span>
                  <strong>{item.title}</strong>
                  <p>{item.purpose}</p>
                  <ShowcaseVideoLink href={item.href} external={item.external} className="homepage-video-link">
                    点击观看
                  </ShowcaseVideoLink>
                </div>
              </article>
            ))}
          </div>

          {homeVideoBlock.segmented ? (
            <div className="homepage-video-subgroup">
              <div className="homepage-video-subgroup-head">
                <span className="showcase-card-eyebrow">分段课程视频</span>
                <strong>{homeVideoBlock.segmented.title}</strong>
                <p>{homeVideoBlock.segmented.description}</p>
              </div>

              <div className="homepage-video-grid">
                {homeVideoBlock.segmented.items.map((item) => (
                  <article key={item.slug} className="homepage-video-card">
                    <div className="homepage-video-cover">
                      <span className="homepage-video-cover-label">{item.label}</span>
                      <strong>{item.title}</strong>
                      <p>{item.summary}</p>
                    </div>

                    <div className="homepage-video-card-copy">
                      <span className="showcase-card-eyebrow">课程视频</span>
                      <strong>{item.title}</strong>
                      <p>{item.purpose}</p>
                      <ShowcaseVideoLink href={item.href} external={item.external} className="homepage-video-link">
                        点击观看
                      </ShowcaseVideoLink>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        <section className="homepage-audit-entry-grid showcase-card" aria-label="核心入口">
          <div className="homepage-band-head">
            <span className="showcase-section-eyebrow">更多入口</span>
            <h2>案例检索、样本案例与研习工作台保持同一条进入路径</h2>
            <p>从首页可继续进入案例检索、代表样本与结构化研习页面。</p>
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
                <strong>直接进入研习工作台</strong>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
