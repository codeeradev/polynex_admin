const app = require('./app');
const connectDB = require('./config/db');
const { port } = require('./config/env');

(async function start() {
  await connectDB();

  const server = app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] PolynexAI Admin API listening on port ${port}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => server.close());
  process.on('SIGINT', () => server.close());
})();
