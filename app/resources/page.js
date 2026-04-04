import ShowcaseNav from "@/components/showcase-nav";
import ShowcaseSection from "@/components/showcase-section";
import { buildShowcaseContent } from "@/lib/showcase-content";
import { buildResourceNote, buildResourceSectionMeta } from "@/lib/showcase-supporting-page-meta";

export default function ResourcesPage() {
  const content = buildShowcaseContent();

  return (
    <main className="showcase-page">
      <ShowcaseNav items={content.nav} />

      <div className="showcase-page-body">
        <section className="showcase-page-head">
          <p className="showcase-page-kicker">教学资源</p>
          <h1>教学资源配置</h1>
          <p>平台围绕课程实施、案例研习与教学评价逐步沉淀资源材料，形成兼顾课堂使用、协同记录与成果回收的教学支撑体系。</p>
        </section>

        <article className="showcase-card supporting-callout">
          <span className="showcase-card-eyebrow">资源说明</span>
          <strong>资源配置服务于课程全过程，而非单一课堂环节。</strong>
          <ul className="supporting-list">
            <li>前端材料帮助教师与学生快速进入裁判文书阅读与法理问题辨析。</li>
            <li>过程性表单保障双师协同、课堂观察与课后回收具有统一依据。</li>
            <li>评价性材料将学生反馈与研习成果纳入连续改进的教学闭环。</li>
          </ul>
        </article>

        <div className="stack-grid">
          {content.resources.groups.map((group) => {
            const sectionMeta = buildResourceSectionMeta(group);

            return (
              <ShowcaseSection
                key={group.title}
                title={sectionMeta.title}
                eyebrow={sectionMeta.eyebrow}
                description={sectionMeta.description}
                className="showcase-section-compact"
                aria-label={group.title}
              >
                <div className="resource-grid">
                  {group.items.map((item) => (
                    <article key={item} className="showcase-card resource-card">
                      <span className="showcase-card-eyebrow">{group.title}</span>
                      <strong>{item}</strong>
                      <p className="resource-card-note">{buildResourceNote(group, item)}</p>
                    </article>
                  ))}
                </div>
              </ShowcaseSection>
            );
          })}
        </div>
      </div>
    </main>
  );
}
