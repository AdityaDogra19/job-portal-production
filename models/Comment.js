const mongoose = require('mongoose');

// SCALABILITY UPGRADE: Separation of Concerns
// Many beginners mistakenly put `comments: [{ text, userId }]` embedded directly inside the Post Model.
// If a post goes viral and hits 50,000 comments, it will crash MongoDB's strict 16MB document size limit!
// By building a distinct Comment Collection, our application can scale infinitely.
const commentSchema = new mongoose.Schema(
  {
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

// Indexing the postId allows us to fetch all comments for a specific post lightning-fast.
commentSchema.index({ postId: 1, createdAt: 1 });

module.exports = mongoose.model('Comment', commentSchema);
