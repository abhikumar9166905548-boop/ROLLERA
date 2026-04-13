const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    // 🔥 Post + Reel dono support
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
    reel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Reel',
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    content: {
      type: String,
      required: true,
      maxlength: 500,
    },

    // ❤️ Like system
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // 🔁 Reply system
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },

    repliesCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Comment', commentSchema);