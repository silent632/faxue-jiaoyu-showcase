"use client";

import { useState } from "react";
import PdfViewer from "@/components/pdf-viewer";

export default function CasePdfDisclosure({ fileUrl, fileName }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="glass-sm case-pdf-panel" id="case-preview">
      <button
        className={`case-pdf-summary-toggle${expanded ? " is-open" : ""}`}
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
      >
        <div className="case-pdf-summary-copy">
          <span className="case-pdf-summary-kicker">PDF 预览</span>
          <strong>{expanded ? "原文预览已展开" : "点击展开原文预览"}</strong>
          <p>详情页默认先收起预览，避免一开始就被大块原文占住注意力；需要连续精读时，再展开预览或直接进入研习页。</p>
        </div>
        <div className="case-pdf-summary-meta">
          <span>{fileName}</span>
          <span className="case-pdf-summary-action">{expanded ? "收起预览" : "展开预览"}</span>
        </div>
      </button>

      {expanded ? (
        <>
          <div className="case-pdf-panel-head">
            <div>
              <h2>PDF 预览</h2>
              <p>这里只适合快速确认版式和关键段落；如果要连续精读，建议直接进入研习页或新窗口打开原始 PDF。</p>
            </div>
            <span>{fileName}</span>
          </div>
          <PdfViewer fileUrl={fileUrl} fileName={fileName} minHeight={1180} downloadHref={fileUrl} defaultViewMode="page" />
        </>
      ) : null}
    </section>
  );
}
