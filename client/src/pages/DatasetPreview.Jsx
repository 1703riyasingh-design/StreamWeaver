import { useEffect, useMemo, useState } from "react";
import { List } from "react-window";
import { useNavigate } from "react-router-dom";
import "./DatasetPreview.css";

function DatasetPreview() {
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("streamweaverDatasetPreview");
    if (saved) {
      try {
        setPreview(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to parse dataset preview:", error);
        setPreview(null);
      }
    }
  }, []);

  const columns = useMemo(() => {
    if (!preview) {
      return [];
    }

    if (preview.columns && preview.columns.length > 0) {
      return preview.columns;
    }

    const firstRow = preview.rows?.[0] ?? {};
    return Object.keys(firstRow);
  }, [preview]);

  const rows = preview?.rows ?? [];
  const fieldMapping = preview?.fieldMapping ?? {};
 

  if (!preview) {
    return (
      <div className="preview-page">
        <div className="preview-container empty-state-panel">
          <h1>Dataset Preview</h1>
          <p className="subtitle">No uploaded dataset has been loaded yet.</p>
          <button className="continue-btn" onClick={() => navigate("/upload-dataset")}>
            Upload a dataset
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="preview-page">
      <div className="preview-container">
        <h1>Dataset Preview</h1>
        <p className="subtitle">Review your uploaded dataset before processing.</p>

        <div className="dataset-info">
          <div>
            <span>Dataset Name</span>
            <strong>{preview.datasetName}</strong>
          </div>

          <div>
            <span>File Name</span>
            <strong>{preview.fileName}</strong>
          </div>

          <div>
            <span>Total Rows</span>
            <strong>{preview.rowCount.toLocaleString()}</strong>
          </div>

          <div>
            <span>Total Columns</span>
            <strong>{preview.columnCount}</strong>
          </div>
        </div>

        <div className="success-message">✓ Dataset uploaded successfully</div>

        <div className="mapping-summary-panel">
          <h3>Selected Mapping</h3>
          <ul>
            {Object.entries(fieldMapping).filter(([, value]) => value).map(([field, value]) => (
              <li key={field}>
                <strong>{field}</strong> → {value}
              </li>
            ))}
          </ul>
        </div>

        {rows.length > 0 ? (
          <>
            <div className="table-caption">
              Showing {rows.length.toLocaleString()} rows
            </div>

         <div className="table-container">
  <div
    className="virtual-table"
    style={{
      width: "100%",
      overflow: "hidden",
    }}
  >
    {/* Header */}
    <div
      className="virtual-table-header"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns.length}, minmax(150px, 1fr))`,
      }}
    >
      {columns.map((column) => (
        <div className="virtual-table-cell" key={column}>
          {column}
        </div>
      ))}
    </div>

    {/* Virtualized Rows */}
    <List
      rowCount={rows.length}
      rowHeight={48}
      rowProps={{
        rows,
        columns,
        fileName: preview.fileName,
      }}
      style={{
        height: 400,
        width: "100%",
      }}
      rowComponent={({ index, style, rows, columns, fileName }) => {
        const row = rows[index];

        return (
          <div
            className="virtual-table-row"
            style={{
              ...style,
              display: "grid",
              gridTemplateColumns: `repeat(${columns.length}, minmax(150px, 1fr))`,
            }}
          >
            {columns.map((column) => (
              <div
                className="virtual-table-cell"
                key={`${fileName}-${index}-${column}`}
              >
                {String(row[column] ?? "")}
              </div>
            ))}
          </div>
        );
      }}
    />
  </div>
</div>
          </>
        ) : (
          <div className="empty-state-panel">
            The uploaded file was received, but no tabular rows could be parsed. Please upload a CSV or JSON dataset with readable rows.
          </div>
        )}

        <div className="buttons">
          <button className="back-btn" onClick={() => navigate("/upload-dataset")}>
            Back
          </button>
          <button className="continue-btn" onClick={() => navigate("/dashboard")}>
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}

export default DatasetPreview;