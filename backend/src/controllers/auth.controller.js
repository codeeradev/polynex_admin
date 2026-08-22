const Admin = require('../models/Admin');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { signAuthToken, hashToken } = require('../utils/token');

/**
 * POST /api/v1/auth/login
 * Email + password login for Admin only (Worker/Leadership use mobile
 * OTP in a separate app — intentionally different auth surface).
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!admin) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (admin.status !== 'active') {
    throw new ApiError(
      403,
      'This account is not active yet. Check your invite email or contact a Super Admin.'
    );
  }

  const isMatch = await admin.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  admin.lastLoginAt = new Date();
  await admin.save();

  const token = signAuthToken(admin);

  res.json({
    success: true,
    data: { token, user: admin.toSafeJSON() },
  });
});

/**
 * POST /api/v1/auth/set-password
 * Consumes the invite-link token emailed by POST /admins and activates
 * the account. Also used for the very first login after any future
 * "reset password" flow, if that reuses the same token shape.
 */
const setPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  const hashedToken = hashToken(token);

  const admin = await Admin.findOne({
    passwordSetupToken: hashedToken,
    passwordSetupExpires: { $gt: new Date() },
  }).select('+passwordSetupToken +passwordSetupExpires');

  if (!admin) {
    throw new ApiError(400, 'This link is invalid or has expired. Ask a Super Admin to resend the invite.');
  }

  await admin.setPassword(password);
  admin.status = 'active';
  admin.passwordSetupToken = undefined;
  admin.passwordSetupExpires = undefined;
  await admin.save();

  const authToken = signAuthToken(admin);

  res.json({
    success: true,
    message: 'Password set successfully',
    data: { token: authToken, user: admin.toSafeJSON() },
  });
});

/**
 * GET /api/v1/auth/me
 * Lets the frontend rehydrate the auth store after a page refresh,
 * using only the token already in localStorage.
 */
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.user } });
});

/**
 * POST /api/v1/auth/logout
 * JWTs are stateless, so there's nothing to invalidate server-side.
 * This endpoint exists for a consistent API surface and gives a place
 * to hang a token-blacklist later if that's ever needed.
 */
const logout = asyncHandler(async (req, res) => {
  res.json({ success: true, message: 'Logged out' });
});

module.exports = { login, setPassword, getMe, logout };
