/**
 * Thrown from anywhere in the request lifecycle; caught centrally by
 * middleware/errorHandler.js so controllers never hand-format error
 * responses themselves.
 */
class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
