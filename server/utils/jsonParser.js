const fs = require("fs");

const parseJSONFile = async (filePath) => {
  const { streamArray } = await import(
    "stream-json/streamers/stream-array.js"
  );

  return new Promise((resolve, reject) => {
    const columnsSet = new Set();
    let rowCount = 0;

    // =========================================
    // FIRST PASS
    // Read JSON only to get columns + row count
    // =========================================

    const firstStream =
      streamArray.withParserAsStream();

    firstStream.on("data", ({ value }) => {
      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value)
      ) {
        rowCount++;

        Object.keys(value).forEach((column) => {
          columnsSet.add(column);
        });
      }
    });

    firstStream.on("end", () => {
      if (rowCount === 0) {
        reject(
          new Error(
            "JSON file does not contain valid object records"
          )
        );
        return;
      }

      // =========================================
      // SECOND PASS
      // Create fresh streaming row stream
      // =========================================

      const rowStream =
  streamArray.withParserAsStream();

rowStream.on("error", (error) => {
  reject(
    new Error(
      `JSON parsing failed: ${error.message}`
    )
  );
});

const { Transform } = require("stream");

const valueStream = new Transform({
  objectMode: true,

  transform(item, encoding, callback) {
    callback(null, item.value);
  },
});

rowStream
  .pipe(valueStream);

fs.createReadStream(filePath, {
  encoding: "utf8",
  highWaterMark: 64 * 1024,
}).pipe(rowStream);

resolve({
  columns: [...columnsSet],
  rowCount,
  stream: valueStream,
});
    });

    firstStream.on("error", (error) => {
      reject(
        new Error(
          `JSON parsing failed: ${error.message}`
        )
      );
    });

    // Start first streaming pass
    fs.createReadStream(filePath, {
      encoding: "utf8",
      highWaterMark: 64 * 1024,
    }).pipe(firstStream);
  });
};

module.exports = parseJSONFile;