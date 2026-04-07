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
  const scopeLabel = selectedFilterCount ? `已选 ${selectedFilterCount} 项筛选` : "未加筛选";
  const guideText = selectedFilterCount
    ? "当前检索范围已经形成，可继续输入关键词或直接抽查结果。"
    : "建议先按年份和案由压缩样本，再继续按法院层级或法条做细筛。";

  return (
    <section className="glass cases-hero">
      <div className="cases-hero-head">
        <div className="section-head-copy">
          <span className="section-eyebrow">审阅路径</span>
          <h2 className="section-title cases-hero-title">案例检索工作面</h2>
          <p className="section-desc cases-hero-desc">围绕案由、年份、法院层级与法条组织案例资源，供专家抽查、类案对照与原文核验。</p>
        </div>

        <div className="cases-hero-stats">
          <article className="cases-hero-stat">
            <span>案例总量</span>
            <strong>{totalCount}</strong>
          </article>
          <article className="cases-hero-stat">
            <span>当前范围</span>
            <strong>{filteredCount}</strong>
          </article>
          <article className="cases-hero-stat">
            <span>筛查状态</span>
            <strong>{scopeLabel}</strong>
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

        <p className="cases-hero-search-hint">可直接输入案号、案名、法院或关键词，优先锁定需要抽查的个案。</p>
      </div>

      <div className="cases-hero-foot">
        <p className="cases-hero-footnote">{guideText}</p>
      </div>
    </section>
  );
}
