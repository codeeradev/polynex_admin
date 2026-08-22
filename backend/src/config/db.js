const mongoose = require('mongoose');
const { mongoUri } = require('./env');

/**
 * Connects to MongoDB. Called once from server.js on boot.
 * Later phases (Election scoping, Worker, Survey models, etc.) will
 * register their schemas against this same connection.
 */
async function connectDB() {
  mongoose.set('strictQuery', true);

  try {
    const conn = await mongoose.connect(mongoUri);
    // eslint-disable-next-line no-console
    console.log(`[db] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[db] MongoDB connection failed:', err.message);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    // eslint-disable-next-line no-console
    console.warn('[db] MongoDB disconnected');
  });
}

module.exports = connectDB;
