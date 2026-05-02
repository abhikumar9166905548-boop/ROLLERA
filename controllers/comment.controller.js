const Comment = require('../models/Comment.model');
const Post = require('../models/Post.model');
const User = require('../models/User.model');

// 🔥 ADD COMMENT / REPLY (POST + REEL + REAL-TIME)
exports.addComment = async (req, res, next) => {
  try {
    const io = req.app.get("io");

    const { content, reelId, parentCommentId } = req.body;

    if (!content)
      return res.status(400).json({ success: false, message: 'Content required' });

    // ✅ SAFETY CHECK
    if (!req.params.postId && !reelId) {
      return res.status(400).json({
        success: false,
        message: "PostId ya ReelId required hai"
      });
    }

    let post = null;

    // ✅ POST CHECK
    if (req.params.postId) {
      post = await Post.findById(req.params.postId);
      if (!post)
        return res.status(404).json({ success: false, message: 'Post not found' });
    }

    // ✅ CREATE COMMENT
    const comment = await Comment.create({
      post: req.params.postId || null,
      reel: reelId || null,
      user: req.user.id,
      content,
      parentComment: parentCommentId || null,
    });

    await comment.populate('user', 'name profilePic');

    // 🔁 REPLY COUNT UPDATE
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $inc: { repliesCount: 1 },
      });
    }

    // 🔔 NOTIFICATION
    if (post && post.user?.toString() !== req.user.id) {
      await User.findByIdAndUpdate(post.user, {
        $push: {
          notifications: {
            type: 'comment',
            from: req.user.id,
            post: post._id,
            message: `${req.user.name} ne aapke post pe comment kiya`,
          },
        },
      });
    }

    // 🔥 ROOM TARGET
    const roomId = reelId || req.params.postId;

    // 🔥 DIFFERENT EVENT (comment vs reply)
    if (parentCommentId) {
      io.to(roomId.toString()).emit("newReply", comment);
    } else {
      io.to(roomId.toString()).emit("newComment", comment);
    }

    res.status(201).json({ success: true, comment });

  } catch (err) {
    console.log(err);
    next(err);
  }
};


// 🔥 GET COMMENTS (POST)
exports.getComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({
      post: req.params.postId,
      parentComment: null,
    })
      .populate('user', 'name profilePic')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, comments });

  } catch (err) {
    next(err);
  }
};


// 🔥 GET COMMENTS (REEL)
exports.getReelComments = async (req, res, next) => {
  try {
    const comments = await Comment.find({
      reel: req.params.reelId,
      parentComment: null,
    })
      .populate('user', 'name profilePic')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, comments });

  } catch (err) {
    next(err);
  }
};


// 🔁 GET REPLIES
exports.getReplies = async (req, res, next) => {
  try {
    const replies = await Comment.find({
      parentComment: req.params.commentId,
    })
      .populate('user', 'name profilePic')
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, replies });

  } catch (err) {
    next(err);
  }
};


// ❤️ LIKE / UNLIKE COMMENT (REAL-TIME)
exports.likeComment = async (req, res, next) => {
  try {
    const io = req.app.get("io");

    const comment = await Comment.findById(req.params.id);

    if (!comment)
      return res.status(404).json({ success: false, message: 'Comment not found' });

    const alreadyLiked = comment.likes.includes(req.user.id);

    if (alreadyLiked) {
      comment.likes.pull(req.user.id);
    } else {
      comment.likes.push(req.user.id);
    }

    await comment.save();

    const roomId = comment.post || comment.reel;

    // 🔥 ONLY ROOM USERS (FIXED)
    io.to(roomId.toString()).emit("commentLiked", {
      commentId: comment._id,
      likes: comment.likes.length,
    });

    res.status(200).json({
      success: true,
      likes: comment.likes.length,
    });

  } catch (err) {
    next(err);
  }
};


// ❌ DELETE COMMENT (REAL-TIME)
exports.deleteComment = async (req, res, next) => {
  try {
    const io = req.app.get("io");

    const comment = await Comment.findById(req.params.id);

    if (!comment)
      return res.status(404).json({ success: false, message: 'Comment not found' });

    if (comment.user.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    const roomId = comment.post || comment.reel;

    await comment.deleteOne();

    // 🔥 ONLY ROOM USERS (FIXED)
    io.to(roomId.toString()).emit("commentDeleted", {
      commentId: req.params.id,
    });

    res.status(200).json({
      success: true,
      message: 'Comment deleted',
    });

  } catch (err) {
    next(err);
  }
};