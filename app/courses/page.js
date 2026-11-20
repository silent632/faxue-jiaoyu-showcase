import ShowcaseNav from "@/components/showcase-nav";
import CourseStageTabs from "@/components/course-stage-tabs";
import { getCoursePackagePeriods } from "@/lib/course-package";

export default function CoursesPage() {
  const periods = getCoursePackagePeriods();

  return (
    <main className="showcase-page" data-page-role="courses-support">
      <ShowcaseNav />

      <div className="showcase-page-body courses-page-body">
        {/* Hero */}
        <section className="course-catalogue" aria-label="课程体系">
          <div className="editorial-heading">
            <h1>课程研习</h1>
            <p>
              跟着每期的案例学会找法条、读判决、写分析。
            </p>
          </div>

          <CourseStageTabs periods={periods} />
        </section>

      </div>
    </main>
  );
}
