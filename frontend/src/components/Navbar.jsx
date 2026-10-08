import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import NotificationList from "./NotificationList.jsx";
import { DEMO_SEARCH_ITEMS } from "../services/demoData.js";
import { USE_MOCK_DATA } from "../services/api.js";
import { getDemoNotifications, markDemoNotificationRead } from "../services/notificationState.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(getDemoNotifications);
  const navbarRef = useRef(null);
  const filteredSearch = useMemo(() => USE_MOCK_DATA
    ? DEMO_SEARCH_ITEMS.filter((item) => (user?.role !== "REVIEWER" || item.href !== "/project-performance") && `${item.label} ${item.detail}`.toLowerCase().includes(query.trim().toLowerCase())).slice(0, 6)
    : [], [query, user?.role]);
  const unreadCount = notifications.filter((item) => item.unread).length;

  useEffect(() => {
    setSearchOpen(false);
    setNotificationsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function refreshNotifications() {
      setNotifications(getDemoNotifications());
    }
    window.addEventListener("demo-notifications-change", refreshNotifications);
    return () => window.removeEventListener("demo-notifications-change", refreshNotifications);
  }, []);

  useEffect(() => {
    function closePanels(event) {
      if (!navbarRef.current?.contains(event.target)) {
        setSearchOpen(false);
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("pointerdown", closePanels);
    return () => document.removeEventListener("pointerdown", closePanels);
  }, []);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <header className="app-navbar" ref={navbarRef}>
      <Link className="app-brand" to="/" aria-label="ESG-365 home">
        <span className="app-brand-mark" aria-hidden="true">E</span>
        <span>ESG-365</span>
      </Link>
      <div className="navbar-search-wrap">
        <label className="navbar-search"><span aria-hidden="true">⌕</span><input aria-label="Search projects and submissions" autoComplete="off" onChange={(event) => setQuery(event.target.value)} onFocus={() => setSearchOpen(true)} placeholder="Search projects, submissions..." value={query} /></label>
        {searchOpen && query.trim() && <div className="navbar-search-results" role="listbox" aria-label="Demo search results">
          {filteredSearch.length ? filteredSearch.map((item) => <Link key={item.label} onClick={() => { setQuery(""); setSearchOpen(false); }} to={item.href}><strong>{item.label}</strong><span>{item.detail}</span><i aria-hidden="true">→</i></Link>) : <p>{USE_MOCK_DATA ? "No matching demo results." : "Enable demo data to search sample records."}</p>}
          <small>Frontend demo search</small>
        </div>}
      </div>
      <div className="navbar-account">
        <div className="notification-wrap">
          <button aria-expanded={notificationsOpen} aria-label={`Notifications, ${unreadCount} unread`} className="notification-trigger" onClick={() => setNotificationsOpen((open) => !open)} title="Notifications" type="button"><span className="bell-icon" aria-hidden="true" />{unreadCount > 0 && <i>{unreadCount}</i>}</button>
          {notificationsOpen && <div className="notification-popover"><div className="notification-popover-heading"><div><strong>Notifications</strong><span>{unreadCount} unread</span></div><Link to="/notifications">View all</Link></div><NotificationList compact items={notifications.slice(0, 4)} onRead={(id) => { markDemoNotificationRead(id); setNotifications((items) => items.map((item) => item.id === id ? { ...item, unread: false } : item)); }} /></div>}
        </div>
        <div className="account-identity">
          <span className="account-name">{user?.name || user?.email}</span>
          <span className="account-role">{user?.role}</span>
        </div>
        <button className="logout-button" onClick={handleLogout} type="button">
          Logout
        </button>
      </div>
    </header>
  );
}