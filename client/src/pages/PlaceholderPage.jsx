import "./PlaceholderPage.css";

function PlaceholderPage({ title, description, icon, metrics = [] }) {
  return (
    <div className="placeholder-page">
      <span className="placeholder-icon">{icon}</span>
      <h1>{title}</h1>
      <p>{description}</p>

      {metrics.length > 0 && (
        <div className="placeholder-metrics">
          {metrics.map((item) => (
            <div key={item.label} className="placeholder-metric-card">
              <span className="metric-label">{item.label}</span>
              <strong className="metric-value">{item.value}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PlaceholderPage;
