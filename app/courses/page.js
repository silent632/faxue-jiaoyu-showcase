import ShowcaseSection from "@/components/showcase-section";
import ShowcaseNav from "@/components/showcase-nav";
import { buildShowcaseContent } from "@/lib/showcase-content";

export default function CoursesPage() {
  const content = buildShowcaseContent();
  const timelineDetails = [
    { module: "课程导入", focus: "类案检索路径与教学目标" },
    { module: "理论辨析", focus: "权利义务一致性的法理阐释" },
    { module: "案例研讨", focus: "商事纠纷中的争点识别与证据梳理" },
    { module: "方法训练", focus: "从权利救济到规范适用的结构化表达" },
    { module: "专题深化", focus: "非法证据排除的课堂讨论与示范分析" },
    { module: "跨界议题", focus: "人脸识别中的同意边界与规范回应" },
    { module: "前沿延展", focus: "平台劳动关系与算法治理的法理冲突" },
    { module: "成果收束", focus: "生成式AI时代的责任边界与课堂总结" },
  ];

  return (
    <main className="showcase-page">
      <ShowcaseNav items={content.nav} />

      <div className="showcase-page-body">
        <section className="showcase-page-head">
          <p className="showcase-page-kicker">课程体系</p>
          <h1>课程体系</h1>
          <p>围绕裁判文书研习形成八期递进式双师课程，便于公开展示课程脉络。</p>
        </section>

        <ShowcaseSection title="课程时间线" className="showcase-section-compact" aria-label="课程体系时间线">
          <div className="timeline-grid">
            {content.courses.timeline.map((item, index) => (
              <article key={item.period} className="showcase-card course-card">
                <span className="showcase-card-eyebrow">{item.period}</span>
                <strong className="course-card-title">{item.title}</strong>
                <span className="course-card-meta">{timelineDetails[index].module}</span>
                <p className="course-card-note">{timelineDetails[index].focus}</p>
              </article>
            ))}
          </div>
        </ShowcaseSection>
      </div>
    </main>
  );
}
