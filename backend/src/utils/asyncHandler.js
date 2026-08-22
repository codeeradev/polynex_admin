/**
 * Wraps an async route handler so a rejected promise / thrown error is
 * forwarded to Express's error middleware, instead of every controller
 * repeating its own try/catch.
 *
 * Usage: router.post('/x', asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
