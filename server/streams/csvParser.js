const { Transform } = require("stream");

class CSVParser extends Transform {
    constructor(options = {}) {
        super({
            ...options,
            readableObjectMode: true
        });

        this.headers = null;
        this.buffer = "";
    }

    _transform(chunk, encoding, callback) {
        try {
            this.buffer += chunk.toString();

            const lines = this.buffer.split("\n");

            this.buffer = lines.pop();

            for (const line of lines) {
                const trimmedLine = line.trim();

                if (!trimmedLine) {
                    continue;
                }

                if (!this.headers) {
                    this.headers = trimmedLine.split(",").map(header => header.trim());
                    continue;
                }

                const values = trimmedLine.split(",");

                const row = {};

                this.headers.forEach((header, index) => {
                    row[header] = values[index]?.trim() || "";
                });

                this.push(row);
            }

            callback();
        } catch (error) {
            callback(error);
        }
    }

    _flush(callback) {
        try {
            if (this.buffer.trim() && this.headers) {
                const values = this.buffer.trim().split(",");
                const row = {};

                this.headers.forEach((header, index) => {
                    row[header] = values[index]?.trim() || "";
                });

                this.push(row);
            }

            callback();
        } catch (error) {
            callback(error);
        }
    }
}

module.exports = CSVParser;