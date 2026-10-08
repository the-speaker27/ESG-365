export default function TrendChart({ items, unit = "kWh", highlightIndex = -1, compact = false }) {
  const maxValue = Math.max(1, ...items.map((item) => item.value));

  return (
    <div className={`trend-chart${compact ? " trend-chart-compact" : ""}`} role="img" aria-label={`Monthly values in ${unit}`}>
      {items.map((item, index) => (
        <div className={`trend-column${index === highlightIndex ? " is-highlighted" : ""}`} key={item.month}>
          {!compact && <span className="trend-value">{item.value ? unit === "kWh" ? `${Math.round(item.value / 1000)}k` : item.value.toLocaleString() : "—"}</span>}
          <div className="trend-bar-track">
            <span
              className="trend-bar"
              style={{ height: `${item.value ? Math.max(5, (item.value / maxValue) * 100) : 0}%` }}
              title={`${item.month}: ${item.value.toLocaleString()} ${unit}`}
            />
          </div>
          <span className="trend-label">{item.month}</span>
        </div>
      ))}
    </div>
  );
}
