const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

const {
  signup,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
} = require('../controllers/auth.controller');

const { protect } = require('../middleware/auth.middleware');

// Rate limiter for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { success: false, message: 'Too many requests, please try again after 15 minutes' },
});

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  next();
};

// ── Routes ──────────────────────────────────────────

// POST /api/auth/signup
router.post(
  '/signup',
  authLimiter,
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate,
  signup
);

// POST /api/auth/login
router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  login
);

// GET /api/auth/me  (protected)
router.get('/me', protect, getMe);

// POST /api/auth/logout  (protected)
router.post('/logout', protect, logout);

// POST /api/auth/forgot-password
router.post(
  '/forgot-password',
  authLimiter,
  [body('email').isEmail().withMessage('Enter a valid email')],
  validate,
  forgotPassword
);

// PUT /api/auth/reset-password/:token
router.put(
  '/reset-password/:token',
  [body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')],
  validate,
  resetPassword
);

module.exports = router;
