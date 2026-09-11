import { NavLink, useNavigate } from "react-router-dom";
import "./Sidebar.css";

const mainLinks = [
  { to: "/dashboard", label: "Dashboard", icon: "D" },
  { to: "/datasets", label: "Datasets", icon: "#" },
  { to: "/upload-dataset", label: "Upload Dataset", icon: "^" },
 

];

const accountLinks = [
  { to: "/profile", label: "Profile", icon: "U" },

];

function Sidebar({ closeSidebar }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem("streamweaver_user");
    navigate("/");
    closeSidebar?.();
  };

  const renderLink = ({ to, label, icon }) => (
    <NavLink key={to} to={to} className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`} onClick={closeSidebar}>
      <span className="sidebar-link-icon" aria-hidden="true">{icon}</span>
      <span>{label}</span>
    </NavLink>
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark" aria-hidden="true">SW</span>
        <span><strong>StreamWeaver</strong><small>Data workspace</small></span>
      </div>
      <nav className="sidebar-nav" aria-label="Primary navigation">
        <div className="sidebar-section"><span className="sidebar-section-label">Main</span>{mainLinks.map(renderLink)}</div>
        <div className="sidebar-section sidebar-account"><span className="sidebar-section-label">Account</span>{accountLinks.map(renderLink)}</div>
      </nav>
      <div className="sidebar-footer"><button className="sidebar-link sidebar-logout" type="button" onClick={handleLogout}><span className="sidebar-link-icon" aria-hidden="true">&gt;</span><span>Logout</span></button></div>
    </aside>
  );
}

export default Sidebar;
