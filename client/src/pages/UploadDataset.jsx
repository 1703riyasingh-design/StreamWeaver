import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UploadDataset.css";

const REQUIRED_FIELDS = [
  { key: "userId", label: "User ID" },
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
  const normalizedColumns = columns.map(
    (column) => String(column).trim()
  );

  return REQUIRED_FIELDS.reduce(
    (mapping, field) => {
      const keywords = {
        userId: [
          "userid",
          "user_id",
          "id"
        ],
        name: [
          "name",
          "full name",
          "fullname"
        ],
        city: [
          "city",
          "location"
        ],
        email: [
          "email"
        ],
      }[field.key] || [field.label];

      const match = normalizedColumns.find(
        (column) => {
          const normalizedColumn =
            normalizeColumnName(column);

          return keywords.some(
            (keyword) =>
              normalizedColumn ===
                normalizeColumnName(keyword) ||
              normalizedColumn.includes(
                normalizeColumnName(keyword)
              )
          );
        }
      );

      mapping[field.key] = match || "";

      return mapping;
    },
    {}
  );
}

function ColumnMappingPanel({
  csvColumns,
  fieldMapping,
  onMappingChange,
}) {
  return (
    <div className="mapping-panel">

      <div className="mapping-header">
        <h3>Column Mapping</h3>
        <span>Map your CSV columns</span>
      </div>

      <div className="mapping-grid">

        {REQUIRED_FIELDS.map((field) => (
          <div
            className="mapping-field"
            key={field.key}
          >

            <label
              htmlFor={`mapping-${field.key}`}
            >
              {field.label}
            </label>

            <select
              id={`mapping-${field.key}`}
              value={
                fieldMapping[field.key] || ""
              }
              onChange={(event) =>
                onMappingChange(
                  field.key,
                  event.target.value
                )
              }
            >

              <option value="">
                Select CSV column
              </option>

              {csvColumns.map((column) => (
                <option
                  key={column}
                  value={column}
                >
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
          {REQUIRED_FIELDS.map((field) => (
            <li key={field.key}>
              <strong>
                {field.label}
              </strong>

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

  const [isUploading, setIsUploading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const navigate = useNavigate();


  const handleMappingChange = (
    fieldKey,
    selectedColumn
  ) => {
    setMapping((current) => ({
      ...current,
      [fieldKey]: selectedColumn,
    }));
  };


  const handleFileChange = async (
    event
  ) => {
    const selectedFile =
      event.target.files[0];

    if (!selectedFile) {
      return;
    }

    setErrorMessage("");

    const fileName =
      selectedFile.name.toLowerCase();

    if (!fileName.endsWith(".csv")) {
      setErrorMessage(
        "Currently only CSV files are supported."
      );

      setFile(null);
      setColumns([]);
      setMapping({});

      return;
    }

    try {
      const text =
        await selectedFile.text();

      const firstLine =
        text.split(/\r?\n/)[0];

      if (!firstLine) {
        setErrorMessage(
          "CSV file is empty or invalid."
        );

        return;
      }

      const extractedColumns =
        firstLine
          .split(",")
          .map((column) =>
            column.trim()
          )
          .filter(Boolean);

      if (
        extractedColumns.length === 0
      ) {
        setErrorMessage(
          "No columns found in the CSV file."
        );

        return;
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

      setErrorMessage(
        "Failed to read CSV file."
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
        "Please select a CSV file."
      );

      return;
    }

    if (columns.length === 0) {
      setErrorMessage(
        "No columns found in the CSV file."
      );

      return;
    }

    const mappingValues =
      Object.values(mapping)
        .filter(Boolean);

    if (mappingValues.length === 0) {
      setErrorMessage(
        "Please map at least one column."
      );

      return;
    }

    const uniqueValues =
      [...new Set(mappingValues)];

    if (
      uniqueValues.length !==
      mappingValues.length
    ) {
      setErrorMessage(
        "Duplicate database fields are not allowed."
      );

      return;
    }

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
        "mapping",
        JSON.stringify(mapping)
      );

      const response =
        await fetch(
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

      navigate("/datasets");

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
            Upload your CSV dataset,
            map columns, and process
            the data.
          </p>


          <div className="upload-grid">

            <div className="upload-field">

              <label
                htmlFor="dataset-name"
              >
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

              <label
                htmlFor="dataset-file"
              >
                Choose Dataset
              </label>

              <div className="upload-file-wrap">

                <input
                  id="dataset-file"
                  className="upload-file-input"
                  type="file"
                  accept=".csv"
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
              CSV
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
              csvColumns={columns}
              fieldMapping={mapping}
              onMappingChange={
                handleMappingChange
              }
            />
          )}


          {isUploading && (
            <div className="upload-progress">

              <span
                className="spinner"
              />

              <span>
                Uploading and processing...
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