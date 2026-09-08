"use client";

import { useState } from "react";
import { normRegistry, normTasks, compareNormSelection, isNormComparisonCurrent } from "../lib/norm-comparison.js";

const names = Object.assign(Object.create(null), Object.fromEntries(normRegistry.map((item) => [item.id, item.name])));
export default function ExpNormRetrieval({ caseItem, onChange, initialData }) {
  const task = normTasks[caseItem.id];
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(() => (initialData?.selected || []).filter((id) => names[id]));
  const [legacySelection] = useState(() => [...(initialData?.legacySelection || []), ...(initialData?.selected || []).filter((id) => !names[id])]);
  const [reason, setReason] = useState(initialData?.reason || "");
  const [revealed, setRevealed] = useState(() => initialData?.caseId === caseItem.id && isNormComparisonCurrent(initialData));
  const comparison = revealed && task ? compareNormSelection(selected, task.referenceIds) : null;
  function emit(next, text, compared = false) {
    setSelected(next); setReason(text); setRevealed(compared);
    onChange?.(`${next.map((id) => names[id]).join("、")}\n${text}`, {
      selected: next, reason: text, legacySelection, compared,
      caseId: caseItem.id, sourceVersion: task?.sourceVersion || "",
      referenceIds: compared ? task.referenceIds : [],
    });
  }
  return <div className="exp-interaction exp-norm-retrieval-interaction">
    <p>对照范围：已核对的结论前规范援引段落。目前支持 {Object.keys(normTasks).length} 个案例。对照仅记录名称是否出现在该段，不评价适用正确性；修订版本以原文明确记载为准，未标明的版本不作推定。</p>
    {!task && <p role="status">本案例原文依据待核查，暂不能进行规范对照或完成实验。{caseItem.normUnavailableReason}可以保留选择与理由，或切换到张保林案等已有依据的案例。</p>}
    {legacySelection.length > 0 && <p>旧版选择已保留：{legacySelection.join("、")}。请按下方完整名称重新选择；旧简称不自动匹配司法解释。</p>}
    <div className="exp-norm-pool"><h4>选择规范完整名称</h4><label htmlFor="norm-filter">查找规范名称</label><input id="norm-filter" className="input" value={query} onChange={event => setQuery(event.target.value)} placeholder="输入规范名称关键词" /><div className="exp-norm-chips">
      {normRegistry.filter(item => item.name.includes(query.trim())).map(({ id, name }) => <button key={id} type="button" aria-pressed={selected.includes(id)} className={`tag exp-norm-chip${selected.includes(id) ? " selected" : ""}`} onClick={() => emit(selected.includes(id) ? selected.filter((value) => value !== id) : [...selected, id], reason)}>{name}</button>)}
    </div></div>
    {selected.length > 0 && <div className="exp-norm-selected"><h4>已选规范（按优先级排列）</h4><ol className="exp-norm-order">
      {selected.map((id, index) => <li key={id}><span>{names[id]}</span>{index > 0 && <button type="button" className="exp-norm-up" aria-label={`上移${names[id]}`} onClick={() => { const next = [...selected]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; emit(next, reason); }}>↑</button>}</li>)}
    </ol></div>}
    <div className="exp-norm-reason"><label htmlFor="norm-reason">选择理由与其他规范依据</label><textarea id="norm-reason" className="exp-task-textarea" rows={4} value={reason} placeholder="说明选择与优先级；规范池未列出的依据可以写在这里，由你结合原文进一步判断。" onChange={(event) => emit(selected, event.target.value)} /></div>
    <button className="btn btn-accent" type="button" disabled={!task || !selected.length || !reason.trim()} onClick={() => emit(selected, reason, true)}>查看原文依据并对照</button>
    {comparison && <div className="exp-norm-comparison">
      <h4>与已核对段落对照</h4>
      {[['shared', '已选且原文段落列明'], ['unselected', '原文段落列明但未选'], ['outside', '已选但本段未列明（不等于不适用）']].map(([key, label]) => <div className="exp-norm-compare-group" key={key}><strong>{label}：{comparison[key].length} 项</strong><ul>{comparison[key].map((id) => <li key={id}>{names[id]}</li>)}</ul></div>)}
      <p><a href={`/cases/${caseItem.id}/#page=${task.page}`} target="_blank" rel="noreferrer">查看原文第 {task.page} 页 · {task.caseNumber}</a></p>
      <blockquote>{task.quote}</blockquote>
      <p>引文保留原文条号与版本表述。修改选择或理由后，需要重新对照。</p>
    </div>}
  </div>;
}
