import "./Dashboard.css";

const stats = [
  { label: "Total Streams", value: "2,847", change: "+12.5%", icon: "📹", trend: "up" },
  { label: "Active Users", value: "18,432", change: "+8.2%", icon: "👥", trend: "up" },
  { label: "Live Streams", value: "156", change: "+23.1%", icon: "🔴", trend: "up" },
];

const viewerData = [40, 65, 45, 80, 55, 90, 70, 95, 60, 85, 75, 100];
const streamData = [
  { day: "Mon", value: 120 },
  { day: "Tue", value: 180 },
  { day: "Wed", value: 150 },
  { day: "Thu", value: 220 },
  { day: "Fri", value: 190 },
  { day: "Sat", value: 280 },
  { day: "Sun", value: 240 },
];

function LineChart({ data }) {
  const width = 480;
  const height = 160;
  const padding = 20;
  const max = Math.max(...data);
  const step = (width - padding * 2) / (data.length - 1);

  const points = data
    .map((val, i) => {
      const x = padding + i * step;
      const y = height - padding - (val / max) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `${padding},${height - padding} ${points} ${padding + (data.length - 1) * step},${height - padding}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg">
      <defs>
        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ea8ff" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#4ea8ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#lineGradient)" />
      <polyline
        points={points}
        fill="none"
        stroke="#4ea8ff"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {data.map((val, i) => {
        const x = padding + i * step;
        const y = height - padding - (val / max) * (height - padding * 2);
        return <circle key={i} cx={x} cy={y} r="3.5" fill="#4ea8ff" />;
      })}
    </svg>
  );
}

function BarChart({ data }) {
  const max = Math.max(...data.map((d) => d.value));

  return (
    <div className="bar-chart">
      {data.map(({ day, value }) => (
        <div key={day} className="bar-group">
          <div
            className="bar"
            style={{ height: `${(value / max) * 100}%` }}
            title={`${value} streams`}
          />
          <span className="bar-label">{day}</span>
        </div>
      ))}
    </div>
  );
}

function Dashboard() {
  const userName =
    sessionStorage.getItem("streamweaver_user") || "StreamWeaver";
  const displayName =
    userName.charAt(0).toUpperCase() + userName.slice(1);

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Welcome, {displayName}</h1>
          <p className="dashboard-subtitle">
            Here&apos;s what&apos;s happening with your streams today.
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

      <section className="stats-grid">
        {stats.map(({ label, value, change, icon, trend }) => (
          <article key={label} className="stat-card">
            <div className="stat-icon">{icon}</div>
            <div className="stat-content">
              <span className="stat-label">{label}</span>
              <span className="stat-value">{value}</span>
              <span className={`stat-change ${trend}`}>{change} vs last month</span>
            </div>
          </article>
        ))}
      </section>

      <section className="charts-grid">
        <article className="chart-card">
          <div className="chart-card-header">
            <h2>Viewer Analytics</h2>
            <span className="chart-badge">Last 12 hours</span>
          </div>
          <LineChart data={viewerData} />
          <div className="chart-footer">
            <span>Avg. concurrent viewers: <strong>72.4K</strong></span>
          </div>
        </article>

        <article className="chart-card">
          <div className="chart-card-header">
            <h2>Streams This Week</h2>
            <span className="chart-badge">Daily count</span>
          </div>
          <BarChart data={streamData} />
          <div className="chart-footer">
            <span>Total this week: <strong>1,480 streams</strong></span>
          </div>
        </article>
      </section>

      <section className="activity-section">
        <h2>Recent Activity</h2>
        <ul className="activity-list">
          <li>
            <span className="activity-dot live" />
            <span><strong>Gaming Marathon</strong> went live — 12.4K viewers</span>
            <time>2 min ago</time>
          </li>
          <li>
            <span className="activity-dot" />
            <span><strong>Tech Talk Weekly</strong> stream ended — 8.2K peak</span>
            <time>45 min ago</time>
          </li>
          <li>
            <span className="activity-dot" />
            <span><strong>Music Session</strong> uploaded to Media Library</span>
            <time>1 hr ago</time>
          </li>
        </ul>
      </section>
    </div>
  );
}

export default Dashboard;
