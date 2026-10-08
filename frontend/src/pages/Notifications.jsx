import { useState } from "react";
import NotificationList from "../components/NotificationList.jsx";
import { getDemoNotifications, markAllDemoNotificationsRead, markDemoNotificationRead } from "../services/notificationState.js";

export default function Notifications() {
  const [notifications, setNotifications] = useState(getDemoNotifications);
  const unreadCount = notifications.filter((item) => item.unread).length;

  function markRead(id) {
    markDemoNotificationRead(id);
    setNotifications((items) => items.map((item) => item.id === id ? { ...item, unread: false } : item));
  }

  return (
    <section className="page-content page-enter">
      <div className="page-heading page-heading-split">
        <div><p className="page-eyebrow">AI & SUPPORT</p><h1>Notifications</h1><p>Reporting updates and items that may need your attention.</p></div>
        <button className="text-button" disabled={!unreadCount} onClick={() => { markAllDemoNotificationsRead(); setNotifications((items) => items.map((item) => ({ ...item, unread: false }))); }} type="button">Mark all as read</button>
      </div>
      <section className="content-section notification-page-section">
        <div className="section-heading"><div><h2>Recent updates</h2><p>{unreadCount} unread notifications</p></div><span className="demo-tag">DEMONSTRATION DATA</span></div>
        <NotificationList items={notifications} onRead={markRead} />
      </section>
    </section>
  );
}
