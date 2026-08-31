import { NavLink, useNavigate } from "react-router-dom";

function Sidebar({ closeSidebar }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("streamweaver_user");
    navigate("/");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">🎥</span>
        <span className="brand-text">StreamWeaver</span>
      </div>
      <nav className="sidebar-nav">
        <span className="nav-label">Main Menu</span>
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeSidebar}>
          <span className="nav-icon">📊</span> Dashboard
        </NavLink>
        <NavLink to="/streams" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeSidebar}>
          <span className="nav-icon">📺</span> Streams
        </NavLink>
        <NavLink to="/media" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeSidebar}>
          <span className="nav-icon">🎬</span> Media Library
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeSidebar}>
          <span className="nav-icon">📈</span> Analytics
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeSidebar}>
          <span className="nav-icon">👤</span> Profile
        </NavLink>
        <NavLink to="/upload-dataset" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeSidebar}>
          <span className="nav-icon">📦</span> Upload Dataset
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => (isActive ? "active" : "")} onClick={closeSidebar}>
          <span className="nav-icon">⚙️</span> Settings
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <span className="logout-icon">🚪</span> Logout
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;