import { Suspense } from "react";
import ShowcaseNav from "@/components/showcase-nav";
import ExperienceFulltext from "@/components/experience-fulltext";
import { getPublicLibrary } from "@/lib/content/library.js";

export const metadata = { title: "备考经验全文 · 资料专区" };

export default function LibraryExperiencePage() {
  const articles = getPublicLibrary().filter(item => item.reading);
  return (
    <main className="showcase-page">
      <ShowcaseNav />
      <div className="editorial-width page-stack">
        <Suspense fallback={<p>正在打开经验帖</p>}>
          <ExperienceFulltext articles={articles} />
        </Suspense>
      </div>
    </main>
  );
}
