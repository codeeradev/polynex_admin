/**
 * Seeds sample Booth/Worker/Survey/Response data so the Phase 3
 * dashboard has something real to aggregate — KPIs, region progress,
 * activity feed, and all three alert types should show non-empty
 * results after this runs.
 *
 * Requires at least one Election to already exist (run
 * seedElections.js first if you haven't). Safe to re-run — skips if
 * workers already exist for the target election.
 *
 * Usage (from backend/):
 *   node src/scripts/seedDashboardData.js
 */
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Election = require('../models/Election');
const Admin = require('../models/Admin');
const Booth = require('../models/Booth');
const Worker = require('../models/Worker');
const Survey = require('../models/Survey');
const Response = require('../models/Response');

const REGIONS = ['Ward 1', 'Ward 2', 'Ward 3'];
const DAY_MS = 24 * 60 * 60 * 1000;

async function seed() {
  await connectDB();

  try {
    const election = await Election.findOne({ status: 'active' });
    if (!election) {
      console.log('[seed] No active election found — run seedElections.js first.');
      return;
    }

    const existingWorkers = await Worker.countDocuments({ electionId: election._id });
    if (existingWorkers > 0) {
      console.log(`[seed] ${existingWorkers} worker(s) already exist for "${election.name}" — skipping.`);
      return;
    }

    const superAdmin = await Admin.findOne({ role: 'SuperAdmin' });
    const createdBy = superAdmin?._id || null;

    // ---- Booths: one per region ------------------------------------
    const booths = await Booth.insertMany(
      REGIONS.map((region, i) => ({
        electionId: election._id,
        name: `${region} Central Booth`,
        boothNumber: `B-${i + 1}`,
        region,
        status: 'active',
        createdBy,
      }))
    );

    // ---- Workers: 3 per region, mixed states for KPI/alert variety --
    const now = Date.now();
    const workerDocs = [];
    REGIONS.forEach((region, i) => {
      const booth = booths[i];
      workerDocs.push(
        {
          electionId: election._id,
          name: `${region} Worker A`,
          phone: `9000000${i}1`,
          region,
          boothId: booth._id,
          approvalStatus: 'approved',
          status: 'active',
          lastActiveAt: new Date(now - 1 * DAY_MS), // recently active
          createdBy,
        },
        {
          electionId: election._id,
          name: `${region} Worker B`,
          phone: `9000000${i}2`,
          region,
          boothId: booth._id,
          approvalStatus: 'approved',
          status: 'active',
          lastActiveAt: new Date(now - 5 * DAY_MS), // stale -> triggers inactive_worker alert
          createdBy,
        },
        {
          electionId: election._id,
          name: `${region} Worker C (new)`,
          phone: `9000000${i}3`,
          region,
          boothId: booth._id,
          approvalStatus: 'pending', // -> contributes to pendingApprovals KPI
          status: 'active',
          lastActiveAt: null,
          createdBy,
        }
      );
    });
    const workers = await Worker.insertMany(workerDocs);

    // ---- Survey: active, overdue -> triggers overdue_survey alert ---
    const survey = await Survey.create({
      electionId: election._id,
      title: 'Voter Sentiment Check-in',
      description: 'Door-to-door sentiment survey',
      questions: [
        { prompt: 'Is the voter aware of the polling location?', type: 'boolean', required: true },
        { prompt: 'Overall sentiment (1-5)', type: 'number', required: true },
      ],
      regionScope: [],
      status: 'active',
      dueDate: new Date(now - 2 * DAY_MS), // already past due
      createdBy,
    });

    // ---- Responses: today's submissions, spread across regions,
    // one with a failed sync -> triggers sync_failure alert -----------
    const approvedWorkers = workers.filter((w) => w.approvalStatus === 'approved');
    const responseDocs = approvedWorkers.map((worker, i) => ({
      electionId: election._id,
      surveyId: survey._id,
      workerId: worker._id,
      boothId: worker.boothId,
      region: worker.region,
      answers: [
        { questionId: survey.questions[0]._id, value: true },
        { questionId: survey.questions[1]._id, value: 4 },
      ],
      submittedAt: new Date(now - i * 60 * 60 * 1000), // staggered today
      syncStatus: i === 0 ? 'failed' : 'synced', // first one fails to sync
    }));
    await Response.insertMany(responseDocs);

    console.log('[seed] Done:');
    console.log(`  - ${booths.length} booths`);
    console.log(`  - ${workers.length} workers (${workers.filter((w) => w.approvalStatus === 'pending').length} pending approval)`);
    console.log(`  - 1 survey ("${survey.title}", overdue)`);
    console.log(`  - ${responseDocs.length} responses (1 sync failure)`);
  } catch (err) {
    console.error('[seed] Failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
