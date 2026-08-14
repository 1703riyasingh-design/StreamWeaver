import { useNavigate } from "react-router-dom";

function SettingsPage() {
  const navigate = useNavigate();

  const settingsItems = [
    { title: "Security", description: "Update password, two-factor authentication, and access control.", path: "/security" },
    { title: "Notifications", description: "Configure alerts, reminders, and platform updates.", path: "/notifications" },
    { title: "Upload Dataset", description: "Add a CSV, JSON, or XLSX dataset to the platform.", path: "/upload-dataset" },
  ];

  return (
    <div className="placeholder-page settings-page">
      <span className="placeholder-icon">⚙️</span>
      <h1>Settings</h1>
      <p>Manage your account preferences and platform configuration.</p>

      <div className="settings-grid">
        {settingsItems.map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={() => navigate(item.path)}
            className="settings-card"
          >
            <div className="settings-card-title">{item.title}</div>
            <div className="settings-card-description">{item.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default SettingsPage;
