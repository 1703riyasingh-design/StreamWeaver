const Dataset = require("../models/Dataset");

const createDataset = async (datasetData) => {
    const dataset = new Dataset(datasetData);
    return await dataset.save();
};

const getDatasetById = async (id) => {
    return await Dataset.findById(id);
};

const getAllDatasets = async () => {
    return await Dataset.find().sort({ createdAt: -1 });
};

module.exports = {
    createDataset,
    getDatasetById,
    getAllDatasets,
};