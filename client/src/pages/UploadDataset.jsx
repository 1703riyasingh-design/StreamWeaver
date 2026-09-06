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
  const normalizedColumns = columns.map((column) =>
    String(column).trim()
  );

  return REQUIRED_FIELDS.reduce(
    (mapping, field) => {
      const keywords = {
        userId: [
          "userid",
          "user_id",
          "id",
        ],
        name: [
          "name",
          "full name",
          "fullname",
        ],
        city: [
          "city",
          "location",
        ],
        email: [
          "email",
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
        <span>Map your dataset columns</span>
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
                Select dataset column
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


    // Check supported file types
    if (
      !fileName.endsWith(".csv") &&
      !fileName.endsWith(".json")
    ) {
      setErrorMessage(
        "Currently only CSV and JSON files are supported."
      );

      setFile(null);
      setColumns([]);
      setMapping({});

      return;
    }


    try {
      const text =
        await selectedFile.text();

      let extractedColumns = [];


      // =========================
      // CSV COLUMN EXTRACTION
      // =========================
      if (
        fileName.endsWith(".csv")
      ) {
        const firstLine =
          text.split(/\r?\n/)[0];

        if (!firstLine) {
          setErrorMessage(
            "CSV file is empty or invalid."
          );

          return;
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
      if (
        fileName.endsWith(".json")
      ) {
        const jsonData =
          JSON.parse(text);

        let rows = [];


        // JSON Array
        if (
          Array.isArray(jsonData)
        ) {
          rows = jsonData;
        }


        // JSON Object
        else if (
          jsonData &&
          typeof jsonData === "object"
        ) {
          const nestedArray =
            Object.values(
              jsonData
            ).find(
              (value) =>
                Array.isArray(value)
            );

          rows =
            nestedArray ||
            [jsonData];
        }


        if (
          rows.length === 0
        ) {
          setErrorMessage(
            "JSON file is empty or does not contain data."
          );

          return;
        }


        extractedColumns =
          Object.keys(
            rows[0] || {}
          );
      }


      // Check columns
      if (
        extractedColumns.length === 0
      ) {
        setErrorMessage(
          "No columns found in the selected file."
        );

        return;
      }


      // Save file
      setFile(
        selectedFile
      );


      // Save detected columns
      setColumns(
        extractedColumns
      );


      // Auto mapping
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


      if (
        fileName.endsWith(".json")
      ) {
        setErrorMessage(
          "Invalid JSON file. Please check the JSON format."
        );
      } else {
        setErrorMessage(
          "Failed to read CSV file."
        );
      }
    }
  };


  const handleUpload = async () => {
    setErrorMessage("");


    // Dataset name validation
    if (
      !datasetName.trim()
    ) {
      setErrorMessage(
        "Please enter a dataset name."
      );

      return;
    }


    // File validation
    if (
      !file
    ) {
      setErrorMessage(
        "Please select a CSV or JSON file."
      );

      return;
    }


    // Column validation
    if (
      columns.length === 0
    ) {
      setErrorMessage(
        "No columns found in the selected file."
      );

      return;
    }


    // Mapping validation
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


    // Check duplicate mappings
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


      if (
        !response.ok
      ) {
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
            Upload your CSV or JSON dataset,
            map columns, and process
            the data.
          </p>


          <div className="upload-grid">


            {/* Dataset Name */}
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


            {/* File Upload */}
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
                  accept=".csv,.json"
                  onChange={
                    handleFileChange
                  }
                />

              </div>

            </div>

          </div>


          {/* Selected File */}
          <div className="upload-meta">

            {file && (
              <span className="file-chip">
                Selected: {file.name}
              </span>
            )}


            <span className="file-format">
              CSV, JSON
            </span>

          </div>


          {/* Error */}
          {errorMessage && (
            <div
              className="upload-error"
              role="alert"
            >
              {errorMessage}
            </div>
          )}


          {/* Column Mapping */}
          {columns.length > 0 && (
            <ColumnMappingPanel
              csvColumns={columns}
              fieldMapping={mapping}
              onMappingChange={
                handleMappingChange
              }
            />
          )}


          {/* Upload Progress */}
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


          {/* Upload Button */}
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