import { useState } from "react";
import { useNavigate } from "react-router-dom";

function NotificationSettings() {
  const navigate = useNavigate();
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = () => {
    localStorage.setItem(
      "streamweaver_notifications",
      JSON.stringify({ emailAlerts, smsAlerts })
    );
    setMessage("Notification settings updated successfully.");
  };

  return (
    <div className="placeholder-page">
      <span className="placeholder-icon">🔔</span>
      <h1>Notifications</h1>
      <p>Choose how you want to receive updates from StreamWeaver.</p>

      <div className="placeholder-metrics" style={{ maxWidth: "550px" }}>
        <div className="placeholder-metric-card">
          <span className="metric-label">Email alerts</span>
          <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={() => setEmailAlerts((current) => !current)}
            />
            Receive email updates
          </label>
        </div>
        <div className="placeholder-metric-card">
          <span className="metric-label">SMS alerts</span>
          <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="checkbox"
              checked={smsAlerts}
              onChange={() => setSmsAlerts((current) => !current)}
            />
            Receive SMS updates
          </label>
        </div>
      </div>

      <div style={{ marginTop: "22px", display: "flex", gap: "14px", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={handleSave}
          style={{
            border: "none",
            borderRadius: "14px",
            background: "#2563eb",
            color: "white",
            padding: "14px 24px",
            cursor: "pointer",
          }}
        >
          Save Notification Settings
        </button>
        <button
          type="button"
          onClick={() => navigate("/settings")}
          style={{
            border: "1px solid rgba(148, 163, 184, 0.25)",
            borderRadius: "14px",
            background: "transparent",
            color: "#e2e8f0",
            padding: "14px 24px",
            cursor: "pointer",
          }}
        >
          Back to Settings
        </button>
      </div>

      {message && (
        <p style={{ color: "#86efac", marginTop: "18px" }}>{message}</p>
      )}
    </div>
  );
}

export default NotificationSettings;
