import "./PlaceholderPage.css";

function PlaceholderPage({ title, description, icon }) {
  return (
    <div className="placeholder-page">
      <span className="placeholder-icon">{icon}</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}

export default PlaceholderPage;
