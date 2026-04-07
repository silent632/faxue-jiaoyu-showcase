"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import CasesFilterChipGroup from "@/components/cases-filter-chip-group";
import CasesIntelligencePanels from "@/components/cases-intelligence-panels";
import CasesResultsColumn from "@/components/cases-results-column";
import CasesSearchHero from "@/components/cases-search-hero";
import {
  PAGE_SIZE,
  buildActiveFilterDescriptors,
  buildCasesQueryString,
  buildFilterOptions,
  buildNarrowingSuggestions,
  resolveCasesStateFromSearchParams,
  buildStarterActions,
  getFilteredRows,
  getKeywordSuggestions,
  normalizeCaseRows,
  normalizeInitialCaseFilters,
  resolvePageNumber,
  resolveSortMode,
} from "@/lib/cases-workspace";

export default function CasesWorkspace({ cases = [], initialFilters = {}, initialSort = "date-desc", initialPage = 1 }) {
  const pathname = usePathname();
  const rows = useMemo(() => normalizeCaseRows(cases), [cases]);
  const [filters, setFilters] = useState(() => normalizeInitialCaseFilters(initialFilters));
  const [keywordInput, setKeywordInput] = useState(() => String(initialFilters.keyword || initialFilters.q || ""));
  const [sortMode, setSortMode] = useState(() => resolveSortMode(initialSort));
  const [currentPage, setCurrentPage] = useState(() => resolvePageNumber(initialPage));
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const syncFromLocation = () => {
      const nextState = resolveCasesStateFromSearchParams(new URLSearchParams(window.location.search));
      setFilters(nextState.filters);
      setKeywordInput(nextState.keywordInput);
      setSortMode(nextState.sortMode);
      setCurrentPage(nextState.currentPage);
    };

    syncFromLocation();
    window.addEventListener("popstate", syncFromLocation);
    return () => window.removeEventListener("popstate", syncFromLocation);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => ({ ...prev, keyword: keywordInput.trim() }));
      setCurrentPage(1);
    }, 240);
    return () => clearTimeout(timer);
  }, [keywordInput]);

  const options = useMemo(() => buildFilterOptions(rows, filters), [rows, filters]);

  useEffect(() => {
    setFilters((prev) => {
      if (!prev.lawArticle.length) return prev;
      const valid = new Set(options.lawArticle.map((item) => item.value));
      const next = prev.lawArticle.filter((item) => valid.has(item));
      if (next.length === prev.lawArticle.length) return prev;
      return { ...prev, lawArticle: next };
    });
  }, [options.lawArticle]);

  function toggleMulti(field, value) {
    setFilters((prev) => {
      const current = prev[field] || [];
      const exists = current.includes(value);
      const next = exists ? current.filter((item) => item !== value) : [...new Set([...current, value])];
      return { ...prev, [field]: next };
    });
    setCurrentPage(1);
  }

  function clearOne(field, value = "") {
    setFilters((prev) => {
      if (Array.isArray(prev[field])) {
        return { ...prev, [field]: prev[field].filter((item) => item !== value) };
      }
      return { ...prev, [field]: "" };
    });
    if (field === "keyword") setKeywordInput("");
    setCurrentPage(1);
  }

  const filtered = useMemo(() => getFilteredRows(rows, filters, sortMode), [rows, filters, sortMode]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = useMemo(() => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE), [filtered, currentPage]);
  const suggestions = useMemo(() => getKeywordSuggestions(rows, keywordInput), [rows, keywordInput]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const query = buildCasesQueryString({ filters, sortMode, currentPage });
    const next = query ? `${pathname}?${query}` : pathname;
    if (`${window.location.pathname}${window.location.search}` !== next) {
      window.history.replaceState(null, "", next);
    }
  }, [pathname, filters, sortMode, currentPage]);

  const activeFilters = useMemo(
    () =>
      buildActiveFilterDescriptors(filters).map((item) => ({
        ...item,
        onClear: () => clearOne(item.field, item.value),
      })),
    [filters]
  );

  const selectedFilterCount = activeFilters.length;
  const pageStart = filtered.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0;
  const pageEnd = filtered.length ? pageStart + pageRows.length - 1 : 0;
  const starterActions = useMemo(() => buildStarterActions({ filtered, rows, filters }), [filtered, rows, filters]);
  const narrowingSuggestions = useMemo(() => buildNarrowingSuggestions({ filtered, filters }), [filtered, filters]);

  function applyFilterAction(action) {
    setFilters((prev) => {
      if (action.field === "year") return { ...prev, year: action.value };
      if (action.field === "causeL1") return { ...prev, causeL1: action.value, causeL2: "", causeL3: "" };
      if (action.field === "causeL2") return { ...prev, causeL2: action.value, causeL3: "" };
      if (action.field === "causeL3") return { ...prev, causeL3: action.value };
      if (action.field === "lawName") return { ...prev, lawName: [action.value], lawArticle: [] };
      return { ...prev, [action.field]: [action.value] };
    });
    setCurrentPage(1);
    setShowMobileFilter(false);
  }

  function handleResetFilters() {
    setFilters(normalizeInitialCaseFilters({}));
    setKeywordInput("");
    setCurrentPage(1);
  }

  function handleSuggestionSelect(item) {
    setKeywordInput(item.title);
    setFilters((prev) => ({ ...prev, keyword: item.title }));
    setShowSuggestions(false);
    setCurrentPage(1);
  }

  return (
    <div className="page-wrap page-stack cases-public-page">
      <CasesSearchHero
        totalCount={rows.length}
        filteredCount={filtered.length}
        selectedFilterCount={selectedFilterCount}
        keywordInput={keywordInput}
        showSuggestions={showSuggestions}
        suggestions={suggestions}
        onKeywordInputChange={setKeywordInput}
        onSuggestionsOpen={() => setShowSuggestions(true)}
        onSuggestionsClose={() => setTimeout(() => setShowSuggestions(false), 120)}
        onSuggestionSelect={handleSuggestionSelect}
      />

      <CasesIntelligencePanels
        filteredCount={filtered.length}
        selectedFilterCount={selectedFilterCount}
        pageStart={pageStart}
        pageEnd={pageEnd}
        currentPage={currentPage}
        totalPages={totalPages}
        starterActions={starterActions}
        narrowingSuggestions={narrowingSuggestions}
        onApplyFilterAction={applyFilterAction}
      />

      <div className="cases-grid">
        <aside className={`glass-sm cases-sidebar${showMobileFilter ? " open" : ""}`}>
          <div className="cases-sidebar-head">
            <div className="cases-sidebar-head-copy">
              <h3 className="cases-sidebar-title">筛选条件</h3>
              <p className="cases-sidebar-note">常用筛选放在上面，组合起来更容易快速定位结果。</p>
            </div>
            <button className="btn btn-outline cases-mobile-close" type="button" onClick={() => setShowMobileFilter(false)}>
              关闭
            </button>
          </div>

          <div className="cases-sidebar-scroll">
            <section className="filter-section">
              <div className="filter-heading-row">
                <div>
                  <div className="filter-heading">案由</div>
                  <p className="filter-hint">按“案件类型 → 案由门类 → 具体案由”逐级收窄，更适合教学检索。</p>
                </div>
              </div>
              <select
                className="input cases-filter-select"
                value={filters.causeL1}
                onChange={(event) => {
                  setFilters((prev) => ({ ...prev, causeL1: event.target.value, causeL2: "", causeL3: "" }));
                  setCurrentPage(1);
                }}
              >
                <option value="">案件类型：全部</option>
                {options.causeL1.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              {filters.causeL1 ? (
                <select
                  className="input cases-filter-select cases-filter-select-spaced"
                  value={filters.causeL2}
                  onChange={(event) => {
                    setFilters((prev) => ({ ...prev, causeL2: event.target.value, causeL3: "" }));
                    setCurrentPage(1);
                  }}
                >
                  <option value="">案由门类：全部</option>
                  {options.causeL2.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              ) : null}
              {filters.causeL2 ? (
                <select
                  className="input cases-filter-select cases-filter-select-spaced"
                  value={filters.causeL3}
                  onChange={(event) => {
                    setFilters((prev) => ({ ...prev, causeL3: event.target.value }));
                    setCurrentPage(1);
                  }}
                >
                  <option value="">具体案由：全部</option>
                  {options.causeL3.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              ) : null}
            </section>

            <section className="filter-section">
              <div className="filter-heading-row">
                <div>
                  <div className="filter-heading">裁判年份</div>
                  <p className="filter-hint">可先选择年份，再继续收窄范围。</p>
                </div>
              </div>
              <select
                className="input cases-filter-select"
                value={filters.year}
                onChange={(event) => {
                  setFilters((prev) => ({ ...prev, year: event.target.value }));
                  setCurrentPage(1);
                }}
              >
                <option value="">全部年份</option>
                {options.year.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </section>

            <CasesFilterChipGroup
              field="courtLevel"
              label="法院层级"
              items={options.courtLevel}
              hint="按审级判断裁判层次，适合区分最高、高院、中院和基层法院。"
              maxVisible={6}
              expanded={!!expandedGroups.courtLevel}
              selectedValues={filters.courtLevel}
              onToggle={toggleMulti}
              onToggleExpanded={(field) => setExpandedGroups((prev) => ({ ...prev, [field]: !prev[field] }))}
            />
            <CasesFilterChipGroup
              field="docType"
              label="文书类型"
              items={options.docType}
              hint="适合在同类案件中区分判决、裁定和调解等文书。"
              maxVisible={6}
              expanded={!!expandedGroups.docType}
              selectedValues={filters.docType}
              onToggle={toggleMulti}
              onToggleExpanded={(field) => setExpandedGroups((prev) => ({ ...prev, [field]: !prev[field] }))}
            />
            <CasesFilterChipGroup
              field="procedure"
              label="审理程序"
              items={options.procedure}
              hint="区分一审、二审、再审和执行等程序场景。"
              maxVisible={6}
              expanded={!!expandedGroups.procedure}
              selectedValues={filters.procedure}
              onToggle={toggleMulti}
              onToggleExpanded={(field) => setExpandedGroups((prev) => ({ ...prev, [field]: !prev[field] }))}
            />
            <CasesFilterChipGroup
              field="province"
              label="省份"
              items={options.province}
              hint="适合做地域比较或快速定位地方司法案例。"
              maxVisible={8}
              expanded={!!expandedGroups.province}
              selectedValues={filters.province}
              onToggle={toggleMulti}
              onToggleExpanded={(field) => setExpandedGroups((prev) => ({ ...prev, [field]: !prev[field] }))}
            />
            <CasesFilterChipGroup
              field="result"
              label="裁判结果"
              items={options.result}
              hint="可辅助筛出改判、发回、支持诉请等有代表性的裁判结果。"
              maxVisible={8}
              expanded={!!expandedGroups.result}
              selectedValues={filters.result}
              onToggle={toggleMulti}
              onToggleExpanded={(field) => setExpandedGroups((prev) => ({ ...prev, [field]: !prev[field] }))}
            />
            <CasesFilterChipGroup
              field="lawName"
              label="法律名称"
              items={options.lawName}
              hint="先按法律名称收窄，再补条文，会比一上来就选具体条文更稳。"
              maxVisible={6}
              expanded={!!expandedGroups.lawName}
              selectedValues={filters.lawName}
              onToggle={toggleMulti}
              onToggleExpanded={(field) => setExpandedGroups((prev) => ({ ...prev, [field]: !prev[field] }))}
            />
            <CasesFilterChipGroup
              field="lawArticle"
              label="具体条文"
              items={options.lawArticle}
              hint="条文适合做最后一层精筛，可先选择法律名称。"
              maxVisible={8}
              expanded={!!expandedGroups.lawArticle}
              selectedValues={filters.lawArticle}
              onToggle={toggleMulti}
              onToggleExpanded={(field) => setExpandedGroups((prev) => ({ ...prev, [field]: !prev[field] }))}
            />
          </div>

          <div className="cases-sidebar-foot">
            <button className="btn btn-outline cases-sidebar-reset" type="button" onClick={handleResetFilters}>
              清空全部筛选
            </button>
          </div>
        </aside>

        <CasesResultsColumn
          showMobileFilter={showMobileFilter}
          filteredCount={filtered.length}
          selectedFilterCount={selectedFilterCount}
          sortMode={sortMode}
          activeFilters={activeFilters}
          pageRows={pageRows}
          pageStart={pageStart}
          pageEnd={pageEnd}
          currentPage={currentPage}
          totalPages={totalPages}
          onToggleMobileFilter={() => setShowMobileFilter((prev) => !prev)}
          onSortModeChange={(value) => {
            setSortMode(value);
            setCurrentPage(1);
          }}
          onResetFilters={handleResetFilters}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
