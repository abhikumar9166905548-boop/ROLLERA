const express = require("express");
const router = express.Router();
const Comment = require('../models/Comment.model');

// 🔥 ADD COMMENT / REPLY (POST + REEL)
router.post("/add", async (req, res) => {
  try {
    console.log("BODY:", req.body);

    const { userId, postId, reelId, content, parentCommentId } = req.body;

    if (!userId || !content) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const comment = await Comment.create({
      user: userId,
      post: postId || null,
      reel: reelId || null,
      content,
      parentComment: parentCommentId || null,
    });

    // 🔁 reply count update
    if (parentCommentId) {
      await Comment.findByIdAndUpdate(parentCommentId, {
        $inc: { repliesCount: 1 },
      });
    }

    const populated = await comment.populate("user", "username profilePic");

    res.json(populated);

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});


// 🔥 GET COMMENTS (POST)
router.get("/post/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({
      post: req.params.postId,
      parentComment: null,
    })
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🔥 GET COMMENTS (REEL)
router.get("/reel/:reelId", async (req, res) => {
  try {
    const comments = await Comment.find({
      reel: req.params.reelId,
      parentComment: null,
    })
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🔁 GET REPLIES
router.get("/replies/:commentId", async (req, res) => {
  try {
    const replies = await Comment.find({
      parentComment: req.params.commentId,
    })
      .populate("user", "username profilePic")
      .sort({ createdAt: 1 });

    res.json(replies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ❤️ LIKE / UNLIKE COMMENT
router.put("/like/:id", async (req, res) => {
  try {
    const { userId } = req.body;

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const alreadyLiked = comment.likes.includes(userId);

    if (alreadyLiked) {
      comment.likes.pull(userId);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();

    res.json({ likes: comment.likes.length });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ❌ DELETE COMMENT
router.delete("/:id", async (req, res) => {
  try {
    const { userId } = req.body;

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await comment.deleteOne();

    res.json({ message: "Comment deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;