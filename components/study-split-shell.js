"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import LearningContextLink from "@/components/learning-context-link";
import CaseTranscript from "@/components/case-transcript";
import PdfViewer from "@/components/pdf-viewer";
import StudyWorkspace from "@/components/study-workspace";

const STORAGE_KEY = "study-shell-left-pane-width";
const DEFAULT_LEFT_PANE = 48;
const MIN_LEFT_PANE = 38;
const MAX_LEFT_PANE = 62;

function clampPaneWidth(value) {
  return Math.min(MAX_LEFT_PANE, Math.max(MIN_LEFT_PANE, value));
}

export default function StudySplitShell({
  caseItem,
  userSid,
  source,
  recommendedModules,
  allowedTopics,
}) {
  const shellRef = useRef(null);
  const [leftPaneWidth, setLeftPaneWidth] = useState(DEFAULT_LEFT_PANE);
  const [isDragging, setIsDragging] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [mobilePane, setMobilePane] = useState("pdf-pane");
  const paneKey = `study-mobile-pane:${userSid}:${caseItem.id}`;

  useEffect(() => {
    try {
      if (window.localStorage.getItem(paneKey) === "study-pane") setMobilePane("study-pane");
    } catch { /* 可继续切换 */ }
  }, [paneKey]);

  function choosePane(name) {
    setMobilePane(name);
    try { window.localStorage.setItem(paneKey, name); } catch { /* 可继续切换 */ }
  }
  const readingPositionKey = `study-pdf-page:${userSid}:${caseItem.id}:${source.file}`;
  const pdfUrl = `/pdfs/${encodeURIComponent(source.file)}`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      const savedValue = Number(stored);
      if (stored && savedValue >= MIN_LEFT_PANE && savedValue <= MAX_LEFT_PANE) setLeftPaneWidth(savedValue);
    } catch { /* 分栏仍可使用 */ }
  }, []);

  // 沉浸工作态：侧栏收窄为图标条
  useEffect(() => {
    document.documentElement.dataset.workspace = "immersive";
    return () => {
      delete document.documentElement.dataset.workspace;
    };
  }, []);

  useEffect(() => {
    if (!isDragging) return undefined;

    function stopDragging() {
      setIsDragging(false);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
    }

    function handlePointerMove(event) {
      if (window.innerWidth <= 1024) return;
      const rect = shellRef.current?.getBoundingClientRect();
      if (!rect || rect.width <= 0) return;
      const nextWidth = ((event.clientX - rect.left) / rect.width) * 100;
      changeWidth(nextWidth);
    }

    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", stopDragging);
    window.addEventListener("pointercancel", stopDragging);

    return () => {
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", stopDragging);
      window.removeEventListener("pointercancel", stopDragging);
    };
  }, [isDragging]);

  function startDragging(event) {
    if (typeof window !== "undefined" && window.innerWidth <= 1024) return;
    event.preventDefault();
    setIsDragging(true);
  }

  function rememberWidth(width) {
    try { window.localStorage.setItem(STORAGE_KEY, String(width)); } catch { /* 分栏仍可使用 */ }
  }

  function changeWidth(width) {
    const next = clampPaneWidth(width);
    setLeftPaneWidth(next);
    rememberWidth(next);
  }

  function resetWidth() {
    changeWidth(DEFAULT_LEFT_PANE);
  }

  function nudgeWidth(delta) {
    changeWidth(leftPaneWidth + delta);
  }

  const shellStyle = useMemo(() => ({ "--study-left-pane": `${leftPaneWidth}%` }), [leftPaneWidth]);

  return (
    <div ref={shellRef} className={`study-shell fade-in pilot-study${isDragging ? " is-dragging" : ""}`} style={shellStyle} data-mobile-pane={mobilePane}>
      <nav className="study-mobile-panes" aria-label="原文和笔记">
        <button type="button" aria-controls="pdf-pane" aria-pressed={mobilePane === "pdf-pane"} onClick={() => choosePane("pdf-pane")}>读原文</button>
        <button type="button" aria-controls="study-pane" aria-pressed={mobilePane === "study-pane"} onClick={() => choosePane("study-pane")}>写研习笔记</button>
      </nav>
      <section className="split-pane" id="pdf-pane">
        <div className="glass-sm study-pane-card study-pane-card-pdf">
            <div className="pilot-reader-tools">
              <strong>{source.title}</strong>
              <button className="btn btn-outline" type="button" onClick={() => setShowPdf(current => !current)}>{showPdf ? "返回文字全文" : "核对 PDF 原件"}</button>
              <LearningContextLink carrySource className="btn btn-primary"
                href={`/resources/laws/?fromCase=${caseItem.id}`}>查法条</LearningContextLink>
              {caseItem.laws?.length > 0 && <details className="study-cited-laws">
                <summary>本案引用</summary>
                <ul>{[...new Set(caseItem.laws.map((law) => [law.displayLaw || law.law, law.article].filter(Boolean).join(" ")))].map((label) => {
                  const query = new URLSearchParams({ fromCase: caseItem.id, q: label });
                  return <li key={label}><LearningContextLink carrySource href={`/resources/laws/?${query}`}>{label} →</LearningContextLink></li>;
                })}</ul>
              </details>}
            </div>
          <div className={`study-pane-body study-pane-body-pdf${showPdf ? "" : " study-transcript-body"}`}>
            {showPdf ? (
            <PdfViewer fileUrl={pdfUrl} fileName={source.file} caseNumber={caseItem.caseNumber} minHeight={0}
              downloadHref={pdfUrl} fillAvailableHeight defaultViewMode="width" hideFooter
              readingPositionKey={readingPositionKey} />
            ) : <CaseTranscript caseId={caseItem.id} source={source} pdfUrl={pdfUrl} readingPositionKey={readingPositionKey} />}
          </div>
        </div>
      </section>

      <div className="study-divider">
        <button
          className="study-divider-handle"
          type="button"
          onPointerDown={startDragging}
          onDoubleClick={resetWidth}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              nudgeWidth(-2);
            }
            if (event.key === "ArrowRight") {
              event.preventDefault();
              nudgeWidth(2);
            }
            if (event.key === "Home") {
              event.preventDefault();
              changeWidth(MIN_LEFT_PANE);
            }
            if (event.key === "End") {
              event.preventDefault();
              changeWidth(MAX_LEFT_PANE);
            }
          }}
          aria-label="调整左侧阅读区和右侧研习区宽度"
          title="拖动可调整宽度，双击可重置"
        >
          <span />
          <span />
          <span />
        </button>
        <span className="study-divider-tip">拖动调宽</span>
      </div>

      <section className="split-pane" id="study-pane">
        <div className="study-pane-card study-pane-card-workspace">
          <div className="study-pane-scroll">
            <StudyWorkspace
              caseItem={caseItem}
              fullText
              userSid={userSid}
              hasPdf
              mode="split"
              recommendedModules={recommendedModules}
              allowedTopics={allowedTopics}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
