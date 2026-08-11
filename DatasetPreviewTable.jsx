// DatasetPreviewTable.jsx
import React from 'react';
import { FixedSizeList as List } from 'react-window';

const DatasetPreviewTable = ({ data, columns }) => {
  // Column Headers Render karein
  const renderHeader = () => (
    <div className="flex border-b border-gray-300 bg-gray-100 font-bold p-2 text-sm">
      <div className="w-16"># Row</div>
      {columns.map((col, index) => (
        <div key={index} className="flex-1 px-2 truncate">
          {col}
        </div>
      ))}
      <div className="w-24 text-center">Status</div>
    </div>
  );

  // Single Row Render Component (Ye Virtualized rahega)
  const Row = ({ index, style }) => {
    const rowData = data[index];
    const isError = rowData?.hasError;

    return (
      <div
        style={style}
        className={`flex border-b border-gray-200 text-sm items-center ${
          isError ? 'bg-red-50 text-red-700' : 'hover:bg-gray-50'
        }`}
      >
        <div className="w-16 font-mono text-gray-500 pl-2">{index + 1}</div>
        {columns.map((col, colIndex) => (
          <div key={colIndex} className="flex-1 px-2 truncate">
            {rowData[col] || '-'}
          </div>
        ))}
        <div className="w-24 text-center">
          {isError ? (
            <span className="px-2 py-0.5 text-xs bg-red-200 text-red-800 rounded-full font-medium">
              Invalid
            </span>
          ) : (
            <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full font-medium">
              Valid
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm bg-white">
      {renderHeader()}
      <List
        height={400} // Table container height
        itemCount={data.length} // Total rows
        itemSize={40} // Single row height in pixels
        width="100%"
      >
        {Row}
      </List>
    </div>
  );
};

export default DatasetPreviewTable;