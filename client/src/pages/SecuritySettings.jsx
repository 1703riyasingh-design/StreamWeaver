import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SecuritySettings() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [twoFactor, setTwoFactor] = useState(false);
  const [message, setMessage] = useState("");

  const handleSave = () => {
    localStorage.setItem(
      "streamweaver_security",
      JSON.stringify({ twoFactorEnabled: twoFactor })
    );
    setMessage("Security settings updated successfully.");
  };

  return (
    <div className="placeholder-page">
      <span className="placeholder-icon">🔒</span>
      <h1>Security</h1>
      <p>Manage your password and set up enhanced account protection for StreamWeaver.</p>

      <div className="placeholder-metrics" style={{ maxWidth: "550px" }}>
        <div className="placeholder-metric-card">
          <span className="metric-label">Password</span>
          <input
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid rgba(148, 163, 184, 0.18)",
              background: "rgba(15, 23, 42, 0.7)",
              color: "#f8fafc",
            }}
            type="password"
            placeholder="Enter a new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="placeholder-metric-card">
          <span className="metric-label">Two-factor authentication</span>
          <label style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <input
              type="checkbox"
              checked={twoFactor}
              onChange={() => setTwoFactor((current) => !current)}
            />
            Enable 2FA
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
          Save Security Settings
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

export default SecuritySettings;
