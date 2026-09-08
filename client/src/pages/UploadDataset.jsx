import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import socket from "../socket";
import "./UploadDataset.css";

const REQUIRED_FIELDS = [
  { key: "id", label: "ID" },
  { key: "name", label: "Name" },
  { key: "city", label: "City" },
  { key: "email", label: "Email" },
];

function normalizeColumnName(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function buildDefaultMapping(columns = []) {
  const normalizedColumns = columns.map((column) =>
    String(column).trim()
  );

  return REQUIRED_FIELDS.reduce((mapping, field) => {
    const keywords = {
  id: [
    "id",
    "userid",
    "user_id",
  ],
      name: ["name", "full name", "fullname"],
      city: ["city", "location"],
      email: ["email"],
    }[field.key] || [field.label];

    const match = normalizedColumns.find((column) => {
      const normalizedColumn = normalizeColumnName(column);

      return keywords.some(
        (keyword) =>
          normalizedColumn === normalizeColumnName(keyword) ||
          normalizedColumn.includes(normalizeColumnName(keyword))
      );
    });

    mapping[field.key] = match || "";

    return mapping;
  }, {});
}

function getLoggedInAccount() {
  const sessionUserId =
    sessionStorage.getItem("streamweaver_user_id") || "";
  const sessionUser =
    sessionStorage.getItem("streamweaver_user") || "";

  try {
    const users = JSON.parse(
      localStorage.getItem("users") || "[]"
    );

    return (Array.isArray(users) ? users : []).find((user) => {
      const emailName = String(user.email || "").split("@")[0];

      return (
        String(user.userId || user.id || "") === sessionUserId ||
        emailName.toLowerCase() === sessionUser.toLowerCase()
      );
    }) || {};
  } catch (error) {
    console.error("Failed to read logged-in account:", error);
    return {};
  }
}

function ColumnMappingPanel({
  datasetColumns,
  fieldMapping,
  onMappingChange,
}) {
  const account = getLoggedInAccount();
  const accountValues = {
    id:
      account.userId ||
      sessionStorage.getItem("streamweaver_user_id") ||
      "Logged-in user ID",
    name: account.name || "Logged-in user name",
    city: account.city || "Logged-in user city",
    email: account.email || "Logged-in user email",
  };

  const mappedIdColumn =
    fieldMapping.id ||
    datasetColumns.find((column) =>
      normalizeColumnName(column).includes("id")
    ) ||
    "";

  return (
    <div className="mapping-panel">
      <div className="mapping-header">
        <h3>Column Mapping</h3>
        <span>Map your dataset columns</span>
      </div>

      <div className="mapping-grid">
        {REQUIRED_FIELDS.map((field) => (
          <div
            className="mapping-field"
            key={field.key}
          >
            <label htmlFor={`mapping-${field.key}`}>
              {field.label}
            </label>

            <select
              id={`mapping-${field.key}`}
              value={fieldMapping[field.key] || ""}
              onChange={(event) =>
                onMappingChange(
                  field.key,
                  event.target.value
                )
              }
            >
              <option value="">
                Select dataset column
              </option>

              {(field.key === "id" ? [mappedIdColumn] : datasetColumns)
                .filter(Boolean)
                .map((column) => (
                  <option
                    key={column}
                    value={column}
                  >
                    {accountValues[field.key]}
                  </option>
                ))}
            </select>
          </div>
        ))}
      </div>

      <div className="mapping-summary">
        <h4>Selected Mapping</h4>

        <ul>
          {REQUIRED_FIELDS.map((field) => (
            <li key={field.key}>
              <strong>{field.label}</strong>

              {" → "}

              {fieldMapping[field.key] ||
                "Not selected"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function UploadDataset() {
  const [datasetName, setDatasetName] =
    useState("");

  const [file, setFile] =
    useState(null);

  const [columns, setColumns] =
    useState([]);

  const [mapping, setMapping] =
    useState({});

  const [transformCode, setTransformCode] =
  useState("");

  const [isUploading, setIsUploading] =
    useState(false);

  const [uploadProgress, setUploadProgress] =
  useState({
    progress: 0,
    message: "",
  });



  const [errorMessage, setErrorMessage] =
    useState("");

 

  const navigate = useNavigate();

 useEffect(() => {
  const handleProgress = (data) => {
    console.log(
      "Upload progress received:",
      data
    );

    setUploadProgress({
      progress: data.progress || 0,
      message:
        data.message ||
        "Processing dataset...",
    });
  };

  socket.on(
    "upload-progress",
    handleProgress
  );

  return () => {
    socket.off(
      "upload-progress",
      handleProgress
    );
  };
}, []);

  const handleMappingChange = (
    fieldKey,
    selectedColumn
  ) => {
    setMapping((current) => ({
      ...current,
      [fieldKey]: selectedColumn,
    }));
  };

  const handleFileChange = async (event) => {
    const selectedFile =
      event.target.files[0];

    if (!selectedFile) {
      return;
    }

    setErrorMessage("");
    setColumns([]);
    setMapping({});

    const fileName =
      selectedFile.name.toLowerCase();

    if (
      !fileName.endsWith(".csv") &&
      !fileName.endsWith(".json") &&
      !fileName.endsWith(".xlsx")
    ) {
      setErrorMessage(
        "Only CSV, JSON and XLSX files are supported."
      );

      setFile(null);

      return;
    }

    try {
      let extractedColumns = [];

      // =========================
      // CSV COLUMN EXTRACTION
      // =========================
      if (fileName.endsWith(".csv")) {
        const text =
          await selectedFile.text();

        const firstLine =
          text.split(/\r?\n/)[0];

        if (!firstLine) {
          throw new Error(
            "CSV file is empty or invalid."
          );
        }

        extractedColumns =
          firstLine
            .split(",")
            .map((column) =>
              column.trim()
            )
            .filter(Boolean);
      }

      // =========================
      // JSON COLUMN EXTRACTION
      // =========================
      else if (fileName.endsWith(".json")) {
        const text =
          await selectedFile.text();

        const jsonData =
          JSON.parse(text);

        let rows = [];

        if (Array.isArray(jsonData)) {
          rows = jsonData;
        } else if (
          jsonData &&
          typeof jsonData === "object"
        ) {
          const nestedArray =
            Object.values(jsonData).find(
              (value) =>
                Array.isArray(value)
            );

          rows =
            nestedArray ||
            [jsonData];
        }

        if (rows.length === 0) {
          throw new Error(
            "JSON file is empty or does not contain data."
          );
        }

        extractedColumns = [
          ...new Set(
            rows.flatMap((row) =>
              row &&
              typeof row === "object" &&
              !Array.isArray(row)
                ? Object.keys(row)
                : []
            )
          ),
        ];
      }

      // =========================
      // XLSX COLUMN EXTRACTION
      // =========================
      else if (fileName.endsWith(".xlsx")) {
        const arrayBuffer =
          await selectedFile.arrayBuffer();

        const workbook =
          XLSX.read(
            arrayBuffer,
            {
              type: "array",
            }
          );

        const firstSheetName =
          workbook.SheetNames[0];

        if (!firstSheetName) {
          throw new Error(
            "XLSX file does not contain any sheet."
          );
        }

        const worksheet =
          workbook.Sheets[
            firstSheetName
          ];

        const rows =
          XLSX.utils.sheet_to_json(
            worksheet,
            {
              header: 1,
              defval: "",
            }
          );

        if (
          !rows.length ||
          !rows[0].length
        ) {
          throw new Error(
            "XLSX file is empty or invalid."
          );
        }

        extractedColumns =
          rows[0]
            .map((column) =>
              String(column).trim()
            )
            .filter(Boolean);
      }

      if (
        extractedColumns.length === 0
      ) {
        throw new Error(
          "No columns found in the selected file."
        );
      }

      setFile(selectedFile);

      setColumns(
        extractedColumns
      );

      const defaultMapping =
        buildDefaultMapping(
          extractedColumns
        );

      setMapping(
        defaultMapping
      );

    } catch (error) {
      console.error(
        "File read error:",
        error
      );

      setFile(null);
      setColumns([]);
      setMapping({});

      setErrorMessage(
        error.message ||
          "Failed to read the selected file."
      );
    }
  };

  const handleUpload = async () => {
    setErrorMessage("");

    if (!datasetName.trim()) {
      setErrorMessage(
        "Please enter a dataset name."
      );

      return;
    }

    if (!file) {
      setErrorMessage(
        "Please select a CSV, JSON or XLSX file."
      );

      return;
    }

    if (columns.length === 0) {
      setErrorMessage(
        "No columns found in the selected file."
      );

      return;
    }

    const mappingValues =
      Object.values(mapping)
        .filter(Boolean);

    if (
      mappingValues.length === 0
    ) {
      setErrorMessage(
        "Please map at least one column."
      );

      return;
    }

    const uniqueValues =
      [
        ...new Set(
          mappingValues
        ),
      ];

    if (
      uniqueValues.length !==
      mappingValues.length
    ) {
      setErrorMessage(
        "Duplicate column mappings are not allowed."
      );

      return;
    }


if (!socket.connected) {
  socket.connect();
}

console.log(
  "Socket ID before upload:",
  socket.id
);

setUploadProgress({
  progress: 0,
  message: "Starting upload...",
});

setIsUploading(true);

try {
  const formData =
    new FormData();

  formData.append(
    "file",
    file
  );

  formData.append(
    "datasetName",
    datasetName.trim()
  );

  formData.append(
  "transformCode",
  transformCode
);

  formData.append(
    "socketId",
    socket.id
  );

  const backendMapping = {};

  Object.entries(mapping).forEach(
    ([targetField, sourceColumn]) => {
      if (sourceColumn) {
        backendMapping[sourceColumn] =
          targetField;
      }
    }
  );

  formData.append(
    "mapping",
    JSON.stringify(backendMapping)
  );

const response = await fetch(
  "http://localhost:5000/api/upload",
  {
    method: "POST",
    body: formData,
  }
);
      const result =
        await response.json();

      if (!response.ok) {
        throw new Error(
          result.message ||
          "Upload failed"
        );
      }

      console.log(
        "Upload successful:",
        result
      );

      alert(
        `Dataset "${result.dataset.datasetName}" uploaded successfully!`
      );

      navigate(
        "/datasets"
      );

    } catch (error) {
      console.error(
        "Upload Error:",
        error
      );

      setErrorMessage(
        error.message ||
          "Upload failed. Please try again."
      );

    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="upload-page">
      <div className="upload-shell">

        <div className="upload-header">
          <div className="upload-title-wrap">
            <div className="upload-icon">
              📦
            </div>

            <h1>
              Upload Dataset
            </h1>
          </div>

          <span className="upload-status">
            Ready
          </span>
        </div>

        <div className="upload-body">

          <p className="upload-description">
            Upload your CSV, JSON or XLSX dataset,
            map columns, and process the data.
          </p>

          <div className="upload-grid">

            <div className="upload-field">
              <label htmlFor="dataset-name">
                Dataset Name
              </label>

              <input
                id="dataset-name"
                className="upload-input"
                type="text"
                placeholder="Enter dataset name"
                value={datasetName}
                onChange={(event) =>
                  setDatasetName(
                    event.target.value
                  )
                }
              />
            </div>

            <div className="upload-field">
              <label htmlFor="dataset-file">
                Choose Dataset
              </label>

              <div className="upload-file-wrap">
                <input
                  id="dataset-file"
                  className="upload-file-input"
                  type="file"
                  accept=".csv,.json,.xlsx"
                  onChange={
                    handleFileChange
                  }
                />
              </div>
            </div>

          </div>

          <div className="upload-meta">
            {file && (
              <span className="file-chip">
                Selected: {file.name}
              </span>
            )}

            <span className="file-format">
              CSV, JSON, XLSX
            </span>
          </div>

          {errorMessage && (
            <div
              className="upload-error"
              role="alert"
            >
              {errorMessage}
            </div>
          )}

          {columns.length > 0 && (
            <ColumnMappingPanel
              datasetColumns={columns}
              fieldMapping={mapping}
              onMappingChange={
                handleMappingChange
              }
            />
          )}

          {columns.length > 0 && (
  <div className="transform-section">

    <h3>
      Custom Transformation
    </h3>

    <p>
      Write JavaScript code to transform
      each row.
    </p>

    <textarea
      className="transform-code-input"
      value={transformCode}
      onChange={(event) =>
        setTransformCode(
          event.target.value
        )
      }
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

{isUploading && (
  <div className="upload-progress">

    <div className="progress-info">
      <span>
        {uploadProgress.message ||
          "Processing dataset..."}
      </span>

      <strong>
        {uploadProgress.progress}%
      </strong>
    </div>

    <div className="progress-bar">
      <div
        className="progress-fill"
        style={{
          width: `${uploadProgress.progress}%`,
        }}
      />
    </div>

    <span className="progress-text">
      Uploading and processing data...
    </span>

  </div>
)}

          <div className="upload-actions">
            <button
              type="button"
              className="upload-button"
              onClick={
                handleUpload
              }
              disabled={
                isUploading
              }
            >
              {isUploading
                ? "Processing..."
                : "Upload Dataset"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default UploadDataset;