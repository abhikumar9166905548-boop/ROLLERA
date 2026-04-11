const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');

// ✅ ALL CONTROLLERS IMPORT (IMPORTANT FIX)
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

  // 🔥 ADD THESE (jo neeche use ho rahe the)
  getSuggestions,
  toggleVerification,
  verifyOtp,
  resendOtp,
  googleLogin,
  adminGetUsers,
  adminDeleteUser,
  adminGetPosts,
  adminDeletePost,
  toggleCloseFriend,
  updateLocation,
  getNearbyUsers,
  adminCreateUser,
  adminUpdateUser,
  adminUpdateStatus,
  adminGetStats

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

// 🔐 AUTH
router.post('/signup', authLimiter,
  [
    body('name').trim().isLength({ min: 2 }),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
  ],
  validate, signup
);

router.post('/login', authLimiter,
  [
    body('email').isEmail(),
    body('password').notEmpty(),
  ],
  validate, login
);

router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

// 🔑 PASSWORD
router.post('/forgot-password', authLimiter,
  [body('email').isEmail()],
  validate, forgotPassword
);

router.put('/reset-password/:token',
  [body('password').isLength({ min: 6 })],
  validate, resetPassword
);

// 👥 USERS
router.get('/users', protect, searchUsers);
router.put('/follow/:id', protect, followUser);
router.get('/notifications', protect, getNotifications);
router.put('/profile/update', protect, updateProfile);
router.put('/posts/:id/save', protect, savePost);
router.get('/posts/saved', protect, getSavedPosts);
router.put('/block/:id', protect, blockUser);

// 🔥 FIXED ROUTES (NO require() INSIDE)
router.get('/suggestions', protect, getSuggestions);
router.put('/verify/:id', protect, toggleVerification);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);
router.post('/google', googleLogin);

router.get('/admin/users', protect, adminGetUsers);
router.delete('/admin/users/:id', protect, adminDeleteUser);
router.get('/admin/posts', protect, adminGetPosts);
router.delete('/admin/posts/:id', protect, adminDeletePost);

router.put('/close-friends/:id', protect, toggleCloseFriend);
router.put('/location', protect, updateLocation);
router.get('/nearby', protect, getNearbyUsers);

router.post('/admin/users', protect, adminCreateUser);
router.put('/admin/users/:id', protect, adminUpdateUser);
router.put('/admin/users/:id/status', protect, adminUpdateStatus);
router.get('/admin/stats', protect, adminGetStats);

// 🔥 TEMP FIX (taaki server crash na ho)
exports.getSuggestions = (req,res)=>res.json({msg:"ok"});
exports.toggleVerification = (req,res)=>res.json({msg:"ok"});
exports.verifyOtp = (req,res)=>res.json({msg:"ok"});
exports.resendOtp = (req,res)=>res.json({msg:"ok"});
exports.googleLogin = (req,res)=>res.json({msg:"ok"});
exports.adminGetUsers = (req,res)=>res.json({msg:"ok"});
exports.adminDeleteUser = (req,res)=>res.json({msg:"ok"});
exports.adminGetPosts = (req,res)=>res.json({msg:"ok"});
exports.adminDeletePost = (req,res)=>res.json({msg:"ok"});
exports.toggleCloseFriend = (req,res)=>res.json({msg:"ok"});
exports.updateLocation = (req,res)=>res.json({msg:"ok"});
exports.getNearbyUsers = (req,res)=>res.json({msg:"ok"});
exports.adminCreateUser = (req,res)=>res.json({msg:"ok"});
exports.adminUpdateUser = (req,res)=>res.json({msg:"ok"});
exports.adminUpdateStatus = (req,res)=>res.json({msg:"ok"});
exports.adminGetStats = (req,res)=>res.json({msg:"ok"});

module.exports = router;