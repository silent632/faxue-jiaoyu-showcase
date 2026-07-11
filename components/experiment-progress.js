"use client";

import { useState, useEffect } from "react";
import { getAllProgress, getModuleProgress } from "@/lib/experiment-archive";

export function HubProgressSummary() {
  const [progress, setProgress] = useState({});

  useEffect(() => {
    setProgress(getAllProgress());
  }, []);

  const total = Object.values(progress).reduce((s, n) => s + n, 0);
  if (total === 0) return null;

  return (
    <div className="exp-hub-progress-summary">
      <span className="exp-hub-progress-label">已完成 {total} 项实验</span>
    </div>
  );
}

export function ModuleProgressBadge({ moduleId }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const p = getModuleProgress(moduleId);
    setCount(p.total);
  }, [moduleId]);

  if (count === 0) return null;

  return (
    <span className="exp-module-progress-badge">已完成 {count} 篇</span>
  );
}

export function ModuleHistory({ moduleId, onSelectCase }) {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const p = getModuleProgress(moduleId);
    setRecords(p.records.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || "")));
  }, [moduleId]);

  if (records.length === 0) return null;

  return (
    <div className="exp-module-history">
      <p className="section-eyebrow">实验档案</p>
      <p className="exp-history-hint">你在此模块已完成 {records.length} 篇案例的实验，点击可查看或继续编辑。</p>
      <div className="exp-history-list">
        {records.map((rec) => (
          <button
            key={rec.caseId}
            className="exp-history-item"
            onClick={() => onSelectCase?.(rec.caseId)}
          >
            <span className="exp-history-item-id">{rec.caseTitle || rec.caseId}</span>
            <span className="exp-history-item-time">
              {rec.updatedAt ? new Date(rec.updatedAt).toLocaleDateString("zh-CN") : ""}
            </span>
            {rec.selfScores && Object.keys(rec.selfScores).length > 0 && (
              <span className="exp-history-item-score">
                自评 {Object.values(rec.selfScores).reduce((s, v) => s + v, 0)}/{(rec.dimensionCount || Object.keys(rec.selfScores).length) * 5}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
