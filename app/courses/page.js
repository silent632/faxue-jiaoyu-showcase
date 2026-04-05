import ShowcaseSection from "@/components/showcase-section";
import ShowcaseNav from "@/components/showcase-nav";
import { buildShowcaseContent } from "@/lib/showcase-content";
import { getCourseTimelineDetail } from "@/lib/showcase-supporting-page-meta";

export default function CoursesPage() {
  const content = buildShowcaseContent();
  const pageHighlights = [
    "八期课程提供连续的课程背景，用于支持平台应用成果的整体说明。",
    "课程安排衔接案例导入、课堂讨论与任务回收，服务双师教学组织复盘。",
    "课程主题从检索方法延展至数字法理议题，为观摩与教学安排提供参考线索。",
  ];

  return (
    <main className="showcase-page" data-page-role="courses-support">
      <ShowcaseNav items={content.nav} />

      <div className="showcase-page-body">
        <section className="showcase-page-head">
          <p className="showcase-page-kicker">课程体系</p>
          <h1>双师课程体系</h1>
          <p>双师课程体系作为课程支撑页面，支持平台应用成果展示与教学组织安排。八期课程依次覆盖检索方法、规范适用、程序规则与数字治理议题，形成稳定的课程背景线索。</p>
        </section>

        <article className="showcase-card supporting-callout">
          <span className="showcase-card-eyebrow">支撑定位</span>
          <strong>课程体系页面聚焦支撑功能，重点服务于平台应用成果说明与教学组织协同。</strong>
          <ul className="supporting-list">
            {pageHighlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <ShowcaseSection
          title="八期课程进程与教学组织线索"
          eyebrow="支撑课程安排"
          description="课程主题由法律方法、权利义务与程序规则逐步延展至数字治理与前沿法理议题，可为课程汇报与教学组织复盘提供时间轴参照。"
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
