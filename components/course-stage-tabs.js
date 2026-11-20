"use client";

import Link from "next/link";
import { useRef, useState } from "react";

export default function CourseStageTabs({ periods }) {
  const [stage, setStage] = useState(0);
  const tabs = useRef([]);
  const [frameworkOpen, setFrameworkOpen] = useState(false);

  const stages = [
    { label: "第一期至第四期", desc: "案例进入、争点识别与课堂表达", items: periods.slice(0, 4) },
    { label: "第五期至第八期", desc: "治理边界和责任判断", items: periods.slice(4, 8) },
  ];

  function handleTabKey(event, index) {
    const targets = { ArrowLeft: (index + stages.length - 1) % stages.length, ArrowRight: (index + 1) % stages.length, Home: 0, End: stages.length - 1 };
    const target = targets[event.key];
    if (!Number.isInteger(target)) return;
    event.preventDefault();
    setStage(target);
    tabs.current[target]?.focus();
  }

  const current = stages[stage];
  const standardMaterialCount = periods[0]?.materialPages?.length ?? 10;
  const standardDirectory = periods[0]?.materialDirectory ?? [];

  return (
    <>
      {/* Stage segmented control */}
      <div className="course-stage-switch-row">
        <div className="course-stage-tabs" role="tablist" aria-label="课程阶段">
          {stages.map((s, i) => (
            <button
              key={s.label}
              className={`course-stage-tab${i === stage ? " active" : ""}`}
              onClick={() => setStage(i)}
              type="button"
              role="tab"
              id={`course-stage-tab-${i}`}
              aria-controls="course-stage-panel"
              tabIndex={i === stage ? 0 : -1}
              ref={node => { tabs.current[i] = node; }}
              onKeyDown={event => handleTabKey(event, i)}
              aria-selected={i === stage}
            >
              {s.label}
            </button>
          ))}
        </div>
        <span className="course-stage-desc">{current.desc}</span>
      </div>

      {/* Period cards for active stage */}
      <div className="course-stage-grid" id="course-stage-panel" role="tabpanel" aria-labelledby={`course-stage-tab-${stage}`}>
        {current.items.map((item) => (
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

      <section className="course-framework-toggle">
        <button
          className="course-framework-toggle-btn"
          onClick={() => setFrameworkOpen((value) => !value)}
          type="button"
          aria-expanded={frameworkOpen}
          aria-controls="course-material-framework"
        >
          <span>课程材料怎么用</span>
          <span className="course-framework-toggle-meta">四类材料 · {standardMaterialCount} 份档案</span>
          <span className="course-framework-toggle-arrow">{frameworkOpen ? "收起 −" : "展开 +"}</span>
        </button>
        {frameworkOpen && (
          <div className="course-framework-content" id="course-material-framework">
            <div className="course-framework-grid">
              {standardDirectory.map((group, index) => (
                <div key={group.title} className="course-framework-group">
                  <strong>{group.title}</strong>
                  <span className="course-framework-count">{group.items.length}份</span>
                  <p>{[
                    "了解本期问题、学习目标和研习任务。",
                    "查找课堂活动分工和观察记录。",
                    "从理论和实务两个角度回看学习表现。",
                    "编写研习报告并记录学习反馈。",
                  ][index]}</p>
                  <ul className="course-framework-list">
                    {group.items.map((item) => (
                      <li key={item.slug}><Link href={item.href}>{item.shortLabel}</Link></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
