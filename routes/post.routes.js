const express = require('express');
const router = express.Router();

const {
  createPost,
  getFeed,
  deletePost,
  likePost,
  editPost,
  getExplore,
  reactPost,
  reportPost
} = require('../controllers/post.controller');

// 🔥 COMMENT CONTROLLERS
const {
  addComment,
  getComments,
  getReelComments,
  getReplies,
  likeComment,
  deleteComment
} = require('../controllers/comment.controller');

const { protect } = require('../middleware/auth.middleware');


// ================= POSTS =================
router.get('/', protect, getFeed);
router.get('/explore', protect, getExplore);
router.post('/', protect, createPost);
router.delete('/:id', protect, deletePost);
router.put('/:id/like', protect, likePost);
router.put('/:id/edit', protect, editPost);
router.put('/:id/react', protect, reactPost);
router.post('/:id/report', protect, reportPost);


// ================= COMMENTS =================

// 🔥 VERY IMPORTANT: PEHLE specific routes

// Reel comments
router.get('/reel/:reelId/comments', getReelComments);

// Replies
router.get('/comments/replies/:commentId', getReplies);

// Like comment
router.put('/comments/like/:id', protect, likeComment);

// Delete comment
router.delete('/comments/:id', protect, deleteComment);


// 🔥 LAST me generic routes (warna conflict hoga)

// Post comment add
router.post('/:postId/comments', protect, addComment);

// Get post comments
router.get('/:postId/comments', protect, getComments);


module.exports = router;