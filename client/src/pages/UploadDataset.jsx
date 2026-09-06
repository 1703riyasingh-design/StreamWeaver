import { useState } from "react";
import "./UploadDataset.css";
import ColumnMapper from "../components/ColumnMapper";

function UploadDataset() {
  const [datasetName, setDatasetName] = useState("");
  const [file, setFile] = useState(null);

  const [step, setStep] = useState(1);
  const [columns, setColumns] = useState([]);
  const [mapping, setMapping] = useState({});

  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // CSV se actual headers extract karna
  const extractColumnsFromCSV = async (selectedFile) => {
    const text = await selectedFile.text();

    const firstLine = text.split(/\r?\n/)[0];

    if (!firstLine) {
      return [];
    }

    return firstLine
      .split(",")
      .map((column) => column.trim())
      .filter(Boolean);
  };

  // File select
  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];

    if (!selectedFile) {
      return;
    }

    setErrorMessage("");

    const fileName = selectedFile.name.toLowerCase();

    // Backend currently CSV support karta hai
    if (!fileName.endsWith(".csv")) {
      setErrorMessage(
        "Currently only CSV files are supported."
      );

      setFile(null);
      setColumns([]);

      return;
    }

    try {
      const extractedColumns =
        await extractColumnsFromCSV(selectedFile);

      if (extractedColumns.length === 0) {
        setErrorMessage(
          "CSV file is empty or does not contain valid columns."
        );

        return;
      }

      setFile(selectedFile);

      setColumns(extractedColumns);

      // Purani mapping reset
      setMapping({});

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


  // Mapping complete
  const handleMappingComplete = (mappingData) => {
    setMapping(mappingData);

    console.log(
      "Mapping completed:",
      mappingData
    );

    setErrorMessage("");
  };


  // Upload page par back
  const handleBackToUpload = () => {
    setStep(1);
  };


  // Actual backend upload
  const handleUpload = async () => {
    setErrorMessage("");

    // Dataset name validation
    if (!datasetName.trim()) {
      setErrorMessage(
        "Please enter a dataset name."
      );

      setStep(1);

      return;
    }


    // File validation
    if (!file) {
      setErrorMessage(
        "Please select a CSV file."
      );

      setStep(1);

      return;
    }


    setIsUploading(true);

    try {
      const formData = new FormData();

      // Backend multer field name
      formData.append(
        "file",
        file
      );

      formData.append(
        "datasetName",
        datasetName.trim()
      );

      // Backend expects req.body.mapping
      formData.append(
        "mapping",
        JSON.stringify(mapping)
      );


      const response = await fetch(
        "http://localhost:5000/api/upload",
        {
          method: "POST",
          body: formData
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
        `Dataset "${result.dataset.datasetName}" uploaded successfully!\n\n` +
        `Total Rows: ${result.dataset.totalRows}\n` +
        `Columns: ${result.dataset.columns.join(", ")}`
      );


      // Reset form after successful upload
      setDatasetName("");
      setFile(null);
      setColumns([]);
      setMapping({});
      setStep(1);


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
            Step {step} of 2
          </span>

        </div>


        <div className="upload-body">


          {/* STEP 1 */}
          {step === 1 && (
            <>

              <p className="upload-description">
                Upload your CSV dataset and map its columns
                before processing.
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
                <div className="upload-error">
                  {errorMessage}
                </div>
              )}



              <div className="upload-actions">

                <button
                  type="button"
                  className="upload-button"
                  onClick={() => {

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


                    if (
                      columns.length === 0
                    ) {
                      setErrorMessage(
                        "No columns found in the CSV file."
                      );

                      return;
                    }


                    setErrorMessage("");
                    setStep(2);

                  }}
                >
                  Next: Map Columns →
                </button>

              </div>

            </>
          )}



          {/* STEP 2 */}
          {step === 2 && (

            <>

              <ColumnMapper
                columns={columns}
                onMap={
                  handleMappingComplete
                }
                onBack={
                  handleBackToUpload
                }
              />


              {errorMessage && (
                <div className="upload-error">
                  {errorMessage}
                </div>
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
                    : "Upload Dataset"
                  }

                </button>

              </div>

            </>

          )}

        </div>

      </div> 

    </div>
  );
}

export default UploadDataset;