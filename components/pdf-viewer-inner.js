"use client";

import { useMemo, useState } from "react";

const DEFAULT_FALLBACK_EMBED_HEIGHT = 960;

function getEmbedFallbackHeight(minHeight) {
  if (typeof minHeight === "number" && Number.isFinite(minHeight)) {
    return Math.max(640, minHeight - 70);
  }

  const matched = String(minHeight || "").match(/(\d{3,4})/u);
  if (matched) {
    return Math.max(640, Number(matched[1]) - 70);
  }

  return DEFAULT_FALLBACK_EMBED_HEIGHT;
}

function normalizePdfUrl(rawUrl) {
  const value = String(rawUrl || "").trim();
  if (!value) return "";

  const hashIndex = value.indexOf("#");
  const withoutHash = hashIndex >= 0 ? value.slice(0, hashIndex) : value;
  const queryIndex = withoutHash.indexOf("?");
  const basePath = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;
  const query = queryIndex >= 0 ? withoutHash.slice(queryIndex) : "";

  const segments = basePath.split("/");
  const lastSegment = segments.pop() || "";

  let encodedSegment = lastSegment;
  try {
    encodedSegment = encodeURIComponent(decodeURIComponent(lastSegment));
  } catch (_error) {
    encodedSegment = encodeURIComponent(lastSegment);
  }

  return `${segments.join("/")}/${encodedSegment}${query}`;
}

function buildViewerUrl(fileUrl, viewMode) {
  const baseUrl = normalizePdfUrl(fileUrl);
  if (!baseUrl) return "";
  return viewMode === "width" ? `${baseUrl}#view=FitH` : `${baseUrl}#view=Fit`;
}

export default function PdfViewerInner({
  fileUrl,
  fileName,
  minHeight = 900,
  downloadHref,
  fillAvailableHeight = false,
  defaultViewMode = "page",
  hideFooter = false,
}) {
  const normalizedDefaultViewMode = defaultViewMode === "width" ? "width" : "page";
  const [viewMode, setViewMode] = useState(normalizedDefaultViewMode);

  const shellHeight = typeof minHeight === "number" ? `${Math.max(0, minHeight)}px` : String(minHeight || "980px");
  const shellStyle = fillAvailableHeight
    ? {
        minHeight: 0,
        height: "100%",
        flex: "1 1 auto",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }
    : {
        minHeight: shellHeight,
        height: shellHeight,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      };

  const frameWrapStyle = fillAvailableHeight
    ? { flex: "1 1 auto", minHeight: 0, height: "100%" }
    : { minHeight: getEmbedFallbackHeight(minHeight) };

  const openHref = useMemo(() => normalizePdfUrl(downloadHref || fileUrl), [downloadHref, fileUrl]);
  const viewerHref = useMemo(() => buildViewerUrl(downloadHref || fileUrl, viewMode), [downloadHref, fileUrl, viewMode]);

  if (!fileUrl) {
    return (
      <div className="pdf-shell" style={shellStyle}>
        <div className="pdf-empty-state">当前案例还没有配置可阅读的 PDF 文件。</div>
      </div>
    );
  }

  return (
    <div className="pdf-shell" style={shellStyle}>
      <div className="pdf-toolbar">
        <div className="pdf-toolbar-group">
          <button className={`btn btn-outline${viewMode === "page" ? " is-active" : ""}`} type="button" onClick={() => setViewMode("page")}>
            整页预览
          </button>
          <button className={`btn btn-outline${viewMode === "width" ? " is-active" : ""}`} type="button" onClick={() => setViewMode("width")}>
            适配宽度
          </button>
        </div>

        <div className="pdf-toolbar-group">
          <a className="btn btn-outline" href={openHref} target="_blank" rel="noreferrer">
            新窗口打开
          </a>
          <a className="btn btn-outline" href={openHref} download={fileName || true}>
            下载 PDF
          </a>
        </div>
      </div>

      <div className="pdf-canvas-wrap">
        <div className="pdf-frame-wrap" style={frameWrapStyle}>
          <iframe className="pdf-frame" title={`pdf-preview-${fileName || "document"}`} src={viewerHref} loading="eager" />
        </div>
      </div>

      {hideFooter ? null : (
        <div className="pdf-footer-note">
          <div>{`文件：${fileName || fileUrl}`}</div>
          <div>默认使用浏览器内置 PDF 预览，可在新窗口打开原始 PDF。</div>
        </div>
      )}
    </div>
  );
}
