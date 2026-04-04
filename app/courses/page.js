import ShowcaseSection from "@/components/showcase-section";
import ShowcaseNav from "@/components/showcase-nav";
import { buildShowcaseContent } from "@/lib/showcase-content";
import { getCourseTimelineDetail } from "@/lib/showcase-supporting-page-meta";

export default function CoursesPage() {
  const content = buildShowcaseContent();
  const pageHighlights = [
    "以八期双师课程为主轴，组织从类案检索到数字法理议题的递进式学习。",
    "每一期围绕明确的课程任务推进事实识别、规范适用与论证表达训练。",
    "课程节奏兼顾理论展开、案例研习与课堂讨论，保持稳定的学术观摩价值。",
  ];

  return (
    <main className="showcase-page">
      <ShowcaseNav items={content.nav} />

      <div className="showcase-page-body">
        <section className="showcase-page-head">
          <p className="showcase-page-kicker">课程体系</p>
          <h1>双师课程编排</h1>
          <p>围绕裁判文书研习平台的教学目标，八期课程依次展开检索方法、规范适用、程序规则与数字治理议题，形成可持续推进的法理学学习序列。</p>
        </section>

        <article className="showcase-card supporting-callout">
          <span className="showcase-card-eyebrow">课程概览</span>
          <strong>课程编排以“进入案例、展开讨论、形成表达”三条线索组织教学节奏。</strong>
          <ul className="supporting-list">
            {pageHighlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <ShowcaseSection
          title="八期课程进程与主题安排"
          eyebrow="课程安排"
          description="课程主题由法律方法、权利义务与程序规则逐步延展至数字治理与前沿法理议题，体现从基础训练到前沿回应的完整教学进程。"
          className="showcase-section-compact"
          aria-label="课程体系时间线"
        >
          <div className="timeline-grid">
            {content.courses.timeline.map((item) => {
              const detail = getCourseTimelineDetail(item);

              return (
                <article key={`${item.period}-${item.title}`} className="showcase-card course-card">
                  <span className="showcase-card-eyebrow">{item.period}</span>
                  <strong className="course-card-title">{item.title}</strong>
                  <span className="course-card-meta">{detail.phase}</span>
                  <p className="course-card-note">{detail.focus}</p>
                </article>
              );
            })}
          </div>
        </ShowcaseSection>
      </div>
    </main>
  );
}
