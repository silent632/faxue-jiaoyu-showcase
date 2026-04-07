import TopNav from "@/components/top-nav";
import CasesWorkspace from "@/components/cases-workspace";
import { getPublicShowcaseUser } from "@/lib/public-showcase-user.js";
import { listPublicShowcaseCases } from "@/lib/public-showcase-cases.js";
import { buildShowcaseContent } from "@/lib/showcase-content";

export default async function CasesPage() {
  const user = getPublicShowcaseUser();
  const navItems = buildShowcaseContent().nav;
  const allCases = await listPublicShowcaseCases();
  const auditMetrics = [
    {
      label: "案例总量",
      value: `${allCases.length} 条`,
    },
    {
      label: "访问链路",
      value: "详情 -> 导读判断 -> 研习 -> PDF",
    },
    {
      label: "检索起点",
      value: "可先从年份、案由开始",
    },
  ];

  return (
    <main className="showcase-page cases-page-shell">
      <TopNav user={user} items={navItems} />
      <section className="page-wrap cases-audit-desk">
        <div className="glass-sm cases-audit-intro">
          <p className="section-eyebrow">案例检索</p>
          <h1>案例检索与原文入口</h1>
          <p>围绕案件检索、详情页与原文入口组织案例浏览与文书阅读。</p>
        </div>

        <div className="cases-audit-metrics">
          {auditMetrics.map((item) => (
            <article key={item.label} className="cases-audit-card">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </div>
      </section>
      <CasesWorkspace cases={allCases} initialFilters={{}} initialSort="date-desc" initialPage={1} />
    </main>
  );
}
