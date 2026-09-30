export class AppError extends Error {
  /**
   * @param {string} message - User-friendly error message
   * @param {number} statusCode - HTTP status code
   * @param {string} code - Machine-readable error code
   * @param {any} [details] - Optional extra error details
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}
