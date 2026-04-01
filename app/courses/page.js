import ShowcaseSection from "@/components/showcase-section";
import ShowcaseNav from "@/components/showcase-nav";
import { buildShowcaseContent } from "@/lib/showcase-content";

export default function CoursesPage() {
  const content = buildShowcaseContent();
  const timelineDetails = [
    { phase: "案例进入", focus: "从类案检索与法律适用切入，建立课程起点。" },
    { phase: "理论展开", focus: "围绕权利义务一致原则展开法理辨析与实践讨论。" },
    { phase: "研讨推进", focus: "把商事争议中的事实识别、证据梳理与程序判断纳入课堂。" },
    { phase: "方法训练", focus: "围绕权利救济与规范适用，训练更稳定的法律表达。" },
    { phase: "规则专题", focus: "以非法证据排除为例，推进规则理解与课堂讨论。" },
    { phase: "数字议题", focus: "聚焦人脸识别中的同意边界与权利保护问题。" },
    { phase: "治理前沿", focus: "围绕平台劳动与算法治理，延展法理学视野。" },
    { phase: "前沿收束", focus: "以生成式 AI 的责任边界回应技术发展中的新问题。" },
  ];

  return (
    <main className="showcase-page">
      <ShowcaseNav items={content.nav} />

      <div className="showcase-page-body">
        <section className="showcase-page-head">
          <p className="showcase-page-kicker">课程体系</p>
          <h1>课程体系</h1>
          <p>围绕裁判文书研习组织八期递进式双师课程，在持续推进中形成清晰的课程脉络与法理学学习路径。</p>
        </section>

        <ShowcaseSection
          title="八期课程脉络"
          description="课程主题从法律方法、权利义务与程序规则逐步延展到数字治理与前沿法理议题，形成连续推进的教学结构。"
          className="showcase-section-compact"
          aria-label="课程体系时间线"
        >
          <div className="timeline-grid">
            {content.courses.timeline.map((item, index) => (
              <article key={item.period} className="showcase-card course-card">
                <span className="showcase-card-eyebrow">{item.period}</span>
                <strong className="course-card-title">{item.title}</strong>
                <span className="course-card-meta">{timelineDetails[index].phase}</span>
                <p className="course-card-note">{timelineDetails[index].focus}</p>
              </article>
            ))}
          </div>
        </ShowcaseSection>
      </div>
    </main>
  );
}
