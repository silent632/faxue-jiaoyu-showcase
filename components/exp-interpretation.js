"use client";

import { useState } from "react";

const METHODS = [
  { id: "literal", label: "文义解释", placeholder: "从条文的文字含义出发，对该条款作字面理解，得出的结论是…" },
  { id: "systematic", label: "体系解释", placeholder: "将该条款放在整部法律或相关法律的上下文中理解，结合其他条文，得出的结论是…" },
  { id: "purposive", label: "目的解释", placeholder: "从立法目的出发理解该条款，结合立法背景和制度功能，得出的结论是…" },
];

export default function ExpInterpretation({ caseItem, onChange, initialData }) {
  const [columns, setColumns] = useState(initialData?.columns || { literal: "", systematic: "", purposive: "" });
  const [bestMethod, setBestMethod] = useState(initialData?.bestMethod || "");
  const [bestReason, setBestReason] = useState(initialData?.bestReason || "");

  function updateCol(id, value) {
    const next = { ...columns, [id]: value };
    setColumns(next);
    const data = { columns: next, bestMethod, bestReason };
    onChange?.(Object.values(next).join("\n") + "\n" + bestMethod + "\n" + bestReason, data);
  }

  return (
    <div className="exp-interaction exp-interpretation-interaction">
      <div className="exp-interp-columns">
        {METHODS.map((m) => (
          <div key={m.id} className="exp-interp-col">
            <h4>{m.label}</h4>
            <textarea
              rows={6}
              placeholder={m.placeholder}
              aria-label={m.label} value={columns[m.id]}
              onChange={(e) => updateCol(m.id, e.target.value)}
            />
            <p className="exp-char-hint">{columns[m.id].trim().length} 字</p>
          </div>
        ))}
      </div>

      <div className="exp-interp-choice">
        <h4>择优判断</h4>
        <div className="exp-interp-method-select">
          <span>最合理的解释方法：</span>
          {METHODS.map((m) => (
            <button
              key={m.id}
              aria-pressed={bestMethod === m.id}
              className={`tag${bestMethod === m.id ? " tag-accent" : ""}`}
              onClick={() => { setBestMethod(m.id); onChange?.(Object.values(columns).join("\n") + "\n" + m.id + "\n" + bestReason, { columns, bestMethod: m.id, bestReason }); }}
            >
              {m.label}
            </button>
          ))}
        </div>
        <textarea
          rows={3}
          placeholder="为什么你认为这种解释方法最合理？其他方法有什么不足？"
          aria-label="解释方法选择理由" value={bestReason}
          onChange={(e) => { setBestReason(e.target.value); onChange?.(Object.values(columns).join("\n") + "\n" + bestMethod + "\n" + e.target.value, { columns, bestMethod, bestReason: e.target.value }); }}
        />
      </div>
    </div>
  );
}
