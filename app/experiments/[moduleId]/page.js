import availability from "@/content/norm-availability.json";
import { loadCourseTasks } from "@/lib/content/course-tasks.js";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import ExperimentShell from "@/components/experiment-shell";
import ShowcaseNav from "@/components/showcase-nav";
import { buildShowcaseContent } from "@/lib/showcase-content.js";
import { loadShowcaseCases } from "@/lib/showcase-cases.js";
import {
  getExperimentModules,
  getExperimentModuleById,
  getExperimentStaticParams,
  getExperimentMicroLoop,
  filterCasesForModule,
  sortCasesByRelevance,
  loadJurisprudenceTags,
} from "@/lib/experiments.js";

export async function generateStaticParams() {
  return getExperimentStaticParams();
}

export default async function ExperimentModulePage({ params }) {
  const { moduleId } = await params;
  const mod = getExperimentModuleById(moduleId);
  if (!mod) notFound();

  const allCases = await loadShowcaseCases();
  const eligible = sortCasesByRelevance(filterCasesForModule(allCases, moduleId), moduleId);
  const modules = getExperimentModules();
  const microLoop = getExperimentMicroLoop();
  const loopCopy = buildShowcaseContent().learningLoop;

  const tagsData = loadJurisprudenceTags();
  const tagLabels = {};
  for (const t of tagsData.tags) {
    tagLabels[t.id] = t.label;
  }

  return (
    <main className="showcase-page experiment-module-page">
      <ShowcaseNav />

      <section className="exp-detail-hero">
        <div className="exp-detail-hero-inner">
          <div className="exp-detail-hero-nav">
            <Link className="exp-detail-back" href="/experiments">
              <span className="exp-detail-back-arrow">←</span>
              <span>实验中心</span>
            </Link>
            <span className="exp-detail-hero-divider">/</span>
            <span className="exp-detail-hero-current">{mod.shortName}</span>
          </div>

          <div className="exp-detail-hero-body">
            <div className="exp-detail-hero-info">
              <div className="exp-detail-hero-tags">
                <span className="exp-detail-badge">{mod.shortName}</span>
                <span className="exp-detail-badge-outline">{mod.interactionLabel}</span>
              </div>
              <h1 className="exp-detail-hero-title">{mod.name}</h1>
              <div className="exp-detail-hero-meta">
                <span>{mod.chapter}</span>
                <span className="exp-detail-meta-dot">·</span>
                <span>训练能力：{mod.skill}</span>
              </div>
              <div className="exp-detail-hero-concepts">
                {mod.anchorConcepts.map((c) => (
                  <span key={c} className="exp-detail-concept">{c}</span>
                ))}
              </div>

              <div className="exp-detail-hero-stats">
                <div className="exp-detail-hero-stat">
                  <strong>{eligible.length}</strong>
                  <span>适用案例</span>
                </div>
                <div className="exp-detail-hero-stat">
                  <strong>{mod.selfEvaluation?.dimensions?.length ?? 0}</strong>
                  <span>自评维度</span>
                </div>
                <div className="exp-detail-hero-stat">
                  <strong>{mod.anchorConcepts.length}</strong>
                  <span>锚定概念</span>
                </div>
              </div>
            </div>

            <div className="exp-detail-hero-steps">
              <span className="exp-detail-steps-label">微循环五步</span>
              <div className="exp-detail-steps-track">
                {microLoop.map((step, i) => (
                  <div key={step.step} className="exp-detail-step-node">
                    <span className="exp-detail-step-num">{step.step}</span>
                    <div className="exp-detail-step-text">
                      <strong>{step.name}</strong>
                      <span>{step.form}</span>
                    </div>
                    {i < microLoop.length - 1 && <span className="exp-detail-step-connector" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="exp-detail-workspace-wrap">
        <Suspense fallback={null}>
          <ExperimentShell
            module={{ ...mod, courseTasks: Object.fromEntries(loadCourseTasks().filter(task => task.moduleId === mod.id).map(task => [task.caseId, { slug: task.slug, version: task.version }])) }}
            modules={modules}
            cases={eligible.map(item => ({ ...item, normUnavailableReason: availability.cases[item.id]?.status === "excluded" ? availability.cases[item.id].reason : "" }))}
            tagLabels={tagLabels}
            loopCopy={loopCopy}
          />
        </Suspense>
      </section>
    </main>
  );
}

export async function generateMetadata({ params }) { const { moduleId } = await params; const mod = getExperimentModuleById(moduleId); return mod ? { title: `${mod.name} · 法理实验`, description: mod.description, alternates: { canonical: `/experiments/${moduleId}/` } } : {}; }
