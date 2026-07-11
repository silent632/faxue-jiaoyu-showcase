"use client";

import { useCallback, useMemo, useState } from "react";

const FALLBACK_PALETTE = [
  { id: "major-premise", label: "大前提", color: "#3b5998" },
  { id: "minor-premise", label: "小前提/涵摄", color: "#82542b" },
  { id: "conclusion", label: "结论", color: "#2d8a50" },
  { id: "interpretation", label: "解释方法", color: "#9b6a4a" },
  { id: "reasoning-gap", label: "推理跳步/瑕疵", color: "#cc3333" },
];

export default function ExpAnnotation({ caseItem, onChange, initialData, tagPalette }) {
  const palette = Array.isArray(tagPalette) && tagPalette.length ? tagPalette : FALLBACK_PALETTE;
  const [annotations, setAnnotations] = useState(initialData?.annotations || []);
  const [activeTag, setActiveTag] = useState(palette[0].id);
  const [evaluation, setEvaluation] = useState(initialData?.evaluation || "");

  // 只批注说理结构（refLegal），不回退到摘要——摘要不是说理文本
  const refText = String(caseItem.refLegal || "").trim();
  const paragraphs = useMemo(() => {
    if (!refText) return [];
    return refText.includes("\n")
      ? refText.split(/\n+/).filter(Boolean)
      : refText.split(/(?<=。)/).filter((sentence) => sentence.trim());
  }, [refText]);

  const buildSummary = useCallback(
    (items) =>
      items
        .map((item) => {
          const tag = palette.find((entry) => entry.id === item.tagId);
          return `[${tag?.label}] ${paragraphs[item.paraIndex]?.slice(0, 30)}…`;
        })
        .join("\n"),
    [palette, paragraphs]
  );

  const toggleAnnotation = useCallback(
    (paraIndex) => {
      const existing = annotations.find((item) => item.paraIndex === paraIndex);
      let next;
      if (existing && existing.tagId === activeTag) {
        next = annotations.filter((item) => item.paraIndex !== paraIndex);
      } else {
        next = [...annotations.filter((item) => item.paraIndex !== paraIndex), { paraIndex, tagId: activeTag }];
      }
      setAnnotations(next);
      onChange?.(`${buildSummary(next)}\n\n${evaluation}`, { annotations: next, evaluation });
    },
    [activeTag, annotations, evaluation, onChange, buildSummary]
  );

  const getAnnotation = (paraIndex) => annotations.find((item) => item.paraIndex === paraIndex);

  if (!paragraphs.length) {
    return (
      <div className="exp-interaction exp-annotation-interaction">
        <div className="exp-annotation-unavailable">
          <strong>本案暂无说理结构文本</strong>
          <p>该案例尚未整理出可供批注的说理结构，请返回选案页换一篇案例继续实验。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="exp-interaction exp-annotation-interaction">
      <div className="exp-annotation-toolbar">
        <span className="exp-annotation-toolbar-label">选择标注类型：</span>
        {palette.map((tag) => (
          <button
            key={tag.id}
            type="button"
            className={`exp-annotation-tag-btn${activeTag === tag.id ? " active" : ""}`}
            style={{ "--tag-color": tag.color }}
            onClick={() => setActiveTag(tag.id)}
          >
            {tag.label}
          </button>
        ))}
      </div>

      <div className="exp-annotation-text">
        <p className="exp-annotation-hint">点击段落进行标注，再次点击同类型标注可取消。</p>
        {paragraphs.map((paragraph, index) => {
          const annotation = getAnnotation(index);
          const tagInfo = annotation ? palette.find((entry) => entry.id === annotation.tagId) : null;
          return (
            <p
              key={index}
              className={`exp-annotation-para${annotation ? " annotated" : ""}`}
              style={tagInfo ? { borderLeftColor: tagInfo.color, backgroundColor: `${tagInfo.color}11` } : undefined}
              onClick={() => toggleAnnotation(index)}
            >
              {tagInfo && <span className="exp-annotation-mark" style={{ background: tagInfo.color }}>{tagInfo.label}</span>}
              {paragraph}
            </p>
          );
        })}
      </div>

      <div className="exp-annotation-stats">
        已标注 {annotations.length} 段
        {palette.map((tag) => {
          const count = annotations.filter((item) => item.tagId === tag.id).length;
          return count > 0 ? (
            <span key={tag.id} className="exp-annotation-stat" style={{ color: tag.color }}>
              {tag.label}: {count}
            </span>
          ) : null;
        })}
      </div>

      <div className="exp-annotation-evaluation">
        <h4>整体说理评价</h4>
        <textarea
          className="exp-task-textarea"
          rows={4}
          placeholder="综合你的标注，对本案裁判的说理质量进行整体评价：三段论是否完整？是否存在推理跳步？说理是否充分？"
          value={evaluation}
          onChange={(event) => {
            setEvaluation(event.target.value);
            onChange?.(`${buildSummary(annotations)}\n\n${event.target.value}`, { annotations, evaluation: event.target.value });
          }}
        />
      </div>
    </div>
  );
}
