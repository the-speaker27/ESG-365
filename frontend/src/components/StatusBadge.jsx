import { getStatusLabel } from "../utils/status.js";

export default function StatusBadge({ status }) {
  const statusClass = status?.toLowerCase().replaceAll("_", "-") || "unknown";
  return <span className={`status-badge status-${statusClass}`}>{getStatusLabel(status)}</span>;
}