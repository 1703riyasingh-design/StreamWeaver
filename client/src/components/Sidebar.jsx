import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const navItems = [
  { to: "/dashboard", icon: "🏠", label: "Dashboard" },
  { to: "/streams", icon: "📹", label: "Streams" },
  { to: "/media", icon: "📂", label: "Media Library" },
  { to: "/analytics", icon: "📊", label: "Analytics" },
  { to: "/profile", icon: "👤", label: "Profile" },
  { to: "/upload-dataset", icon: "📤", label: "Upload Dataset" },
  { to: "/settings", icon: "⚙️", label: "Settings" },
];

function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-logo">SW</span>
        <span className="sidebar-title">StreamWeaver</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link${isActive ? " active" : ""}`
            }
          >
            <span className="sidebar-icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      <button
        type="button"
        className="sidebar-link sidebar-logout"
        onClick={() => {
          sessionStorage.removeItem("streamweaver_user");
          navigate("/");
        }}
      >
        <span className="sidebar-icon">🚪</span>
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;
