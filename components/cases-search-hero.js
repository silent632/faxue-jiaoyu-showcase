export default function CasesSearchHero({
  totalCount,
  filteredCount,
  selectedFilterCount,
  keywordInput,
  showSuggestions,
  suggestions,
  onKeywordInputChange,
  onSuggestionsOpen,
  onSuggestionsClose,
  onSuggestionSelect,
}) {
  const guideText = selectedFilterCount
    ? "当前检索范围已经形成，可继续输入关键词或浏览结果。"
    : "可先从年份和案由开始，再补充法院层级或法条。";

  return (
    <section className="cases-hero">
      <div className="cases-hero-head">
        <div className="cases-hero-intro">
          <p className="section-eyebrow">案例检索</p>
          <h1 className="cases-hero-title">案例检索与原文入口</h1>
          <p className="cases-hero-desc">围绕案由、年份、法院层级与法条组织案例资源，支持类案浏览、对照与文书阅读。</p>
        </div>

        <div className="cases-hero-kpi-row">
          <article className="cases-hero-kpi is-primary">
            <strong className="cases-hero-kpi-value">{totalCount}</strong>
            <span className="cases-hero-kpi-label">案例总量</span>
          </article>
          <article className="cases-hero-kpi">
            <strong className="cases-hero-kpi-value">{filteredCount}</strong>
            <span className="cases-hero-kpi-label">当前范围</span>
          </article>
          <article className="cases-hero-kpi">
            <strong className="cases-hero-kpi-value">{selectedFilterCount || "—"}</strong>
            <span className="cases-hero-kpi-label">已选筛选</span>
          </article>
        </div>
      </div>

      <div className="cases-hero-search-row">
        <div className="cases-hero-search-box">
          <input
            className="input cases-search-input"
            placeholder="输入案号、案名、法院或关键词"
            value={keywordInput}
            onChange={(event) => onKeywordInputChange(event.target.value)}
            onFocus={onSuggestionsOpen}
            onBlur={onSuggestionsClose}
          />

          {showSuggestions && suggestions.length ? (
            <div className="cases-suggestion-list">
              {suggestions.map((item) => (
                <button
                  key={item.id}
                  className="sug-item cases-suggestion-item"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => onSuggestionSelect(item)}
                >
                  <div className="cases-suggestion-title">{item.title}</div>
                  <div className="cases-suggestion-meta">{item.caseNumber || item.courtName}</div>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <p className="cases-hero-search-hint">{guideText}</p>
      </div>
    </section>
  );
}
