import Link from "next/link";
import ShowcaseNav from "@/components/showcase-nav";
import { getShowcaseCanonicalStudyHref, loadShowcaseCases } from "@/lib/showcase-cases";
import { buildShowcaseContent } from "@/lib/showcase-content";

/** 按标签稀缺度精选案例：指导性案例 > 自由裁量 > 公共利益 > 价值冲突 */
function pickFeaturedCases(cases, limit = 3) {
  const priority = ["guiding-case", "discretion-explicit", "public-interest", "value-tension"];
  const picked = [];
  const pickedIds = new Set();

  for (const tag of priority) {
    for (const item of cases) {
      if (picked.length >= limit) return picked;
      if (pickedIds.has(item.id)) continue;
      if ((item.jurisprudenceTags || []).includes(tag)) {
        picked.push(item);
        pickedIds.add(item.id);
      }
    }
  }

  for (const item of cases) {
    if (picked.length >= limit) break;
    if (!pickedIds.has(item.id)) {
      picked.push(item);
      pickedIds.add(item.id);
    }
  }
  return picked;
}

function buildImpactDataPanels(content) {
  const trendPanels = content.impactDashboard?.trendPanels ?? [];
  const coverageCards = content.impactDashboard?.coverageCards ?? [];
  return [
    ...trendPanels.map((panel) => ({
      key: panel.title,
      label: panel.title,
      value: panel.metricValue || panel.value,
      valueNote: panel.metricLabel || "",
      headline: panel.value,
      desc: panel.detail,
      percent: null,
    })),
    ...coverageCards.map((panel) => ({
      key: panel.title,
      label: panel.title,
      value: panel.coverageValue,
      valueNote: "覆盖率",
      headline: "",
      desc: panel.description,
      percent: Number.parseFloat(panel.coverageValue) || null,
    })),
  ];
}

