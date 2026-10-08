export default function Loading({ message = "Loading..." }) {
  return (
    <div className="loading-screen" role="status" aria-live="polite" aria-label={message}>
      <span className="loading-message">{message}</span>
      <div className="skeleton-kpis" aria-hidden="true">{[1, 2, 3, 4].map((item) => <span className="skeleton-block skeleton-kpi" key={item} />)}</div>
      <div className="skeleton-content" aria-hidden="true"><span className="skeleton-block skeleton-heading" /><span className="skeleton-block skeleton-line" /><span className="skeleton-block skeleton-line skeleton-line-short" /><span className="skeleton-block skeleton-table" /></div>
    </div>
  );
}