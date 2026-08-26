const Dataset = require("../models/Dataset");
const DatasetRow = require("../models/DatasetRow");

const createDataset = async (datasetData) => {
    const dataset = new Dataset(datasetData)({
     datasetName: datasetData.datasetName,
        originalFileName: datasetData.originalFileName,
        fileType: datasetData.fileType,
        totalRows: datasetData.totalRows || 0,
        columns: datasetData.columns || []
    });


    return await dataset.save();
};
const insertRowsInBulk = async (datasetId, rows) => {
    if (!rows || rows.length === 0) {
        return 0;
    }

    const operations = rows.map((row) => ({
        insertOne: {
            document: {
                datasetId,
                data: row
            }
        }
    }));

    const result = await DatasetRow.bulkWrite(
        operations,
        {
            ordered: false
        }
    );

    return result.insertedCount;
};

const getDatasetById = async (id) => {
    return await Dataset.findById(id);
};

const getAllDatasets = async () => {
    return await Dataset.find().sort({ createdAt: -1 });
};

const getDatasetRows = async (datasetId, limit = 100) => {
    return await DatasetRow.find({ datasetId })
        .sort({ createdAt: 1 })
        .limit(limit)
        .lean();
};

module.exports = {
    createDataset,
    insertRowsInBulk,
    getDatasetById,
    getAllDatasets,
    getDatasetRows
};