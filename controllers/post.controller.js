const Post = require('../models/Post.model');

// Create post
exports.createPost = async (req, res, next) => {
  try {
    const post = await Post.create({
      user: req.user.id,
      content: req.body.content || '',
      image: req.body.image || null,
      video: req.body.video || null,
      music: req.body.music || null,
      musicName: req.body.musicName || null,
    });
    await post.populate('user', 'name email isVerifiedBadge');
    res.status(201).json({ success: true, post });
  } catch (err) { next(err); }
};

// Get all posts (feed)
exports.getFeed = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate('user', 'name email profilePhoto isVerifiedBadge')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, posts });
  } catch (err) { next(err); }
};

// Delete post
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.user.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });
    await post.deleteOne();
    res.status(200).json({ success: true, message: 'Post deleted' });
  } catch (err) { next(err); }
};

// Like / Unlike post
exports.likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const liked = post.likes.includes(req.user.id);
    if (liked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);
    }
    await post.save();
    res.status(200).json({ success: true, liked: !liked, likes: post.likes.length });
  } catch (err) { next(err); }
};

// Edit post
exports.editPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.user.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: 'Not authorized' });
    post.content = req.body.content || post.content;
    post.edited = true;
    await post.save();
    res.status(200).json({ success: true, post });
  } catch (err) { next(err); }
};

// Explore - trending posts
exports.getExplore = async (req, res, next) => {
  try {
    const posts = await Post.find()
      .populate('user', 'name email profilePhoto isVerifiedBadge')
      .sort({ 'likes': -1, createdAt: -1 })
      .limit(20);
    res.status(200).json({ success: true, posts });
  } catch (err) { next(err); }
};

// React to post
exports.reactPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const { type } = req.body;
    const existingReaction = post.reactions.find(r => r.user.toString() === req.user.id);
    if (existingReaction) {
      if (existingReaction.type === type) {
        post.reactions = post.reactions.filter(r => r.user.toString() !== req.user.id);
      } else {
        existingReaction.type = type;
      }
    } else {
      post.reactions.push({ user: req.user.id, type });
    }
    await post.save();
    res.status(200).json({ success: true, reactions: post.reactions });
  } catch (err) { next(err); }
};

// Report post
exports.reportPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const alreadyReported = post.reports.find(r => r.user.toString() === req.user.id);
    if (alreadyReported)
      return res.status(400).json({ success: false, message: 'Aap pehle se report kar chuke hain' });
    post.reports.push({ user: req.user.id, reason: req.body.reason || 'Inappropriate content' });
    await post.save();
    res.status(200).json({ success: true, message: 'Post report ho gaya' });
  } catch (err) { next(err); }
};