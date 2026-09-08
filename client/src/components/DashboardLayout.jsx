import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import "./DashboardLayout.css";

function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="dashboard-layout">
      <button className="hamburger-btn" onClick={toggleSidebar} aria-label="Toggle navigation menu" aria-expanded={isSidebarOpen}>
        <span aria-hidden="true">=</span>
      </button>

      <div className={`sidebar-overlay ${isSidebarOpen ? "active" : ""}`} onClick={closeSidebar} />

      <div className={`sidebar-wrapper ${isSidebarOpen ? "open" : ""}`}>
        <Sidebar closeSidebar={closeSidebar} />
      </div>

      <main className="dashboard-main">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;