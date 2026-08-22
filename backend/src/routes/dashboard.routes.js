const express = require('express');
const router = express.Router();

const { getKpis, getRegionProgress, getActivity, getAlerts } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth.middleware');
const { requireElectionScope } = require('../middleware/electionScope');

// Both roles can view the dashboard, scoped to whatever election is
// selected in the top-nav switcher — unlike Elections/Admins management,
// this isn't SuperAdmin-only.
router.get('/kpis', protect, requireElectionScope, getKpis);
router.get('/region-progress', protect, requireElectionScope, getRegionProgress);
router.get('/activity', protect, requireElectionScope, getActivity);
router.get('/alerts', protect, requireElectionScope, getAlerts);

module.exports = router;
