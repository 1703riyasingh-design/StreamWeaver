import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const API_URL = "http://localhost:5000";

function Dashboard() {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalDatasets: 0,
    totalRows: 0,
    validRows: 0,
    invalidRows: 0,
  });

  const [latestDatasets, setLatestDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const userName =
    sessionStorage.getItem("streamweaver_user") || "StreamWeaver";
  const displayName =
    userName.charAt(0).toUpperCase() + userName.slice(1);

  // ==========================================
  // FETCH DASHBOARD STATS
  // ==========================================
  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      // Fetch dashboard stats
      const statsResponse = await fetch(
        `${API_URL}/api/datasets/dashboard/stats`
      );
      const statsResult = await statsResponse.json();

      if (!statsResponse.ok) {
        throw new Error(
          statsResult.message || "Failed to fetch dashboard stats"
        );
      }

      setStats({
        totalDatasets: statsResult.stats?.totalDatasets || 0,
        totalRows: statsResult.stats?.totalRows || 0,
        validRows: statsResult.stats?.validRows || 0,
        invalidRows: statsResult.stats?.invalidRows || 0,
      });

      // Fetch latest datasets
      const datasetsResponse = await fetch(`${API_URL}/api/datasets`);
      const datasetsResult = await datasetsResponse.json();

      if (datasetsResponse.ok) {
        setLatestDatasets((datasetsResult.datasets || []).slice(0, 5));
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      setErrorMessage(error.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // BUILD STATS CARDS
  // ==========================================
  const statsCards = [
    {
      label: "Total Datasets",
      value: stats.totalDatasets.toLocaleString(),
      change: "+0%",
      icon: "📁",
      trend: "up",
    },
    {
      label: "Total Rows",
      value: stats.totalRows.toLocaleString(),
      change: "+0%",
      icon: "📄",
      trend: "up",
    },
    {
      label: "Valid Rows",
      value: stats.validRows.toLocaleString(),
      change: "+0%",
      icon: "✅",
      trend: "up",
    },
    {
      label: "Invalid Rows",
      value: stats.invalidRows.toLocaleString(),
      change: "-0%",
      icon: "❌",
      trend: "down",
    },
  ];

  // ==========================================
  // CHART DATA
  // ==========================================
  const totalRowsForChart = stats.totalRows || 1;
  const validPercent = Math.round(
    (stats.validRows / totalRowsForChart) * 100
  );
  const invalidPercent = Math.round(
    (stats.invalidRows / totalRowsForChart) * 100
  );

  return (
    <div className="dashboard-page">
      {/* HEADER */}
      <header className="dashboard-header">
        <div>
          <h1>Welcome, {displayName}</h1>
          <p className="dashboard-subtitle">
            Here&apos;s an overview of your datasets and data processing
            activity.
          </p>
        </div>
        <div className="header-date">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </header>

      {/* ERROR */}
      {errorMessage && (
        <div className="upload-error" role="alert">
          {errorMessage}
        </div>
      )}

      {/* STATS CARDS */}
      <section className="stats-grid">
        {statsCards.map(({ label, value, change, icon, trend }) => (
          <article key={label} className="stat-card">
            <div className="stat-icon">{icon}</div>
            <div className="stat-content">
              <span className="stat-label">{label}</span>
              <span className="stat-value">{loading ? "—" : value}</span>
              <span className={`stat-change ${trend}`}>
                {change} vs last month
              </span>
            </div>
          </article>
        ))}
      </section>

      {/* CHARTS */}
      <section className="charts-grid">
        <article className="chart-card">
          <div className="chart-card-header">
            <h2>Validation Analytics</h2>
            <span className="chart-badge">Dataset Rows</span>
          </div>

          <div className="bar-chart">
            <div className="bar-group">
              <div
                className="bar bar-valid"
                style={{
                  height: `${Math.max(validPercent, 5)}%`,
                }}
                title={`${stats.validRows} valid rows`}
              />
              <span className="bar-label">
                Valid Rows ({stats.validRows})
              </span>
            </div>

            <div className="bar-group">
              <div
                className="bar bar-invalid"
                style={{
                  height: `${Math.max(invalidPercent, 5)}%`,
                }}
                title={`${stats.invalidRows} invalid rows`}
              />
              <span className="bar-label">
                Invalid Rows ({stats.invalidRows})
              </span>
            </div>
          </div>

          <div className="chart-footer">
            <span>
              Total processed rows: <strong>{stats.totalRows}</strong>
            </span>
          </div>
        </article>

        <article className="chart-card">
          <div className="chart-card-header">
            <h2>Dataset Overview</h2>
            <span className="chart-badge">Latest Datasets</span>
          </div>

          {loading ? (
            <p className="dashboard-empty-text">Loading...</p>
          ) : latestDatasets.length === 0 ? (
            <p className="dashboard-empty-text">
              No dataset data available.
            </p>
          ) : (
            <ul className="mini-dataset-list">
              {latestDatasets.map((d) => (
                <li key={d._id}>
                  <span className="mini-dataset-name">
                    {d.datasetName}
                  </span>
                  <span className="mini-dataset-rows">
                    {d.totalRows} rows
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="chart-footer">
            <span>
              Showing rows from the latest{" "}
              <strong>{latestDatasets.length}</strong> datasets
            </span>
          </div>
        </article>
      </section>

      {/* LATEST DATASETS */}
      <section className="activity-section">
        <h2>Latest Datasets</h2>

        {loading ? (
          <ul className="activity-list">
            <li>
              <span className="activity-dot" />
              <span>Loading datasets...</span>
            </li>
          </ul>
        ) : latestDatasets.length === 0 ? (
          <ul className="activity-list">
            <li>
              <span className="activity-dot" />
              <span>No datasets uploaded yet.</span>
            </li>
          </ul>
        ) : (
          <ul className="activity-list">
            {latestDatasets.map((dataset, index) => (
              <li
                key={dataset._id}
                onClick={() => navigate(`/datasets/${dataset._id}`)}
                style={{ cursor: "pointer" }}
              >
                <span
                  className={`activity-dot ${index === 0 ? "live" : ""}`}
                />
                <span>
                  <strong>{dataset.datasetName}</strong> —{" "}
                  {dataset.totalRows} rows
                </span>
                <time>
                  {new Date(dataset.createdAt).toLocaleDateString()}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default Dashboard;