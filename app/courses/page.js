import ShowcaseSection from "@/components/showcase-section";
import ShowcaseNav from "@/components/showcase-nav";
import { buildShowcaseContent } from "@/lib/showcase-content";

const timelineDetailsByPeriod = {
  第一期: { phase: "案例进入", focus: "从类案检索与法律适用切入，建立课程起点。" },
  第二期: { phase: "理论展开", focus: "围绕权利义务一致原则展开法理辨析与实践讨论。" },
  第三期: { phase: "研讨推进", focus: "把商事争议中的事实识别、证据梳理与程序判断纳入课堂。" },
  第四期: { phase: "方法训练", focus: "围绕权利救济与规范适用，训练更稳定的法律表达。" },
  第五期: { phase: "规则专题", focus: "以非法证据排除为例，推进规则理解与课堂讨论。" },
  第六期: { phase: "数字议题", focus: "聚焦人脸识别中的同意边界与权利保护问题。" },
  第七期: { phase: "治理前沿", focus: "围绕平台劳动与算法治理，延展法理学视野。" },
  第八期: { phase: "前沿收束", focus: "以生成式 AI 的责任边界回应技术发展中的新问题。" },
};

const defaultTimelineDetail = {
  phase: "课程推进",
  focus: "围绕案例研习、规范适用与课堂讨论组织连续推进的法理学习。",
};

function getTimelineDetail(item) {
  return timelineDetailsByPeriod[item.period] ?? timelineDetailsByPeriod[item.title] ?? defaultTimelineDetail;
}

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
              const detail = getTimelineDetail(item);

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
