/**
 * Error thrown when an Umi‑Time string cannot be parsed into a valid representation.
 */
export class ParseError extends Error {
  /**
   * Creates a new `ParseError` instance.
   *
   * @param message - Human-readable description of the parsing failure.
   */
  constructor(message: string) {
    super(message);
    this.name = "ParseError";
  }
}

/**
 * Base error thrown for invalid Umi‑Time operations, ranges, or arguments.
 */
export class UmiTimeError extends Error {
  /**
   * Creates a new `UmiTimeError` instance.
   *
   * @param message - Human-readable description of the Umi‑Time error.
   */
  constructor(message: string) {
    super(message);
    this.name = "UmiTimeError";
  }
}
