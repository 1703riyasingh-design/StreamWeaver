const { Transform } = require("stream");
const ivm = require("isolated-vm");

class DataTransformStream extends Transform {
  constructor(options = {}) {
    super({
      ...options,
      objectMode: true,
    });

    this.processedRows = 0;

    this.transformCode =
      options.transformCode || null;

    this.isolate = null;
    this.context = null;
    this.transformFunction = null;
  }

  // ========================================
  // INITIALIZE SECURE SANDBOX
  // ========================================

  async initializeSandbox() {
    if (!this.transformCode) {
      return;
    }

    this.isolate = new ivm.Isolate({
      memoryLimit: 128,
    });

    this.context =
      await this.isolate.createContext();

    const jail =
      this.context.global;

    await jail.set(
      "global",
      jail.derefInto()
    );

    const wrappedCode = `
      function transformRow(row) {
        ${this.transformCode}
      }
    `;

    const script =
      await this.isolate.compileScript(
        wrappedCode
      );

    await script.run(
      this.context
    );

    this.transformFunction =
      await this.context.global.get(
        "transformRow",
        {
          reference: true,
        }
      );
  }

  // ========================================
  // TRANSFORM ROW
  // ========================================

  async _transform(
    row,
    encoding,
    callback
  ) {
    try {
      let transformedRow = {
        ...row,
      };

      // No custom transformation
      if (!this.transformCode) {
        this.processedRows++;

        this.push(
          transformedRow
        );

        return callback();
      }

      // Initialize sandbox only once
      if (!this.context) {
        await this.initializeSandbox();
      }

      // Execute transformation safely
      const result =
        await this.transformFunction.apply(
          undefined,
          [
            new ivm.ExternalCopy(
              transformedRow
            ).copyInto(),
          ],
          {
            result: {
              copy: true,
            },

            timeout: 1000,
          }
        );

      // Make sure transformation returns an object
      if (
        !result ||
        typeof result !== "object" ||
        Array.isArray(result)
      ) {
        throw new Error(
          "Transformation must return a valid row object."
        );
      }

      transformedRow = result;

      this.processedRows++;

      this.push(
        transformedRow
      );

      callback();

    } catch (error) {
      callback(error);
    }
  }

  // ========================================
  // CLEANUP SANDBOX
  // ========================================

  async _flush(callback) {
    try {
      if (this.isolate) {
        this.isolate.dispose();
      }

      callback();

    } catch (error) {
      callback(error);
    }
  }
}

module.exports =
  DataTransformStream;