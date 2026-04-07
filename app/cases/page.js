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
      label: "核验链路",
      value: "详情 -> 导读判断 -> 研习 -> PDF",
    },
    {
      label: "抽查建议",
      value: "先按年份、案由缩小范围",
    },
  ];

  return (
    <main className="showcase-page cases-page-shell">
      <TopNav user={user} items={navItems} />
      <section className="page-wrap cases-audit-desk">
        <div className="glass-sm cases-audit-intro">
          <p className="section-eyebrow">案例抽查台</p>
          <h1>案例抽查与原文核验</h1>
          <p>围绕案件检索、详情页与原文入口组织抽查流程，服务专家快速定位样本并继续核验。</p>
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
