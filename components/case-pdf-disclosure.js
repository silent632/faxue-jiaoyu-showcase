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
          <strong>{expanded ? "原文预览" : "查看原文预览"}</strong>
          <p>可在详情页中直接浏览原文版式与关键段落，也可进入研习页面继续阅读与分析。</p>
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
              <p>适合结合案例摘要和裁判信息继续阅读原文，也可在新窗口中打开完整 PDF。</p>
            </div>
            <span>{fileName}</span>
          </div>
          <PdfViewer fileUrl={fileUrl} fileName={fileName} minHeight={1180} downloadHref={fileUrl} defaultViewMode="page" />
        </>
      ) : null}
    </section>
  );
}
