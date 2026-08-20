// import { useState } from "react";
// import "./UploadDataset.css";

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
  const [step, setStep] = useState(1);
  const [columns, setColumns] = useState([]);
  const [mapping, setMapping] = useState(null);

  // 🔹 मान लें कि file upload होने के बाद columns निकाल लिए गए
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // ⚠️ Real implementation: file पढ़कर columns extract करें (CSV/Excel)
      // Mock example:
      const mockColumns = ["CustomerID", "FullName", "EmailAddr", "Age"];
      setColumns(mockColumns);
      setStep(2); // mapping step पर जाएँ
    }
  };

  const handleMappingComplete = (mappingData) => {
    setMapping(mappingData);
    console.log("Mapping completed:", mappingData);
    // अब आप backend पर file + mapping + datasetName भेज सकते हैं
    alert("Mapping saved! Now you can proceed.");
    // यहाँ आप actual upload API call कर सकते हैं
  };

  const handleBackToUpload = () => {
    setStep(1);
    // optionally reset
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
                {file && <span className="file-chip">Selected: {file.name}</span>}
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

          {step === 2 && (
            <ColumnMapper
              columns={columns}
              onMap={handleMappingComplete}
              onBack={handleBackToUpload}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default UploadDataset;