/**
 * One-off script to seed sample elections so the Elections page has
 * something to show. Safe to re-run — skips creating anything if
 * elections already exist, so it won't duplicate data on a second run.
 *
 * Usage (from backend/):
 *   node src/scripts/seedElections.js
 */
const connectDB = require('../config/db');
const mongoose = require('mongoose');
const Election = require('../models/Election');
const Admin = require('../models/Admin');

const SAMPLE_ELECTIONS = [
  {
    name: '2026 General Election',
    startDate: new Date('2026-11-03'),
    endDate: new Date('2026-11-03'),
    regionScope: [], // empty = all regions
    status: 'active',
  },
  {
    name: '2024 Municipal Election',
    startDate: new Date('2024-04-15'),
    endDate: new Date('2024-04-15'),
    regionScope: ['Ward 3', 'Ward 7'],
    status: 'archived',
  },
];

async function seed() {
  await connectDB();

  try {
    const existingCount = await Election.countDocuments();
    if (existingCount > 0) {
      console.log(`[seed] ${existingCount} election(s) already exist — skipping seed.`);
      return;
    }

    // Attribute the seeded elections to a real SuperAdmin if one exists,
    // so createdBy isn't left dangling. Falls back to null (schema
    // allows it) if no admin has been created yet either.
    const superAdmin = await Admin.findOne({ role: 'SuperAdmin' });
    if (!superAdmin) {
      console.log('[seed] No SuperAdmin found yet — seeding elections with createdBy: null.');
    }

    const docs = SAMPLE_ELECTIONS.map((e) => ({
      ...e,
      createdBy: superAdmin?._id || null,
    }));

    const created = await Election.insertMany(docs);
    console.log(`[seed] Created ${created.length} election(s):`);
    created.forEach((e) => console.log(`  - ${e.name} (${e.status})`));
  } catch (err) {
    console.error('[seed] Failed:', err);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
