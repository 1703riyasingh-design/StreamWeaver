// StreamETLDashboard.jsx
import React, { useState } from 'react';
import DatasetPreviewTable from './DatasetPreviewTable';
import ValidationErrorUI from './ValidationErrorUI';

const StreamETLDashboard = () => {
  // Mock Columns & Data (Backend/File Upload se connect karein)
  const columns = ['id', 'name', 'email', 'age'];
  
  const [data, setData] = useState([
    { id: 1, name: 'Rahul Sharma', email: 'rahul@test.com', age: 28, hasError: false },
    { id: 2, name: 'Priya Singh', email: 'invalid-email', age: 'N/A', hasError: true },
    { id: 3, name: 'Aman Verma', email: 'aman@test.com', age: 24, hasError: false }
  ]);

  const [errorLogs, setErrorLogs] = useState([
    {
      rowNumber: 2,
      field: 'email',
      reason: 'Invalid Email Format ("invalid-email")',
      rawData: { id: 2, name: 'Priya Singh', email: 'invalid-email', age: 'N/A' }
    }
  ]);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">StreamWeaver - ETL Dataset Monitor</h1>
      
      {/* 1. Virtualized Dataset Table */}
      <section>
        <h2 className="text-lg font-semibold mb-2 text-gray-700">Dataset Live Preview</h2>
        <DatasetPreviewTable data={data} columns={columns} />
      </section>

      {/* 2. Validation & Error UI */}
      <section>
        <ValidationErrorUI errorLogs={errorLogs} />
      </section>
    </div>
  );
};

export default StreamETLDashboard;