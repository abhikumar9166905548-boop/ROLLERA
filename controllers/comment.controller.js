const Comment = require('../models/comment.model');
const Post = require('../models/Post.model');
const User = require('../models/User.model');
const { io } = require('../server');


// 🔥 ADD COMMENT / REPLY (POST + REEL + REAL-TIME)
exports.addComment = async (req, res, next) => {
  try {
    const { content, reelId, parentCommentId } = req.body;

    if (!content)
      return res.status(400).json({ success: false, message: 'Content required' });

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

    // 🔥 REAL-TIME EMIT (ROOM BASED)
    if (reelId) {
      io.to(reelId.toString()).emit("newComment", comment);
    }

    if (req.params.postId) {
      io.to(req.params.postId.toString()).emit("newComment", comment);
    }

    // ✅ RESPONSE
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

    // 🔥 REAL-TIME LIKE UPDATE
    io.emit("commentLiked", {
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
    const comment = await Comment.findById(req.params.id);

    if (!comment)
      return res.status(404).json({ success: false, message: 'Comment not found' });

    if (comment.user.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });

    await comment.deleteOne();

    // 🔥 REAL-TIME DELETE
    io.emit("commentDeleted", {
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