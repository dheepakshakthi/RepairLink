const express = require('express');
const router = express.Router();

const {
  register,
  login,
  refreshToken,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  changePassword
} = require('./auth.controller');

const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema
} = require('./auth.validators');

const validate = require('../../middleware/validate');
const authenticate = require('../../middleware/authenticate');
const { authLimiter } = require('../../middleware/rateLimiter');

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logout);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/me', authenticate, getMe);
router.put('/me', authenticate, validate(updateProfileSchema), updateProfile);
router.put('/me/password', authenticate, validate(changePasswordSchema), changePassword);

module.exports = router;
