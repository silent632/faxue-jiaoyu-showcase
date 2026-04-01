"use client";

import dynamic from "next/dynamic";

const PdfViewerInner = dynamic(() => import("./pdf-viewer-inner"), {
  ssr: false,
  loading: () => (
    <div className="pdf-shell pdf-shell-loading">
      <p className="status-inline status-inline-muted">PDF 组件加载中...</p>
    </div>
  ),
});

export default function PdfViewer(props) {
  return <PdfViewerInner {...props} />;
}
