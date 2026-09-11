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

            <Route path="/dashboard" element={<Dashboard />} />

          

           
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
  element={<ProfilePage />}
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

<Route
  path="/datasets"
  element={<DatasetList />}
/>

<Route
  path="/datasets/:id"
  element={<DatasetDetails />}
/>

          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;