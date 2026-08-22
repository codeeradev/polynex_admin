const express = require('express');
const { login, setPassword, getMe, logout } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { validate, isEmail, isNonEmptyString } = require('../middleware/validate');

const router = express.Router();

router.post(
  '/login',
  validate({
    email: (v) => (isEmail(v) ? null : 'A valid email is required'),
    password: (v) => (isNonEmptyString(v) ? null : 'Password is required'),
  }),
  login
);

router.post(
  '/set-password',
  validate({
    token: (v) => (isNonEmptyString(v) ? null : 'Token is required'),
    password: (v) =>
      isNonEmptyString(v) && v.length >= 8 ? null : 'Password must be at least 8 characters',
  }),
  setPassword
);

router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;
