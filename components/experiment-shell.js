"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Link from "next/link";

import ExpReasoning from "@/components/exp-reasoning";
import ExpArgumentation from "@/components/exp-argumentation";
import ExpNormRetrieval from "@/components/exp-norm-retrieval";
import ExpInterpretation from "@/components/exp-interpretation";
import ExpValueBalancing from "@/components/exp-value-balancing";
import ExpAnnotation from "@/components/exp-annotation";
import { saveExperimentRecord, loadExperimentRecord } from "@/lib/experiment-archive";
import { ModuleHistory } from "@/components/experiment-progress";

const INTERACTION_MAP = {
  "exp-reasoning": ExpReasoning,
  "exp-argumentation": ExpArgumentation,
  "exp-norm-retrieval": ExpNormRetrieval,
  "exp-interpretation": ExpInterpretation,
  "exp-value-balancing": ExpValueBalancing,
  "exp-annotation": ExpAnnotation,
};

const CASES_PER_PAGE = 12;

function CaseSelector({ cases, onSelect, tagLabels, moduleId }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (!search.trim()) return cases;
    const q = search.trim().toLowerCase();
    return cases.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.causeFocus.toLowerCase().includes(q) ||
        c.caseNumber.toLowerCase().includes(q) ||
        c.courtName.toLowerCase().includes(q),
    );
  }, [cases, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / CASES_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pageCases = filtered.slice((currentPage - 1) * CASES_PER_PAGE, currentPage * CASES_PER_PAGE);

  return (
    <div className="exp-selector">
      <div className="exp-selector-head">
        <div className="exp-selector-head-info">
          <h2 className="exp-selector-title">选择案例开始实验</h2>
          <span className="exp-selector-count">共 {cases.length} 篇适用案例</span>
        </div>
        <div className="exp-selector-search-wrap">
          <input
            type="search"
            className="exp-selector-search"
            placeholder="搜索案名、案号、案由、法院…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          {search && (
            <span className="exp-selector-search-result">
              找到 {filtered.length} 条
            </span>
          )}
        </div>
      </div>

      <div className="exp-selector-grid">
        {pageCases.map((c) => (
          <button key={c.id} className="exp-selector-card" onClick={() => onSelect(c)}>
            <div className="exp-selector-card-head">
              <span className="exp-selector-card-cause">{c.causeFocus}</span>
              {c.courtLevel && <span className="exp-selector-card-level">{c.courtLevel}</span>}
            </div>
            <strong className="exp-selector-card-title">{c.title}</strong>
            <div className="exp-selector-card-meta">
              <span>{c.caseNumber}</span>
              <span>{c.courtName}</span>
              <span>{c.judgmentDate}</span>
            </div>
            <div className="exp-selector-card-tags">
              {(c.jurisprudenceTags || []).slice(0, 3).map((t) => (
                <span key={t} className="exp-selector-tag">{(tagLabels || {})[t] || t}</span>
              ))}
            </div>
            <span className="exp-selector-card-action">开始实验 →</span>
          </button>
        ))}
        {pageCases.length === 0 && (
          <p className="exp-selector-empty">未找到匹配的案例，请调整搜索条件。</p>
        )}
      </div>

      {totalPages > 1 && (
        <div className="exp-selector-pagination">
          <button className="btn btn-outline" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>上一页</button>
          <span className="exp-selector-page-info">{currentPage} / {totalPages}</span>
          <button className="btn btn-outline" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>下一页</button>
        </div>
      )}

      {moduleId && (
        <ModuleHistory
          moduleId={moduleId}
          onSelectCase={(caseId) => {
            const found = cases.find((c) => c.id === caseId);
            if (found) onSelect(found);
          }}
        />
      )}
    </div>
  );
}

function FallbackInteraction({ onChange }) {
  const [output, setOutput] = useState("");
  return (
    <div className="exp-task-interaction">
      <textarea
        className="exp-task-textarea"
        rows={10}
        placeholder="在此完成你的实验产出…"
        value={output}
        onChange={(e) => { setOutput(e.target.value); onChange?.(e.target.value); }}
      />
      <p className="exp-task-char-count">已写 {output.trim().length} 字</p>
    </div>
  );
}

function SelfEvaluation({ dimensions, instruction, scores, onScoreChange }) {
  return (
    <div className="exp-eval-content">
      <p className="exp-eval-instruction">{instruction}</p>
      <div className="exp-eval-grid">
        {dimensions.map((dim) => (
          <div key={dim.id} className="exp-eval-dim">
            <div className="exp-eval-dim-info">
              <strong className="exp-eval-dim-label">{dim.label}</strong>
              <span className="exp-eval-dim-desc">{dim.description}</span>
            </div>
            <div className="exp-eval-stars">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  className={`exp-eval-star${(scores[dim.id] || 0) >= v ? " active" : ""}`}
                  onClick={() => onScoreChange(dim.id, v)}
                  title={`${v} 分`}
                >
                  {(scores[dim.id] || 0) >= v ? "★" : "☆"}
                </button>
              ))}
              <span className="exp-eval-star-val">{scores[dim.id] || 0}/5</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const TRAINER_STAGES = [
  { id: "task", num: "01", label: "实验产出" },
  { id: "review", num: "02", label: "双师点评" },
  { id: "eval", num: "03", label: "自评存档" },
];

const STAGE_ORDER = { task: 0, review: 1, eval: 2 };

function ExperimentWorkspace({ module: mod, caseItem, tagLabels, onBack }) {
  const [output, setOutput] = useState("");
  const [selfScores, setSelfScores] = useState({});
  const [interactionData, setInteractionData] = useState(null);
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [stage, setStage] = useState("task");
  const trainerRef = useRef(null);
  const reviewRef = useRef(null);
  const evalRef = useRef(null);
  const InteractionComponent = INTERACTION_MAP[mod.id] || null;

  // 沉浸工作态：侧栏收窄为图标条，隐藏模块 hero
  useEffect(() => {
    document.documentElement.dataset.workspace = "immersive";
    window.scrollTo(0, 0);
    return () => {
      delete document.documentElement.dataset.workspace;
    };
  }, []);

  useEffect(() => {
    const rec = loadExperimentRecord(mod.id, caseItem.id);
    if (rec) {
      setSelfScores(rec.selfScores || {});
      if (rec.interactionData) setInteractionData(rec.interactionData);
      if (rec.output) setOutput(rec.output);
      setLoaded(true);
      setStage("eval");
    }
  }, [mod.id, caseItem.id]);

  const handleScoreChange = useCallback((dimId, value) => {
    setSelfScores((prev) => ({ ...prev, [dimId]: value }));
    setSaved(false);
  }, []);

  const handleOutputChange = useCallback((val, data) => {
    setOutput(val);
    if (data) setInteractionData(data);
    setSaved(false);
  }, []);

  function handleSave() {
    saveExperimentRecord(mod.id, caseItem.id, {
      output,
      selfScores,
      interactionData,
      caseTitle: caseItem.title,
      dimensionCount: evalDimensions.length,
    });
    setSaved(true);
  }

  const hasUnsavedWork = !saved && (output.trim().length > 0 || Object.keys(selfScores).length > 0);

  function handleBack() {
    if (hasUnsavedWork && !window.confirm("你有未保存的实验内容，确定返回吗？返回后内容将丢失。")) {
      return;
    }
    onBack();
  }

  const evalDimensions = mod.selfEvaluation?.dimensions || [];
  const evalInstruction = mod.selfEvaluation?.instruction || "";
  const totalScore = Object.values(selfScores).reduce((s, v) => s + v, 0);
  const maxScore = evalDimensions.length * 5;
  const scoredCount = Object.keys(selfScores).length;

  const outputChars = output.trim().length;
  const taskDone = outputChars >= 20 || interactionData != null;
  const stageIdx = STAGE_ORDER[stage];

  function scrollTrainerTo(ref) {
    window.requestAnimationFrame(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function goReview() {
    if (!taskDone) return;
    setStage("review");
    scrollTrainerTo(reviewRef);
  }

  function goEval() {
    setStage("eval");
    scrollTrainerTo(evalRef);
  }

  const isGuidedReading = mod.feedbackStrategy?.type === "guided-reading";

  return (
    <div className="exp-ws3">
      {/* 顶部工作条 */}
      <div className="exp-ws3-topbar">
        <div className="exp-ws3-topbar-left">
          <button className="exp-ws3-back" onClick={handleBack}>← 返回选案</button>
          <span className="exp-ws3-module-badge">{mod.shortName}</span>
          <div className="exp-ws3-case">
            <strong>{caseItem.title}</strong>
            <span>{caseItem.caseNumber} · {caseItem.courtName}</span>
          </div>
        </div>
        <div className="exp-ws3-topbar-right">
          {loaded && <span className="exp-ws3-archive-badge">已有存档</span>}
          <button className={`btn ${saved ? "btn-outline" : "btn-accent"}`} onClick={handleSave}>
            {saved ? "✓ 已存档" : "存档铸能"}
          </button>
        </div>
      </div>

      <div className="exp-ws3-split">
        {/* 左栏：纸面案例阅读器 */}
        <aside className="exp-ws3-reader">
          <div className="exp-ws3-reader-inner">
            <div className="exp-ws3-reader-head">
              <span className="exp-ws3-reader-doctag">案例材料</span>
              <h2 className="exp-ws3-reader-title">{caseItem.title}</h2>
              <p className="exp-ws3-reader-meta">{caseItem.caseNumber} · {caseItem.courtName} · {caseItem.judgmentDate}</p>
              <div className="exp-ws3-reader-links">
                <Link href={`/cases/${caseItem.id}`}>案例详情</Link>
                <Link href={`/cases/${caseItem.id}/study`}>研习工作台</Link>
              </div>
            </div>

            {caseItem.refFact && (
              <section className="exp-ws3-reader-section">
                <h3>案件事实</h3>
                <p>{caseItem.refFact}</p>
              </section>
            )}
            {caseItem.refIssue && (
              <section className="exp-ws3-reader-section">
                <h3>争议焦点</h3>
                <p>{caseItem.refIssue}</p>
              </section>
            )}
            {(caseItem.laws || []).length > 0 && (
              <section className="exp-ws3-reader-section">
                <h3>涉及法条</h3>
                <ul className="exp-ws3-reader-laws">
                  {caseItem.laws.map((law, i) => (
                    <li key={`${law.law}-${law.article}-${i}`}>
                      {(law.displayLaw || law.law)}{law.article ? ` ${law.article}` : ""}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            {(caseItem.jurisprudenceTags || []).length > 0 && (
              <section className="exp-ws3-reader-section">
                <h3>法理标签</h3>
                <div className="exp-ws3-reader-tags">
                  {caseItem.jurisprudenceTags.map((t) => (
                    <span key={t} className="exp-ws3-reader-tag">{(tagLabels || {})[t] || t}</span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </aside>

        {/* 右栏：递进训练面板 */}
        <section className="exp-ws3-trainer" ref={trainerRef}>
          {/* 进度指示 */}
          <div className="exp-ws3-progress">
            <div className="exp-ws3-progress-label">
              Step <strong>{stageIdx + 1}</strong> / {TRAINER_STAGES.length}
            </div>
            <div className="exp-ws3-progress-track">
              {TRAINER_STAGES.map((s, i) => (
                <div key={s.id} className={`exp-ws3-progress-seg${i <= stageIdx ? " done" : ""}`}>
                  <span className="exp-ws3-progress-num">{s.num}</span>
                  <span className="exp-ws3-progress-text">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 阶段一：实验产出 */}
          <div className="exp-ws3-stage">
            <div className="exp-ws3-stage-head">
              <h3>实验任务 · {mod.interactionLabel}</h3>
              <p>{mod.description}</p>
            </div>
            <div className="exp-ws3-stage-body">
              {InteractionComponent ? (
                <InteractionComponent
                  key={loaded ? "restored" : "fresh"}
                  caseItem={caseItem}
                  onChange={handleOutputChange}
                  initialData={interactionData}
                  tagPalette={mod.tagPalette}
                />
              ) : (
                <FallbackInteraction onChange={handleOutputChange} />
              )}
              <div className="exp-ws3-task-status">
                <span>总产出 {outputChars} 字</span>
              </div>
            </div>

            {stage === "task" && (
              <div className="exp-ws3-advance">
                <button className="exp-ws3-advance-btn" disabled={!taskDone} onClick={goReview}>
                  提交产出，进入双师点评 →
                </button>
                {!taskDone && (
                  <p className="exp-ws3-advance-hint">先完成上方实验操作（或写满 20 字），再进入点评环节。</p>
                )}
              </div>
            )}
          </div>

          {/* 阶段二：双师点评（递进揭示） */}
          {stageIdx >= 1 ? (
            <div className="exp-ws3-stage" ref={reviewRef}>
              <div className="exp-ws3-stage-head">
                <h3>双师点评</h3>
                <p>从理论与实务两个维度审视你的产出。</p>
              </div>
              <div className="exp-ws3-teacher-grid">
                <article className="exp-ws3-teacher-card">
                  <span className="exp-ws3-teacher-avatar exp-ws3-teacher-avatar-theory">理</span>
                  <div>
                    <span className="exp-ws3-teacher-label">理论导师视角</span>
                    <p>{mod.dualTeacher.theoryPrompt}</p>
                  </div>
                </article>
                <article className="exp-ws3-teacher-card">
                  <span className="exp-ws3-teacher-avatar exp-ws3-teacher-avatar-practice">实</span>
                  <div>
                    <span className="exp-ws3-teacher-label">实务导师视角</span>
                    <p>{mod.dualTeacher.practicePrompt}</p>
                  </div>
                </article>
              </div>

              {mod.feedbackStrategy && (
                <div className="exp-ws3-reference">
                  <div className="exp-ws3-reference-head">
                    <span className="exp-ws3-reference-type">
                      {isGuidedReading ? "引导阅读" : "参照对比"}
                    </span>
                    <p>{mod.feedbackStrategy.instruction}</p>
                  </div>
                  {!isGuidedReading && caseItem.refLegal && (
                    <div className="exp-ws3-reference-body">
                      <p>{caseItem.refLegal}</p>
                    </div>
                  )}
                </div>
              )}

              {stage === "review" && (
                <div className="exp-ws3-advance">
                  <button className="exp-ws3-advance-btn" onClick={goEval}>
                    对照完成，进入自我评价 →
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="exp-ws3-stage-locked">
              <span className="exp-ws3-lock-num">02</span>
              <span>双师点评 · 提交实验产出后解锁</span>
            </div>
          )}

          {/* 阶段三：自评存档（递进揭示） */}
          {stageIdx >= 2 ? (
            evalDimensions.length > 0 && (
              <div className="exp-ws3-stage" ref={evalRef}>
                <div className="exp-ws3-stage-head">
                  <h3>自我评价</h3>
                  <p>{evalInstruction}</p>
                </div>
                <SelfEvaluation
                  dimensions={evalDimensions}
                  instruction=""
                  scores={selfScores}
                  onScoreChange={handleScoreChange}
                />
                <div className="exp-ws3-final">
                  <div className="exp-ws3-final-score">
                    {totalScore > 0 ? (
                      <>自评得分 <strong>{totalScore}</strong> / {maxScore}</>
                    ) : (
                      <>共 {evalDimensions.length} 个维度待评分</>
                    )}
                  </div>
                  <button
                    className="exp-ws3-advance-btn"
                    disabled={scoredCount < evalDimensions.length}
                    onClick={handleSave}
                  >
                    {saved ? "✓ 已存档 · 可在选案页查看历史" : "存档铸能，完成本次实验"}
                  </button>
                  {scoredCount < evalDimensions.length && (
                    <p className="exp-ws3-advance-hint">给全部 {evalDimensions.length} 个维度打分后即可存档。</p>
                  )}
                </div>
              </div>
            )
          ) : (
            <div className="exp-ws3-stage-locked">
              <span className="exp-ws3-lock-num">03</span>
              <span>自评存档 · 完成双师点评对照后解锁</span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function ExperimentShell({ module: mod, cases, tagLabels }) {
  const [selectedCase, setSelectedCase] = useState(null);

  const handleSelect = useCallback((caseItem) => {
    setSelectedCase(caseItem);
    window.scrollTo(0, 0);
  }, []);

  const handleBack = useCallback(() => {
    setSelectedCase(null);
    window.scrollTo(0, 0);
  }, []);

  if (selectedCase) {
    return (
      <ExperimentWorkspace
        module={mod}
        caseItem={selectedCase}
        tagLabels={tagLabels}
        onBack={handleBack}
      />
    );
  }

  return <CaseSelector cases={cases} onSelect={handleSelect} tagLabels={tagLabels} moduleId={mod.id} />;
}
