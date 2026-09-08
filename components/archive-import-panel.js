"use client";

import { useEffect, useRef, useState } from "react";
import { archiveFromAlternative, commitArchiveImport, MAX_IMPORT_BYTES, parseArchiveImport, previewArchiveImport, readImportAlternatives } from "@/lib/archive-import";
import { storageErrorMessage, subscribeRecords } from "@/lib/local-record";

export default function ArchiveImportPanel({ caseIndex, userSid, downloadJson }) {
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [copies, setCopies] = useState([]);
  const [selectedCopy, setSelectedCopy] = useState(null);
  const sequence = useRef(0);

  useEffect(() => {
    const refresh = () => {
      try { setCopies(readImportAlternatives(userSid)); }
      catch (failure) { setError(failure.message); }
    };
    refresh();
    return subscribeRecords(refresh);
  }, [userSid]);

  async function chooseFile(event) {
    const file = event.target.files?.[0];
    const request = ++sequence.current;
    setPreview(null); setNotice(""); setError("");
    if (!file) return;
    setBusy(true);
    try {
      if (file.size > MAX_IMPORT_BYTES) throw new Error("文件不得超过 2 MB。");
      const entries = parseArchiveImport(await file.text());
      if (request !== sequence.current) return;
      setPreview(previewArchiveImport(entries, { userSid, knownCaseIds: caseIndex.map((item) => item.id) }));
    } catch (failure) { if (request === sequence.current) setError(failure.message); }
    finally { if (request === sequence.current) setBusy(false); }
  }

  async function importFile() {
    setBusy(true); setError("");
    try {
    const result = await commitArchiveImport(preview);
    if (result.ok) {
      setNotice(`导入完成：新增 ${result.counts.new} 条，重复 ${result.counts.duplicate} 条，另存副本 ${result.counts.conflict} 条。`);
      setPreview(null);
      setCopies(readImportAlternatives(userSid));
    } else {
      if (result.preview) setPreview(result.preview);
      setError(result.errorCode === "conflict" ? "本地记录已变化，预览已刷新，请核对后重新导入。" : result.errorCode === "unsupported" ? "当前浏览器不支持安全导入，请在 HTTPS 页面或本地预览中使用较新的浏览器。" : result.message || storageErrorMessage(result.errorCode));
    }
    } catch (failure) { setError(failure.message || "导入未完成，请重新读取预览。"); }
    finally { setBusy(false); }
  }

  return (
    <section className="showcase-card archive-import" aria-label="导入备份">
      <h2>导入备份</h2>
      <p>选择从本平台导出的 JSON 文件（最多 2 MB）。先预览再导入；已有记录保留，内容冲突另存副本。未知案例按历史记录保留。</p>
      <label className="archive-import-file">备份文件<input type="file" accept=".json,application/json" onChange={chooseFile} disabled={busy} /></label>
      {notice ? <p role="status">{notice}</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {preview ? <div className="archive-import-preview">
        <p>新增 {preview.counts.new} 条 · 重复 {preview.counts.duplicate} 条 · 冲突副本 {preview.counts.conflict} 条 · 未知案例记录 {preview.counts.unknown} 条</p>
        <ul>{preview.rows.slice(0, 50).map((row, index) => <li key={index}>
          {row.caseId} · {row.moduleId || "三步研习"} · {({ new: "新增", duplicate: "跳过重复", conflict: "另存副本" })[row.action]}{row.unknown ? " · 历史记录" : ""}
        </li>)}</ul>
        {preview.rows.length > 50 ? <p>显示前 50 条；以上统计及导入包含全部 {preview.rows.length} 条记录。</p> : null}
        <div className="archive-action-buttons">
          <button type="button" className="btn btn-primary" disabled={busy || !preview.rows.length} onClick={importFile}>{busy ? "正在导入" : "导入并保留冲突副本"}</button>
          <button type="button" className="btn btn-outline" disabled={busy} onClick={() => setPreview(null)}>取消导入</button>
        </div>
      </div> : null}
      {copies.length ? <div className="archive-import-copies">
        <h3>保留的导入副本（{copies.length}）</h3>
        <p>这里保留与当前记录不同的导入版本。导出全部档案时也会包含这些副本。</p>
        <ul>{copies.map((entry, index) => <li key={index}>
          <span>{entry.caseId} · {entry.moduleId || "三步研习"}</span>
          <button type="button" className="btn btn-ghost" onClick={() => setSelectedCopy(entry)} aria-label={`查看副本 ${index + 1}`}>查看</button>
          <button type="button" className="btn btn-ghost" onClick={() => downloadJson(archiveFromAlternative(entry))} aria-label={`导出副本 ${index + 1}`}>导出副本</button>
        </li>)}</ul>
        {selectedCopy ? <label>副本内容<textarea className="exp-task-textarea" rows={8} readOnly value={JSON.stringify(selectedCopy.record, null, 2)} /></label> : null}
      </div> : null}
    </section>
  );
}
