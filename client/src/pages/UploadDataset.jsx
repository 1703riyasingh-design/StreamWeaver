import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import "./UploadDataset.css";

const REQUIRED_FIELDS = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "email", label: "Email" },
  { key: "city", label: "City" },
];

function normalizeColumnName(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function buildDefaultMapping(columns = []) {
  const normalizedColumns = columns.map((column) => String(column).trim());

  return REQUIRED_FIELDS.reduce((mapping, field) => {
    const match = normalizedColumns.find(
      (column) =>
        column.toLowerCase() === field.label.toLowerCase() ||
        column.toLowerCase().includes(field.label.toLowerCase())
    );

    mapping[field.key] = match ?? "";
    return mapping;
  }, {});
}

function parseCsvRows(text) {
  const rows = [];
  let current = "";
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(current);
      current = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i += 1;
      }
      row.push(current);
      if (row.some((value) => value.trim() !== "")) {
        rows.push(row);
      }
      row = [];
      current = "";
      continue;
    }

    current += char;
  }

  if (current.length > 0 || row.length > 0) {
    row.push(current);
    if (row.some((value) => value.trim() !== "")) {
      rows.push(row);
    }
  }

  if (rows.length < 2) {
    return [];
  }

  const [headers, ...body] = rows;
  return body
    .filter((values) => values.some((value) => value.trim() !== ""))
    .map((values) => {
      const record = {};
      headers.forEach((header, index) => {
        record[header.trim()] = (values[index] ?? "").trim();
      });
      return record;
    });
}

