import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import socket from "../socket";
import "./UploadDataset.css";

function buildDefaultMapping(columns = []) {
  return columns.reduce((mapping, column) => {
    const cleanColumn = String(column).trim();
    if (cleanColumn) {
      mapping[cleanColumn] = cleanColumn;
    }
    return mapping;
  }, {});
}

function ColumnMappingPanel({ datasetColumns, fieldMapping, onMappingChange }) {
  return (
    <div className="mapping-panel">
      <div className="mapping-header">
        <h3>Column Mapping</h3>
        <span>Map source columns to destination fields</span>
      </div>

      <div className="mapping-grid">
        {datasetColumns.map((sourceColumn) => (
          <div className="mapping-field" key={sourceColumn}>
            <label>{sourceColumn}</label>
            <span className="mapping-arrow">→</span>
            <select
              value={fieldMapping[sourceColumn] ?? sourceColumn}
              onChange={(event) =>
                onMappingChange(sourceColumn, event.target.value)
              }
            >
              <option value={sourceColumn}>{sourceColumn}</option>
              <option value="id">id</option>
              <option value="name">name</option>
              <option value="email">email</option>
              <option value="age">age</option>
              {datasetColumns
                .filter((column) => column !== sourceColumn)
                .map((column) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
            </select>
          </div>
        ))}
      </div>

      <div className="mapping-summary">
        <h4>Selected Mapping</h4>
        <ul>
          {datasetColumns.map((sourceColumn) => (
            <li key={sourceColumn}>
              <strong>{sourceColumn}</strong>
              {" → "}
              {fieldMapping[sourceColumn] || "Not selected"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function UploadDataset() {
  const [datasetName, setDatasetName] = useState("");
  const [file, setFile] = useState(null);
  const [columns, setColumns] = useState([]);
  const [mapping, setMapping] = useState({});
  const [mappingConfirmed, setMappingConfirmed] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [transformCode, setTransformCode] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    progress: 0,
    message: "",
  });
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  // ==========================================
  // Determine current step
  // ==========================================
  const currentStep = (() => {
    if (isUploading) return 4;
    if (mappingConfirmed) return 3;
    if (columns.length > 0) return 2;
    return 1;
  })();

  // ==========================================
  // SOCKET PROGRESS
  // ==========================================
  useEffect(() => {
    const handleProgress = (data) => {
      setUploadProgress({
        progress: data.progress || 0,
        message: data.message || "Processing dataset...",
      });
      localStorage.setItem(
        "streamweaverProcessingProgress",
        JSON.stringify({
          progress: data.progress || 0,
          message: data.message || "Processing dataset...",
          datasetName: datasetName || "Unnamed Dataset",
          fileName: file?.name || "",
          updatedAt: Date.now(),
        })
      );
    };

    socket.on("upload-progress", handleProgress);

    return () => {
      socket.off("upload-progress", handleProgress);
    };
  }, [datasetName, file]);

  // ==========================================
  // MAPPING CHANGE
  // ==========================================
  const handleMappingChange = (sourceColumn, targetField) => {
    setMapping((current) => ({
      ...current,
      [sourceColumn]: targetField,
    }));
    setMappingConfirmed(false);
  };

  // ==========================================
  // FILE CHANGE
  // ==========================================
  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) return;

    setErrorMessage("");
    setColumns([]);
    setMapping({});
    setMappingConfirmed(false);
    setShowSuccessModal(false);
    setUploadProgress({ progress: 0, message: "" });

    const fileName = selectedFile.name.toLowerCase();

    if (
      !fileName.endsWith(".csv") &&
      !fileName.endsWith(".json") &&
      !fileName.endsWith(".xlsx")
    ) {
      setErrorMessage("Only CSV, JSON and XLSX files are supported.");
      setFile(null);
      return;
    }

    try {
      let extractedColumns = [];

      // CSV
      if (fileName.endsWith(".csv")) {
        const text = await selectedFile.text();
        const firstLine = text.split(/\r?\n/)[0];

        if (!firstLine) {
          throw new Error("CSV file is empty or invalid.");
        }

        extractedColumns = firstLine
          .split(",")
          .map((column) => column.trim())
          .filter(Boolean);
      }

      // JSON
      else if (fileName.endsWith(".json")) {
        const text = await selectedFile.text();
        const jsonData = JSON.parse(text);

        let rows = [];

        if (Array.isArray(jsonData)) {
          rows = jsonData;
        } else if (jsonData && typeof jsonData === "object") {
          const nestedArray = Object.values(jsonData).find((value) =>
            Array.isArray(value)
          );
          rows = nestedArray || [jsonData];
        }

        if (rows.length === 0) {
          throw new Error(
            "JSON file is empty or does not contain data."
          );
        }

        extractedColumns = [
          ...new Set(
            rows.flatMap((row) =>
              row && typeof row === "object" && !Array.isArray(row)
                ? Object.keys(row)
                : []
            )
          ),
        ];
      }

      // XLSX
      else if (fileName.endsWith(".xlsx")) {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];

        if (!firstSheetName) {
          throw new Error("XLSX file does not contain any sheet.");
        }

        const worksheet = workbook.Sheets[firstSheetName];
        const rows = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
        });

        if (!rows.length || !rows[0].length) {
          throw new Error("XLSX file is empty or invalid.");
        }

        extractedColumns = rows[0]
          .map((column) => String(column).trim())
          .filter(Boolean);
      }

      if (extractedColumns.length === 0) {
        throw new Error("No columns found in the selected file.");
      }

      setFile(selectedFile);
      setColumns(extractedColumns);
      setMapping(buildDefaultMapping(extractedColumns));
    } catch (error) {
      console.error("File read error:", error);
      setFile(null);
      setColumns([]);
      setMapping({});
      setMappingConfirmed(false);
      setErrorMessage(
        error.message || "Failed to read the selected file."
      );
    }
  };

  // ==========================================
  // UPLOAD
  // ==========================================
  const handleUpload = async () => {
    setErrorMessage("");

    if (!mappingConfirmed) {
      setErrorMessage(
        "Please confirm the column mapping before processing."
      );
      return;
    }

    if (!datasetName.trim()) {
      setErrorMessage("Please enter a dataset name.");
      return;
    }

    if (!file) {
      setErrorMessage("Please select a CSV, JSON or XLSX file.");
      return;
    }

    if (columns.length === 0) {
      setErrorMessage("No columns found in the selected file.");
      return;
    }

    const mappingEntries = Object.entries(mapping).filter(
      ([sourceColumn, targetField]) =>
        String(sourceColumn).trim() && String(targetField).trim()
    );

    if (mappingEntries.length === 0) {
      setErrorMessage("Please map at least one column.");
      return;
    }

    const targetFields = mappingEntries.map(([, targetField]) =>
      String(targetField).trim()
    );

    const uniqueTargetFields = [...new Set(targetFields)];

    if (uniqueTargetFields.length !== targetFields.length) {
      setErrorMessage("Duplicate destination fields are not allowed.");
      return;
    }

    if (!socket.connected) {
      socket.connect();
    }

    setUploadProgress({
      progress: 0,
      message: "Starting upload...",
    });
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("datasetName", datasetName.trim());
      formData.append("transformCode", transformCode);
      formData.append("socketId", socket.id);

      const backendMapping = {};
      Object.entries(mapping).forEach(([sourceColumn, targetField]) => {
        const cleanSource = String(sourceColumn).trim();
        const cleanTarget = String(targetField).trim();
        if (cleanSource && cleanTarget) {
          backendMapping[cleanSource] = cleanTarget;
        }
      });

      formData.append("mapping", JSON.stringify(backendMapping));

      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Upload failed");
      }

      const dataset = result.dataset;

      localStorage.setItem(
        "streamweaverDatasetPreview",
        JSON.stringify({
          datasetId: dataset.datasetId,
          datasetName: dataset.datasetName,
          fileName: dataset.originalFileName,
          rowCount: dataset.totalRows,
          columnCount: dataset.columns.length,
          columns: dataset.columns,
          fieldMapping: dataset.mapping,
          rows: dataset.preview.map((item) => ({
            ...item.data,
            _isValid: item.isValid,
            _errors: item.errors,
          })),
        })
      );

      setShowSuccessModal(true);
    } catch (error) {
      console.error("Upload Error:", error);
      setErrorMessage(
        error.message || "Upload failed. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  // ==========================================
  // RESET
  // ==========================================
  const handleUploadAnother = () => {
    setShowSuccessModal(false);
    setDatasetName("");
    setFile(null);
    setColumns([]);
    setMapping({});
    setMappingConfirmed(false);
    setTransformCode("");
    setUploadProgress({ progress: 0, message: "" });
    setErrorMessage("");

    const fileInput = document.getElementById("dataset-file");
    if (fileInput) fileInput.value = "";
  };

  // ==========================================
  // UI
  // ==========================================
  return (
    <div className="upload-page">
      <div className="upload-shell">
        {/* HEADER */}
        <div className="upload-header">
          <div className="upload-title-wrap">
            <div className="upload-icon">📦</div>
            <h1>Upload Dataset</h1>
          </div>
          <span className="upload-status">
            {isUploading ? "Processing" : "Ready"}
          </span>
        </div>

        <div className="upload-body">
          {/* STEPPER */}
          <div className="upload-steps">
            <div className={`upload-step ${currentStep >= 1 ? "active" : ""}`}>
              <span>1</span>
              <label>Upload</label>
            </div>
            <div className="step-line" />
            <div className={`upload-step ${currentStep >= 2 ? "active" : ""}`}>
              <span>2</span>
              <label>Map Columns</label>
            </div>
            <div className="step-line" />
            <div className={`upload-step ${currentStep >= 3 ? "active" : ""}`}>
              <span>3</span>
              <label>Confirm</label>
            </div>
            <div className="step-line" />
            <div className={`upload-step ${currentStep >= 4 ? "active" : ""}`}>
              <span>4</span>
              <label>Process</label>
            </div>
          </div>

          {/* DESCRIPTION */}
          <p className="upload-description">
            Upload your CSV, JSON or XLSX dataset, map columns, and process
            the data.
          </p>

          {/* NAME + FILE */}
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

          {/* FILE INFO */}
          <div className="upload-meta">
            {file && (
              <span className="file-chip">Selected: {file.name}</span>
            )}
            <span className="file-format">CSV, JSON, XLSX</span>
          </div>

          {/* ERROR */}
          {errorMessage && (
            <div className="upload-error" role="alert">
              {errorMessage}
            </div>
          )}

          {/* COLUMN MAPPING */}
          {columns.length > 0 && (
            <ColumnMappingPanel
              datasetColumns={columns}
              fieldMapping={mapping}
              onMappingChange={handleMappingChange}
            />
          )}

          {/* CONFIRM MAPPING */}
          {columns.length > 0 && (
            <div className="mapping-confirm">
              <button
                type="button"
                className="confirm-mapping-button"
                onClick={() => {
                  setErrorMessage("");
                  setMappingConfirmed(true);
                }}
                disabled={isUploading}
              >
                {mappingConfirmed
                  ? "✓ Mapping Confirmed"
                  : "Confirm Mapping"}
              </button>

              {mappingConfirmed && (
                <span className="mapping-confirmed-text">
                  Mapping is ready for processing.
                </span>
              )}
            </div>
          )}

          {/* TRANSFORMATION */}
          {columns.length > 0 && (
            <div className="transform-section">
              <h3>Custom Transformation</h3>
              <p>Write JavaScript code to transform each row.</p>
              <textarea
                className="transform-code-input"
                value={transformCode}
                onChange={(event) => setTransformCode(event.target.value)}
                placeholder={`Example:

return {
  ...row,
  name: row.name
    ? row.name.toUpperCase()
    : ""
};`}
                rows={10}
              />
            </div>
          )}

          {/* PROGRESS */}
          {isUploading && (
            <div className="upload-progress">
              <div className="progress-info">
                <span>
                  {uploadProgress.message || "Processing dataset..."}
                </span>
                <strong>{uploadProgress.progress}%</strong>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${uploadProgress.progress}%` }}
                />
              </div>
              <span className="progress-text">
                Uploading and processing data...
              </span>
            </div>
          )}

          {/* ACTION */}
          <div className="upload-actions">
            <button
              type="button"
              className="upload-button"
              onClick={handleUpload}
              disabled={isUploading || !mappingConfirmed}
            >
              {isUploading
                ? "Processing..."
                : mappingConfirmed
                  ? "Process Dataset"
                  : "Confirm Mapping First"}
            </button>
          </div>
        </div>
      </div>

      {/* SUCCESS MODAL */}
      {showSuccessModal && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <div className="success-icon">✓</div>
            <h2>Dataset Processed Successfully</h2>
            <p>
              Your dataset has been uploaded and processed successfully.
            </p>
            <div className="success-actions">
              <button
                type="button"
                onClick={() => navigate("/dataset-preview")}
              >
                View Dataset
              </button>
              <button type="button" onClick={handleUploadAnother}>
                Upload Another Dataset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadDataset;