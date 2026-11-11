"use client";

import CaseRubric from "./case-rubric";
import { getCaseRubric } from "../lib/case-rubrics.js";
import { annotationTasks } from "../lib/annotation.js";
import { normTasks } from "../lib/norm-comparison.js";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import LearningContextLink from "@/components/learning-context-link";
import LearningContextPanel from "@/components/learning-context-panel";
import { useSearchParams } from "next/navigation";

import useExperimentDraft from "@/components/use-experiment-draft";
import { checkExperimentCompletion, isExperimentComplete } from "@/lib/experiment-completion";
import { subscribeRecords } from "@/lib/local-record";

import ExpReasoning from "@/components/exp-reasoning";
import ExpArgumentation from "@/components/exp-argumentation";
import ExpNormRetrieval from "@/components/exp-norm-retrieval";
import ExpInterpretation from "@/components/exp-interpretation";
import ExpValueBalancing from "@/components/exp-value-balancing";
import ExpAnnotation from "@/components/exp-annotation";
import {
  readExperimentArchive,
} from "@/lib/experiment-archive";
import { ModuleHistory } from "@/components/experiment-progress";
import { recommendModulesForCase } from "@/lib/learning-loop";

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
            {getCaseRubric(c.id, moduleId) && <span className="exp-selector-tag">有案例专属量规</span>}
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
            <span className="exp-selector-card-action">{moduleId === "exp-norm-retrieval" ? (normTasks[c.id] ? "原文依据已核对 · 开始实验 →" : "原文依据待核查 · 可保存草稿 →") : moduleId === "exp-annotation" ? (annotationTasks[c.id] ? "原文摘录已核对 · 开始批注 →" : "原文摘录待核查 · 可保存草稿 →") : "开始实验 →"}</span>
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
                  aria-label={`${dim.label} ${v} 分`}
                  aria-pressed={scores[dim.id] === v}
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
  { id: "review", num: "02", label: "对照指引" },
  { id: "eval", num: "03", label: "自评存档" },
];

const STAGE_ORDER = { task: 0, review: 1, eval: 2 };

function ExperimentWorkspace({ module: mod, modules, caseItem, tagLabels, loopCopy, onBack }) {
  const { output, selfScores, interactionData, saved, loaded, stage, restoreKey,
    reviewRubric, initialDraft, revisionNote, revisionCheck, enterReview, enterEvaluation, handleRevisionNoteChange,
    saveInfo, failed, hasUnsavedWork, handleOutputChange, handleScoreChange, handleSaveDraft, handleSave, exportCurrent,
  } = useExperimentDraft(mod, caseItem);
  const [completedModuleIds, setCompletedModuleIds] = useState([]);
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
    const refresh = () => setCompletedModuleIds(Object.entries(readExperimentArchive())
      .filter(([moduleId, records]) => isExperimentComplete(moduleId, records?.[caseItem.id]))
      .map(([moduleId]) => moduleId));
    refresh();
    return subscribeRecords(refresh);
  }, [caseItem.id]);

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
  const taskCheck = checkExperimentCompletion(mod.id, interactionData);
  const taskDone = taskCheck.complete;
  const stageIdx = STAGE_ORDER[stage];

  function scrollTrainerTo(ref) {
    window.requestAnimationFrame(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function goReview() {
    if (!taskDone) return;
    if (enterReview()) scrollTrainerTo(reviewRef);
  }

  function goEval() {
    if (enterEvaluation()) scrollTrainerTo(evalRef);
  }

  const isGuidedReading = mod.feedbackStrategy?.type === "guided-reading";
  const otherModules = recommendModulesForCase(caseItem.jurisprudenceTags, modules)
    .filter((item) => item.id !== mod.id && !completedModuleIds.includes(item.id));
  const nextCopy = loopCopy?.experimentNext || {};

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
          <button className={`btn ${saved ? "btn-outline" : "btn-accent"}`} onClick={handleSaveDraft}>
            保存草稿
          </button>
        </div>
      </div>

      {mod.courseTasks?.[caseItem.id] && <Link className="btn btn-outline" href={`/courses/${mod.courseTasks[caseItem.id].slug}/`}>返回本期课程查看进度</Link>}
      <LearningContextPanel links={caseItem.learningLinks}/>
      <div className="exp-save-notice" role="status">
        <span>{saveInfo}</span>
        <button type="button" className="btn btn-outline" onClick={exportCurrent}>导出当前实验</button>
        {failed ? <button type="button" className="btn btn-outline" onClick={handleSaveDraft}>重试保存</button> : null}
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
                <LearningContextLink allowedTopics={caseItem.learningTopicIds} href={`/cases/${caseItem.id}`}>案例详情</LearningContextLink>
                <LearningContextLink allowedTopics={caseItem.learningTopicIds} href={`/cases/${caseItem.id}/study`}>研习工作台</LearningContextLink>
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
              {reviewRubric && <section className="exp-case-task"><h4>本案专属任务 · {reviewRubric.title}</h4><p>{reviewRubric.task}</p><p>{reviewRubric.courseRelation}</p></section>}
              {InteractionComponent ? (
                <InteractionComponent
                  key={restoreKey}
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
                  完成产出，进入对照指引 →
                </button>
                {!taskDone && (
                  <p className="exp-ws3-advance-hint">请补充：{taskCheck.missing.join("、")}。</p>
                )}
              </div>
            )}
          </div>

          {/* 阶段二：对照指引（递进揭示） */}
          {stageIdx >= 1 ? (
            <div className="exp-ws3-stage" ref={reviewRef}>
              <div className="exp-ws3-stage-head">
                <h3>对照指引</h3>
                <p>以下是固定学习指引，不是教师对本次作答的审阅意见。</p>
              </div>
              {reviewRubric && <CaseRubric rubric={reviewRubric} caseId={caseItem.id} />}
              {!reviewRubric && <div className="exp-ws3-teacher-grid">
                <article className="exp-ws3-teacher-card">
                  <span className="exp-ws3-teacher-avatar exp-ws3-teacher-avatar-theory">理</span>
                  <div>
                    <span className="exp-ws3-teacher-label">理论检查视角</span>
                    <p>{mod.dualTeacher.theoryPrompt}</p>
                  </div>
                </article>
                <article className="exp-ws3-teacher-card">
                  <span className="exp-ws3-teacher-avatar exp-ws3-teacher-avatar-practice">实</span>
                  <div>
                    <span className="exp-ws3-teacher-label">实务检查视角</span>
                    <p>{mod.dualTeacher.practicePrompt}</p>
                  </div>
                </article>
              </div>}

              {!reviewRubric && mod.feedbackStrategy && (
                <div className="exp-ws3-reference">
                  <div className="exp-ws3-reference-head">
                    <span className="exp-ws3-reference-type">
                      {isGuidedReading ? "引导阅读" : "参照对比"}
                    </span>
                    <p>{mod.feedbackStrategy.instruction}</p>
                  </div>
                  {!isGuidedReading && caseItem.refLegal && (
                    <div className="exp-ws3-reference-body">
                      <p>教学整理（非裁判原文、非标准答案）</p><p>{caseItem.refLegal}</p>
                    </div>
                  )}
                </div>
              )}

              {initialDraft && <section className="exp-revision-panel" aria-label="初稿与修订">
                <h4>初稿与修订</h4>
                <p>首次进入对照时的产出已保留。可回到上方修改，当前产出作为修订稿；旧记录从本次进入对照开始留存，不还原此前作答。</p>
                <details><summary>查看对照前初稿</summary><p className="exp-revision-output">{initialDraft.output}</p></details>
                <details><summary>查看当前产出</summary><p className="exp-revision-output">{output}</p></details>
                <label htmlFor="experiment-revision-note">修改说明与依据</label>
                <textarea id="experiment-revision-note" className="exp-task-textarea" rows={3} value={revisionNote} onChange={(event) => handleRevisionNoteChange(event.target.value)} placeholder="修改了哪一点？依据哪段原文或规范？如保留原判断，也可以说明理由。" />
                <button type="button" className="btn btn-outline" disabled={!revisionNote.trim()} onClick={() => handleRevisionNoteChange(revisionNote)}>确认说明适用于当前稿</button>
                <p>修改产出后须补充说明再存档；继续改稿会保留旧说明，但需要更新或重新确认。</p>
              </section>}

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
              <span>对照指引 · 完成实验产出后解锁</span>
            </div>
          )}

          {/* 阶段三：自评存档（递进揭示） */}
          {stageIdx >= 2 ? (
            evalDimensions.length > 0 && (
              <div className="exp-ws3-stage" ref={evalRef}>
                <div className="exp-ws3-stage-head">
                  <h3>自我评价</h3>
                  <p>{evalInstruction} 评分仅代表你的自我判断，不是客观能力评定。</p>
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
                    disabled={!taskDone || !revisionCheck.complete}
                    onClick={handleSave}
                  >
                    {saved ? "✓ 已存档 · 可在选案页查看历史" : "存档铸能，完成本次实验"}
                  </button>
                  {!revisionCheck.complete && <p className="exp-ws3-advance-hint">请补充：{revisionCheck.missing.join("、")}。</p>}
                  {!taskDone && (
                    <p className="exp-ws3-advance-hint">请先完成实验产出；自评可按需要填写。</p>
                  )}
                </div>

                {saved ? (
                  <section className="exp-ws3-next" aria-label={nextCopy.title || "下一步"}>
                    <div className="exp-ws3-next-copy">
                      <span className="section-eyebrow">{nextCopy.eyebrow}</span>
                      <h4>{nextCopy.title}</h4>
                      <p>{nextCopy.description}</p>
                    </div>
                    <div className="exp-ws3-next-actions">
                      <Link className="btn btn-primary" href="/archive">
                        {nextCopy.archiveLabel}
                      </Link>
                      <button className="btn btn-outline" type="button" onClick={handleBack}>
                        {nextCopy.changeCaseLabel}
                      </button>
                    </div>
                    {otherModules.length ? (
                      <div className="exp-ws3-next-modules">
                        <strong>{nextCopy.otherModulesTitle}</strong>
                        <div>
                          {otherModules.map((item) => (
                            <Link
                              key={item.id}
                              href={`/experiments/${item.id}?case=${caseItem.id}`}
                              className="tag"
                            >
                              {item.shortName}
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </section>
                ) : null}
              </div>
            )
          ) : (
            <div className="exp-ws3-stage-locked">
              <span className="exp-ws3-lock-num">03</span>
              <span>自评存档 · 完成对照指引对照后解锁</span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function ExperimentShell({ module: mod, modules, cases, tagLabels, loopCopy }) {
  const searchParams = useSearchParams();
  const [selectedCase, setSelectedCase] = useState(null);
  const requestedCaseId = searchParams.get("case");

  useEffect(() => {
    if (!requestedCaseId) return;
    const matchedCase = cases.find((item) => item.id === requestedCaseId);
    if (matchedCase) setSelectedCase(matchedCase);
  }, [cases, requestedCaseId]);

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
        key={`${mod.id}:${selectedCase.id}`}
        module={mod}
        modules={modules}
        caseItem={selectedCase}
        tagLabels={tagLabels}
        loopCopy={loopCopy}
        onBack={handleBack}
      />
    );
  }

  return <CaseSelector cases={cases} onSelect={handleSelect} tagLabels={tagLabels} moduleId={mod.id} />;
}
