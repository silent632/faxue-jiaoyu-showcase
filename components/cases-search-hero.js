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
  return (
    <section className="glass cases-hero">
      <div className="cases-hero-head">
        <div className="section-head-copy">
          <span className="section-eyebrow">案例检索</span>
          <h1 className="section-title cases-hero-title">案例检索库</h1>
          <p className="section-desc cases-hero-desc">围绕案由、年份、法院层级与法条组织案例资源，便于从同类主题中比较不同裁判文书。</p>
        </div>

        <div className="cases-hero-stats">
          <span className="tag">案例库 {totalCount}</span>
          <span className="tag">{`当前结果 ${filteredCount}`}</span>
          <span className="tag">{selectedFilterCount ? `已选筛选 ${selectedFilterCount}` : "未加筛选"}</span>
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
      </div>

      <div className="cases-hero-foot">
        <p className="cases-hero-footnote">
          {selectedFilterCount ? "当前已形成检索范围，可继续浏览结果或补充关键词细化阅读对象。" : "可从年份、案由或关键词进入，逐步形成更清晰的阅读范围。"}
        </p>
      </div>
    </section>
  );
}
