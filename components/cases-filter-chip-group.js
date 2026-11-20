export default function CasesFilterChipGroup({
  field,
  label,
  items,
  hint = "",
  maxVisible = 9,
  expanded = false,
  selectedValues = [],
  onToggle,
  onToggleExpanded,
}) {
  if (!items.length) return null;

  const visible = expanded ? items : items.slice(0, maxVisible);

  return (
    <details className="filter-section filter-fold">
      <summary><span>{label}</span>{selectedValues.length > 0 && <span className="filter-selected">已选 {selectedValues.length}</span>}</summary>
      {hint && <p className="filter-hint">{hint}</p>}

      <div className="filter-chip-grid">
        {visible.map((item) => {
          const active = selectedValues.includes(item.value);
          return (
            <button key={item.value} type="button" className={`filter-chip${active ? " active" : ""}`} aria-pressed={active} onClick={() => onToggle(field, item.value)}>
              <span className="filter-chip-text" title={item.fullLabel || item.value}>
                {item.label || item.value}
              </span>
              <span className="filter-chip-count">{item.count}</span>
            </button>
          );
        })}
      </div>

      {items.length > maxVisible ? (
        <button type="button" className="btn btn-ghost filter-expand-btn" onClick={() => onToggleExpanded(field)}>
          {expanded ? "收起" : `展开全部 ${items.length} 项`}
        </button>
      ) : null}
    </details>
  );
}
