const mongoose = require("mongoose");

const datasetSchema = new mongoose.Schema(
  {
    datasetName: {
      type: String,
      required: true,
      trim: true,
    },

    originalFileName: {
      type: String,
      required: true,
      trim: true
    },

    fileType: {
      type: String,
      required: true,
      trim: true
    },

    totalRows: {
      type: Number,
      default: 0,
    },

    columns: {
      type: [String],
      default: [],
    },
      
    mapping: {
      type: Map,
      of: String,
      default: {},
    },

    // data: {
    //   type: [mongoose.Schema.Types.Mixed],
    //   default: [],
    // },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Dataset", datasetSchema);