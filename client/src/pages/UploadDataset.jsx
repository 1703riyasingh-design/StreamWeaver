import { useState } from "react";
import "./UploadDataset.css";

function UploadDataset() {
  const [datasetName, setDatasetName] = useState("");
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

const handleUpload = async () => {
  if (!datasetName.trim()) {
    alert("Please enter a dataset name before uploading.");
    return;
  }

  if (!file) {
    alert("Please select a dataset file first.");
    return;
  }

  try {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("datasetName", datasetName);

    const response = await fetch("http://localhost:5000/api/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Upload failed");
    }

    console.log("Backend Response:", result);

    alert(
      `Dataset "${datasetName}" uploaded successfully!\nTotal Rows: ${result.totalRows}`
    );
  } catch (error) {
    console.error("Upload Error:", error);
    alert(`Upload failed: ${error.message}`);
  }
};

  return (
    <div className="upload-page">
      <div className="upload-shell">
        <div className="upload-header">
          <div className="upload-title-wrap">
            <div className="upload-icon">📦</div>
            <h1>Upload Dataset</h1>
          </div>
          <span className="upload-status">Ready</span>
        </div>

        <div className="upload-body">
          <p className="upload-description">
            Upload your dataset to start processing and preview the data.
          </p>

          <div className="upload-grid">
            <div className="upload-field">
              <label htmlFor="dataset-name">Dataset Name</label>
              <input
                id="dataset-name"
                className="upload-input"
                type="text"
                placeholder="Enter dataset name"
                value={datasetName}
                onChange={(event) => setDatasetName(event.target.value)}
              />
            </div>

            <div className="upload-field">
              <label htmlFor="dataset-file">Choose Dataset</label>
              <div className="upload-file-wrap">
                <input
                  id="dataset-file"
                  className="upload-file-input"
                  type="file"
                  accept=".csv,.json,.xlsx"
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>

          <div className="upload-meta">
            {file && <span className="file-chip">Selected: {file.name}</span>}
            <span className="file-format">CSV, JSON, XLSX</span>
          </div>

          <div className="upload-actions">
            <button type="button" className="upload-button" onClick={handleUpload}>
              Upload Dataset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadDataset;