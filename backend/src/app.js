const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { clientOrigin, nodeEnv } = require('./config/env');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// --- Core middleware -------------------------------------------------
app.use(helmet());
app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (nodeEnv !== 'test') {
  app.use(morgan(nodeEnv === 'production' ? 'combined' : 'dev'));
}

// --- Routes ------------------------------------------------------------
app.use('/api/v1', routes);

// --- 404 + error handling (must be last) --------------------------------
app.use(notFound);
app.use(errorHandler);

module.exports = app;
