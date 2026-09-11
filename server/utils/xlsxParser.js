const XLSX = require("xlsx");

const parseXLSXFile = async (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);

    if (
      !workbook.SheetNames ||
      workbook.SheetNames.length === 0
    ) {
      throw new Error(
        "XLSX file does not contain any sheet"
      );
    }

    let selectedWorksheet = null;
    let selectedSheetName = null;

    // Find the first sheet that actually contains data
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];

      if (!worksheet) {
        continue;
      }

      const rawRows =
        XLSX.utils.sheet_to_json(
          worksheet,
          {
            header: 1,
            defval: "",
            blankrows: false,
          }
        );

      const hasData = rawRows.some(
        (row) =>
          Array.isArray(row) &&
          row.some(
            (cell) =>
              String(cell ?? "").trim() !== ""
          )
      );

      if (hasData) {
        selectedWorksheet = worksheet;
        selectedSheetName = sheetName;
        break;
      }
    }

    if (!selectedWorksheet) {
      throw new Error(
        "XLSX file does not contain any data"
      );
    }

    console.log(
      `Using XLSX sheet: ${selectedSheetName}`
    );

    // Read complete sheet as arrays
    const rawRows =
      XLSX.utils.sheet_to_json(
        selectedWorksheet,
        {
          header: 1,
          defval: "",
          blankrows: false,
        }
      );

    if (
      !Array.isArray(rawRows) ||
      rawRows.length === 0
    ) {
      throw new Error(
        "XLSX file does not contain any rows"
      );
    }

    // Find first non-empty row as header
    const headerIndex =
      rawRows.findIndex(
        (row) =>
          Array.isArray(row) &&
          row.some(
            (cell) =>
              String(cell ?? "").trim() !== ""
          )
      );

    if (headerIndex === -1) {
      throw new Error(
        "XLSX file does not contain valid headers"
      );
    }

    const headers = rawRows[headerIndex].map(
      (header, index) => {
        const value =
          String(header ?? "").trim();

        return value || `Column_${index + 1}`;
      }
    );

    // Convert remaining rows into objects
    const rows = rawRows
      .slice(headerIndex + 1)
      .filter((row) =>
        Array.isArray(row) &&
        row.some(
          (cell) =>
            String(cell ?? "").trim() !== ""
        )
      )
      .map((row) => {
        const obj = {};

        headers.forEach(
          (header, index) => {
            obj[header] =
              row[index] ?? "";
          }
        );

        return obj;
      });

    if (rows.length === 0) {
      throw new Error(
        "XLSX file contains headers but no data rows"
      );
    }

    const columns = [...headers];

    return {
      rows,
      columns,
    };

  } catch (error) {
    throw new Error(
      `XLSX parsing failed: ${error.message}`
    );
  }
};

module.exports = parseXLSXFile;