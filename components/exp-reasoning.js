"use client";

import { useMemo, useState } from "react";

const SLOTS = [
  { id: "majorPremise", badge: "大前提", note: "法律规范", color: "var(--exp-tag-major)", poolKey: "laws", rows: 3, placeholder: "从下方素材池点选法条填入，或直接书写本案适用的法律规范…" },
  { id: "minorPremise", badge: "小前提", note: "事实涵摄", color: "var(--exp-tag-minor)", poolKey: "facts", rows: 3, placeholder: "点选事实素材填入后，逐一对应法律规范的构成要件补写涵摄…" },
  { id: "conclusion", badge: "结论", note: "裁判结论", color: "var(--exp-tag-conclusion)", poolKey: null, rows: 2, placeholder: "基于以上推理，得出的裁判结论是…" },
];

function splitFactChips(refFact) {
  const text = String(refFact || "").trim();
  if (!text) return [];
  return (text.match(/[^。；]+[。；]?/gu) || [])
    .map((item) => item.trim())
    .filter((item) => item.length >= 12)
    .slice(0, 6);
}

function buildLawChips(laws) {
  return (laws || [])
    .map((law) => `${law.displayLaw || law.law}${law.article ? ` ${law.article}` : ""}`.trim())
    .filter(Boolean)
    .slice(0, 8);
}

export default function ExpReasoning({ caseItem, onChange, initialData }) {
  const [values, setValues] = useState({
    majorPremise: initialData?.majorPremise || "",
    minorPremise: initialData?.minorPremise || "",
    conclusion: initialData?.conclusion || "",
    subsumption: initialData?.subsumption || "",
  });
  const [focusedSlot, setFocusedSlot] = useState("majorPremise");
  const [usedChips, setUsedChips] = useState(() => new Set(initialData?.usedChips || []));

  const pools = useMemo(
    () => ({
      laws: buildLawChips(caseItem?.laws),
      facts: splitFactChips(caseItem?.refFact),
    }),
    [caseItem]
  );

  function emit(next, nextUsed = usedChips) {
    onChange?.(
      [next.majorPremise, next.minorPremise, next.conclusion, next.subsumption].join("\n"),
      { ...next, usedChips: [...nextUsed] }
    );
  }

  function updateField(field, value) {
    const next = { ...values, [field]: value };
    setValues(next);
    emit(next);
  }

  function insertChip(poolKey, chip) {
    const slot = SLOTS.find((item) => item.poolKey === poolKey && item.id === focusedSlot)
      || SLOTS.find((item) => item.poolKey === poolKey);
    if (!slot) return;

    const chipKey = `${poolKey}:${chip}`;
    if (usedChips.has(chipKey)) return;

    const current = values[slot.id];
    const nextValue = current ? `${current.replace(/\s+$/u, "")}\n${chip}` : chip;
    const next = { ...values, [slot.id]: nextValue };
    const nextUsed = new Set(usedChips);
    nextUsed.add(chipKey);

    setValues(next);
    setUsedChips(nextUsed);
    setFocusedSlot(slot.id);
    emit(next, nextUsed);
  }

  const activePool = SLOTS.find((slot) => slot.id === focusedSlot)?.poolKey;

  return (
    <div className="exp-interaction exp-reasoning-interaction">
      {/* 素材池 */}
      <div className="exp-material-pool">
        <div className="exp-pool-group">
          <span className={`exp-pool-label${activePool === "laws" ? " is-active" : ""}`}>法条素材 → 大前提</span>
          <div className="exp-pool-chips">
            {pools.laws.length ? (
              pools.laws.map((chip) => {
                const used = usedChips.has(`laws:${chip}`);
                return (
                  <button
                    key={chip}
                    type="button"
                    className={`exp-pool-chip${used ? " is-used" : ""}`}
                    disabled={used}
                    onClick={() => insertChip("laws", chip)}
                  >
                    {chip}
                  </button>
                );
              })
            ) : (
              <span className="exp-pool-empty">本案暂无法条素材，可直接在大前提中书写。</span>
            )}
          </div>
        </div>

        <div className="exp-pool-group">
          <span className={`exp-pool-label${activePool === "facts" ? " is-active" : ""}`}>事实素材 → 小前提</span>
          <div className="exp-pool-chips">
            {pools.facts.length ? (
              pools.facts.map((chip) => {
                const used = usedChips.has(`facts:${chip}`);
                return (
                  <button
                    key={chip}
                    type="button"
                    className={`exp-pool-chip exp-pool-chip-fact${used ? " is-used" : ""}`}
                    disabled={used}
                    onClick={() => insertChip("facts", chip)}
                    title={chip}
                  >
                    {chip.length > 38 ? `${chip.slice(0, 38)}…` : chip}
                  </button>
                );
              })
            ) : (
              <span className="exp-pool-empty">本案暂无事实素材，可直接在小前提中书写。</span>
            )}
          </div>
        </div>
      </div>

      {/* 三段论面板 */}
      <div className="exp-syllogism-panel">
        {SLOTS.map((slot, index) => (
          <div key={slot.id}>
            {index > 0 && <div className="exp-syllogism-arrow">↓ {index === 1 ? "涵摄" : "推导"}</div>}
            <div className={`exp-syllogism-step${focusedSlot === slot.id ? " is-focused" : ""}`}>
              <label className="exp-syllogism-label">
                <span className="exp-syllogism-badge" style={{ background: slot.color }}>{slot.badge}</span>
                {slot.note}
              </label>
              <textarea
                aria-label={slot.note} className="exp-syllogism-input"
                rows={slot.rows}
                placeholder={slot.placeholder}
                value={values[slot.id]}
                onFocus={() => setFocusedSlot(slot.id)}
                onChange={(event) => updateField(slot.id, event.target.value)}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="exp-syllogism-reflection">
        <label className="exp-syllogism-reflection-label">涵摄过程反思</label>
        <textarea
          className="exp-task-textarea"
          rows={3}
          placeholder="在涵摄过程中，哪些要件的对应最困难？是否存在推理跳步？"
          aria-label="涵摄过程反思" value={values.subsumption}
          onChange={(event) => updateField("subsumption", event.target.value)}
        />
      </div>
    </div>
  );
}
