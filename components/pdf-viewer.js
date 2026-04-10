"use client";

import dynamic from "next/dynamic";

const PdfViewerInner = dynamic(() => import("./pdf-viewer-inner"), {
  ssr: false,
  loading: () => (
    <div className="pdf-shell pdf-shell-loading">
      <p className="status-inline status-inline-muted">PDF 阅读器加载中，稍后可直接在站内查看原文。</p>
    </div>
  ),
});

export default function PdfViewer(props) {
  return <PdfViewerInner {...props} />;
}
