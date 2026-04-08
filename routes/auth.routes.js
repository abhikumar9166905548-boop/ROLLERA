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
  searchUsers,
  followUser,
  getNotifications,
  updateProfile,
  savePost,
  getSavedPosts,
  blockUser,
} = require('../controllers/auth.controller');

const { protect } = require('../middleware/auth.middleware');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many requests, please try again after 15 minutes' },
});

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  next();
};

router.post('/signup', authLimiter,
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  validate, signup
);

router.post('/login', authLimiter,
  [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate, login
);

router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

router.post('/forgot-password', authLimiter,
  [body('email').isEmail().withMessage('Enter a valid email')],
  validate, forgotPassword
);

router.put('/reset-password/:token',
  [body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')],
  validate, resetPassword
);

router.get('/users', protect, searchUsers);
router.put('/follow/:id', protect, followUser);
router.get('/notifications', protect, getNotifications);
router.put('/profile/update', protect, updateProfile);
router.put('/posts/:id/save', protect, savePost);
router.get('/posts/saved', protect, getSavedPosts);
router.put('/block/:id', protect, blockUser);
router.get('/suggestions', protect, require('../controllers/auth.controller').getSuggestions);
router.put('/verify/:id', protect, require('../controllers/auth.controller').toggleVerification);
router.post('/verify-otp', require('../controllers/auth.controller').verifyOtp);
router.post('/resend-otp', require('../controllers/auth.controller').resendOtp);
router.post('/google', require('../controllers/auth.controller').googleLogin);
router.get('/admin/users', protect, require('../controllers/auth.controller').adminGetUsers);
router.delete('/admin/users/:id', protect, require('../controllers/auth.controller').adminDeleteUser);
router.get('/admin/posts', protect, require('../controllers/auth.controller').adminGetPosts);
router.delete('/admin/posts/:id', protect, require('../controllers/auth.controller').adminDeletePost);
router.put('/close-friends/:id', protect, require('../controllers/auth.controller').toggleCloseFriend);
router.put('/location', protect, require('../controllers/auth.controller').updateLocation);
router.get('/nearby', protect, require('../controllers/auth.controller').getNearbyUsers);
router.post('/admin/users',           protect, require('../controllers/auth.controller').adminCreateUser);
router.put('/admin/users/:id',        protect, require('../controllers/auth.controller').adminUpdateUser);
router.put('/admin/users/:id/status', protect, require('../controllers/auth.controller').adminUpdateStatus);
router.get('/admin/stats',            protect, require('../controllers/auth.controller').adminGetStats);
module.exports = router;