const { Transform } = require("stream");
const ivm = require("isolated-vm");

class DataTransformStream extends Transform {
  constructor(options = {}) {
    super({
      ...options,
      objectMode: true,
    });

    this.processedRows = 0;

    // Empty / whitespace transformation ko disable rakho
    this.transformCode =
      typeof options.transformCode === "string" &&
      options.transformCode.trim()
        ? options.transformCode.trim()
        : null;

    this.isolate = null;
    this.context = null;
    this.transformFunction = null;
  }

  // ========================================
  // INITIALIZE SECURE SANDBOX
  // ========================================

  async initializeSandbox() {
    // No transformation
    if (!this.transformCode) {
      return;
    }

    try {
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

      /*
       * IMPORTANT:
       * User code is added using string concatenation,
       * NOT a template literal.
       *
       * This prevents user backticks (`) from
       * breaking the sandbox wrapper.
       */
      const wrappedCode =
        "function transformRow(row) {\n" +
        this.transformCode +
        "\n}";

      console.log(
        "Initializing transformation sandbox..."
      );

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

      if (!this.transformFunction) {
        throw new Error(
          "Transformation function could not be initialized."
        );
      }

      console.log(
        "Transformation sandbox initialized successfully."
      );

    } catch (error) {
      // Important:
      // Failed initialization ko clean karo
      if (this.isolate) {
        try {
          this.isolate.dispose();
        } catch (_) {
          // Ignore cleanup error
        }
      }

      this.isolate = null;
      this.context = null;
      this.transformFunction = null;

      throw new Error(
        `Transformation code error: ${error.message}`
      );
    }
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

      // ========================================
      // NO CUSTOM TRANSFORMATION
      // ========================================

      if (!this.transformCode) {
        this.processedRows++;

        this.push(
          transformedRow
        );

        return callback();
      }

      // ========================================
      // INITIALIZE SANDBOX
      // ========================================

      if (
        !this.context ||
        !this.transformFunction
      ) {
        await this.initializeSandbox();
      }

      // Safety check
      if (!this.transformFunction) {
        throw new Error(
          "Transformation function is not available."
        );
      }

      // ========================================
      // EXECUTE TRANSFORMATION
      // ========================================

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

      // ========================================
      // VALIDATE RESULT
      // ========================================

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

      this.isolate = null;
      this.context = null;
      this.transformFunction = null;

      callback();

    } catch (error) {
      callback(error);
    }
  }
}

module.exports =
  DataTransformStream;