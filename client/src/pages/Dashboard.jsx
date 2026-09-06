import { useEffect, useState } from "react";
import "./Dashboard.css";

// const stats = [
//   { label: "Total Streams", value: "2,847", change: "+12.5%", icon: "📹", trend: "up" },
//   { label: "Active Users", value: "18,432", change: "+8.2%", icon: "👥", trend: "up" },
//   { label: "Live Streams", value: "156", change: "+23.1%", icon: "🔴", trend: "up" },
// ];

// const viewerData = [40, 65, 45, 80, 55, 90, 70, 95, 60, 85, 75, 100];
// const streamData = [
//   { day: "Mon", value: 120 },
//   { day: "Tue", value: 180 },
//   { day: "Wed", value: 150 },
//   { day: "Thu", value: 220 },
//   { day: "Fri", value: 190 },
//   { day: "Sat", value: 280 },
//   { day: "Sun", value: 240 },
// ];

// function LineChart({ data }) {
//   const width = 480;
//   const height = 160;
//   const padding = 20;
//   const max = Math.max(...data);
//   const step = (width - padding * 2) / (data.length - 1);

//   const points = data
//     .map((val, i) => {
//       const x = padding + i * step;
//       const y = height - padding - (val / max) * (height - padding * 2);
//       return `${x},${y}`;
//     })
//     .join(" ");

//   const areaPoints = `${padding},${height - padding} ${points} ${padding + (data.length - 1) * step},${height - padding}`;

//   return (
//     <svg viewBox={`0 0 ${width} ${height}`} className="chart-svg">
//       <defs>
//         <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
//           <stop offset="0%" stopColor="#4ea8ff" stopOpacity="0.4" />
//           <stop offset="100%" stopColor="#4ea8ff" stopOpacity="0" />
//         </linearGradient>
//       </defs>
//       <polygon points={areaPoints} fill="url(#lineGradient)" />
//       <polyline
//         points={points}
//         fill="none"
//         stroke="#4ea8ff"
//         strokeWidth="2.5"
//         strokeLinejoin="round"
//         strokeLinecap="round"
//       />
//       {data.map((val, i) => {
//         const x = padding + i * step;
//         const y = height - padding - (val / max) * (height - padding * 2);
//         return <circle key={i} cx={x} cy={y} r="3.5" fill="#4ea8ff" />;
//       })}
//     </svg>
//   );
// }

function LineChart({ data }) {

  const width = 480;
  const height = 160;
  const padding = 20;

  const values = data.map(
    (item) => item.value
  );

  const max = Math.max(
    ...values,
    1
  );

  const step =
    data.length > 1
      ? (width - padding * 2) /
        (data.length - 1)
      : width - padding * 2;

  const points = data
    .map((item, index) => {

      const x =
        data.length === 1
          ? width / 2
          : padding + index * step;

      const y =
        height -
        padding -
        (item.value / max) *
          (height - padding * 2);

      return `${x},${y}`;

    })
    .join(" ");

  return (

    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="chart-svg"
    >

      <defs>

        <linearGradient
          id="lineGradient"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >

          <stop
            offset="0%"
            stopColor="#4ea8ff"
            stopOpacity="0.4"
          />

          <stop
            offset="100%"
            stopColor="#4ea8ff"
            stopOpacity="0"
          />

        </linearGradient>

      </defs>

      {data.length > 1 && (

        <polyline
          points={points}
          fill="none"
          stroke="#4ea8ff"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

      )}

      {data.map((item, index) => {

        const x =
          data.length === 1
            ? width / 2
            : padding + index * step;

        const y =
          height -
          padding -
          (item.value / max) *
            (height - padding * 2);

        return (

          <circle
            key={item._id || index}
            cx={x}
            cy={y}
            r="4"
            fill="#4ea8ff"
          />

        );

      })}

    </svg>

  );
}

