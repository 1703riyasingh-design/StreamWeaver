const XLSX =
  require("xlsx");


const parseXLSXFile =
  async (filePath) => {

    try {

      const workbook =
        XLSX.readFile(
          filePath
        );


      const firstSheetName =
        workbook.SheetNames[0];


      if (
        !firstSheetName
      ) {
        throw new Error(
          "XLSX file does not contain any sheet"
        );
      }


      const worksheet =
        workbook.Sheets[
          firstSheetName
        ];


      const rows =
        XLSX.utils.sheet_to_json(
          worksheet,
          {
            defval: "",
          }
        );


      if (
        !Array.isArray(rows) ||
        rows.length === 0
      ) {
        throw new Error(
          "XLSX file does not contain any rows"
        );
      }


      const columns =
        [
          ...new Set(
            rows.flatMap(
              (row) =>
                Object.keys(
                  row
                )
            )
          ),
        ];


      return {
        rows,
        columns,
      };

    } catch (
      error
    ) {

      throw new Error(
        `XLSX parsing failed: ${error.message}`
      );

    }

  };


module.exports =
  parseXLSXFile;