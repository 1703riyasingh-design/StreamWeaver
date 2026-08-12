const { Transform } = require("stream");

class DataTransformStream extends Transform {
    constructor(options = {}) {
        super({
            ...options,
            objectMode: true
        });
    }

    _transform(row, encoding, callback) {
        try {
            const transformedRow = {
                ...row
            };

            this.push(transformedRow);

            callback();
        } catch (error) {
            callback(error);
        }
    }
}

module.exports = DataTransformStream;