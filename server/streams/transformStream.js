const { Transform } = require("stream");

class DataTransformStream extends Transform {
    constructor(options = {}) {
        super({
            ...options,
            objectMode: true
        });
    
    
        this.processedRows = 0;
    }

    _transform(row, encoding, callback) {
        try {
            const transformedRow = {
                ...row
            };
            this.processedRows++;

            this.push(transformedRow);

            callback();
        } catch (error) {
            callback(error);
        }
    }
}

module.exports = DataTransformStream;