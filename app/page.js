import Link from "next/link";
import ShowcaseHomeHero from "@/components/showcase-home-hero";
import ShowcaseSection from "@/components/showcase-section";
import TopNav from "@/components/top-nav";
import { getPublicShowcaseUser } from "@/lib/public-showcase-user.js";
import { getShowcaseCanonicalStudyHref, loadShowcaseCases } from "@/lib/showcase-cases";
import { buildShowcaseContent } from "@/lib/showcase-content";

export default async function HomePage() {
  const content = buildShowcaseContent();
  const user = getPublicShowcaseUser();
  const studyHref = getShowcaseCanonicalStudyHref();
  const cases = await loadShowcaseCases();
  const featuredCases = cases.slice(0, 4);
  const featuredDetailHref = featuredCases[0] ? `/cases/${featuredCases[0].id}` : "/cases";

  return (
    <main className="showcase-page">
      <TopNav user={user} />

      <div className="showcase-page-body">
        <ShowcaseHomeHero content={content} featuredCases={featuredCases} canonicalStudyHref={studyHref} />

        <ShowcaseSection
          title="平台访问路径"
          eyebrow="平台功能"
          description="从检索、导读到研习输出，平台围绕同一份裁判文书组织连续学习路径。"
        >
          <div className="showcase-flow-grid">
            {content.homeFlow.map((item) => (
              <article key={item.id} className="showcase-flow-card">
                <span className="showcase-flow-index">{item.id}</span>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </article>
            ))}
          </div>

          <div className="showcase-chain-links">
            <Link href="/cases" className="showcase-chain-card">
              <span className="showcase-card-eyebrow">案例检索</span>
              <strong>先明确同类案例的阅读边界</strong>
              <p>围绕案由、年份、层级与法条建立稳定的检索起点。</p>
            </Link>
            <Link href={featuredDetailHref} className="showcase-chain-card">
              <span className="showcase-card-eyebrow">案例阅读</span>
              <strong>在详情页完成导读判断</strong>
              <p>结合摘要、案号与裁判结果确定继续精读的对象。</p>
            </Link>
            <Link href={studyHref} className="showcase-chain-card">
              <span className="showcase-card-eyebrow">研习实践</span>
              <strong>围绕文书完成结构化研习</strong>
              <p>在并置工作台中推进事实梳理、争议焦点与法理分析。</p>
            </Link>
          </div>
        </ShowcaseSection>

        <ShowcaseSection
          title="平台关注的真实问题"
          eyebrow="教学痛点"
          description="聚焦课堂、课后与实践环节中最常见的三类断点。"
        >
          <div className="showcase-problems">
            {content.problems.map((item, index) => (
              <article key={item} className="showcase-problem-card">
                <span className="showcase-problem-index">{String(index + 1).padStart(2, "0")}</span>
                <p>{item}</p>
              </article>
            ))}
          </div>
        </ShowcaseSection>

        <ShowcaseSection
          title="平台建设亮点"
          eyebrow="建设重点"
          description="围绕课程实施、案例研习与资源组织形成清晰稳定的展示界面。"
        >
          <div className="showcase-highlight-grid">
            {content.platformHighlights.map((item) => (
              <article key={item.title} className="showcase-highlight-card">
                <span className="showcase-card-eyebrow">{item.eyebrow}</span>
                <strong>{item.title}</strong>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </ShowcaseSection>

        <ShowcaseSection
          title="课程与资源总览"
          eyebrow="体系支撑"
          description="课程建设、教学资源与项目成效在站内形成统一呈现。"
        >
          <div className="showcase-summary-grid">
            <article className="showcase-summary-card">
              <span className="showcase-card-eyebrow">课程体系</span>
              <strong>八期递进式双师课程</strong>
              <p>{content.courses.timeline.slice(0, 3).map((item) => item.title).join("、")}等主题依次展开，形成连续课程脉络。</p>
              <Link href="/courses" className="showcase-inline-link">
                查看课程体系
              </Link>
            </article>

            <article className="showcase-summary-card">
              <span className="showcase-card-eyebrow">教学资源</span>
              <strong>标准化资源包与支撑材料</strong>
              <p>
                {content.resources.groups
                  .flatMap((group) => group.items)
                  .slice(0, 3)
                  .join("、")}
                等材料共同构成课程实施与研习支持的资源基础。
              </p>
              <Link href="/resources" className="showcase-inline-link">
                查看教学资源
              </Link>
            </article>

            <article className="showcase-summary-card">
              <span className="showcase-card-eyebrow">建设成效</span>
              <strong>平台、课程与推广三线并进</strong>
              <p>从教学建设、学生发展到平台运行，项目已形成较完整的成果呈现体系。</p>
              <Link href="/impact" className="showcase-inline-link">
                查看成效展示
              </Link>
            </article>
          </div>
        </ShowcaseSection>
      </div>
    </main>
  );
}
