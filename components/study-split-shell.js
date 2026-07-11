"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import PdfViewer from "@/components/pdf-viewer";
import StudyWorkspace from "@/components/study-workspace";

/** 左栏主体：纸面版式的案例整理材料（裁判说理不在此展示，留给第三步对照揭示） */
function StudyMaterialReader({ caseItem }) {
  const sections = [
    { label: "案例摘要", text: caseItem.summary },
    { label: "事实梳理", text: caseItem.refFact },
    { label: "争议焦点", text: caseItem.refIssue },
  ].filter((block) => String(block.text || "").trim());

  return (
    <div className="exp-ws3-reader-inner study-reader-inner">
      <div className="exp-ws3-reader-head">
        <span className="exp-ws3-reader-doctag">案例材料</span>
        <h2 className="exp-ws3-reader-title">{caseItem.title}</h2>
        <p className="exp-ws3-reader-meta">
          {[caseItem.caseNumber, caseItem.courtName, caseItem.judgmentDate].filter(Boolean).join(" · ")}
        </p>
      </div>

      {sections.map((block) => (
        <section key={block.label} className="exp-ws3-reader-section">
          <h3>{block.label}</h3>
          <p>{block.text}</p>
        </section>
      ))}

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

      <p className="study-reader-footnote">裁判说理与法院结论会在完成第三步写作后开放对照。</p>
    </div>
  );
}

const STORAGE_KEY = "study-shell-left-pane-width";
const DEFAULT_LEFT_PANE = 48;
const MIN_LEFT_PANE = 38;
const MAX_LEFT_PANE = 62;

function clampPaneWidth(value) {
  return Math.min(MAX_LEFT_PANE, Math.max(MIN_LEFT_PANE, value));
}

export default function StudySplitShell({ caseItem, userSid, pdfFileName, hasPdf }) {
  const shellRef = useRef(null);
  const [leftPaneWidth, setLeftPaneWidth] = useState(DEFAULT_LEFT_PANE);
  const [isDragging, setIsDragging] = useState(false);
  const [readerTab, setReaderTab] = useState("material");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedValue = Number(window.localStorage.getItem(STORAGE_KEY));
    if (Number.isFinite(savedValue)) {
      setLeftPaneWidth(clampPaneWidth(savedValue));
    }
  }, []);

  // 沉浸工作态：侧栏收窄为图标条
  useEffect(() => {
    document.documentElement.dataset.workspace = "immersive";
    return () => {
      delete document.documentElement.dataset.workspace;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, String(leftPaneWidth));
  }, [leftPaneWidth]);

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
      setLeftPaneWidth(clampPaneWidth(nextWidth));
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

  function resetWidth() {
    setLeftPaneWidth(DEFAULT_LEFT_PANE);
  }

  function nudgeWidth(delta) {
    setLeftPaneWidth((current) => clampPaneWidth(current + delta));
  }

  const shellStyle = useMemo(() => ({ "--study-left-pane": `${leftPaneWidth}%` }), [leftPaneWidth]);

  return (
    <div ref={shellRef} className={`study-shell fade-in${isDragging ? " is-dragging" : ""}`} style={shellStyle}>
      <section className="split-pane" id="pdf-pane">
        <div className="glass-sm study-pane-card study-pane-card-pdf">
          <div className="study-reader-tabs">
            <button
              type="button"
              className={`study-reader-tab${readerTab === "material" ? " active" : ""}`}
              onClick={() => setReaderTab("material")}
            >
              整理材料
            </button>
            <button
              type="button"
              className={`study-reader-tab${readerTab === "pdf" ? " active" : ""}`}
              onClick={() => setReaderTab("pdf")}
              disabled={!hasPdf}
              title={hasPdf ? "" : "当前案例暂未提供 PDF 原文"}
            >
              原文 PDF
            </button>
            {readerTab === "pdf" && pdfFileName ? (
              <span className="study-pane-meta" title={pdfFileName}>{pdfFileName}</span>
            ) : null}
          </div>

          <div className={`study-pane-body${readerTab === "pdf" ? " study-pane-body-pdf" : " study-pane-body-material"}`}>
            {readerTab === "material" ? (
              <StudyMaterialReader caseItem={caseItem} />
            ) : (
              <PdfViewer
                fileUrl={`/pdfs/${encodeURIComponent(pdfFileName)}`}
                fileName={pdfFileName}
                minHeight={0}
                downloadHref={`/pdfs/${encodeURIComponent(pdfFileName)}`}
                fillAvailableHeight
                defaultViewMode="width"
                hideFooter
                fallbackContent={<StudyMaterialReader caseItem={caseItem} />}
              />
            )}
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
              setLeftPaneWidth(MIN_LEFT_PANE);
            }
            if (event.key === "End") {
              event.preventDefault();
              setLeftPaneWidth(MAX_LEFT_PANE);
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
            <StudyWorkspace caseItem={caseItem} userSid={userSid} hasPdf={hasPdf} mode="split" />
          </div>
        </div>
      </section>
    </div>
  );
}
