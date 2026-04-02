"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import PdfViewer from "@/components/pdf-viewer";
import StudyWorkspace from "@/components/study-workspace";
import { getPublicStudyReaderNote, getPublicStudyWriterNote } from "@/lib/public-showcase-study";

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

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedValue = Number(window.localStorage.getItem(STORAGE_KEY));
    if (Number.isFinite(savedValue)) {
      setLeftPaneWidth(clampPaneWidth(savedValue));
    }
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
          <div className="study-pane-head">
            <div className="study-pane-head-copy">
              <span className="study-pane-kicker">原文阅读</span>
              <strong className="study-pane-title">先通读，再定位细节</strong>
              <span className="study-pane-head-note">{getPublicStudyReaderNote({ hasPdf })}</span>
            </div>
            <span className="study-pane-meta" title={pdfFileName || ""}>{pdfFileName || "未配置 PDF"}</span>
          </div>

          <div className="study-pane-body study-pane-body-pdf">
            {hasPdf ? (
              <PdfViewer
                fileUrl={`/pdfs/${encodeURIComponent(pdfFileName)}`}
                fileName={pdfFileName}
                minHeight={0}
                downloadHref={`/pdfs/${encodeURIComponent(pdfFileName)}`}
                fillAvailableHeight
                defaultViewMode="width"
                hideFooter
              />
            ) : (
              <div className="study-pane-empty">
                当前案例暂未提供 PDF 原文，可先结合案例导读与右侧研习内容继续阅读和分析。
              </div>
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
          <div className="study-pane-head study-pane-head-workspace">
            <div className="study-pane-head-copy">
              <span className="study-pane-kicker">结构化输出</span>
              <strong className="study-pane-title">围绕同一份文书完成三步研习</strong>
              <span className="study-pane-head-note">{getPublicStudyWriterNote({ hasPdf })}</span>
            </div>
            <button className="btn btn-outline study-pane-reset-btn" type="button" onClick={resetWidth}>
              重置宽度
            </button>
          </div>

          <div className="study-pane-scroll">
            <StudyWorkspace caseItem={caseItem} userSid={userSid} hasPdf={hasPdf} mode="split" />
          </div>
        </div>
      </section>
    </div>
  );
}
