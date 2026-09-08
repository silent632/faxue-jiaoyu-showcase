"use client";

import { useState } from "react";

export default function ExpValueBalancing({ caseItem, onChange, initialData }) {
  const [leftValue, setLeftValue] = useState(initialData?.leftValue || "");
  const [rightValue, setRightValue] = useState(initialData?.rightValue || "");
  const [leftArg, setLeftArg] = useState(initialData?.leftArg || "");
  const [rightArg, setRightArg] = useState(initialData?.rightArg || "");
  const [slider, setSlider] = useState(initialData?.slider ?? 50);
  const [reason, setReason] = useState(initialData?.reason || "");

  function notify(field, value) {
    const next = { leftValue, rightValue, leftArg, rightArg, reason, [field]: value };
    const data = { ...next, slider };
    onChange?.(Object.values(next).join("\n"), data);
  }

  const sliderLabel = slider < 35 ? "偏向左侧价值" : slider > 65 ? "偏向右侧价值" : "相对均衡";

  return (
    <div className="exp-interaction exp-value-balancing-interaction">
      <div className="exp-value-names">
        <div className="exp-value-name-input">
          <label>左侧价值</label>
          <input
            type="text"
            placeholder="如：个人隐私权"
            aria-label="左侧价值" value={leftValue}
            onChange={(e) => { setLeftValue(e.target.value); notify("leftValue", e.target.value); }}
          />
        </div>
        <span className="exp-value-vs">VS</span>
        <div className="exp-value-name-input">
          <label>右侧价值</label>
          <input
            type="text"
            placeholder="如：公共安全"
            aria-label="右侧价值" value={rightValue}
            onChange={(e) => { setRightValue(e.target.value); notify("rightValue", e.target.value); }}
          />
        </div>
      </div>

      <div className="exp-value-args">
        <div className="exp-value-arg-col">
          <h4>{leftValue || "左侧价值"} 的论证理由</h4>
          <textarea
            rows={5}
            placeholder="为什么应当倾向保护这一价值？法理依据和事实支撑…"
            aria-label="左侧价值论证理由" value={leftArg}
            onChange={(e) => { setLeftArg(e.target.value); notify("leftArg", e.target.value); }}
          />
        </div>
        <div className="exp-value-arg-col">
          <h4>{rightValue || "右侧价值"} 的论证理由</h4>
          <textarea
            rows={5}
            placeholder="为什么应当倾向保护这一价值？法理依据和事实支撑…"
            aria-label="右侧价值论证理由" value={rightArg}
            onChange={(e) => { setRightArg(e.target.value); notify("rightArg", e.target.value); }}
          />
        </div>
      </div>

      <div className="exp-value-scale">
        {/* 天平可视化：横梁随滑块倾斜 */}
        <div className="exp-scale-beam-wrap" aria-hidden="true">
          <div className="exp-scale-beam" style={{ transform: `rotate(${((slider - 50) / 50) * 6}deg)` }}>
            <span className="exp-scale-pan">{(leftValue || "左侧价值").slice(0, 6)}</span>
            <span className="exp-scale-pan">{(rightValue || "右侧价值").slice(0, 6)}</span>
          </div>
          <div className="exp-scale-pivot" />
        </div>

        <div className="exp-scale-labels">
          <span>{leftValue || "左"}</span>
          <span className="exp-scale-center">{sliderLabel}</span>
          <span>{rightValue || "右"}</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          aria-label="价值倾向" value={slider}
          onChange={(e) => { const v = Number(e.target.value); setSlider(v); onChange?.(Object.values({ leftValue, rightValue, leftArg, rightArg, reason }).join("\n"), { leftValue, rightValue, leftArg, rightArg, slider: v, reason }); }}
          className="exp-scale-slider"
        />
      </div>

      <div className="exp-value-reason">
        <h4>衡量理由（必填）</h4>
        <textarea
          rows={4}
          placeholder="滑块位置不算最终答案。请写出完整的衡量理由：为什么最终倾向某一方？是否考虑了比例原则？"
          aria-label="衡量理由" value={reason}
          onChange={(e) => { setReason(e.target.value); notify("reason", e.target.value); }}
        />
      </div>
    </div>
  );
}
