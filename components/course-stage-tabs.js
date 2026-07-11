"use client";

import Link from "next/link";
import { useState } from "react";

export default function CourseStageTabs({ periods }) {
  const [stage, setStage] = useState(0);
  const [frameworkOpen, setFrameworkOpen] = useState(false);

  const stages = [
    { label: "第一期至第四期", desc: "案例进入、争点识别与课堂表达", items: periods.slice(0, 4) },
    { label: "第五期至第八期", desc: "治理边界和责任判断", items: periods.slice(4, 8) },
  ];

  const current = stages[stage];
  const standardMaterialCount = periods[0]?.materialPages?.length ?? 10;
  const standardDirectory = periods[0]?.materialDirectory ?? [];

  return (
    <>
      {/* Stage segmented control */}
      <div className="course-stage-switch-row">
        <div className="course-stage-tabs" role="tablist">
          {stages.map((s, i) => (
            <button
              key={s.label}
              className={`course-stage-tab${i === stage ? " active" : ""}`}
              onClick={() => setStage(i)}
              type="button"
              role="tab"
              aria-selected={i === stage}
            >
              {s.label}
            </button>
          ))}
        </div>
        <span className="course-stage-desc">{current.desc}</span>
      </div>

      {/* Period cards for active stage */}
      <div className="course-stage-grid">
        {current.items.map((item, i) => (
          <article key={item.slug} className="course-stage-card">
            <div className="course-stage-card-header">
              <span className="course-stage-card-num">{item.period}</span>
              <span className="course-stage-card-module">{item.module}</span>
            </div>
            <div className="course-stage-card-body">
              <strong className="course-stage-card-title">{item.title}</strong>
              <p className="course-stage-card-lead">{item.archiveCard.lead}</p>
            </div>
            <div className="course-stage-card-foot">
              <Link href={item.detailHref} className="homepage-video-link">进入课程</Link>
              <Link href={item.videoHref} className="btn btn-outline course-stage-video-btn">▶ 观看视频</Link>
            </div>
          </article>
        ))}
      </div>

      {/* Collapsible material framework */}
      <div className="course-framework-toggle">
        <button
          className="course-framework-toggle-btn"
          onClick={() => setFrameworkOpen((v) => !v)}
          type="button"
        >
          <span className="showcase-card-eyebrow">统一材料框架</span>
          <span className="course-framework-toggle-meta">
            四类材料 · {standardMaterialCount}份档案
          </span>
          <span className="course-framework-toggle-arrow">{frameworkOpen ? "收起" : "展开"}</span>
        </button>

        {frameworkOpen && (
          <div className="course-framework-content">
            <div className="course-framework-grid">
              {standardDirectory.map((group) => (
                <div key={group.title} className="course-framework-group">
                  <strong>{group.title}</strong>
                  <span className="course-framework-count">{group.items.length}份</span>
                  <ul className="course-framework-list">
                    {group.items.map((item) => (
                      <li key={item.slug}>{item.shortLabel}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
