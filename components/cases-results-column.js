import Link from "next/link";
import { SORT_OPTIONS } from "@/lib/cases-workspace";

function buildCaseSnippet(item) {
  const source = String(item.summary || item.resultText || "").trim();
  if (!source) return "当前暂无摘要，可进入详情页查看案例信息与原文入口。";
  if (source.length <= 120) return source;
  return `${source.slice(0, 120).trim()}...`;
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
            <span className="section-eyebrow">检索结果</span>
            <h2 className="section-title cases-results-title">{filteredCount ? `当前匹配 ${filteredCount} 条案例` : "暂时没有找到相关案例"}</h2>
            <p className="section-desc cases-results-desc">{filteredCount ? "结合标题、法院、裁判结果与摘要，先确定抽查对象，再进入详情页核对原文。" : "可调整检索条件后重新浏览案例结果。"}</p>
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

        <div className="cases-results-toolbar">
            <div className="cases-results-summary">{resultsSummary}</div>
          {activeFilters.length ? (
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
          ) : (
            <p className="cases-results-empty-note">当前未设置筛选条件，可从年份、案由或关键词开始检索。</p>
          )}
        </div>
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
          <section key={item.id} className="glass-sm case-card-shell">
            <div className="case-card-head">
              <div className="case-card-tags">
                <span className="case-card-index">{String(pageStart + index).padStart(2, "0")}</span>
                {item.causeFocus ? <span className="tag">{item.causeFocus}</span> : null}
                {item.courtLevel ? <span className="tag">{item.courtLevel}</span> : null}
                {item.docType ? <span className="tag">{item.docType}</span> : null}
                {item.procedure ? <span className="tag">{item.procedure}</span> : null}
              </div>
              <div className="case-card-head-side">
                {item.result ? <span className="tag tag-accent">{item.result}</span> : null}
                <span className="case-card-date">{item.judgmentDate || "日期待补充"}</span>
              </div>
            </div>

            <div className="case-card-main">
              <h3 className="case-card-title">
                <Link className="case-card-title-link" href={`/cases/${item.id}`}>
                  {item.title}
                </Link>
              </h3>
              <p className="case-card-meta">
                {item.caseNumber || "案号待补充"} · {item.courtName || "法院待补充"}
              </p>
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

            <div className="case-card-footer">
              <span className="case-card-footer-note">进入详情页继续查看导读判断、裁判结论与原文入口。</span>
              <Link className="btn btn-primary" href={`/cases/${item.id}`}>
                查看详情
              </Link>
            </div>
          </section>
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
