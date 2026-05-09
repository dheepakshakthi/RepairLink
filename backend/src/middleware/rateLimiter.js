const rateLimit = require('express-rate-limit');

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Too many uploads from this IP, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  globalLimiter,
  authLimiter,
  uploadLimiter
};
