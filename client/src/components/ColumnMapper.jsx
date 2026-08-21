// // src/components/ColumnMapper.jsx
// import React, { useState } from "react";

// const ColumnMapper = ({ columns, onMap, onBack }) => {
//   const [mapping, setMapping] = useState({});

//   // आपके Database की Expected Fields (जैसे आपकी Table में क्या columns हैं)
//   const targetFields = ["id", "name", "email", "age"];

//   const handleMappingChange = (sourceCol, targetField) => {
//     setMapping((prev) => ({ ...prev, [sourceCol]: targetField }));
//   };

//   const handleSubmit = () => {
//     // Check: क्या सभी columns map हो गए?
//     const allMapped = columns.every((col) => mapping[col]);
//     if (!allMapped) {
//       alert("Please map all columns.");
//       return;
//     }
//     onMap(mapping); // mapping को parent component (UploadDataset) को भेजें
//   };

//   return (
//     <div className="column-mapper">
//       <h3>Map Columns to Database Fields</h3>
//       <p>Select the corresponding field for each column in your dataset.</p>
//       <div className="mapper-grid">
//         {columns.map((col) => (
//           <div key={col} className="mapper-row">
//             <span className="source-col">{col}</span>
//             <select
//               value={mapping[col] || ""}
//               onChange={(e) => handleMappingChange(col, e.target.value)}
//             >
//               <option value="">-- Select --</option>
//               {targetFields.map((field) => (
//                 <option key={field} value={field}>
//                   {field}
//                 </option>
//               ))}
//             </select>
//           </div>
//         ))}
//       </div>
//       <div className="mapper-actions">
//         <button type="button" onClick={onBack} className="btn-secondary">
//           ⬅ Back
//         </button>
//         <button type="button" onClick={handleSubmit} className="btn-primary">
//           ✅ Confirm Mapping
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ColumnMapper;


import React, { useState } from "react";

const ColumnMapper = ({ columns, onMap, onBack }) => {
  const [mapping, setMapping] = useState({});

  // आपके Database की Expected Fields (जैसे आपकी Table में क्या columns हैं)
  const targetFields = ["id", "name", "email", "age"];

  const handleMappingChange = (sourceCol, targetField) => {
    setMapping((prev) => ({ ...prev, [sourceCol]: targetField }));
  };

  const handleSubmit = () => {
    // Check: क्या सभी columns map हो गए?
    const allMapped = columns.every((col) => mapping[col]);
    if (!allMapped) {
      alert("Please map all columns.");
      return;
    }
    onMap(mapping); // mapping को parent component (UploadDataset) को भेजें
  };

  return (
    <div className="column-mapper">
      <h3>Map Columns to Database Fields</h3>
      <p>Select the corresponding field for each column in your dataset.</p>
      <div className="mapper-grid">
        {columns.map((col) => (
          <div key={col} className="mapper-row">
            <span className="source-col">{col}</span>
            <select
              value={mapping[col] || ""}
              onChange={(e) => handleMappingChange(col, e.target.value)}
            >
              <option value="">-- Select --</option>
              {targetFields.map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      <div className="mapper-actions">
        <button type="button" onClick={onBack} className="btn-secondary">
          ⬅ Back
        </button>
        <button type="button" onClick={handleSubmit} className="btn-primary">
          ✅ Confirm Mapping
        </button>
      </div>
    </div>
  );
};

export default ColumnMapper;