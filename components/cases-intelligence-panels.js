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
  const actionTitle = shouldNarrow ? "下一步建议" : "快速起步";
  const actionNote = shouldNarrow ? "结果仍然偏多，优先再加一个条件，把范围先收进 20 条以内。" : "先从这些高频条件开始，建立第一轮范围。";
  const scopeNote = !filteredCount
    ? "暂时没有找到相关案例。建议先清掉低频条件，只保留年份或案由重试。"
    : shouldNarrow
      ? "当前结果仍然偏多，继续加一个条件会比直接逐条翻看更高效。"
      : filteredCount === 1
        ? "范围已经非常聚焦，可以直接进入详情页。"
        : "范围已经适合浏览，可以先比较摘要、裁判结果和法院，再选 1 到 2 份继续阅读。";

  return (
    <div className="cases-intel-grid">
      <section className="glass-sm cases-intel-card">
        <div className="cases-intel-head">
          <strong>当前范围</strong>
          <span>{selectedFilterCount ? `已选 ${selectedFilterCount} 项` : "建议先选年份和案由。"}</span>
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
            <span>{shouldNarrow ? "目标：收进 20 条以内" : "先建立第一轮范围"}</span>
          </div>
          <p className="cases-intel-note">{actionNote}</p>
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
