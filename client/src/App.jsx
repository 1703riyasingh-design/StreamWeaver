import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import PlaceholderPage from "./pages/PlaceholderPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
          <Route
            path="/streams"
            element={
              <PlaceholderPage
                icon="📹"
                title="Streams"
                description="Manage and monitor all your live and scheduled streams from one place."
              />
            }
          />
          <Route
            path="/media"
            element={
              <PlaceholderPage
                icon="📂"
                title="Media Library"
                description="Browse, organize, and upload your video and audio assets."
              />
            }
          />
          <Route
            path="/analytics"
            element={
              <PlaceholderPage
                icon="📊"
                title="Analytics"
                description="Deep-dive into audience engagement, retention, and performance metrics."
              />
            }
          />
          <Route
            path="/profile"
            element={
              <PlaceholderPage
                icon="👤"
                title="Profile"
                description="Update your account details, avatar, and streaming preferences."
              />
            }
          />
          <Route
            path="/settings"
            element={
              <PlaceholderPage
                icon="⚙️"
                title="Settings"
                description="Configure notifications, security, and platform integrations."
              />
            }
          />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
