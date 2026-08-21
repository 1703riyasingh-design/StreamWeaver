// import { useState } from "react";
// import "./UploadDataset.css";
// import ColumnMapper from "../components/ColumnMapper.jsx";

// function UploadDataset() {
//   const [datasetName, setDatasetName] = useState("");
//   const [file, setFile] = useState(null);

//   const handleFileChange = (event) => {
//     const selectedFile = event.target.files[0];
//     if (selectedFile) {
//       setFile(selectedFile);
//     }
//   };

// const handleUpload = async () => {
//   if (!datasetName.trim()) {
//     alert("Please enter a dataset name before uploading.");
//     return;
//   }

//   if (!file) {
//     alert("Please select a dataset file first.");
//     return;
//   }

//   try {
//     const formData = new FormData();

//     formData.append("file", file);
//     formData.append("datasetName", datasetName);

//     const response = await fetch("http://localhost:5000/api/upload", {
//       method: "POST",
//       body: formData,
//     });

//     const result = await response.json();

//     if (!response.ok) {
//       throw new Error(result.message || "Upload failed");
//     }

//     console.log("Backend Response:", result);

//     alert(
//       `Dataset "${datasetName}" uploaded successfully!\nTotal Rows: ${result.totalRows}`
//     );
//   } catch (error) {
//     console.error("Upload Error:", error);
//     alert(`Upload failed: ${error.message}`);
//   }
// };

//   return (
//     <div className="upload-page">
//       <div className="upload-shell">
//         <div className="upload-header">
//           <div className="upload-title-wrap">
//             <div className="upload-icon">📦</div>
//             <h1>Upload Dataset</h1>
//           </div>
//           <span className="upload-status">Ready</span>
//         </div>

//         <div className="upload-body">
//           <p className="upload-description">
//             Upload your dataset to start processing and preview the data.
//           </p>

//           <div className="upload-grid">
//             <div className="upload-field">
//               <label htmlFor="dataset-name">Dataset Name</label>
//               <input
//                 id="dataset-name"
//                 className="upload-input"
//                 type="text"
//                 placeholder="Enter dataset name"
//                 value={datasetName}
//                 onChange={(event) => setDatasetName(event.target.value)}
//               />
//             </div>

//             <div className="upload-field">
//               <label htmlFor="dataset-file">Choose Dataset</label>
//               <div className="upload-file-wrap">
//                 <input
//                   id="dataset-file"
//                   className="upload-file-input"
//                   type="file"
//                   accept=".csv,.json,.xlsx"
//                   onChange={handleFileChange}
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="upload-meta">
//             {file && <span className="file-chip">Selected: {file.name}</span>}
//             <span className="file-format">CSV, JSON, XLSX</span>
//           </div>

//           <div className="upload-actions">
//             <button type="button" className="upload-button" onClick={handleUpload}>
//               Upload Dataset
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default UploadDataset;



import { useState } from "react";
import "./UploadDataset.css";
import ColumnMapper from "../components/ColumnMapper";

function UploadDataset() {
  const [datasetName, setDatasetName] = useState("");
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(1);          // 1: Upload, 2: Mapping
  const [columns, setColumns] = useState([]);   // File से निकाले गए columns
  const [mapping, setMapping] = useState(null); // Mapping data

  // 🔹 File चुनने पर – Columns Extract करें (अभी Mock)
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // ⚠️ अभी Mock Columns – बाद में Real Parsing करें
      const mockColumns = ["CustomerID", "FullName", "EmailAddr", "Age"];
      setColumns(mockColumns);
      setStep(2);   // Mapping step पर जाएँ
    }
  };

  // 🔹 Mapping Complete होने पर
  const handleMappingComplete = (mappingData) => {
    setMapping(mappingData);
    console.log("✅ Mapping completed:", mappingData);
    alert("✅ Mapping saved! Now you can proceed.");
    // यहाँ आप File + Mapping + DatasetName Backend भेज सकते हैं
  };

  // 🔹 वापस Upload Step पर
  const handleBackToUpload = () => {
    setStep(1);
    setFile(null);
    setColumns([]);
    setMapping(null);
  };

  // 🔹 Real Upload (Mapping होने के बाद)
  const handleUpload = async () => {
    if (!datasetName.trim()) {
      alert("Please enter a dataset name before uploading.");
      return;
    }
    if (!file) {
      alert("Please select a dataset file first.");
      return;
    }
    if (!mapping) {
      alert("Please complete column mapping first.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("datasetName", datasetName);
      formData.append("mapping", JSON.stringify(mapping));

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
      // Reset after success
      setDatasetName("");
      setFile(null);
      setMapping(null);
      setStep(1);
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
          <span className="upload-status">Step {step} of 2</span>
        </div>

        <div className="upload-body">
          {/* Step 1: Upload Form */}
          {step === 1 && (
            <>
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
                    onChange={(e) => setDatasetName(e.target.value)}
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
                {file && <span className="file-chip">✅ Selected: {file.name}</span>}
                <span className="file-format">CSV, JSON, XLSX</span>
              </div>

              <div className="upload-actions">
                <button
                  type="button"
                  className="upload-button"
                  onClick={() => {
                    if (file && columns.length > 0) {
                      setStep(2);
                    } else {
                      alert("Please select a file first.");
                    }
                  }}
                >
                  Next: Map Columns →
                </button>
              </div>
            </>
          )}

          {/* Step 2: Column Mapping */}
          {step === 2 && (
            <>
              <ColumnMapper
                columns={columns}
                onMap={handleMappingComplete}
                onBack={handleBackToUpload}
              />
              {/* Mapping होने के बाद Upload बटन दिखेगा */}
              {mapping && (
                <div className="upload-actions" style={{ marginTop: "20px" }}>
                  <button
                    type="button"
                    className="upload-button"
                    onClick={handleUpload}
                  >
                    📤 Upload Dataset
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadDataset;