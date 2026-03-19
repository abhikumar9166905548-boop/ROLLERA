const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// Helper: Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Helper: Send token response
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = generateToken(user._id);
  res.status(statusCode).json({
    success: true,
    message,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

// ─────────────────────────────────────────────
// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
// ─────────────────────────────────────────────
exports.signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    sendTokenResponse(user, 201, res, 'Account created successfully');
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
// ─────────────────────────────────────────────
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// @route   GET /api/auth/me
// @desc    Get logged in user
// @access  Private
// ─────────────────────────────────────────────
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────
// @route   POST /api/auth/logout
// @desc    Logout (client just deletes token; this confirms)
// @access  Private
// ─────────────────────────────────────────────
exports.logout = async (req, res) => {
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// ─────────────────────────────────────────────
// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
// ─────────────────────────────────────────────
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ success: false, message: 'No account found with that email' });
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #eee; border-radius: 8px;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Hi <strong>${user.name}</strong>,</p>
        <p>You requested to reset your password. Click the button below to set a new password:</p>
        <a href="${resetUrl}" style="display:inline-block; background:#4F46E5; color:#fff; padding:12px 24px; border-radius:6px; text-decoration:none; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color:#888; font-size:13px;">This link will expire in <strong>15 minutes</strong>. If you did not request this, please ignore this email.</p>
        <hr style="border:none; border-top:1px solid #eee; margin-top:30px;" />
        <p style="color:#aaa; font-size:12px;">If the button doesn't work, copy this link: ${resetUrl}</p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request',
      html,
    });

    res.status(200).json({ success: true, message: 'Password reset email sent' });
  } catch (err) {
    // Clean up tokens if email fails
    if (req.body.email) {
      const user = await User.findOne({ email: req.body.email });
      if (user) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
      }
    }
    next(err);
  }
};

// ─────────────────────────────────────────────
// @route   PUT /api/auth/reset-password/:token
// @desc    Reset password using token
// @access  Public
// ─────────────────────────────────────────────
exports.resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res, 'Password reset successful');
  } catch (err) {
    next(err);
  }
};
// ─────────────────────────────────────────────
// @route   GET /api/auth/users?q=search
// @desc    Search users
// @access  Private
// ─────────────────────────────────────────────
exports.searchUsers = async (req, res, next) => {
  try {
    const query = req.query.q;
    if (!query) return res.status(400).json({ success: false, message: 'Query required' });
    const users = await User.find({
      name: { $regex: query, $options: 'i' }
    }).select('name email').limit(10);
    res.status(200).json({ success: true, users });
  } catch (err) {
    next(err);
  }
};
// ─────────────────────────────────────────────
// @route   PUT /api/auth/follow/:id
// @desc    Follow / Unfollow user
// @access  Private
// ─────────────────────────────────────────────
exports.followUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id)
      return res.status(400).json({ success: false, message: 'Aap khud ko follow nahi kar sakte' });

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) return res.status(404).json({ success: false, message: 'User not found' });

    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(req.user.id, { $pull: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user.id } });
      res.status(200).json({ success: true, following: false, message: 'Unfollow ho gaya' });
    } else {
      // Follow
      await User.findByIdAndUpdate(req.user.id, { $push: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id, { $push: { followers: req.user.id } });
      // Notification
      await User.findByIdAndUpdate(req.params.id, {
        $push: {
          notifications: {
            type: 'follow',
            from: req.user.id,
            message: `${req.user.name} ne aapko follow kiya`,
          }
        }
      });
      res.status(200).json({ success: true, following: true, message: 'Follow ho gaya' });
    }
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────
// @route   GET /api/auth/notifications
// @desc    Get notifications
// @access  Private
// ─────────────────────────────────────────────
exports.getNotifications = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('notifications.from', 'name');
    const notifications = user.notifications.sort((a, b) => b.createdAt - a.createdAt);
    // Mark all as read
    await User.findByIdAndUpdate(req.user.id, {
      $set: { 'notifications.$[].read': true }
    });
    res.status(200).json({ success: true, notifications });
  } catch (err) { next(err); }
};
// ─────────────────────────────────────────────
// @route   PUT /api/auth/profile/update
// @desc    Update bio and profile photo
// @access  Private
// ─────────────────────────────────────────────
exports.updateProfile = async (req, res, next) => {
  try {
    const { bio, profilePhoto } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { bio, profilePhoto },
      { new: true }
    );
    res.status(200).json({ success: true, user });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────
// @route   PUT /api/auth/posts/:id/save
// @desc    Save / Unsave post
// @access  Private
// ─────────────────────────────────────────────
exports.savePost = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const postId = req.params.id;
    const saved = user.savedPosts.includes(postId);
    if (saved) {
      user.savedPosts = user.savedPosts.filter(id => id.toString() !== postId);
    } else {
      user.savedPosts.push(postId);
    }
    await user.save();
    res.status(200).json({ success: true, saved: !saved });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────
// @route   GET /api/auth/posts/saved
// @desc    Get saved posts
// @access  Private
// ─────────────────────────────────────────────
exports.getSavedPosts = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedPosts',
      populate: { path: 'user', select: 'name' }
    });
    res.status(200).json({ success: true, posts: user.savedPosts });
  } catch (err) { next(err); }
};