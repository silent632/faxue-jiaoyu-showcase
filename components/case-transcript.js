"use client";

import { useEffect, useRef, useState } from "react";

export default function CaseTranscript({ caseId, source, pdfUrl, readingPositionKey }) {
  const transcriptRef = useRef(null);
  const [pages, setPages] = useState(null);
  const [failed, setFailed] = useState(false);
  const [page, setPage] = useState(1);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/case-text/${caseId}.json`, { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("缺少文字全文");
        const data = await response.json();
        if (data.sha256 !== source.sha256 || data.pages?.length !== source.pages) throw new Error("原件版本不一致");
        if (!controller.signal.aborted) setPages(data.pages);
      })
      .catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [caseId, source.sha256, source.pages, attempt]);

  useEffect(() => {
    if (!pages) return;
    const reader = transcriptRef.current;
    const pane = reader.closest(".study-pane-body");
    const sections = [...reader.querySelectorAll("section")];
    let frame = 0;
    let scrollIntentUntil = 0;
    function markScrollIntent() { scrollIntentUntil = performance.now() + 900; }
    function rememberPage(current) {
      setPage(current);
      try { window.localStorage.setItem(readingPositionKey, String(current)); } catch { /* 可继续阅读 */ }
    }
    function followPage() {
      scrollIntentUntil = 0;
      let lastPage = 1;
      try { lastPage = Number(window.localStorage.getItem(readingPositionKey)) || 1; } catch { /* 可继续阅读 */ }
      const reference = /^#page=(\d+)$/u.exec(window.location.hash)?.[1];
      const current = Math.min(pages.length, Math.max(1, Number(reference) || lastPage));
      rememberPage(current);
      if (current !== 1 || reference) sections[current - 1]?.scrollIntoView({ block: "start" });
    }
    function onScroll() {
      if (frame || performance.now() > scrollIntentUntil) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (!reader.getClientRects().length) return;
        const top = Math.max(pane.getBoundingClientRect().top, 0) + 80;
        const current = sections.findLastIndex(section => section.getBoundingClientRect().top <= top) + 1;
        if (current > 0) rememberPage(current);
      });
    }
    followPage();
    window.addEventListener("hashchange", followPage);
    pane.addEventListener("scroll", onScroll, { passive: true });
    pane.addEventListener("wheel", markScrollIntent, { passive: true });
    pane.addEventListener("touchmove", markScrollIntent, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("hashchange", followPage);
      pane.removeEventListener("scroll", onScroll);
      pane.removeEventListener("wheel", markScrollIntent);
      pane.removeEventListener("touchmove", markScrollIntent);
      window.removeEventListener("scroll", onScroll);
      window.cancelAnimationFrame(frame);
    };
  }, [pages, readingPositionKey]);

  if (failed) return <p className="case-transcript-status" role="status">
    文字全文暂未载入。 <button className="btn btn-outline" type="button" onClick={() => { setFailed(false); setAttempt(value => value + 1); }}>重试</button>
    {" "}<a href={pdfUrl}>打开 PDF 原件</a>
  </p>;
  if (!pages) return <p className="case-transcript-status" role="status">正在载入文字全文…</p>;

  return (
    <div className="case-transcript" ref={transcriptRef} aria-label="文书文字全文">
      <label className="case-transcript-page-select">定位原件页
        <select className="input" value={page} onChange={event => {
          const hash = `#page=${event.target.value}`;
          if (window.location.hash === hash) document.getElementById(`transcript-page-${event.target.value}`)?.scrollIntoView({ block: "start" });
          else window.location.hash = hash;
        }}>
          {pages.map((_, index) => <option key={index} value={index + 1}>第 {index + 1} 页</option>)}
        </select>
      </label>
      {pages.map((text, index) => (
        <section key={index} id={`transcript-page-${index + 1}`}>
          <h2><a href={`#page=${index + 1}`}>原件第 {index + 1} 页</a></h2>
          {text.trim() ? <div className="case-transcript-text">{text}</div> :
            <figure className="case-transcript-image">
              <a href={`${pdfUrl}#page=${index + 1}`}><img loading="lazy" src={`/case-text/${caseId}-${index + 1}.png`} alt={`原件第 ${index + 1} 页图像`} /></a>
              <figcaption>此页以图像呈现。<a href={`${pdfUrl}#page=${index + 1}`}>打开 PDF 原页</a></figcaption>
            </figure>}
        </section>
      ))}
    </div>
  );
}
