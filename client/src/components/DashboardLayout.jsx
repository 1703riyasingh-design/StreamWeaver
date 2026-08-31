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
      {/* Hamburger Button - Mobile पर ही दिखेगा */}
      <button className="hamburger-btn" onClick={toggleSidebar} aria-label="Toggle menu">
        ☰
      </button>

      {/* Overlay - Sidebar खुलने पर डिम */}
      <div className={`sidebar-overlay ${isSidebarOpen ? "active" : ""}`} onClick={closeSidebar} />

      {/* Sidebar - Wrapper for sliding */}
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