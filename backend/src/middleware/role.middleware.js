const ApiError = require('../utils/ApiError');

/**
 * Role guard. Must run after `protect` (needs req.admin).
 *
 * Usage:
 *   router.post('/admins', protect, allowRoles('SuperAdmin'), createAdmin);
 */
function allowRoles(...roles) {
  return (req, res, next) => {
    if (!req.admin) {
      return next(new ApiError(401, 'Not authenticated'));
    }
    if (!roles.includes(req.admin.role)) {
      return next(new ApiError(403, 'You do not have permission to perform this action'));
    }
    return next();
  };
}

module.exports = { allowRoles };