export default async function HomePage() {
  const content = buildShowcaseContent();
  const studyHref = getShowcaseCanonicalStudyHref();
  const cases = await loadShowcaseCases();
  const metrics = content.metrics ?? {};
  const featuredCases = pickFeaturedCases(cases);
  const homeVideoBlock = content.homeVideoBlock;
  const impactSections = content.impact?.sections ?? [];
  const dataPanels = buildImpactDataPanels(content);

  const pillars = [
    {
      stage: "第一阶",
      title: "课程认知",
      desc: "八期递进式课程，从案例检索到程序正义、数字治理与智能治理，配套双师视频与四类课程材料。",
      href: "/courses",
      action: "进入课程体系",
      metric: metrics.coursePeriods,
    },
    {
      stage: "第二阶",
      title: "案例研习",
      desc: "210+ 典型裁判文书，按案由、年份、法院层级与法条检索，在研习工作台完成事实梳理、争点提炼与法理分析。",
      href: "/cases",
      action: "进入案例检索",
      metric: metrics.caseCount,
    },
    {
      stage: "第三阶",
      title: "仿真实验",
      desc: "六大实验模块覆盖法律推理、争点论证、规范检索、法律解释、价值衡量与裁判标注，从案例出发动手产出。",
      href: "/experiments",
      action: "进入仿真实验",
      metric: { label: "实验模块", value: "6项" },
    },
  ];

  const quickLinks = [
    { href: "/cases", label: "案例检索", desc: "按案由、年份、法院层级检索 210+ 典型裁判文书" },
    { href: studyHref, label: "研习工作台", desc: "分屏阅读原文，完成事实梳理与法理分析" },
    { href: "/experiments", label: "仿真实验", desc: "六大模块覆盖法律推理全流程，动手产出" },
  ];

  return (
    <main className="showcase-page">
      <ShowcaseNav items={content.nav} />

      <div className="showcase-page-body">
        {/* Hero */}
        <section className="showcase-card" aria-label="平台概览">
          <div className="homepage-console-main">
            <div className="homepage-console-status">
              <p className="showcase-hero-kicker">一核 · 两翼 · 三阶 · 六能 · 双环</p>
              <h1>裁判文书研习平台</h1>
              <p className="showcase-hero-subtitle">
                将课程认知、案例研习与仿真实验组织为一条递进式学习路径，
                在同一平台内完成从阅读理解到动手产出的全过程。
              </p>
            </div>

            <div className="homepage-console-kpis" aria-label="平台规模">
              {[metrics.caseCount, metrics.coursePeriods, metrics.registeredUsers, metrics.totalVideoPlays]
                .filter(Boolean)
                .map((m) => (
                  <article key={m.label} className="homepage-console-kpi">
                    <strong>{m.value}</strong>
                    <span>{m.label}</span>
                  </article>
                ))}
            </div>
          </div>
        </section>

        {/* 三阶递进 */}
        <section className="homepage-results-grid stagger-in" aria-label="三阶递进">
          {pillars.map((p, i) => (
            <Link key={p.title} href={p.href} className="homepage-result-card showcase-card">
              <div className="homepage-pillar-top">
                <span className="homepage-pillar-ordinal">{String(i + 1).padStart(2, '0')}</span>
                <span className="showcase-card-eyebrow">{p.stage}</span>
              </div>
              <strong>{p.title}</strong>
              <div className="homepage-pillar-stat">
                <span className="homepage-pillar-metric">{p.metric?.value ?? ""}</span>
                <span className="homepage-pillar-metric-label">{p.metric?.label ?? ""}</span>
              </div>
              <p>{p.desc}</p>
              <span className="homepage-video-link">{p.action}</span>
            </Link>
          ))}
        </section>

        {/* 课程纵览 */}
        <section className="homepage-video-block showcase-card" aria-label="课程纵览">
          <div className="homepage-band-head">
            <span className="showcase-section-eyebrow">课程视频</span>
            <h2>{homeVideoBlock.title}</h2>
            <p>{homeVideoBlock.description}</p>
          </div>

          <div className="homepage-video-stage-grid">
            {homeVideoBlock.phaseGuide.map((item, i) => (
              <article key={item.slug} className="homepage-video-stage-card">
                <div className="homepage-video-stage-head">
                  <span className="homepage-video-stage-badge">阶段 {i + 1}</span>
                </div>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </article>
            ))}
          </div>

          <div className="homepage-course-cta">
            <div className="homepage-course-cta-copy">
              <strong>{homeVideoBlock.periods.length} 期课程</strong>
              <span>双师视频与配套材料已就绪</span>
            </div>
            <Link href="/courses" className="btn btn-primary">查看全部课程</Link>
          </div>
        </section>

        {/* 快速开始 + 精选案例 */}
        <section className="showcase-card" aria-label="快速开始">
          <div className="homepage-band-head">
            <span className="showcase-section-eyebrow">研习路径</span>
            <h2>快速开始</h2>
            <p>三个入口覆盖从检索到研习到实验的完整路径。</p>
          </div>

          <div className="homepage-start-grid">
            <div className="homepage-quick-links">
              {quickLinks.map((item, i) => (
                <Link key={item.href} href={item.href} className="homepage-quick-link">
                  <span className="homepage-quick-step">{String(i + 1).padStart(2, '0')}</span>
                  <div className="homepage-quick-body">
                    <strong>{item.label}</strong>
                    <p>{item.desc}</p>
                  </div>
                  <span className="homepage-quick-arrow">→</span>
                </Link>
              ))}
            </div>

            {featuredCases.length > 0 && (
              <div className="homepage-featured-cases">
                <div className="homepage-featured-head">
                  <span className="showcase-card-eyebrow">精选案例</span>
                </div>
                {featuredCases.map((item) => (
                  <Link key={item.id} href={`/cases/${item.id}`} className="homepage-featured-case">
                    <span className="tag">{item.causeFocus || "典型案例"}</span>
                    <strong>{item.title}</strong>
                    <span className="homepage-featured-case-meta">
                      {item.courtName} · {item.caseNumber}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 成效展示：运行数据 */}
        {dataPanels.length > 0 && (
          <section className="showcase-card impact-data" aria-label="运行数据">
            <div className="impact-data-head">
              <p className="section-eyebrow">成效展示</p>
              <h2>平台运行趋势与建设覆盖</h2>
            </div>

            <div className="impact-data-grid">
              {dataPanels.map((panel) => (
                <article key={panel.key} className="impact-data-card">
                  <span className="impact-data-card-label">{panel.label}</span>
                  <div className="impact-data-card-figure">
                    <strong className="impact-data-card-number">{panel.value}</strong>
                    {panel.valueNote ? <span className="impact-data-card-unit">{panel.valueNote}</span> : null}
                  </div>
                  {panel.percent !== null ? (
                    <div className="impact-data-bar" role="presentation">
                      <span className="impact-data-bar-fill" style={{ width: `${Math.min(100, panel.percent)}%` }} />
                    </div>
                  ) : null}
                  {panel.headline ? <strong className="impact-data-card-headline">{panel.headline}</strong> : null}
                  <p className="impact-data-card-desc">{panel.desc}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* 成效展示：成果明细 */}
        <section className="showcase-card impact-proof" aria-label="成果明细">
          <div className="impact-proof-head">
            <p className="section-eyebrow">教学成果</p>
            <h2>四个维度的教学改革成果</h2>
          </div>

          <div className="impact-proof-grid">
            {impactSections.map((item, i) => (
              <article key={item.title} className="impact-proof-item">
                <div className="impact-proof-item-head">
                  <span className="impact-proof-item-marker">{String(i + 1).padStart(2, '0')}</span>
                  <span className="impact-proof-item-label">{item.title}</span>
                </div>
                <strong className="impact-proof-item-intro">{item.intro}</strong>
                <p className="impact-proof-item-point">{item.points[0]}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
