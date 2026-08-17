// ValidationErrorUI.jsx
import React, { useState } from 'react';

const ValidationErrorUI = ({ errorLogs = [] }) => {
  const [selectedError, setSelectedError] = useState(null);

  return (
    <div className="p-4 border border-red-200 rounded-lg bg-red-50/50 mt-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-red-800 flex items-center gap-2">
          <span>⚠️ Validation & Ingestion Errors</span>
          <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full">
            {errorLogs.length} Failed Rows
          </span>
        </h3>
      </div>

      {errorLogs.length === 0 ? (
        <p className="text-sm text-gray-500">No validation errors detected.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Error List */}
          <div className="max-h-60 overflow-y-auto border rounded bg-white">
            {errorLogs.map((item, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedError(item)}
                className={`p-2.5 border-b text-xs cursor-pointer hover:bg-red-50 transition-colors ${
                  selectedError?.rowNumber === item.rowNumber ? 'bg-red-100 font-medium' : ''
                }`}
              >
                <div className="flex justify-between text-red-700">
                  <span>Row #{item.rowNumber}</span>
                  <span className="font-mono text-gray-500">{item.field}</span>
                </div>
                <p className="text-gray-600 truncate mt-1">{item.reason}</p>
              </div>
            ))}
          </div>

          {/* Error Detailed Inspector */}
          <div className="p-3 bg-white border rounded text-xs">
            <h4 className="font-semibold text-gray-700 border-b pb-1 mb-2">Error Inspector</h4>
            {selectedError ? (
              <div className="space-y-2">
                <div>
                  <span className="text-gray-500">Row ID:</span> #{selectedError.rowNumber}
                </div>
                <div>
                  <span className="text-gray-500">Failed Field:</span>{' '}
                  <span className="font-mono bg-gray-100 px-1 rounded">{selectedError.field}</span>
                </div>
                <div>
                  <span className="text-gray-500">Reason:</span>{' '}
                  <span className="text-red-600 font-medium">{selectedError.reason}</span>
                </div>
                <div>
                  <span className="text-gray-500 block mb-1">Raw Row Data:</span>
                  <pre className="bg-gray-900 text-green-400 p-2 rounded text-[11px] overflow-x-auto">
                    {JSON.stringify(selectedError.rawData, null, 2)}
                  </pre>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 italic">Click on an error from the list to inspect details.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationErrorUI;