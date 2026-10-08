import { Link } from "react-router-dom";

export default function NotificationList({ items, onRead, compact = false }) {
  if (!items.length) {
    return <div className="notification-empty"><span aria-hidden="true">◌</span><strong>You're all caught up</strong><p>No notifications to show.</p></div>;
  }

  return (
    <div className={`notification-list${compact ? " notification-list-compact" : ""}`}>
      {items.map((item) => (
        <Link className={`notification-item${item.unread ? " is-unread" : ""}`} key={item.id} onClick={() => onRead?.(item.id)} to={item.href}>
          <span className={`notification-icon notification-icon-${item.icon === "!" ? "warning" : item.icon === "✓" ? "success" : "neutral"}`} aria-hidden="true">{item.icon}</span>
          <span className="notification-copy"><strong>{item.title}</strong><span>{item.message}</span><time>{item.time}</time></span>
          {item.unread && <i className="notification-unread-dot" aria-label="Unread" />}
        </Link>
      ))}
    </div>
  );
}
