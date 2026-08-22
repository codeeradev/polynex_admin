const ApiError = require('../utils/ApiError');

/**
 * Small, dependency-free request validator. Pass a map of
 * { field: (value, body) => errorMessage | null } and it 400s on the
 * first failure, or calls next(). Swap for zod/express-validator if
 * validation needs grow past this.
 */
function validate(rules) {
  return (req, res, next) => {
    for (const [field, check] of Object.entries(rules)) {
      const error = check(req.body[field], req.body);
      if (error) {
        return next(new ApiError(400, error));
      }
    }
    return next();
  };
}

const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;
const isEmail = (v) => isNonEmptyString(v) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

module.exports = { validate, isNonEmptyString, isEmail };
