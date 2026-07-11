import Link from "next/link";
import { SORT_OPTIONS } from "@/lib/cases-workspace";

function buildCaseSnippet(item) {
  const source = String(item.summary || item.resultText || "").trim();
  if (!source) return "可进入详情页查看案例信息与原文入口。";
  if (source.length <= 120) return source;
  return `${source.slice(0, 120).trim()}...`;
}

function joinMetaParts(parts = [], fallback = "案例信息以详情页为准") {
  const values = parts.map((item) => String(item || "").trim()).filter(Boolean);
  return values.length ? values.join(" · ") : fallback;
}

function buildVisiblePages(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "ellipsis-end", totalPages];
  }
  if (currentPage >= totalPages - 3) {
    return [1, "ellipsis-start", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "ellipsis-start", currentPage - 1, currentPage, currentPage + 1, "ellipsis-end", totalPages];
}

export default function CasesResultsColumn({
  showMobileFilter,
  filteredCount,
  selectedFilterCount,
  sortMode,
  activeFilters,
  pageRows,
  pageStart,
  pageEnd,
  currentPage,
  totalPages,
  onToggleMobileFilter,
  onSortModeChange,
  onResetFilters,
  onPageChange,
}) {
  const visiblePages = buildVisiblePages(currentPage, totalPages);
  const resultsSummary = filteredCount ? `第 ${pageStart}-${pageEnd} 条，共 ${filteredCount} 条` : "当前无匹配结果";

  return (
    <section className="cases-results-column">
      <section className="glass-sm cases-results-head">
        <div className="cases-results-head-top">
          <div className="cases-results-copy">
            <h2 className="cases-results-title">检索结果</h2>
            <span className="cases-results-count">
              <strong>{filteredCount}</strong> 条案例
            </span>
            {filteredCount ? <span className="cases-results-range">{resultsSummary}</span> : null}
          </div>

          <div className="cases-results-actions">
            <div className="cases-mobile-toggle">
              <button className="btn btn-outline" type="button" onClick={onToggleMobileFilter}>
                {showMobileFilter ? "收起筛选" : "展开筛选"}
              </button>
            </div>
            <label className="cases-sort-label">
              <span>排序</span>
              <select className="input cases-sort-select" value={sortMode} onChange={(event) => onSortModeChange(event.target.value)}>
                {SORT_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <button className="btn btn-outline" type="button" onClick={onResetFilters} disabled={!selectedFilterCount}>
              重置筛选
            </button>
          </div>
        </div>

        {activeFilters.length > 0 && (
          <div className="cases-results-toolbar">
            <div className="active-filter-row">
              {activeFilters.map((item) => (
                <span key={item.key} className="active-chip">
                  {item.label}
                  <button type="button" onClick={item.onClear}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {!pageRows.length ? (
        <section className="card cases-empty-state">
          <h3 className="cases-empty-title">没有找到符合条件的案例</h3>
          <p className="cases-empty-desc">可适当放宽筛选条件，重新组织检索范围。</p>
          <button className="btn btn-primary" type="button" onClick={onResetFilters}>
            清空全部筛选
          </button>
        </section>
      ) : (
        pageRows.map((item, index) => (
          <Link key={item.id} href={`/cases/${item.id}`} className="case-card-shell">
            <div className="case-card-accent" />
            <div className="case-card-content">
              <div className="case-card-head">
                <div className="case-card-tags">
                  <span className="case-card-index">{String(pageStart + index).padStart(2, "0")}</span>
                  {item.causeFocus ? <span className="tag">{item.causeFocus}</span> : null}
                  {item.courtLevel ? <span className="tag">{item.courtLevel}</span> : null}
                </div>
                <div className="case-card-head-side">
                  {item.result ? <span className="tag tag-accent">{item.result}</span> : null}
                  {item.judgmentDate ? <span className="case-card-date">{item.judgmentDate}</span> : null}
                </div>
              </div>

              <div className="case-card-main">
                <h3 className="case-card-title">{item.title}</h3>
                <p className="case-card-meta">{joinMetaParts([item.caseNumber, item.courtName])}</p>
                <p className="case-card-summary">{buildCaseSnippet(item)}</p>
              </div>

              {(item.laws || []).length ? (
                <div className="case-law-row">
                  {(item.laws || []).slice(0, 3).map((law) => (
                    <span key={`${law.law}-${law.article}`} className="tag">
                      {law.displayLaw || law.law}
                      {law.article ? ` ${law.article}` : ""}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </Link>
        ))
      )}

      {filteredCount ? (
        <section className="card cases-pagination">
          <span className="cases-pagination-summary">{`第 ${currentPage} / ${totalPages} 页`}</span>
          <button className="btn btn-outline" type="button" disabled={currentPage <= 1} onClick={() => onPageChange(Math.max(1, currentPage - 1))}>
            上一页
          </button>
          {visiblePages.map((page) =>
            typeof page === "number" ? (
              <button
                key={page}
                type="button"
                className={`btn ${page === currentPage ? "btn-primary" : "btn-outline"} cases-page-btn`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            ) : (
              <span key={page} className="cases-page-ellipsis">
                …
              </span>
            )
          )}
          <button className="btn btn-outline" type="button" disabled={currentPage >= totalPages} onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}>
            下一页
          </button>
        </section>
      ) : null}
    </section>
  );
}
