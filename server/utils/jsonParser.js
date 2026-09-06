const fs = require("fs/promises");

const parseJSONFile = async (filePath) => {
  try {
    const fileContent = await fs.readFile(filePath, "utf8");

    const jsonData = JSON.parse(fileContent);

    let rows = [];

    // Case 1: JSON directly contains an array
    if (Array.isArray(jsonData)) {
      rows = jsonData;
    }

    // Case 2: JSON is an object containing an array
    else if (jsonData && typeof jsonData === "object") {
      const nestedArray = Object.values(jsonData).find((value) =>
        Array.isArray(value)
      );

      if (nestedArray) {
        rows = nestedArray;
      } else {
        // Single object becomes one row
        rows = [jsonData];
      }
    }

    // Invalid JSON structure
    if (!Array.isArray(rows) || rows.length === 0) {
      throw new Error("JSON file does not contain any valid rows");
    }

    // Only object rows are allowed
    rows = rows.filter(
      (row) =>
        row &&
        typeof row === "object" &&
        !Array.isArray(row)
    );

    if (rows.length === 0) {
      throw new Error(
        "JSON file does not contain valid object records"
      );
    }

    // Extract all unique columns from JSON rows
    const columns = [
      ...new Set(
        rows.flatMap((row) => Object.keys(row))
      ),
    ];

    return {
      rows,
      columns,
    };
  } catch (error) {
    throw new Error(
      `JSON parsing failed: ${error.message}`
    );
  }
};

module.exports = parseJSONFile;