"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  clampPdfPage,
  clampPdfScale,
  getNextPdfScale,
  normalizePdfAssetUrl,
} from "@/lib/pdf-viewer-state";

const DEFAULT_FALLBACK_EMBED_HEIGHT = 960;
const PDF_WORKER_SRC = "/pdf.worker.min.mjs";

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

function getFitScale(mode, pageSize, containerSize) {
  const pageWidth = Number(pageSize?.width) || 0;
  const pageHeight = Number(pageSize?.height) || 0;
  const containerWidth = Number(containerSize?.width) || 0;
  const containerHeight = Number(containerSize?.height) || 0;

  if (!pageWidth || !pageHeight || !containerWidth) {
    return 1;
  }

  const safeWidth = Math.max(320, containerWidth - 36);
  const widthScale = safeWidth / pageWidth;
  if (mode === "page" && containerHeight) {
    const safeHeight = Math.max(360, containerHeight - 36);
    const heightScale = safeHeight / pageHeight;
    return clampPdfScale(Math.min(widthScale, heightScale));
  }

  return clampPdfScale(widthScale);
}

function formatPdfError(error) {
  const message = String(error?.message || error || "").trim();
  if (!message) {
    return "当前环境未能完成站内阅读，可改用备用打开方式继续查看原文。";
  }

  if (/fetch|network|load|request|response/u.test(message)) {
    return "PDF 原文暂时未能成功加载，可先使用新窗口打开或下载 PDF 继续阅读。";
  }

  return "站内阅读暂未成功完成，可先使用新窗口打开或下载 PDF 继续阅读。";
}

