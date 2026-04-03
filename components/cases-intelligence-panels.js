import { PAGE_SIZE } from "@/lib/cases-workspace";

export default function CasesIntelligencePanels({
  filteredCount,
  selectedFilterCount,
  pageStart,
  pageEnd,
  currentPage,
  totalPages,
  starterActions,
  narrowingSuggestions,
  onApplyFilterAction,
}) {
  const shouldNarrow = filteredCount > PAGE_SIZE;
  const actionItems = (shouldNarrow && narrowingSuggestions.length ? narrowingSuggestions : starterActions).slice(0, 4);
  const actionTitle = shouldNarrow ? "建议优先补充" : "可直接进入";
  const scopeNote = !filteredCount
    ? "当前没有匹配结果，可适当放宽条件后重新检索。"
    : shouldNarrow
      ? "结果仍较多，建议继续补充一个条件。"
      : filteredCount === 1
        ? "当前结果已聚焦，可直接进入案例详情。"
        : "当前结果已适合浏览，可结合摘要与裁判结果继续选择。";

  return (
    <div className="cases-intel-grid">
      <section className="glass-sm cases-intel-card">
        <div className="cases-intel-head">
          <strong>当前范围</strong>
          <span>{selectedFilterCount ? `已选 ${selectedFilterCount} 项` : "建议先选年份和案由"}</span>
        </div>

        <div className="cases-mini-metric-grid">
          <article className="cases-mini-metric">
            <span>共找到</span>
            <strong>{filteredCount}</strong>
          </article>
          <article className="cases-mini-metric">
            <span>当前页</span>
            <strong>{filteredCount ? `${pageStart}-${pageEnd}` : "0"}</strong>
          </article>
          <article className="cases-mini-metric">
            <span>页数</span>
            <strong>{filteredCount ? `${currentPage}/${totalPages}` : "0/0"}</strong>
          </article>
        </div>

        <p className="cases-intel-note">{scopeNote}</p>
      </section>

      {actionItems.length ? (
        <section className="glass-sm cases-intel-card">
          <div className="cases-intel-head">
            <strong>{actionTitle}</strong>
            <span>{shouldNarrow ? "缩小检索范围" : "高频检索入口"}</span>
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
      ) : null}
    </div>
  );
}
