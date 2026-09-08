"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { findPdfText, formatPdfCitation, getPdfPageFromHash } from "@/lib/pdf-text";

import {
  clampPdfPage,
  clampPdfScale,
  getNextPdfScale,
  normalizePdfAssetUrl,
} from "@/lib/pdf-viewer-state";

const PDF_WORKER_SRC = "/pdf.worker.min.mjs";

function getFitScale(mode, pageSize, containerSize) {
  const pageWidth = Number(pageSize?.width) || 0;
  const pageHeight = Number(pageSize?.height) || 0;
  const containerWidth = Number(containerSize?.width) || 0;
  const containerHeight = Number(containerSize?.height) || 0;

  if (!pageWidth || !pageHeight || !containerWidth) {
    return 1;
  }

  const safeWidth = Math.max(100, containerWidth - 24);
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
  caseNumber,
  minHeight = 900,
  downloadHref,
  fillAvailableHeight = false,
  defaultViewMode = "page",
  hideFooter = false,
  fallbackContent = null,
}) {
  const normalizedDefaultViewMode = defaultViewMode === "page" ? "page" : "width";
  const normalizedSource = useMemo(() => normalizePdfAssetUrl(downloadHref || fileUrl), [downloadHref, fileUrl]);
  const viewportRef = useRef(null);
  const canvasRef = useRef(null);
  const textLayerRef = useRef(null);
  const pdfApiRef = useRef(null);
  const searchJob = useRef(0);
  const [pageInput, setPageInput] = useState("1");
  const [query, setQuery] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchNotice, setSearchNotice] = useState("");
  const [searching, setSearching] = useState(false);
  const [textNotice, setTextNotice] = useState("");
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
    : { minHeight: "100%" };

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
      setQuery(""); setActiveQuery(""); setSearchResults([]); setSearchNotice(""); setSearching(false); setTextNotice("");
      setStatus("loading");
      setErrorMessage("");
      setPdfDocument(null);
      setPageCount(1);
      setPageNumber(1);
      setPageSize({ width: 0, height: 0 });

      try {
        const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
        if (disposed) return;
        pdfApiRef.current = pdfjs;
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
        setPageNumber(clampPdfPage(getPdfPageFromHash(window.location.hash, getPdfPageFromHash(fileUrl.split("#")[1])), nextDocument.numPages));
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
      searchJob.current += 1;
      if (loadingTask && typeof loadingTask.destroy === "function") {
        loadingTask.destroy();
      }
      if (nextDocument && typeof nextDocument.destroy === "function") {
        Promise.resolve(nextDocument.destroy()).catch(() => {});
      }
    };
  }, [fileUrl, normalizedSource]);

  useEffect(() => {
    setPageInput(String(pageNumber));
  }, [pageNumber]);

  useEffect(() => {
    const followReference = () => setPageNumber(clampPdfPage(getPdfPageFromHash(window.location.hash, pageNumber), pageCount));
    window.addEventListener("hashchange", followReference);
    return () => window.removeEventListener("hashchange", followReference);
  }, [pageNumber, pageCount]);

  useEffect(() => {
    const node = viewportRef.current;
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
    let textLayer = null;

    async function renderPage() {
      try {
        setIsRendering(true);
        textLayerRef.current?.replaceChildren();
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
        if (disposed) return;
        try {
          const content = await page.getTextContent();
          if (disposed || !textLayerRef.current) return;
          const container = textLayerRef.current;
          container.replaceChildren();
          container.style.setProperty("--total-scale-factor", String(viewport.scale));
          textLayer = new pdfApiRef.current.TextLayer({ textContentSource: content, container, viewport });
          await textLayer.render();
          if (disposed) return;
          const matches = findPdfText(textLayer.textContentItemsStr, activeQuery);
          for (const index of matches.indexes) textLayer.textDivs[index]?.classList.add("pdf-text-match");
          setTextNotice(textLayer.textContentItemsStr.some((value) => value.trim()) ? "可选择文字；复制时附带案号和 PDF 页码。" : "本页没有可选择文字，可能是扫描页；可查看图像或下载原文，未执行 OCR。");
        } catch (error) {
          if (!disposed && !isExpectedPdfAbort(error)) setTextNotice("本页文字层未能加载，仍可查看图像或下载原文。");
        }
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
      textLayer?.cancel();
    };
  }, [activeScale, activeQuery, pageNumber, pdfDocument, status]);

  async function searchDocument(event) {
    event.preventDefault();
    const job = ++searchJob.current;
    const term = query.trim();
    setActiveQuery(term); setSearchResults([]);
    if (!term || !pdfDocument) { setSearchNotice(""); setSearching(false); return; }
    setSearching(true); setSearchNotice("正在查找全文…");
    const results = [];
    let pagesWithoutText = 0;
    try {
      for (let number = 1; number <= pdfDocument.numPages; number += 1) {
        const page = await pdfDocument.getPage(number);
        if (job !== searchJob.current) return;
        const content = await page.getTextContent();
        if (job !== searchJob.current) return;
        const strings = content.items.filter((item) => typeof item.str === "string").map((item) => item.str);
        if (!strings.some((text) => text.trim())) pagesWithoutText += 1;
        const match = findPdfText(strings, term);
        if (match.count) results.push({ page: number, ...match });
      }
      setSearchResults(results);
      setSearchNotice(`找到 ${results.length} 页匹配结果。${pagesWithoutText ? `${pagesWithoutText} 页没有可检索文字。` : ""}`);
    } catch (error) {
      if (job === searchJob.current) setSearchNotice("全文查找未完成，可换词重试或下载原文查阅。");
    } finally { if (job === searchJob.current) setSearching(false); }
  }

  function copySelection(event) {
    const selection = window.getSelection();
    if (!selection?.toString() || !textLayerRef.current?.contains(selection.anchorNode) || !textLayerRef.current?.contains(selection.focusNode)) return;
    event.clipboardData.setData("text/plain", formatPdfCitation(selection.toString(), caseNumber || fileName, pageNumber));
    event.preventDefault();
  }

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
          <form className="pdf-page-jump" onSubmit={(event) => { event.preventDefault(); const next = clampPdfPage(pageInput, pageCount); setPageNumber(next); setPageInput(String(next)); }}>
            <input type="number" aria-label="跳转页码" min="1" max={pageCount} step="1" value={pageInput} onChange={(event) => setPageInput(event.target.value)} disabled={status !== "ready"} />
            <button className="btn btn-outline" type="submit" disabled={status !== "ready"}>跳转</button>
          </form>
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
          <a className="btn btn-outline" href={`${normalizedSource}#page=${pageNumber}`} target="_blank" rel="noreferrer">
            新窗口打开
          </a>
          <a className="btn btn-outline" href={normalizedSource} download={fileName || true}>
            下载 PDF
          </a>
        </div>
      </div>

      <form className="pdf-search-form" onSubmit={searchDocument}>
        <input type="search" aria-label="查找 PDF 原文" placeholder="查找原文中的词句" value={query} maxLength={100} onChange={(event) => setQuery(event.target.value)} disabled={status !== "ready"} />
        <button className="btn btn-outline" type="submit" disabled={status !== "ready"}>{searching ? "重新查找" : "查找全文"}</button>
        {searching ? <button className="btn btn-ghost" type="button" onClick={() => { searchJob.current += 1; setSearching(false); setSearchNotice("已停止查找。"); }}>停止</button> : null}
      </form>
      {searchNotice ? <div className="pdf-search-results" role="status">
        <p>{searchNotice}</p>
        {searchResults.length ? <ul>{searchResults.map((result) => <li key={result.page}><button type="button" onClick={() => setPageNumber(result.page)} aria-label={`定位到第 ${result.page} 页`}>第 {result.page} 页 · {result.snippet}</button></li>)}</ul> : null}
      </div> : null}
      {textNotice ? <p className="pdf-text-notice" style={{ visibility: isRendering ? "hidden" : undefined }}>{textNotice}</p> : null}

      <div ref={viewportRef} className="pdf-canvas-wrap">
        <div className={`pdf-frame-wrap pdf-frame-wrap-${status}`} style={frameWrapStyle}>
          {status === "loading" ? (
            <div className="pdf-status-card">
              <p className="status-inline">正在加载原文，可直接在站内阅读。</p>
              <p className="status-inline status-inline-muted">如当前网络环境较慢，也可先使用右上角的备用打开方式。</p>
            </div>
          ) : null}

          {status === "error" ? (
            <div className="pdf-error-wrap">
              <div className="pdf-status-card pdf-status-card-warning">
                <p className="status-inline">{errorMessage}</p>
                <p className="status-inline status-inline-muted">你仍可使用“新窗口打开”或“下载 PDF”继续查看完整原文。</p>
              </div>
              {fallbackContent}
            </div>
          ) : null}

          {status === "ready" ? (
            <div className="pdf-canvas-stage">
              {isRendering ? <div className="pdf-rendering-badge">正在渲染本页内容...</div> : null}
              <div className="pdf-page-surface" style={{ width: pageSize.width * activeScale, height: pageSize.height * activeScale }} onCopy={copySelection}>
                <canvas ref={canvasRef} className="pdf-canvas" aria-hidden="true" />
                <div ref={textLayerRef} className="pdf-text-layer" role="document" aria-label={`PDF 第 ${pageNumber} 页文字`} />
              </div>
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
