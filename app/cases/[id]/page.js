import Link from "next/link";
import { notFound } from "next/navigation";

import ShowcaseNav from "@/components/showcase-nav";
import ShowcaseSection from "@/components/showcase-section";
import { buildShowcaseContent } from "@/lib/showcase-content";
import { getShowcaseCaseById, getShowcaseCaseStaticParams } from "@/lib/showcase-cases";

function formatDate(dateString) {
  if (!dateString) return "日期未注明";
  return dateString;
}

export async function generateStaticParams() {
  return getShowcaseCaseStaticParams(24);
}

export default async function CaseDetailPage({ params }) {
  const { id } = await params;
  const caseItem = await getShowcaseCaseById(id);

  if (!caseItem) notFound();

  const content = buildShowcaseContent();

  return (
    <main className="showcase-page">
      <ShowcaseNav items={content.nav} />

      <div className="showcase-page-body">
        <section className="showcase-page-head">
          <p className="showcase-page-kicker">案例详情</p>
          <h1>{caseItem.title}</h1>
          <p>{caseItem.caseNumber || "案号未注明"} · {caseItem.courtName || "法院信息未注明"} · {formatDate(caseItem.judgmentDate)}</p>
        </section>

        <div className="case-meta-grid">
          <article className="showcase-card">
            <span className="case-meta-label">案由</span>
            <strong>{caseItem.causePath || caseItem.causeFocus || "未注明"}</strong>
          </article>
          <article className="showcase-card">
            <span className="case-meta-label">裁判结果</span>
            <strong>{caseItem.resultText || caseItem.result || "未注明"}</strong>
          </article>
          <article className="showcase-card">
            <span className="case-meta-label">审理程序</span>
            <strong>{caseItem.procedure || "未注明"}</strong>
          </article>
          <article className="showcase-card">
            <span className="case-meta-label">文书类型</span>
            <strong>{caseItem.docType || "未注明"}</strong>
          </article>
        </div>

        <div className="stack-grid">
          <ShowcaseSection title="案例摘要" description="保留原始源数据中的教学导读摘要，便于公开浏览与后续研习。">
            <p className="case-detail-copy">{caseItem.summary || "暂无摘要信息。"}</p>
          </ShowcaseSection>

          <ShowcaseSection title="事实要点" description="聚焦课堂研习中的事实梳理与情境理解。">
            <p className="case-detail-copy">{caseItem.refFact || "暂无事实要点。"}</p>
          </ShowcaseSection>

          <ShowcaseSection title="争议焦点" description="用于组织课堂提问与小组讨论。">
            <p className="case-detail-copy">{caseItem.refIssue || "暂无争议焦点。"}</p>
          </ShowcaseSection>

          <ShowcaseSection title="法理要点" description="帮助学生将事实、规范与结论连接起来。">
            <p className="case-detail-copy">{caseItem.refLegal || "暂无法理要点。"}</p>
          </ShowcaseSection>

          <ShowcaseSection title="相关法条" description="展示系统整理的规范引用。">
            <div className="case-laws">
              {Array.isArray(caseItem.laws) && caseItem.laws.length > 0 ? (
                caseItem.laws.map((law) => (
                  <article key={`${law.law}-${law.article}`} className="showcase-card">
                    <strong>{law.displayLaw || law.law || "未注明法条"}</strong>
                    <p className="case-library-meta">{law.article || "条文未注明"}</p>
                  </article>
                ))
              ) : (
                <article className="showcase-card">
                  <strong>暂无相关法条</strong>
                </article>
              )}
            </div>
          </ShowcaseSection>

          <div className="case-detail-actions">
            <Link href="/cases" className="case-detail-back">
              返回案例检索库
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
