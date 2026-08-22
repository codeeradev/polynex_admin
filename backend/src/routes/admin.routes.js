const express = require('express');
const Admin = require('../models/Admin');
const { createAdmin, listAdmins } = require('../controllers/admin.controller');
const { protect } = require('../middleware/auth.middleware');
const { allowRoles } = require('../middleware/role.middleware');
const { validate, isEmail, isNonEmptyString } = require('../middleware/validate');

const router = express.Router();

// Every route below requires a logged-in SuperAdmin.
router.use(protect, allowRoles('SuperAdmin'));

router.post(
  '/',
  validate({
    name: (v) => (isNonEmptyString(v) ? null : 'Name is required'),
    email: (v) => (isEmail(v) ? null : 'A valid email is required'),
    role: (v) => (Admin.ROLES.includes(v) ? null : `Role must be one of: ${Admin.ROLES.join(', ')}`),
    assignedRegion: (v, body) =>
      body.role === 'RegionalAdmin' && !isNonEmptyString(v)
        ? 'assignedRegion is required for RegionalAdmin accounts'
        : null,
  }),
  createAdmin
);

router.get('/', listAdmins);

module.exports = router;
