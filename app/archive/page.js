import ArchiveWorkspace from "@/components/archive-workspace";
import ShowcaseNav from "@/components/showcase-nav";
import { getExperimentModules } from "@/lib/experiments.js";
import { buildShowcaseContent } from "@/lib/showcase-content.js";
import { loadShowcaseCases } from "@/lib/showcase-cases.js";

export default async function ArchivePage() {
  const cases = await loadShowcaseCases();
  const caseIndex = cases.map((item) => ({
    id: item.id,
    title: item.title,
    caseNumber: item.caseNumber,
    causeFocus: item.causeFocus,
    jurisprudenceTags: item.jurisprudenceTags,
  }));
  const modules = getExperimentModules().map((item) => ({
    id: item.id,
    shortName: item.shortName,
    name: item.name,
    skill: item.skill,
    primaryTags: item.primaryTags,
  }));
  const content = buildShowcaseContent();

  return (
    <main className="showcase-page archive-page">
      <ShowcaseNav items={content.nav} />
      <ArchiveWorkspace
        caseIndex={caseIndex}
        modules={modules}
        copy={content.learningLoop.archive}
        userSid="public-showcase"
      />
    </main>
  );
}
