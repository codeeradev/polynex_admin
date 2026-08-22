require('dotenv').config();

/**
 * Centralized, validated access to environment variables.
 * Fail fast on boot if something required is missing, rather than
 * surfacing a confusing error deep inside a request handler later.
 */
const required = ['MONGO_URI', 'JWT_SECRET'];

for (const key of required) {
  if (!process.env[key]) {
    // eslint-disable-next-line no-console
    console.error(`[config] Missing required env var: ${key}`);
    process.exit(1);
  }
}

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
};
