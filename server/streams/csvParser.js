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
                this.processLine(line);
            }

             callback();

        } catch (error) {
            callback(error);
        }
    }
    
    _flush(callback) {
        try {
            if (this.buffer.trim()) {
                this.processLine(this.buffer);
            }

            callback();

        } catch (error) {
            callback(error);
        }
    }
       processLine(line) {
                const trimmedLine = line.trim();

                if (!trimmedLine) {
                 return;
                }

                const values = this.parseCSVLine(trimmedLine);
                
                if (!this.headers) {
                    this.headers =  values.map((header) =>
                header.trim()
            );

            return;
        }

               // const values = trimmedLine.split(",");

                const row = {};

                this.headers.forEach((header, index) => {
            row[header] =
                values[index] !== undefined
                    ? values[index].trim()
                    : "";
        });
                this.push(row);
            }

            parseCSVLine(line) {
        const values = [];
        let currentValue = "";
        let insideQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const character = line[i];

            if (character === '"') {

                // Handle escaped quote: ""
                if (
                    insideQuotes &&
                    line[i + 1] === '"'
                ) {
                    currentValue += '"';
                    i++;
                    continue;
                }

                insideQuotes = !insideQuotes;
                continue;
            }

            if (
                character === "," &&
                !insideQuotes
            ) {
                values.push(currentValue);
                currentValue = "";
                continue;
            }

            currentValue += character;
        }

        values.push(currentValue);

        return values;
    }
}

module.exports = CSVParser;