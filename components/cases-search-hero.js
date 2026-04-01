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
          <h1 className="section-title cases-hero-title">先收窄范围，再决定读哪一份文书</h1>
          <p className="section-desc cases-hero-desc">先用年份和案由把范围收进可浏览规模，再从结果里挑 1 到 2 份进入详情页。</p>
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
          {selectedFilterCount ? "已有筛选条件时，优先先看结果，不要继续叠很多低频条件。" : "还没开始筛时，优先先选年份，再选案由。"}
        </p>
      </div>
    </section>
  );
}
