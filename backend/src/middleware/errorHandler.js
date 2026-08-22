/**
 * Central error-handling middleware. Every controller can just
 * `next(err)` and let this format the response consistently, instead
 * of each route hand-rolling its own try/catch response shape.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.statusCode || 500;
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(isProd ? {} : { stack: err.stack }),
  });
}

function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

module.exports = { errorHandler, notFound };
