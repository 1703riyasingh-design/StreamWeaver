const XLSX = require("xlsx");

const cleanHeader = (value, index) => {
  // Convert to string and trim
  let header = String(value ?? "").trim();

  // Remove surrounding quotes (single or double)
  header = header.replace(/^["']+|["']+$/g, "");

  // Remove any remaining quotes
  header = header.replace(/["']/g, "");

  // Trim again
  header = header.trim();

  // If empty, use fallback
  return header || `Column_${index + 1}`;
};

const parseXLSXFile = async (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error("XLSX file does not contain any sheet");
    }

    let selectedWorksheet = null;
    let selectedSheetName = null;

    // Find first sheet with data
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      if (!worksheet) continue;

      const rawRows = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: "",
        blankrows: false,
      });

      const hasData = rawRows.some(
        (row) =>
          Array.isArray(row) &&
          row.some((cell) => String(cell ?? "").trim() !== "")
      );

      if (hasData) {
        selectedWorksheet = worksheet;
        selectedSheetName = sheetName;
        break;
      }
    }

    if (!selectedWorksheet) {
      throw new Error("XLSX file does not contain any data");
    }

    console.log(`Using XLSX sheet: ${selectedSheetName}`);

    const rawRows = XLSX.utils.sheet_to_json(selectedWorksheet, {
      header: 1,
      defval: "",
      blankrows: false,
    });

    if (!Array.isArray(rawRows) || rawRows.length === 0) {
      throw new Error("XLSX file does not contain any rows");
    }

    // Find first non-empty row as header
    const headerIndex = rawRows.findIndex(
      (row) =>
        Array.isArray(row) &&
        row.some((cell) => String(cell ?? "").trim() !== "")
    );

    if (headerIndex === -1) {
      throw new Error("XLSX file does not contain valid headers");
    }

    // Clean headers (remove quotes)
    const rawHeaders = rawRows[headerIndex];
    const headers = rawHeaders.map((header, index) =>
      cleanHeader(header, index)
    );

    // Deduplicate headers
    const seenHeaders = new Map();
    const uniqueHeaders = headers.map((header) => {
      const count = seenHeaders.get(header) || 0;
      seenHeaders.set(header, count + 1);
      return count === 0 ? header : `${header}_${count + 1}`;
    });

    // Convert remaining rows into objects
    const rows = rawRows
      .slice(headerIndex + 1)
      .filter(
        (row) =>
          Array.isArray(row) &&
          row.some((cell) => String(cell ?? "").trim() !== "")
      )
      .map((row) => {
        const obj = {};
        uniqueHeaders.forEach((header, index) => {
          const value = row[index] ?? "";
          // Clean individual cell values (remove quotes if present)
          obj[header] =
            typeof value === "string"
              ? value.replace(/^["']+|["']+$/g, "").trim()
              : value;
        });
        return obj;
      });

    if (rows.length === 0) {
      throw new Error("XLSX file contains headers but no data rows");
    }

    const columns = [...uniqueHeaders];

    console.log("XLSX columns extracted:", columns);

    return {
      rows,
      columns,
    };
  } catch (error) {
    throw new Error(`XLSX parsing failed: ${error.message}`);
  }
};

module.exports = parseXLSXFile;