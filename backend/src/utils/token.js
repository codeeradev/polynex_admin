const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { jwtSecret, jwtExpiresIn } = require('../config/env');

/** Issues the session JWT returned on login / set-password. */
function signAuthToken(admin) {
  return jwt.sign({ sub: admin._id.toString(), role: admin.role }, jwtSecret, {
    expiresIn: jwtExpiresIn,
  });
}

/**
 * Generates a one-time set-password token. The raw value goes in the
 * email link; only its SHA-256 hash is stored in Mongo — same pattern
 * as a password reset token, so a DB read alone can't produce a valid
 * link.
 */
function generateSetupToken() {
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = hashToken(rawToken);
  return { rawToken, hashedToken };
}

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

module.exports = { signAuthToken, generateSetupToken, hashToken };
