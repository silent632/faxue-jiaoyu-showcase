"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import PdfViewer from "@/components/pdf-viewer";
import { libraryCategories } from "@/lib/library-categories.js";

import { useExperiencePreview } from "@/components/use-experience-preview";

export default function ExperienceFulltext({ articles }) {
  const params = useSearchParams();
  const preview = useExperiencePreview();
  const current = [...articles, ...preview.articles].find(item => item.id === params.get("article"));

  return (
    <>
      <Link href="/resources/library/">← 返回资料专区</Link>
      {current ? <>
        <header className="editorial-heading">
          <div>
            <p className="section-eyebrow">{current.localPreview ? "本地全文校样" : libraryCategories[current.category]}</p>
            <h1>{current.title}</h1>
            <p>{[current.reading.school, current.reading.track, current.reading.year && `${current.reading.year} 年`, `${current.reading.pages} 页`].filter(Boolean).join(" · ")}</p>
          </div>
        </header>
        <section className="editorial-panel" aria-label="经验帖全文">
          <PdfViewer fileUrl={current.href} fileName={current.title} downloadHref={current.href} minHeight="min(76vh, 920px)" hideFooter />
        </section>
      </> : preview.loading ? <p role="status">正在打开经验帖</p> : <section className="editorial-panel">
        <h1>经验帖暂不可读</h1>
        <p>可以返回资料专区查看已开放的文章。</p>
      </section>}
    </>
  );
}
