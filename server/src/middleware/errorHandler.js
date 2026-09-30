import { logger } from '../logger.js';
import { AppError } from '../utils/AppError.js';

export function errorHandler(err, req, res, next) {
  // Log unexpected errors
  if (!(err instanceof AppError)) {
    logger.error({ err, path: req.path, method: req.method }, 'Unhandled internal server error');
  } else {
    logger.warn({ code: err.code, message: err.message, path: req.path }, 'Client handled error');
  }

  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  // User-facing clear plain language message
  const message = err.message && statusCode < 500
    ? err.message
    : 'Something went wrong on our end. Please try again in a moment.';

  res.status(statusCode).json({
    success: false,
    code,
    message,
    details: err.details || null
  });
}