function BarChart({ data }) {
  const max = Math.max(
  ...data.map((d) => d.value),
  1
);

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
  
  const [stats, setStats] = useState({
  totalDatasets: 0,
  totalRows: 0,
  validRows: 0,
  invalidRows: 0,
});

const [latestDatasets, setLatestDatasets] = useState([]);

const [loading, setLoading] = useState(true);
  const userName =
    sessionStorage.getItem("streamweaver_user") || "StreamWeaver";
  const displayName =
    userName.charAt(0).toUpperCase() + userName.slice(1);

    useEffect(() => {

  const fetchDashboardStats = async () => {
    try {

      const response = await fetch(
        "http://localhost:5000/api/datasets/dashboard/stats"
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to fetch dashboard statistics"
        );
      }

      setStats(result.stats);

    } catch (error) {

      console.error(
        "Dashboard stats error:",
        error
      );

    } finally {

      setLoading(false);

    }
  };



  const fetchLatestDatasets = async () => {

  try {

    const response = await fetch(
      "http://localhost:5000/api/datasets"
    );

    const result =
      await response.json();

    if (!response.ok) {

      throw new Error(
        result.message ||
        "Failed to fetch latest datasets"
      );

    }

    setLatestDatasets(
      (result.datasets || []).slice(0, 5)
    );

  } catch (error) {

    console.error(
      "Latest datasets error:",
      error
    );

  }

};
  fetchDashboardStats();

fetchLatestDatasets();

}, []);
const validationData = [
  {
    label: "Valid Rows",
    value: stats.validRows,
  },
  {
    label: "Invalid Rows",
    value: stats.invalidRows,
  },
];
const datasetChartData =
  latestDatasets.map(
    (dataset) => ({
      _id: dataset._id,

      label:
        dataset.datasetName,

      value:
        dataset.totalRows || 0,
    })
  );
  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Welcome, {displayName}</h1>
          <p className="dashboard-subtitle">
            Here's an overview of your datasets and data processing activity.
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

  {loading ? (

    <p>Loading dashboard statistics...</p>

  ) : (

    <>
      <article className="stat-card">

        <div className="stat-icon">
          📁
        </div>

        <div className="stat-content">

          <span className="stat-label">
            Total Datasets
          </span>

          <span className="stat-value">
            {stats.totalDatasets}
          </span>

        </div>

      </article>


      <article className="stat-card">

        <div className="stat-icon">
          📄
        </div>

        <div className="stat-content">

          <span className="stat-label">
            Total Rows
          </span>

          <span className="stat-value">
            {stats.totalRows}
          </span>

        </div>

      </article>


      <article className="stat-card">

        <div className="stat-icon">
          ✅
        </div>

        <div className="stat-content">

          <span className="stat-label">
            Valid Rows
          </span>

          <span className="stat-value">
            {stats.validRows}
          </span>

        </div>

      </article>


      <article className="stat-card">

        <div className="stat-icon">
          ❌
        </div>

        <div className="stat-content">

          <span className="stat-label">
            Invalid Rows
          </span>

          <span className="stat-value">
            {stats.invalidRows}
          </span>

        </div>

      </article>
    </>

  )}

</section>

<section className="charts-grid">

  {/* Validation Chart */}

  <article className="chart-card">

    <div className="chart-card-header">

      <h2>
        Validation Analytics
      </h2>

      <span className="chart-badge">
        Dataset Rows
      </span>

    </div>

    <BarChart
      data={validationData.map(
        (item) => ({
          day: item.label,
          value: item.value,
        })
      )}
    />

    <div className="chart-footer">

      <span>

        Total processed rows:

        <strong>
          {" "}
          {stats.totalRows}
        </strong>

      </span>

    </div>

  </article>


  {/* Dataset Rows Chart */}

  <article className="chart-card">

    <div className="chart-card-header">

      <h2>
        Dataset Overview
      </h2>

      <span className="chart-badge">
        Latest Datasets
      </span>

    </div>


    {datasetChartData.length === 0 ? (

      <p>
        No dataset data available.
      </p>

    ) : (

      <LineChart
        data={datasetChartData}
      />

    )}


    <div className="chart-footer">

      <span>

        Showing rows from the latest
        <strong>
          {" "}
          {datasetChartData.length}
        </strong>
        {" "}datasets

      </span>

    </div>

  </article>

</section>

     {/* Latest Datasets */}

<section className="activity-section">

  <h2>
    Latest Datasets
  </h2>


  {latestDatasets.length === 0 ? (

    <p>
      No datasets uploaded yet.
    </p>

  ) : (

    <ul className="activity-list">

      {latestDatasets.map(
        (dataset) => (

          <li
            key={dataset._id}
          >

            <span
              className="activity-dot live"
            />

            <span>

              <strong>
                {dataset.datasetName}
              </strong>

              {" "}— {dataset.totalRows} rows

            </span>

            <time>

              {new Date(
                dataset.createdAt
              ).toLocaleDateString()}

            </time>

          </li>

        )
      )}

    </ul>

  )}

</section>


{/* Dashboard Overview */}

<section className="activity-section">

  <h2>
    Dashboard Overview
  </h2>

  <ul className="activity-list">

    <li>

      <span className="activity-dot live" />

      <span>
        <strong>
          {stats.totalDatasets}
        </strong>
        {" "} datasets available in the system
      </span>

    </li>


    <li>

      <span className="activity-dot" />

      <span>
        <strong>
          {stats.totalRows}
        </strong>
        {" "} total rows processed
      </span>

    </li>


    <li>

      <span className="activity-dot" />

      <span>
        <strong>
          {stats.invalidRows}
        </strong>
        {" "} rows require validation or correction
      </span>

    </li>

  </ul>

</section>
    </div>
  );
}

export default Dashboard;
