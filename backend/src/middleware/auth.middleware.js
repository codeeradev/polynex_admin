const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { jwtSecret } = require('../config/env');

/**
 * Verifies the Bearer JWT, loads the admin, and attaches it to the
 * request. Any route behind this can trust req.admin / req.user.
 *
 * Expired/invalid tokens map to 401 here — the frontend's axios
 * interceptor treats any 401 as "session ended" and forces a logout,
 * which is the auto-logout behavior end to end.
 */
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw new ApiError(401, 'Not authenticated');
  }

  let payload;
  try {
    payload = jwt.verify(token, jwtSecret);
  } catch (err) {
    const message =
      err.name === 'TokenExpiredError' ? 'Session expired, please log in again' : 'Invalid token';
    throw new ApiError(401, message);
  }

  const admin = await Admin.findById(payload.sub);
  if (!admin || admin.status !== 'active') {
    throw new ApiError(401, 'Account not found or inactive');
  }

  req.admin = admin; // full Mongoose doc, for role checks / writes
  req.user = admin.toSafeJSON(); // safe shape, for responses
  next();
});

/**
 * Role gate — use AFTER `protect`, since it reads req.admin.role.
 * Usage: router.post('/', protect, restrictTo('SuperAdmin'), createX);
 * Takes one or more allowed roles; 403s if req.admin.role isn't among them.
 */
const restrictTo = (...allowedRoles) => (req, res, next) => {
  if (!req.admin) {
    // Programmer error — restrictTo used without protect running first.
    throw new ApiError(500, 'restrictTo used without protect middleware');
  }
  if (!allowedRoles.includes(req.admin.role)) {
    throw new ApiError(403, 'You do not have permission to perform this action');
  }
  next();
};

module.exports = { protect, restrictTo };
