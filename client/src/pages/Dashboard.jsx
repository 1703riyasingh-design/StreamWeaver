import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const API_URL = "http://localhost:5000/api";
const emptyStats = { totalDatasets: 0, totalRows: 0, validRows: 0, invalidRows: 0 };
const metrics = [
  { key: "totalDatasets", label: "Total Datasets", icon: "#", tone: "blue" },
  { key: "totalRows", label: "Total Rows", icon: "=", tone: "cyan" },
  { key: "validRows", label: "Valid Rows", icon: "+", tone: "green" },
  { key: "invalidRows", label: "Invalid Rows", icon: "!", tone: "red" },
];

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

function formatDate(value) {
  if (!value) return "Unknown date";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function getPercentages(stats) {
  const total = stats.totalRows || 0;
  return { valid: total ? Math.round((stats.validRows / total) * 100) : 0, invalid: total ? Math.round((stats.invalidRows / total) * 100) : 0 };
}

function getDatasetStatus(dataset) {
  const processedRows = (dataset.validRows || 0) + (dataset.invalidRows || 0);
  if (!dataset.totalRows) return "No rows";
  return processedRows >= dataset.totalRows ? "Complete" : "Processing";
}

function StateMessage({ type, title, description, action }) {
  return <div className={`dashboard-state dashboard-state-${type}`}><span className="state-mark" aria-hidden="true">{type === "error" ? "!" : type === "empty" ? "-" : "..."}</span><div><strong>{title}</strong><p>{description}</p></div>{action}</div>;
}

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(emptyStats);
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const displayName = (sessionStorage.getItem("streamweaver_user") || "StreamWeaver").replace(/^./, (character) => character.toUpperCase());

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const [statsResponse, datasetsResponse] = await Promise.all([fetch(`${API_URL}/datasets/dashboard/stats`), fetch(`${API_URL}/datasets`)]);
      const [statsResult, datasetsResult] = await Promise.all([statsResponse.json(), datasetsResponse.json()]);
      if (!statsResponse.ok) throw new Error(statsResult.message || "Failed to fetch dashboard statistics");
      if (!datasetsResponse.ok) throw new Error(datasetsResult.message || "Failed to fetch datasets");
      setStats({ ...emptyStats, ...(statsResult.stats || {}) });
      setDatasets(datasetsResult.datasets || []);
    } catch (error) {
      console.error("Dashboard data error:", error);
      setErrorMessage(error.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const percentages = useMemo(() => getPercentages(stats), [stats]);
  const latestDataset = datasets[0];
  const recentDatasets = datasets.slice(0, 5);
  const latestStatus = latestDataset ? getDatasetStatus(latestDataset) : "Awaiting upload";
  const healthLabel = stats.totalRows === 0 ? "Awaiting data" : percentages.invalid === 0 ? "Healthy" : percentages.valid >= 90 ? "Good" : "Needs attention";

  return <div className="dashboard-page">
    <header className="dashboard-header"><div><span className="dashboard-eyebrow">Workspace overview</span><h1>Welcome back, {displayName}</h1><p className="dashboard-subtitle">Monitor your datasets, validation quality, and processing activity.</p></div><div className="dashboard-header-actions"><span className="header-date">{formatDate(new Date())}</span><button className="secondary-action" type="button" onClick={fetchDashboardData} disabled={loading}>{loading ? "Refreshing..." : "Refresh data"}</button></div></header>

    <section className="dashboard-actions"><div><span className="section-eyebrow">Data operations</span><h2>Keep your pipeline moving</h2></div><div className="action-buttons"><button className="primary-action" type="button" onClick={() => navigate("/upload-dataset")}>+ Upload Dataset</button><button className="secondary-action" type="button" onClick={() => navigate("/datasets")}>View Datasets</button></div></section>

    {errorMessage && <StateMessage type="error" title="Dashboard data is unavailable" description={errorMessage} action={<button className="state-action" type="button" onClick={fetchDashboardData}>Try again</button>} />}

    <section className="stats-grid" aria-label="Dataset metrics">{metrics.map((metric) => <article className={`stat-card stat-card-${metric.tone}`} key={metric.key}><div className="stat-icon" aria-hidden="true">{metric.icon}</div><div className="stat-content"><span className="stat-label">{metric.label}</span><strong className="stat-value">{loading ? "--" : formatNumber(stats[metric.key])}</strong><span className="stat-caption">Across your workspace</span></div></article>)}</section>

    <section className="dashboard-grid dashboard-grid-primary">
      <article className="dashboard-panel"><div className="panel-heading"><div><span className="section-eyebrow">Quality control</span><h2>Validation Analytics</h2></div><span className="panel-meta">{formatNumber(stats.totalRows)} rows</span></div>{loading ? <StateMessage type="loading" title="Calculating validation quality" description="Reading the latest row results..." /> : <div className="validation-content"><div className="validation-ring" style={{ "--valid-percent": `${percentages.valid}%` }}><div><strong>{percentages.valid}%</strong><span>valid</span></div></div><div className="validation-legend"><div><span className="legend-dot valid-dot" /><span>Valid rows</span><strong>{formatNumber(stats.validRows)} <small>{percentages.valid}%</small></strong></div><div><span className="legend-dot invalid-dot" /><span>Invalid rows</span><strong>{formatNumber(stats.invalidRows)} <small>{percentages.invalid}%</small></strong></div><div className="quality-track"><span style={{ width: `${percentages.valid}%` }} /></div></div></div>}</article>
      <article className="dashboard-panel"><div className="panel-heading"><div><span className="section-eyebrow">Pipeline monitor</span><h2>Processing Activity</h2></div><span className={`status-pill status-${latestStatus.toLowerCase().replace(" ", "-")}`}>{latestStatus}</span></div>{loading ? <StateMessage type="loading" title="Checking pipeline" description="Loading processing activity..." /> : latestDataset ? <div className="status-summary"><div className="status-summary-icon">o</div><div><strong>{latestDataset.datasetName}</strong><p>{formatNumber(latestDataset.totalRows)} rows in the latest dataset</p><span>Updated {formatDate(latestDataset.updatedAt || latestDataset.createdAt)}</span></div><button className="text-action" type="button" onClick={() => navigate(`/datasets/${latestDataset._id}`)}>Open dataset</button></div> : <StateMessage type="empty" title="No processing yet" description="Upload a dataset to start your first validation run." action={<button className="state-action" type="button" onClick={() => navigate("/upload-dataset")}>Upload dataset</button>} />}</article>
    </section>

    <section className="dashboard-grid dashboard-grid-secondary"><article className="dashboard-panel"><div className="panel-heading"><div><span className="section-eyebrow">Most recent upload</span><h2>Latest Dataset</h2></div>{latestDataset && <button className="text-action" type="button" onClick={() => navigate(`/datasets/${latestDataset._id}`)}>View details</button>}</div>{loading ? <StateMessage type="loading" title="Loading latest dataset" description="Fetching dataset details..." /> : latestDataset ? <div className="latest-dataset"><div className="file-mark">{String(latestDataset.fileType || "file").toUpperCase()}</div><div className="latest-dataset-info"><strong>{latestDataset.datasetName}</strong><span>{latestDataset.originalFileName} - Uploaded {formatDate(latestDataset.createdAt)}</span><div className="dataset-mini-stats"><span><strong>{formatNumber(latestDataset.totalRows)}</strong> rows</span><span><strong>{formatNumber(latestDataset.validRows)}</strong> valid</span><span><strong>{formatNumber(latestDataset.invalidRows)}</strong> invalid</span></div></div></div> : <StateMessage type="empty" title="No datasets uploaded" description="Your latest dataset will appear here after upload." action={<button className="state-action" type="button" onClick={() => navigate("/upload-dataset")}>Get started</button>} />}</article><article className="dashboard-panel"><div className="panel-heading"><div><span className="section-eyebrow">Validation signal</span><h2>Dataset Health</h2></div><span className="health-indicator">OK {healthLabel}</span></div><div className="health-score"><strong>{percentages.valid}%</strong><span>valid rows across all datasets</span></div><div className="health-bar"><span style={{ width: `${percentages.valid}%` }} /></div><p className="health-note">{stats.invalidRows ? `${formatNumber(stats.invalidRows)} rows need attention.` : "No invalid rows detected in the current data."}</p></article></section>

    <section className="dashboard-panel recent-panel"><div className="panel-heading"><div><span className="section-eyebrow">Activity</span><h2>Recent Datasets</h2></div><button className="text-action" type="button" onClick={() => navigate("/datasets")}>View all datasets</button></div>{loading ? <StateMessage type="loading" title="Loading recent datasets" description="Fetching your latest uploads..." /> : recentDatasets.length === 0 ? <StateMessage type="empty" title="No recent activity" description="Uploaded datasets will appear in this list." action={<button className="state-action" type="button" onClick={() => navigate("/upload-dataset")}>Upload dataset</button>} /> : <div className="recent-table"><div className="recent-table-header"><span>Dataset</span><span>Rows</span><span>Quality</span><span>Status</span><span>Uploaded</span></div>{recentDatasets.map((dataset) => { const validPercent = dataset.totalRows ? Math.round(((dataset.validRows || 0) / dataset.totalRows) * 100) : 0; const status = getDatasetStatus(dataset); return <button className="recent-row" type="button" key={dataset._id} onClick={() => navigate(`/datasets/${dataset._id}`)}><span className="dataset-name-cell"><span className="row-file-mark">{String(dataset.fileType || "file").slice(0, 4).toUpperCase()}</span><strong>{dataset.datasetName}</strong></span><span>{formatNumber(dataset.totalRows)}</span><span className="quality-cell"><span className="row-quality-track"><i style={{ width: `${validPercent}%` }} /></span>{validPercent}%</span><span><span className={`status-pill status-${status.toLowerCase().replace(" ", "-")}`}>{status}</span></span><span className="date-cell">{formatDate(dataset.createdAt)}</span></button>; })}</div>}</section>
  </div>;
}

export default Dashboard;
