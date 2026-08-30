import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import UploadDataset from "./pages/UploadDataset";
import DatasetPreview from "./pages/DatasetPreview";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import PlaceholderPage from "./pages/PlaceholderPage";
import SettingsPage from "./pages/SettingsPage";
import SecuritySettings from "./pages/SecuritySettings";
import NotificationSettings from "./pages/NotificationSettings";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>

            <Route path="/dashboard" element={<Dashboard />} />

            <Route
              path="/streams"
              element={
                <PlaceholderPage
                  icon="📺"
                  title="Streams"
                  description="Live sessions, scheduled broadcasts, and content delivery status across all channels."
                  metrics={[
                    { label: "Live now", value: "14" },
                    { label: "Scheduled", value: "27" },
                    { label: "Avg uptime", value: "99.4%" },
                  ]}
                />
              }
            />

            <Route
              path="/media"
              element={
                <PlaceholderPage
                  icon="🎬"
                  title="Media Library"
                  description="Organize clips, upload new assets, and manage reusable content for future broadcasts."
                  metrics={[
                    { label: "Assets", value: "1,248" },
                    { label: "Videos", value: "482" },
                    { label: "Audio", value: "316" },
                  ]}
                />
              }
            />

            <Route
              path="/analytics"
              element={
                <PlaceholderPage
                  icon="📊"
                  title="Analytics"
                  description="Audience insights, engagement trends, and performance reports for your active content." 
                  metrics={[
                    { label: "Reach", value: "2.4M" },
                    { label: "Engagement", value: "68%" },
                    { label: "Retention", value: "76%" },
                  ]}
                />
              }
            />

            <Route
              path="/profile"
              element={
                <PlaceholderPage
                  icon="👤"
                  title="Profile"
                  description="Review account details, team information, channel identity, and preferences."
                  metrics={[
                    { label: "Plan", value: "Pro" },
                    { label: "Team", value: "8 members" },
                    { label: "Status", value: "Active" },
                  ]}
                />
              }
            />

            <Route
              path="/settings"
              element={<SettingsPage />}
            />

            <Route
              path="/security"
              element={<SecuritySettings />}
            />

            <Route
              path="/notifications"
              element={<NotificationSettings />}
            />

            <Route
              path="/upload-dataset"
              element={<UploadDataset />}
            />

            <Route
              path="/dataset-preview"
              element={<DatasetPreview />}
            />

          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;