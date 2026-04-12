const express = require("express");
const router = express.Router();
const Comment = require("../models/Comment");

// 🔥 ADD COMMENT
router.post("/add", async (req, res) => {
  try {
    console.log("BODY:", req.body); // debug

    const { userId, postId, content } = req.body;

    if (!userId || !postId || !content) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const comment = await Comment.create({
      user: userId,
      post: postId,
      content,
    });

    const populated = await comment.populate("user", "username profilePic");

    res.json(populated);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// 🔥 GET COMMENTS
router.get("/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("user", "username profilePic")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;