function ColumnMappingPanel({ csvColumns, fieldMapping, onMappingChange }) {
  return (
    <div className="mapping-panel">
      <div className="mapping-header">
        <h3>Column Mapping</h3>
        <span>Required fields</span>
      </div>

      <div className="mapping-grid">
        {REQUIRED_FIELDS.map((field) => (
          <div className="mapping-field" key={field.key}>
            <label htmlFor={`mapping-${field.key}`}>{field.label}</label>
            <select
              id={`mapping-${field.key}`}
              value={fieldMapping[field.key] ?? ""}
              onChange={(event) => onMappingChange(field.key, event.target.value)}
            >
              <option value="">Select CSV column</option>
              {csvColumns.map((column) => (
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
          {REQUIRED_FIELDS.filter(
            (field) => fieldMapping[field.key] && fieldMapping[field.key] !== ""
          ).map((field) => (
            <li key={field.key}>
              <strong>{field.label}</strong> → {fieldMapping[field.key]}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function UploadDataset() {
  const [datasetData, setDatasetData] = useState({
    datasetName: "",
    file: null,
    columnMapping: {},
  });
  const [csvColumns, setCsvColumns] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const { datasetName, file, columnMapping } = datasetData;

  const handleMappingChange = (fieldKey, selectedColumn) => {
    setDatasetData((current) => ({
      ...current,
      columnMapping: {
        ...current.columnMapping,
        [fieldKey]: selectedColumn,
      },
    }));
  };

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    if (!selectedFile) {
      return;
    }

    setErrorMessage("");
    setDatasetData((current) => ({
      ...current,
      file: selectedFile,
    }));

    try {
      const lowerName = selectedFile.name.toLowerCase();
      let rows = [];

      if (lowerName.endsWith(".json")) {
        const fileText = await selectedFile.text();
        const jsonData = JSON.parse(fileText);
        if (Array.isArray(jsonData)) {
          rows = jsonData;
        } else if (jsonData && typeof jsonData === "object") {
          const nestedArray = Object.values(jsonData).find(Array.isArray);
          rows = nestedArray ?? [jsonData];
        }
      } else if (lowerName.endsWith(".csv")) {
        const fileText = await selectedFile.text();
        rows = parseCsvRows(fileText);
      } else if (lowerName.endsWith(".xlsx")) {
        const arrayBuffer = await selectedFile.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      }

      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

      if (!columns.length) {
        setCsvColumns([]);
        setDatasetData((current) => ({
          ...current,
          columnMapping: {},
        }));
        setErrorMessage("The CSV is empty or invalid. Please upload a file that contains headers and rows.");
        return;
      }

      setCsvColumns(columns);
      setDatasetData((current) => ({
        ...current,
        columnMapping: {},
      }));
    } catch (error) {
      console.error("Failed to read file columns:", error);
      setCsvColumns([]);
      setDatasetData((current) => ({
        ...current,
        columnMapping: {},
      }));
      setErrorMessage("The CSV file is invalid. Please upload a valid CSV, JSON, or XLSX file and try again.");
    }
  };

  const handleUpload = async () => {
    setErrorMessage("");

    if (!datasetName.trim()) {
      setErrorMessage("Please enter a dataset name before uploading.");
      return;
    }

    if (!file) {
      setErrorMessage("Please select a dataset file first.");
      return;
    }

    if (!csvColumns.length) {
      setErrorMessage("The CSV is empty or invalid. Please upload a file with rows and headers.");
      return;
    }

    const missingMappings = REQUIRED_FIELDS.filter(
      (field) => !columnMapping[field.key] || columnMapping[field.key] === ""
    ).map((field) => field.label);

    if (missingMappings.length > 0) {
      setErrorMessage(
        `Mapping is incomplete. Please map the required fields before uploading: ${missingMappings.join(", ")}.`
      );
      return;
    }

    setIsUploading(true);

    try {
      const lowerName = file.name.toLowerCase();
      let rows = [];
      let columns = [];

      if (lowerName.endsWith(".json")) {
        const fileText = await file.text();
        const jsonData = JSON.parse(fileText);
        if (Array.isArray(jsonData)) {
          rows = jsonData;
        } else if (jsonData && typeof jsonData === "object") {
          const nestedArray = Object.values(jsonData).find(Array.isArray);
          rows = nestedArray ?? [jsonData];
        }
      } else if (lowerName.endsWith(".csv")) {
        const fileText = await file.text();
        rows = parseCsvRows(fileText);
      } else if (lowerName.endsWith(".xlsx")) {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheetName];
        rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      }

      if (rows.length === 0) {
        throw new Error("CSV is empty");
      }

      columns = Object.keys(rows[0]);

      const payload = {
        datasetName: datasetName.trim(),
        fileName: file.name,
        rowCount: rows.length,
        columnCount: columns.length,
        columns,
        rows,
        fieldMapping: columnMapping,
        uploadedAt: new Date().toISOString(),
      };

      const formData = new FormData();
      formData.append("csvFile", file);
      formData.append("datasetName", datasetName.trim());
      formData.append("columnMapping", JSON.stringify(columnMapping));

      const response = await fetch("http://localhost:5000/api/upload-dataset", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const backendMessage = await response.text();
        throw new Error(backendMessage || "Backend/API upload failed");
      }

      localStorage.setItem("streamweaverDatasetPreview", JSON.stringify(payload));
      navigate("/dataset-preview");
    } catch (error) {
      console.error("Dataset upload failed:", error);

      if (error.message === "CSV is empty") {
        setErrorMessage("The CSV file is empty. Please upload a file with data before trying again.");
      } else if (error.message.includes("Backend") || error.message.includes("API") || error.message.includes("failed")) {
        setErrorMessage("The backend/API request failed. Please check the server and try again.");
      } else {
        setErrorMessage("Upload failed. Please check your file and try again.");
      }
    } finally {
      setIsUploading(false);
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
                onChange={(event) =>
                  setDatasetData((current) => ({
                    ...current,
                    datasetName: event.target.value,
                  }))
                }
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

          {errorMessage && (
            <div className="upload-error" role="alert">
              {errorMessage}
            </div>
          )}

          {csvColumns.length > 0 && (
            <ColumnMappingPanel
              csvColumns={csvColumns}
              fieldMapping={columnMapping}
              onMappingChange={handleMappingChange}
            />
          )}

          {isUploading && (
            <div className="upload-progress">
              <span className="spinner" aria-hidden="true" />
              <span>Uploading...</span>
            </div>
          )}

          <div className="upload-actions">
            <button
              type="button"
              className="upload-button"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? "Processing..." : "Upload Dataset"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UploadDataset;