import ShowcaseNav from "@/components/showcase-nav";
import ShowcaseVideoHub from "@/components/showcase-video-hub";
import CourseStageTabs from "@/components/course-stage-tabs";
import { getCoursePackagePeriods } from "@/lib/course-package";
import { buildShowcaseContent } from "@/lib/showcase-content";

export default function CoursesPage() {
  const content = buildShowcaseContent();
  const periods = getCoursePackagePeriods();
  const standardMaterialCount = periods[0]?.materialPages?.length ?? 10;

  return (
    <main className="showcase-page" data-page-role="courses-support">
      <ShowcaseNav />

      <div className="showcase-page-body courses-page-body">
        {/* Hero */}
        <section className="showcase-card" aria-label="课程体系">
          <div className="showcase-page-head">
            <p className="showcase-page-kicker">课程体系</p>
            <h1>八期课程档案</h1>
            <p>
              八期课程沿两个阶段推进，四类材料对齐主题脉络，{standardMaterialCount}份档案保持统一入口。
            </p>
          </div>

          <CourseStageTabs periods={periods} />
        </section>

        <ShowcaseVideoHub hub={content.videoHub} />
      </div>
    </main>
  );
}
