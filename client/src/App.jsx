import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import UploadDataset from "./pages/UploadDataset";
import DatasetPreview from "./pages/DatasetPreview";
import DatasetList from "./pages/DatasetList";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import PlaceholderPage from "./pages/PlaceholderPage";
import SettingsPage from "./pages/SettingsPage";
import SecuritySettings from "./pages/SecuritySettings";
import DatasetDetails from "./pages/DatasetDetails";
import ProfilePage from "./pages/ProfilePage";
import NotificationSettings from "./pages/NotificationSettings";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>

            {/* Dashboard */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Streams */}
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

            {/* Media Library */}
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

            {/* Analytics */}
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

            {/* Profile */}
            <Route path="/profile" element={<ProfilePage />} />

            {/* Settings */}
            <Route path="/settings" element={<SettingsPage />} />

            {/* Security */}
            <Route path="/security" element={<SecuritySettings />} />

            {/* Notifications */}
            <Route path="/notifications" element={<NotificationSettings />} />

            {/* Upload Dataset */}
            <Route path="/upload-dataset" element={<UploadDataset />} />

            {/* Dataset Preview */}
            <Route path="/dataset-preview" element={<DatasetPreview />} />

            {/* Datasets List */}
            <Route path="/datasets" element={<DatasetList />} />

            {/* Dataset Details */}
            <Route path="/datasets/:id" element={<DatasetDetails />} />

          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;