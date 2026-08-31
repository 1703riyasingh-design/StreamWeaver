const applyMapping = (row, mapping) => {
    const mappedRow = {};

    for (const [sourceColumn, targetColumn] of Object.entries(mapping)) {
        // Ignore empty mapping
        if (!targetColumn) {
            continue;
        }

        // Copy value from source column
        if (
            Object.prototype.hasOwnProperty.call(
                row,
                sourceColumn
            )
        ) {
            mappedRow[targetColumn] =
                row[sourceColumn];
        }
    }

    return mappedRow;
};

module.exports = applyMapping;