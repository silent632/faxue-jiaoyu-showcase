"use client";

import { useMemo, useState } from "react";

/** 现行有效的常见法律与规范类别（原合同法/物权法/婚姻法/继承法/侵权责任法已并入民法典） */
const NORM_POOL = [
  "民法典", "刑法", "刑事诉讼法", "民事诉讼法", "行政诉讼法",
  "公司法", "劳动法", "劳动合同法", "消费者权益保护法",
  "食品安全法", "产品质量法", "环境保护法", "长江保护法",
  "治安管理处罚法", "行政处罚法", "行政许可法", "国家赔偿法",
  "著作权法", "商标法", "专利法", "反不正当竞争法",
  "保险法", "道路交通安全法", "企业破产法",
  "最高人民法院司法解释", "其他法律法规",
];

/** 学生选择与法院援引的匹配：法院法条名包含所选项即视为命中 */
function matchNorm(selectedNorm, actualLawNames) {
  if (selectedNorm === "最高人民法院司法解释") {
    return actualLawNames.some((name) => /最高|解释|规定|批复|纪要/u.test(name));
  }
  if (selectedNorm === "其他法律法规") return false;
  return actualLawNames.some((name) => name.includes(selectedNorm));
}

export default function ExpNormRetrieval({ caseItem, onChange, initialData }) {
  const [selected, setSelected] = useState(initialData?.selected || []);
  const [reason, setReason] = useState(initialData?.reason || "");
  const [revealed, setRevealed] = useState(false);

  const actualLaws = useMemo(
    () => (caseItem.laws || []).map((law) => ({
      label: `${law.displayLaw || law.law}${law.article ? ` ${law.article}` : ""}`.trim(),
      name: String(law.law || law.displayLaw || ""),
    })),
    [caseItem]
  );
  const actualLawNames = useMemo(() => actualLaws.map((law) => law.name), [actualLaws]);

  const comparison = useMemo(() => {
    if (!revealed) return null;
    const hits = selected.filter((norm) => matchNorm(norm, actualLawNames));
    const extras = selected.filter((norm) => !matchNorm(norm, actualLawNames));
    const missedLaws = actualLaws.filter(
      (law) => !selected.some((norm) => matchNorm(norm, [law.name]))
    );
    return { hits, extras, missedLaws };
  }, [revealed, selected, actualLawNames, actualLaws]);

  function emit(nextSelected, nextReason) {
    onChange?.(`${nextSelected.join("、")}\n${nextReason}`, { selected: nextSelected, reason: nextReason });
  }

  function toggle(norm) {
    const next = selected.includes(norm) ? selected.filter((item) => item !== norm) : [...selected, norm];
    setSelected(next);
    emit(next, reason);
  }

  function moveUp(index) {
    if (index <= 0) return;
    const next = [...selected];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setSelected(next);
    emit(next, reason);
  }

  return (
    <div className="exp-interaction exp-norm-retrieval-interaction">
      <div className="exp-norm-pool">
        <h4>规范池 — 选择你认为适用的法律</h4>
        <div className="exp-norm-chips">
          {NORM_POOL.map((norm) => (
            <button
              key={norm}
              type="button"
              className={`tag exp-norm-chip${selected.includes(norm) ? " selected" : ""}`}
              onClick={() => toggle(norm)}
            >
              {norm}
            </button>
          ))}
        </div>
      </div>

      {selected.length > 0 && (
        <div className="exp-norm-selected">
          <h4>已选法律（按优先级排列，点 ↑ 调整）</h4>
          <ol className="exp-norm-order">
            {selected.map((norm, index) => (
              <li key={norm}>
                <span>{norm}</span>
                {index > 0 && (
                  <button type="button" className="exp-norm-up" onClick={() => moveUp(index)}>↑</button>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="exp-norm-reason">
        <h4>选择理由</h4>
        <textarea
          className="exp-task-textarea"
          rows={3}
          placeholder="为什么选择这些法律？优先级排列的依据是什么？"
          value={reason}
          onChange={(event) => { setReason(event.target.value); emit(selected, event.target.value); }}
        />
      </div>

      <div className="exp-norm-reveal">
        {!revealed ? (
          <button
            className="btn btn-accent"
            type="button"
            onClick={() => setRevealed(true)}
            disabled={selected.length === 0}
          >
            揭示法院选择
          </button>
        ) : (
          <div className="exp-norm-comparison">
            <h4>与法院援引的逐条对照</h4>

            {comparison.hits.length > 0 && (
              <div className="exp-norm-compare-group">
                <span className="exp-norm-compare-label is-hit">✓ 命中（你和法院都选了）</span>
                <ul className="exp-norm-compare-list">
                  {comparison.hits.map((norm) => <li key={norm}>{norm}</li>)}
                </ul>
              </div>
            )}

            {comparison.missedLaws.length > 0 && (
              <div className="exp-norm-compare-group">
                <span className="exp-norm-compare-label is-missed">△ 遗漏（法院援引但你未选）</span>
                <ul className="exp-norm-compare-list">
                  {comparison.missedLaws.map((law) => <li key={law.label}>{law.label}</li>)}
                </ul>
              </div>
            )}

            {comparison.extras.length > 0 && (
              <div className="exp-norm-compare-group">
                <span className="exp-norm-compare-label is-extra">○ 多选（你选了但法院未援引）</span>
                <ul className="exp-norm-compare-list">
                  {comparison.extras.map((norm) => <li key={norm}>{norm}</li>)}
                </ul>
              </div>
            )}

            {!actualLaws.length && <p className="exp-norm-compare-empty">该案例暂无法条数据可供对照。</p>}
          </div>
        )}
      </div>
    </div>
  );
}
