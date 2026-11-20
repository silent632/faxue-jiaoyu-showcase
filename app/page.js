import { loadCourseTasks } from "@/lib/content/course-tasks.js";
import Link from "next/link";
import HomeContinueCard from "@/components/home-continue-card";
import ShowcaseNav from "@/components/showcase-nav";
import { loadShowcaseCases } from "@/lib/showcase-cases";
import { buildShowcaseContent } from "@/lib/showcase-content";

export default async function HomePage() {
  const content = buildShowcaseContent();
  const cases = await loadShowcaseCases();
  const metrics = content.metrics ?? {};
  const impactSections = content.impact?.sections ?? [];
  const impactLinks = [
    { href: "/courses/", label: "查看课程安排" },
    { href: "/cases/case-0012/study/", label: "体验案例研习" },
    { href: "/cases/", label: "浏览案例库" },
    { href: "/courses/course-period-01/#course-materials", label: "查看课内材料" },
  ];
  const homeCaseIndex = cases.map((item) => ({
    id: item.id,
    title: item.title,
    caseNumber: item.caseNumber,
  }));

  const pillars = [
    {
      title: "课程认知",
      desc: "八期递进式课程，从案例检索到程序正义、数字治理与智能治理，配套双师视频与四类课程材料。",
      href: "/courses",
      action: "进入课程体系",
    },
    {
      title: "法理知识",
      desc: "从知识图谱选择章节，复习法的价值、法律关系、法律方法等概念，并查找对应的案例。",
      href: "/knowledge",
      action: "打开知识图谱",
    },
    {
      title: "案例研习",
      desc: "按案由、年份、法院层级和法理知识检索裁判文书，完成事实梳理、争点识别与法理分析。",
      href: "/cases",
      action: "进入案例检索",
    },
  ];

  const quickLinks = [
    { href: "/courses/", label: "选一期课程", desc: "打开课程视频，跟着本期问题阅读主案例和配套材料。" },
    { href: "/knowledge/", label: "复习相关法理", desc: "在知识图谱里找概念，沿关联问题进入裁判文书。" },
    { href: "/cases/", label: "阅读裁判文书", desc: "在研习页一边读原文、一边写分析。" },
    { href: "/archive/", label: "继续未完成的研习", desc: "从个人中心找回笔记、继续写作或导出备份。" },
  ];

  return (
    <main className="showcase-page">
      <ShowcaseNav items={content.nav} />

      <div className="showcase-page-body">
        {/* Hero */}
        <section className="showcase-card homepage-hero" aria-label="平台概览">
          <div className="homepage-console-main">
            <div className="homepage-console-status">
              <p className="showcase-hero-kicker">一核 · 两翼 · 三阶 · 六能 · 双环</p>
              <h1>裁判文书研习平台</h1>
              <p className="showcase-hero-subtitle">
                从一节课或一件案例开始。读裁判原文、查法条，写下自己的判断。
              </p>
              <Link className="home-guide-link" href="/help/guide/">查看使用指南 →</Link>
            </div>

            <div className="homepage-console-kpis" aria-label="平台规模">
              {[metrics.caseCount, metrics.coursePeriods, metrics.registeredUsers, metrics.totalVideoPlays]
                .filter(m => m && m.status !== "unverified")
                .map((m) => (
                  <article key={m.label} className="homepage-console-kpi">
                    <strong>{m.value}</strong>
                    <span>{m.label}</span>
                  </article>
                ))}
            </div>
          </div>
        </section>

        <HomeContinueCard courseTasks={loadCourseTasks()}
          caseIndex={homeCaseIndex}
          copy={content.learningLoop.homeContinue}
          userSid="public-showcase"
        />

        {/* 三阶递进 */}
        <section className="homepage-results-grid stagger-in" aria-label="三阶递进">
          {pillars.map((p, i) => (
            <Link key={p.title} href={p.href} className="homepage-result-card showcase-card">
              <div className="homepage-pillar-top">
                <span className="homepage-pillar-ordinal">{String(i + 1).padStart(2, '0')}</span>
              </div>
              <strong>{p.title}</strong>
              <p>{p.desc}</p>
              <span className="homepage-video-link">{p.action}</span>
            </Link>
          ))}
        </section>

        <section className="showcase-card home-path" aria-labelledby="home-path-title">
          <h2 id="home-path-title">怎样使用平台</h2>
          <div className="homepage-quick-links">
            {quickLinks.map((item, i) => (
              <Link key={item.href} href={item.href} className="homepage-quick-link">
                <span className="homepage-quick-step" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <strong>{item.label}</strong>
                <p>{item.desc}</p>
              </Link>
            ))}
          </div>
          <div className="console-actions home-guide-actions"><Link className="btn btn-outline" href="/resources/laws/">查找法条</Link><Link className="btn btn-outline" href="/help/guide/">阅读完整使用指南</Link></div>
        </section>

        {/* 教学成果 */}
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
                {impactLinks[i] && <Link className="impact-proof-link" href={impactLinks[i].href}>{impactLinks[i].label} →</Link>}
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
