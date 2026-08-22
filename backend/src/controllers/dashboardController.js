const Worker = require('../models/Worker');
const Booth = require('../models/Booth');
const Survey = require('../models/Survey');
const Response = require('../models/Response');
const Admin = require('../models/Admin');

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// GET /api/v1/dashboard/kpis
// Requires requireElectionScope — req.electionId is set by that middleware.
exports.getKpis = async (req, res, next) => {
  try {
    const { electionId } = req;
    const today = startOfToday();

    const [totalWorkers, workersWithSubmission, surveysCompletedToday, activeBooths, pendingApprovals] =
      await Promise.all([
        Worker.countDocuments({ electionId, status: 'active' }),
        Response.distinct('workerId', { electionId }).then((ids) => ids.length),
        Response.countDocuments({ electionId, submittedAt: { $gte: today } }),
        Booth.countDocuments({ electionId, status: 'active' }),
        Worker.countDocuments({ electionId, approvalStatus: 'pending' }),
      ]);

    // Definition used here: % of active workers who have submitted at
    // least one response, for this election, ever (not just today).
    // Adjust the numerator/denominator if "completion" should mean
    // something more specific (e.g. per-survey completion).
    const completionPercent = totalWorkers === 0 ? 0 : Math.round((workersWithSubmission / totalWorkers) * 100);

    res.json({
      totalWorkers,
      surveysCompletedToday,
      completionPercent,
      activeBooths,
      pendingApprovals,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/dashboard/region-progress
exports.getRegionProgress = async (req, res, next) => {
  try {
    const { electionId } = req;

    const [workerCounts, responseCounts] = await Promise.all([
      Worker.aggregate([
        { $match: { electionId } },
        { $group: { _id: '$region', totalWorkers: { $sum: 1 } } },
      ]),
      Response.aggregate([
        { $match: { electionId } },
        { $group: { _id: '$region', distinctWorkers: { $addToSet: '$workerId' } } },
      ]),
    ]);

    const responseMap = new Map(
      responseCounts.map((r) => [r._id, r.distinctWorkers.length])
    );

    const regions = workerCounts.map((w) => {
      const surveysCompleted = responseMap.get(w._id) || 0;
      const completionPercent = w.totalWorkers === 0 ? 0 : Math.round((surveysCompleted / w.totalWorkers) * 100);
      return {
        region: w._id,
        totalWorkers: w.totalWorkers,
        surveysCompleted,
        completionPercent,
      };
    });

    regions.sort((a, b) => b.completionPercent - a.completionPercent);
    res.json(regions);
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/dashboard/activity?limit=20
// No dedicated ActivityLog model yet — this merges two existing signals
// (recent survey submissions, recent admin logins) and sorts them. If
// the activity feed needs to cover more event types later (worker
// added, admin invited, etc.), replace this with a proper ActivityLog
// collection that gets written to at each of those action points.
exports.getActivity = async (req, res, next) => {
  try {
    const { electionId } = req;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

    const [recentResponses, recentLogins] = await Promise.all([
      Response.find({ electionId })
        .sort({ submittedAt: -1 })
        .limit(limit)
        .populate('workerId', 'name')
        .populate('surveyId', 'title'),
      Admin.find({ lastLoginAt: { $ne: null } })
        .sort({ lastLoginAt: -1 })
        .limit(limit)
        .select('name lastLoginAt'),
    ]);

    const submissionEvents = recentResponses.map((r) => ({
      id: `response:${r._id}`,
      type: 'survey_submitted',
      actor: r.workerId?.name || 'Unknown worker',
      description: `Submitted "${r.surveyId?.title || 'a survey'}"`,
      timestamp: r.submittedAt,
    }));

    const loginEvents = recentLogins.map((a) => ({
      id: `login:${a._id}:${a.lastLoginAt.getTime()}`,
      type: 'login',
      actor: a.name,
      description: 'Logged in',
      timestamp: a.lastLoginAt,
    }));

    const activity = [...submissionEvents, ...loginEvents]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

    res.json(activity);
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/dashboard/alerts
// Each alert type is its own small query with its own threshold —
// these are business rules, not schema fields, so they live here
// rather than being precomputed and stored.
const INACTIVE_WORKER_DAYS = 3;

exports.getAlerts = async (req, res, next) => {
  try {
    const { electionId } = req;
    const inactiveCutoff = new Date(Date.now() - INACTIVE_WORKER_DAYS * 24 * 60 * 60 * 1000);
    const now = new Date();

    const [inactiveWorkers, overdueSurveys, syncFailures] = await Promise.all([
      Worker.find({
        electionId,
        status: 'active',
        $or: [{ lastActiveAt: { $lt: inactiveCutoff } }, { lastActiveAt: null }],
      })
        .select('name region lastActiveAt')
        .limit(50),

      Survey.find({ electionId, status: 'active', dueDate: { $lt: now } }).select('title dueDate'),

      Response.find({ electionId, syncStatus: 'failed' })
        .select('workerId surveyId submittedAt')
        .populate('workerId', 'name')
        .limit(50),
    ]);

    const alerts = [
      ...inactiveWorkers.map((w) => ({
        id: `inactive_worker:${w._id}`,
        type: 'inactive_worker',
        severity: 'warning',
        message: `${w.name} (${w.region}) has had no activity in ${INACTIVE_WORKER_DAYS}+ days`,
        relatedId: w._id,
      })),
      ...overdueSurveys.map((s) => ({
        id: `overdue_survey:${s._id}`,
        type: 'overdue_survey',
        severity: 'critical',
        message: `"${s.title}" is past its due date (${s.dueDate.toDateString()})`,
        relatedId: s._id,
      })),
      ...syncFailures.map((r) => ({
        id: `sync_failure:${r._id}`,
        type: 'sync_failure',
        severity: 'critical',
        message: `Response from ${r.workerId?.name || 'a worker'} failed to sync`,
        relatedId: r._id,
      })),
    ];

    res.json(alerts);
  } catch (err) {
    next(err);
  }
};
