import { PAGE_SIZE } from "@/lib/cases-workspace";

export default function CasesIntelligencePanels({
  filteredCount,
  starterActions,
  narrowingSuggestions,
  onApplyFilterAction,
}) {
  const shouldNarrow = filteredCount > PAGE_SIZE;
  const actionItems = (shouldNarrow && narrowingSuggestions.length ? narrowingSuggestions : starterActions).slice(0, 6);

  if (!actionItems.length) return null;

  const actionTitle = shouldNarrow ? "下一步筛选" : "快速开始";
  const actionNote = shouldNarrow
    ? "结果仍较多，点选一个条件可先把范围收窄下来。"
    : "可从下面的常用条件直接开始检索。";

  return (
    <section className="cases-intel-bar">
      <div className="cases-intel-bar-head">
        <strong>{actionTitle}</strong>
        <span>{actionNote}</span>
      </div>
      <div className="cases-action-row">
        {actionItems.map((item) => (
          <button key={item.key} type="button" className="cases-action-chip" onClick={() => onApplyFilterAction(item)}>
            <span>{item.label}</span>
            <small>{shouldNarrow ? `${item.fieldLabel} · ${item.count} 条` : item.helper}</small>
          </button>
        ))}
      </div>
    </section>
  );
}