function isExpectedPdfAbort(error) {
  const name = String(error?.name || "");
  const message = String(error?.message || error || "");
  return /AbortException|RenderingCancelledException/u.test(name) || /aborted|cancelled|canceled/u.test(message);
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
  const normalizedDefaultViewMode = defaultViewMode === "page" ? "page" : "width";
  const normalizedSource = useMemo(() => normalizePdfAssetUrl(downloadHref || fileUrl), [downloadHref, fileUrl]);
  const frameWrapRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState(fileUrl ? "loading" : "empty");
  const [errorMessage, setErrorMessage] = useState("");
  const [pdfDocument, setPdfDocument] = useState(null);
  const [pageCount, setPageCount] = useState(1);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState({ width: 0, height: 0 });
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [scaleMode, setScaleMode] = useState(normalizedDefaultViewMode);
  const [manualScale, setManualScale] = useState(1);
  const [isRendering, setIsRendering] = useState(false);

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

  const fitWidthScale = useMemo(() => getFitScale("width", pageSize, containerSize), [pageSize, containerSize]);
  const fitPageScale = useMemo(() => getFitScale("page", pageSize, containerSize), [pageSize, containerSize]);
  const activeScale = scaleMode === "manual" ? clampPdfScale(manualScale) : scaleMode === "page" ? fitPageScale : fitWidthScale;

  useEffect(() => {
    setScaleMode(normalizedDefaultViewMode);
  }, [normalizedDefaultViewMode, normalizedSource]);

  useEffect(() => {
    if (!fileUrl) {
      setStatus("empty");
      setErrorMessage("");
      setPdfDocument(null);
      setPageCount(1);
      setPageNumber(1);
      setPageSize({ width: 0, height: 0 });
      return undefined;
    }

    let disposed = false;
    let loadingTask = null;
    let nextDocument = null;

    async function loadDocument() {
      setStatus("loading");
      setErrorMessage("");
      setPdfDocument(null);
      setPageCount(1);
      setPageNumber(1);
      setPageSize({ width: 0, height: 0 });

      try {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        if (disposed) return;
        if (pdfjs.GlobalWorkerOptions?.workerSrc !== PDF_WORKER_SRC) {
          pdfjs.GlobalWorkerOptions.workerSrc = PDF_WORKER_SRC;
        }

        loadingTask = pdfjs.getDocument({
          url: normalizedSource,
          isEvalSupported: false,
        });
        nextDocument = await loadingTask.promise;
        if (disposed) {
          await nextDocument.destroy();
          return;
        }

        setPdfDocument(nextDocument);
        setPageCount(nextDocument.numPages || 1);
        setPageNumber(1);
        setStatus("ready");
      } catch (error) {
        if (disposed || isExpectedPdfAbort(error)) return;
        setStatus("error");
        setErrorMessage(formatPdfError(error));
      }
    }

    loadDocument();

    return () => {
      disposed = true;
      if (loadingTask && typeof loadingTask.destroy === "function") {
        loadingTask.destroy();
      }
      if (nextDocument && typeof nextDocument.destroy === "function") {
        Promise.resolve(nextDocument.destroy()).catch(() => {});
      }
    };
  }, [fileUrl, normalizedSource]);

  useEffect(() => {
    const node = frameWrapRef.current;
    if (!node || typeof ResizeObserver === "undefined") return undefined;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const nextSize = {
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      };
      setContainerSize((current) =>
        current.width === nextSize.width && current.height === nextSize.height ? current : nextSize
      );
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setPageNumber((current) => clampPdfPage(current, pageCount));
  }, [pageCount]);

  useEffect(() => {
    if (!pdfDocument || status !== "ready") return undefined;

    let disposed = false;
    let renderTask = null;

    async function renderPage() {
      try {
        setIsRendering(true);
        const page = await pdfDocument.getPage(pageNumber);
        if (disposed) return;

        const baseViewport = page.getViewport({ scale: 1 });
        setPageSize((current) =>
          current.width === baseViewport.width && current.height === baseViewport.height
            ? current
            : { width: baseViewport.width, height: baseViewport.height }
        );

        const viewport = page.getViewport({ scale: activeScale });
        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext("2d", { alpha: false });
        if (!context) {
          throw new Error("PDF canvas context unavailable");
        }

        const pixelRatio = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
        canvas.width = Math.max(1, Math.floor(viewport.width * pixelRatio));
        canvas.height = Math.max(1, Math.floor(viewport.height * pixelRatio));
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);
        renderTask = page.render({
          canvasContext: context,
          viewport,
          transform: pixelRatio === 1 ? undefined : [pixelRatio, 0, 0, pixelRatio, 0, 0],
        });
        await renderTask.promise;
        if (!disposed) {
          page.cleanup();
        }
      } catch (error) {
        if (disposed || isExpectedPdfAbort(error)) return;
        setStatus("error");
        setErrorMessage(formatPdfError(error));
      } finally {
        if (!disposed) {
          setIsRendering(false);
        }
      }
    }

    renderPage();

    return () => {
      disposed = true;
      if (renderTask && typeof renderTask.cancel === "function") {
        renderTask.cancel();
      }
    };
  }, [activeScale, pageNumber, pdfDocument, status]);

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
          <button
            className={`btn btn-outline${scaleMode === "page" ? " is-active" : ""}`}
            type="button"
            onClick={() => setScaleMode("page")}
            disabled={status !== "ready"}
          >
            整页预览
          </button>
          <button
            className={`btn btn-outline${scaleMode === "width" ? " is-active" : ""}`}
            type="button"
            onClick={() => setScaleMode("width")}
            disabled={status !== "ready"}
          >
            适配宽度
          </button>
          <button
            className="btn btn-outline"
            type="button"
            onClick={() => {
              setScaleMode("manual");
              setManualScale((current) => getNextPdfScale(scaleMode === "manual" ? current : activeScale, -0.15));
            }}
            disabled={status !== "ready"}
          >
            缩小
          </button>
          <button
            className="btn btn-outline"
            type="button"
            onClick={() => {
              setScaleMode("manual");
              setManualScale((current) => getNextPdfScale(scaleMode === "manual" ? current : activeScale, 0.15));
            }}
            disabled={status !== "ready"}
          >
            放大
          </button>
          <span className="pdf-toolbar-meta">{`${Math.round(activeScale * 100)}%`}</span>
        </div>

        <div className="pdf-toolbar-group">
          <button
            className="btn btn-outline"
            type="button"
            onClick={() => setPageNumber((current) => clampPdfPage(current - 1, pageCount))}
            disabled={status !== "ready" || pageNumber <= 1}
          >
            上一页
          </button>
          <span className="pdf-toolbar-meta">{`第 ${pageNumber} / ${pageCount} 页`}</span>
          <button
            className="btn btn-outline"
            type="button"
            onClick={() => setPageNumber((current) => clampPdfPage(current + 1, pageCount))}
            disabled={status !== "ready" || pageNumber >= pageCount}
          >
            下一页
          </button>
        </div>

        <div className="pdf-toolbar-group">
          <a className="btn btn-outline" href={normalizedSource} target="_blank" rel="noreferrer">
            新窗口打开
          </a>
          <a className="btn btn-outline" href={normalizedSource} download={fileName || true}>
            下载 PDF
          </a>
        </div>
      </div>

      <div className="pdf-canvas-wrap">
        <div ref={frameWrapRef} className={`pdf-frame-wrap pdf-frame-wrap-${status}`} style={frameWrapStyle}>
          {status === "loading" ? (
            <div className="pdf-status-card">
              <p className="status-inline">正在加载原文，可直接在站内阅读。</p>
              <p className="status-inline status-inline-muted">如当前网络环境较慢，也可先使用右上角的备用打开方式。</p>
            </div>
          ) : null}

          {status === "error" ? (
            <div className="pdf-status-card pdf-status-card-warning">
              <p className="status-inline">{errorMessage}</p>
              <p className="status-inline status-inline-muted">你仍可使用“新窗口打开”或“下载 PDF”继续查看完整原文。</p>
            </div>
          ) : null}

          {status === "ready" ? (
            <div className="pdf-canvas-stage">
              {isRendering ? <div className="pdf-rendering-badge">正在渲染本页内容...</div> : null}
              <canvas ref={canvasRef} className="pdf-canvas" />
            </div>
          ) : null}
        </div>
      </div>

      {hideFooter ? null : (
        <div className="pdf-footer-note">
          <div>{`文件：${fileName || fileUrl}`}</div>
          <div>默认优先使用站内阅读；如当前环境受限，可使用新窗口打开或下载 PDF 继续查看原文。</div>
        </div>
      )}
    </div>
  );
}
