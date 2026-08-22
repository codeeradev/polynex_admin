const express = require('express');

const router = express.Router();

/**
 * Root API router. Feature routers (elections, workers, leadership,
 * surveys, responses, booths, reports, announcements, settings) get
 * mounted here in later phases.
 */

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'PolynexAI Admin API is running' });
});

router.use('/auth', require('./auth.routes'));
router.use('/admins', require('./admin.routes'));
router.use('/elections', require('./election.routes'));
router.use('/dashboard', require('./dashboard.routes'));

module.exports = router;
