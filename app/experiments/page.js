import Link from "next/link";

import ShowcaseNav from "@/components/showcase-nav";
import { getExperimentModules, getExperimentFormula, getExperimentMicroLoop, filterCasesForModule } from "@/lib/experiments.js";
import { loadShowcaseCases } from "@/lib/showcase-cases.js";
import { HubProgressSummary, ModuleProgressBadge } from "@/components/experiment-progress";

export default async function ExperimentsHubPage() {
  const modules = getExperimentModules();
  const formula = getExperimentFormula();
  const microLoop = getExperimentMicroLoop();
  const allCases = await loadShowcaseCases();

  const moduleCards = modules.map((mod) => ({
    ...mod,
    eligibleCount: filterCasesForModule(allCases, mod.id).length,
  }));

  return (
    <main className="showcase-page experiments-hub-page">
      <ShowcaseNav />

      <div className="page-wrap fade-in">
        {/* Hero */}
        <section className="showcase-card exp-hero">
          <div className="exp-hero-copy">
            <p className="section-eyebrow">仿真实验中心</p>
            <h1>法学虚拟仿真实验</h1>
            <p>{formula.slogan}</p>
            <p className="exp-hero-sub">
              六大实验模块覆盖法理学核心能力训练，每个实验从案例出发，经法理锚定、动手产出、双师双评，最终存档铸能。
            </p>
          </div>

          {/* Horizontal step bar */}
          <div className="exp-step-bar">
            <p className="exp-step-bar-label">微循环五步</p>
            <div className="exp-step-bar-track">
              {microLoop.map((step, i) => (
                <div key={step.step} className="exp-step-node">
                  <span className="exp-step-num">{step.step}</span>
                  <strong className="exp-step-name">{step.name}</strong>
                  <span className="exp-step-form">{step.form}</span>
                  {i < microLoop.length - 1 && <span className="exp-step-line" aria-hidden="true" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Modules */}
        <section className="showcase-card exp-modules">
          <div className="exp-modules-head">
            <div>
              <p className="section-eyebrow">实验模块</p>
              <h2>六大实验模块</h2>
            </div>
            <HubProgressSummary />
          </div>

          <div className="exp-modules-grid stagger-in">
            {moduleCards.map((mod, i) => (
              <Link key={mod.id} href={`/experiments/${mod.id}`} className="exp-module-card">
                <div className="exp-module-card-top">
                  <span className="exp-module-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="tag tag-accent">{mod.shortName}</span>
                  <ModuleProgressBadge moduleId={mod.id} />
                </div>
                <div className="exp-module-card-body">
                  <strong className="exp-module-name">{mod.name}</strong>
                  <p className="exp-module-desc">{mod.description}</p>
                </div>
                <div className="exp-module-card-meta">
                  <span className="exp-module-skill">训练能力：{mod.skill}</span>
                  <span className="exp-module-divider" />
                  <span className="exp-module-count">{mod.eligibleCount} 篇适用案例</span>
                  <span className="exp-module-arrow">进入实验 →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
