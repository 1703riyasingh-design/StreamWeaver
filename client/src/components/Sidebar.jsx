import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

// Modern SVG Icons
const Icons = {
  Dashboard: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  Streams: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M6 7V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
      <line x1="8" y1="12" x2="8" y2="16" />
      <line x1="12" y1="12" x2="12" y2="16" />
      <line x1="16" y1="12" x2="16" y2="16" />
    </svg>
  ),
  Media: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <circle cx="8" cy="10" r="1.5" />
      <path d="m22 17-5-5L2 22" />
    </svg>
  ),
  Analytics: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 15l4-4 3 3 5-6" />
      <circle cx="7" cy="15" r="1.2" fill="currentColor" />
      <circle cx="11" cy="11" r="1.2" fill="currentColor" />
      <circle cx="14" cy="14" r="1.2" fill="currentColor" />
      <circle cx="19" cy="8" r="1.2" fill="currentColor" />
    </svg>
  ),
  Profile: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Upload: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  Settings: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Logout: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

const mainLinks = [
  { to: "/dashboard", label: "Dashboard", Icon: Icons.Dashboard },
  { to: "/streams", label: "Streams", Icon: Icons.Streams },
  { to: "/media", label: "Media Library", Icon: Icons.Media },
  { to: "/analytics", label: "Analytics", Icon: Icons.Analytics },
  { to: "/upload-dataset", label: "Upload Dataset", Icon: Icons.Upload },
  { to: "/datasets", label: "Datasets", Icon: Icons.Media },
];

const accountLinks = [
  { to: "/profile", label: "Profile", Icon: Icons.Profile },
  { to: "/settings", label: "Settings", Icon: Icons.Settings },
];

function Sidebar({ closeSidebar }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("streamweaver_user");
    sessionStorage.removeItem("streamweaver_user_id");
    navigate("/");
    closeSidebar?.();
  };

  const renderLink = ({ to, label, Icon }) => (
    <NavLink
      key={to}
      to={to}
      className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
      onClick={closeSidebar}
    >
      <span className="sidebar-link-icon" aria-hidden="true">
        <Icon />
      </span>
      <span>{label}</span>
    </NavLink>
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark" aria-hidden="true">SW</span>
        <span>
          <strong>StreamWeaver</strong>
          <small>Data workspace</small>
        </span>
      </div>

      <nav className="sidebar-nav" aria-label="Primary navigation">
        <div className="sidebar-section">
          <span className="sidebar-section-label">Main</span>
          {mainLinks.map(renderLink)}
        </div>

        <div className="sidebar-section sidebar-account">
          <span className="sidebar-section-label">Account</span>
          {accountLinks.map(renderLink)}
        </div>
      </nav>

      <div className="sidebar-footer">
        <button
          className="sidebar-link sidebar-logout"
          type="button"
          onClick={handleLogout}
        >
          <span className="sidebar-link-icon" aria-hidden="true">
            <Icons.Logout />
          </span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;