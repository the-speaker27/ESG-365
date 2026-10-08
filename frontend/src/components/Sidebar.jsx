import { NavLink } from "react-router-dom";
import { ROLE_NAVIGATION } from "../utils/constants.js";

export default function Sidebar({ role }) {
	const items = ROLE_NAVIGATION[role] || [];

  return (
    <aside className="app-sidebar">
      <nav aria-label="Primary navigation" className="sidebar-nav">
        {items.map((group) => (
          <div className="sidebar-group" key={group.section}>
            <p className="sidebar-section-label">{group.section}</p>
            {group.items.map((item) => (
              <NavLink
                className={({ isActive }) => `sidebar-link${isActive ? " is-active" : ""}`}
                to={item.path}
                key={item.path}
              >
                <span className="sidebar-link-icon" aria-hidden="true">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}