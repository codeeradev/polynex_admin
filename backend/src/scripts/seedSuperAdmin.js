require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Admin = require('../models/Admin');

/**
 * One-off bootstrap script. The Admin-creation API is SuperAdmin-only,
 * which means the very first SuperAdmin can't be created through the
 * API — this script creates that first, already-active account
 * directly against the database.
 *
 * Run once:
 *   SEED_ADMIN_EMAIL=you@polynexai.com SEED_ADMIN_PASSWORD=xxxxxxxx \
 *     node src/scripts/seedSuperAdmin.js
 */
async function run() {
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME || 'Super Admin';

  if (!email || !password) {
    // eslint-disable-next-line no-console
    console.error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD before running this script.');
    process.exit(1);
  }

  await connectDB();

  const existing = await Admin.findOne({ email: email.toLowerCase() });
  if (existing) {
    // eslint-disable-next-line no-console
    console.log(`Admin ${email} already exists — nothing to do.`);
    await mongoose.disconnect();
    return;
  }

  const admin = new Admin({ name, email: email.toLowerCase(), role: 'SuperAdmin', status: 'active' });
  await admin.setPassword(password);
  await admin.save();

  // eslint-disable-next-line no-console
  console.log(`SuperAdmin created: ${admin.email}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
