const Admin = require('../models/Admin');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { generateSetupToken } = require('../utils/token');
const { sendMail, buildSetPasswordEmail } = require('../utils/mailer');
const { clientOrigin } = require('../config/env');

/**
 * POST /api/v1/admins — SuperAdmin only.
 * Creates an "invited" (inactive) admin and emails a set-password link.
 * No password is ever set directly by another admin.
 */
const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, role, assignedRegion } = req.body;

  const existing = await Admin.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new ApiError(409, 'An admin with this email already exists');
  }

  const { rawToken, hashedToken } = generateSetupToken();

  const admin = await Admin.create({
    name,
    email: email.toLowerCase(),
    role,
    assignedRegion: role === 'RegionalAdmin' ? assignedRegion : null,
    status: 'invited',
    passwordSetupToken: hashedToken,
    passwordSetupExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    createdBy: req.admin._id,
  });

  const setupLink = `${clientOrigin}/set-password?token=${rawToken}`;
  const { subject, html } = buildSetPasswordEmail({ name: admin.name, link: setupLink });
  await sendMail({ to: admin.email, subject, html });

  res.status(201).json({
    success: true,
    message: 'Admin invited successfully',
    data: { admin: admin.toSafeJSON() },
  });
});

/**
 * GET /api/v1/admins — SuperAdmin only.
 * Backs the (future) Settings > Admins list.
 */
const listAdmins = asyncHandler(async (req, res) => {
  const admins = await Admin.find().sort({ createdAt: -1 });
  res.json({ success: true, data: { admins: admins.map((a) => a.toSafeJSON()) } });
});

module.exports = { createAdmin, listAdmins };
