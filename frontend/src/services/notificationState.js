import { DEMO_NOTIFICATIONS } from "./demoData.js";

const READ_KEY = "meil-demo-read-notifications";

function getReadIds() {
  try {
    const value = JSON.parse(localStorage.getItem(READ_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function saveReadIds(ids) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event("demo-notifications-change"));
  } catch {
    return;
  }
}

export function getDemoNotifications() {
  const readIds = getReadIds();
  return DEMO_NOTIFICATIONS.map((item) => ({ ...item, unread: item.unread && !readIds.includes(item.id) }));
}

export function markDemoNotificationRead(id) {
  saveReadIds([...new Set([...getReadIds(), id])]);
}

export function markAllDemoNotificationsRead() {
  saveReadIds(DEMO_NOTIFICATIONS.map((item) => item.id));
}
